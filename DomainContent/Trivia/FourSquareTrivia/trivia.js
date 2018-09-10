//
//  trivia.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge */

(function() {
    var TRIVIA_CHANNEL = "TriviaChannel";
    var TABLET_BUTTON_IMAGE = Script.resolvePath('assets/icons/questionMark-i.png?1234');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('assets/icons/questionMark-a.png?1234');
    var CORRECT_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/correct.wav'));
    var WRONG_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/audio1.wav'));
    var TIMER_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/timer.wav'));
    var NEXT_ROUND_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/ding.wav'));
    var GAME_OVER_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/oohAah.wav?3425'));
    var SEARCH_RADIUS = 100;
    var ONE_HUNDRED = 100;
    var ONE_SECOND_MS = 1000;
    var TEN_SECONDS_MS = 10000;
    var ZONE_COLOR_INDEX = 19;
    var HALF_MULTIPLIER = 0.5;
    var WAIT_TO_COUNT_AVATARS = 1000;
    var WAIT_TO_SHOW_QUESTION = 500;

    var audioVolume = 0.7;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('trivia.html?096');
    var button = tablet.addButton({
        text: 'TRIVIA',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;
    var injector;
    var questionText;
    var choiceTexts = [];
    var answerText;
    var triviaData;
    var request = Script.require('./modules/request.js').request;
    var type = null;
    var category = null;
    var difficulty = null;
    var currentChoices = [];
    var lights = [];
    var correctHighlights = [];
    var timer;
    var playerCounterZone;
    var playerCounterZoneProperties;
    var avatarCounter;
    var bubble;

    var htmlEnDeCode = (function() {
        var charToEntityRegex,
            entityToCharRegex,
            charToEntity,
            entityToChar;
    
        function resetCharacterEntities() {
            charToEntity = {};
            entityToChar = {};
            // add the default set
            addCharacterEntities({
                '&amp;': '&',
                '&gt;': '>',
                '&lt;': '<',
                '&quot;': '"',
                '&#39;': "'",
                '&lsquo;': '"',
                '&rsquo;': '"',
                '&ldquo;': '"',
                '&rdquo;': '"',
                '&eacute;': 'e',
                '&prime;': '\'',
                '&Prime': '"'
            });
        }
    
        function addCharacterEntities(newEntities) {
            var charKeys = [],
                entityKeys = [],
                key, echar;
            for (key in newEntities) {
                echar = newEntities[key];
                entityToChar[key] = echar;
                charToEntity[echar] = key;
                charKeys.push(echar);
                entityKeys.push(key);
            }
            charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
            entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
        }
    
        function htmlEncode(value) {
            var htmlEncodeReplaceFn = function(match, capture) {
                return charToEntity[capture];
            };
    
            return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplaceFn);
        }
    
        function htmlDecode(value) {
            var htmlDecodeReplaceFn = function(match, capture) {
                return (capture in entityToChar) ? entityToChar[capture] : String.fromCharCode(parseInt(capture.substr(2), 10));
            };
    
            return (!value) ? value : String(value).replace(entityToCharRegex, htmlDecodeReplaceFn);
        }
    
        resetCharacterEntities();
    
        return {
            htmlEncode: htmlEncode,
            htmlDecode: htmlDecode
        };
    })();

    function begin() {
        findTargets();
        clearGame();
        lights.forEach(function(light) {
            Entities.editEntity(light, { visible: true });
        });
        bubbleOn();
        updateAvatarCounter();
    }

    function bubbleOn() {
        Entities.editEntity(bubble, {
            visible: true,
            collidesWith: "static,dynamic,kinematic,myAvatar,otherAvatar"
        });
    }

    function bubbleOff() {
        Entities.editEntity(bubble, { visible: false,
            collidesWith: "static,dynamic,kinematic"
        });
    }
  
    function findTargets() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(element) {
            var name = Entities.getEntityProperties(element, ['name']).name;
            if (name.indexOf("Trivia") !== -1) {
                if (name.indexOf("Light") !== -1) {
                    lights.push(element);
                } else if (name.indexOf("Correct") !== -1) {
                    correctHighlights.push(element);
                } else {
                    switch (name) {
                        case "Trivia Question":
                            questionText = element;
                            break;
                        case "Trivia Answer":
                            answerText = element;
                            break;
                        case "Trivia Choice Text Green":
                            choiceTexts[0] = element;
                            break;
                        case "Trivia Choice Text Yellow":
                            choiceTexts[1] = element;
                            break;
                        case "Trivia Choice Text Red":
                            choiceTexts[2] = element;
                            break;
                        case "Trivia Choice Text Blue":
                            choiceTexts[3] = element;
                            break;
                        case "Trivia Timer Countdown":
                            timer = element;
                            break;
                        case "Trivia Avatar Counter Total":
                            avatarCounter = element;
                            break;
                        case "Trivia Player Counter Zone":
                            playerCounterZone = element;
                            playerCounterZoneProperties = Entities.getEntityProperties(playerCounterZone, 
                                ["position", "dimensions", "rotation", "userData"]);
                            break;
                        case "Trivia Bubble":
                            // print("found bubble");
                            bubble = element;
                            break;
                    }
                }
            }
        });
    }

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
        }
    }

    function getQuestion() {
        try {
            var triviaURL = "https://opentdb.com/api.php?amount=1";
            if (type) {
                triviaURL = triviaURL + "&type=" + type;
            }
            if (difficulty) {
                triviaURL = triviaURL + "&difficulty=" + difficulty;
            }
            if (category) {
                triviaURL = triviaURL + "&category=" + category;
            }
            request(triviaURL, function (error, data) {
                if (!error) {
                    tablet.emitScriptEvent(JSON.stringify(data.results[0]));
                    triviaData = data.results;
                }
            });
        } catch (err) {
            print("Could not get domain data using userData domainAPIURL");
        }
    }

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    function showQuestion() {
        clearBoard();
        Script.setTimeout(function() {
            choiceTexts.forEach(function(choice) {
                Entities.editEntity(choice, {
                    text: "",
                    visible: true
                });
            });
            var formattedQuestion = htmlEnDeCode.htmlDecode(triviaData[0].question);
            Entities.editEntity(questionText, { text: formattedQuestion });
            Entities.editEntity(answerText, {
                text: "",
                visible: false
            });
            Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({
                type: "newQuestion"
            }));
        }, WAIT_TO_SHOW_QUESTION);
    }

    function showAnswers() {
        if (triviaData[0].type === "boolean") {
            Entities.editEntity(choiceTexts[0], {
                text: "",
                visible: false
            });
            // randomize this
            Entities.editEntity(choiceTexts[1], {
                text: "True",
                visible: true
            });
            Entities.editEntity(choiceTexts[2], {
                text: "False",
                visible: true
            });
            Entities.editEntity(choiceTexts[3], {
                text: "",
                visible: false
            });
            currentChoices = [];
            currentChoices.push("True");
            currentChoices.push("False");
            lights.forEach(function(light) {
                var lightName = Entities.getEntityProperties(light, 'name').name;
                if (lightName.indexOf("Green") !== -1) {
                    Entities.editEntity(light, { visible: false });
                } else if (lightName.indexOf("Blue") !== -1) {
                    Entities.editEntity(light, { visible: false });
                }
            });
        } else {
            currentChoices = [];
            currentChoices.push(htmlEnDeCode.htmlDecode(triviaData[0].correct_answer));
            triviaData[0].incorrect_answers.forEach(function(choice) {
                currentChoices.push(htmlEnDeCode.htmlDecode(choice));
            });
            shuffle(currentChoices);
            currentChoices.forEach(function(choice, index) {
                Entities.editEntity(choiceTexts[index], {
                    text: choice,
                    visible: true
                });
            });
        }
        startTimer();
        Script.setTimeout(function() {
            Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({type: "timeUp"}));
            showCorrect();
        }, TEN_SECONDS_MS);
    }

    function clearGame() {
        bubbleOff();
        lights.forEach(function(light) {
            Entities.editEntity(light, { visible: false });
        });
        correctHighlights.forEach(function(highlight) {
            Entities.editEntity(highlight, { visible: false });
        });
        Entities.editEntity(questionText, { text: "Questions will appear here" });
        choiceTexts.forEach(function(choice) {
            Entities.editEntity(choice, {
                text: "Answers appear here",
                visible: true
            });
        });
        Entities.editEntity(answerText, {
            text: "",
            visible: false
        });
        Entities.editEntity(avatarCounter, { text: 0});
    }

    function isPositionInsideBox(position) {
        var localPosition = Vec3.multiplyQbyV(Quat.inverse(playerCounterZoneProperties.rotation),
            Vec3.subtract(position, playerCounterZoneProperties.position));
        var halfDimensions = Vec3.multiply(playerCounterZoneProperties.dimensions, HALF_MULTIPLIER);
        return -halfDimensions.x <= localPosition.x &&
                halfDimensions.x >= localPosition.x &&
               -halfDimensions.y <= localPosition.y &&
                halfDimensions.y >= localPosition.y &&
               -halfDimensions.z <= localPosition.z &&
                halfDimensions.z >= localPosition.z;
    }

    function usersInZone() {
        var count = 0;
        AvatarList.getAvatarIdentifiers().forEach(function(avatarID) {
            var avatar = AvatarList.getAvatar(avatarID);
            if (avatar.sessionUUID) {
                if (isPositionInsideBox(avatar.position, playerCounterZoneProperties)) {
                    count++;
                }
            }
        });
        return count;
    }

    function updateAvatarCounter() {
        var count = usersInZone(playerCounterZoneProperties);
        Entities.editEntity(avatarCounter, { text: count});
    }

    function clearBoard() {
        lights.forEach(function(light) {
            Entities.editEntity(light, { visible: true });
        });
        correctHighlights.forEach(function(highlight) {
            Entities.editEntity(highlight, { visible: false });
        });
        Entities.editEntity(questionText, { text: "" });
        choiceTexts.forEach(function(choice) {
            Entities.editEntity(choice, {
                text: "",
                visible: true
            });
        });
        Entities.editEntity(answerText, {
            text: "",
            visible: false
        });
    }

    function startTimer() {
        playSound(TIMER_SOUND);
        var seconds = 10;
        Entities.editEntity(timer, { text: JSON.stringify(seconds) });
        var interval = Script.setInterval(function() {
            seconds--;
            Entities.editEntity(timer, { text: JSON.stringify(seconds) });
            if (seconds === 0) {
                Script.clearInterval(interval);
            }
        }, ONE_SECOND_MS);
    }

    function showCorrect() {
        var formattedAnswer = htmlEnDeCode.htmlDecode(triviaData[0].correct_answer);
        var correctColor;
        choiceTexts.forEach(function(textEntity) {
            var properties = Entities.getEntityProperties(textEntity, ['name', 'text']);
            if (properties.text === htmlEnDeCode.htmlDecode(triviaData[0].correct_answer)) {
                var color = properties.name.substr(ZONE_COLOR_INDEX);
                correctColor = color;
            }
        });
        lights.forEach(function(light) {
            var lightName = Entities.getEntityProperties(light, 'name').name;
            if (lightName.indexOf(correctColor) === -1) {
                Entities.editEntity(light, { visible: false });
            }
        });
        correctHighlights.forEach(function(highlight) {
            var highlightName = Entities.getEntityProperties(highlight, 'name').name;
            if (highlightName.indexOf(correctColor) !== -1) {
                Entities.editEntity(highlight, { visible: true });
            }
        });
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({
            type: "check",
            correct: correctColor
        }));
        Entities.editEntity(answerText, {
            text: formattedAnswer,
            visible: true
        });
        Script.setTimeout(function() {
            updateAvatarCounter();
        }, WAIT_TO_COUNT_AVATARS);
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            switch (event.type) {
                case 'begin':
                    begin();
                    break;
                case 'end':
                    clearGame();
                    break;
                case 'type':
                    if (event.selectedIndex === 0) {
                        category = null;
                    } else {
                        type = event.value;
                    }
                    break;
                case 'difficulty':
                    if (event.selectedIndex === 0) {
                        category = null;
                    } else {
                        difficulty = event.value;
                    }
                    break;
                case 'category':
                    if (event.selectedIndex === 0) {
                        category = null;
                    } else {
                        category = event.value;
                    }
                    break;
                case 'newQuestion':
                    getQuestion();
                    break;
                case 'showQuestion':
                    showQuestion();
                    break;
                case 'showAnswers':
                    showAnswers();
                    break;
                case 'showCorrect':
                    showCorrect();
                    break;
                case 'clearBoard':
                    clearBoard();
                    break;
                case 'correctAnswer':
                    playSound(CORRECT_SOUND);
                    break;
                case 'wrongAnswer':
                    playSound(WRONG_SOUND);
                    break;
                case 'gameBegin':
                    break;
                case 'nextRound':
                    playSound(NEXT_ROUND_SOUND);
                    break;
                case 'gameEnd':
                    playSound(GAME_OVER_SOUND);
                    break;
                case 'volumeSlider':
                    if (injector) {
                        injector.setOptions( { volume: event.volume / ONE_HUNDRED } );
                    }
                    break;    
                default:
                    print("error in detecting event.type");
            } 
        }
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
    }

    function appEnding() {
        Messages.unsubscribe(TRIVIA_CHANNEL);
        clearGame();
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }

    function playSound(sound) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: MyAvatar.position,
                volume: audioVolume
            });
        }
    }

    this.unload = function() {
        clearGame();
    };

    findTargets();
    Messages.subscribe(TRIVIA_CHANNEL);
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    clearGame();

    Script.scriptEnding.connect(appEnding);
}());
