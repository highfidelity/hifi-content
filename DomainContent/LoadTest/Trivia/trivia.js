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
    var GAME_BEGIN_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/welcome.wav'));
    var NEXT_ROUND_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/ding.wav'));
    var GAME_OVER_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/oohAah.wav?3425'));
    var SEARCH_RADIUS = 100;
    var ONE_HUNDRED = 100;
    var TEN_SECONDS_MS = 10000;

    var audioVolume = 0.7;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('trivia.html?009');
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
    var podiumQuestions = [];
    var podiumReveals = [];

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
        playSound(GAME_BEGIN_SOUND);
        findTargets();
        clearGame();
    }
  
    function findTargets() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(element) {
            var name = Entities.getEntityProperties(element, ['name']).name;
            switch (name) {
                case "Trivia Question":
                    questionText = element;
                    break;
                case "Trivia Answer":
                    answerText = element;
                    break;
                case "Trivia Choice Text 1":
                    choiceTexts[0] = element;
                    break;
                case "Trivia Choice Text 2":
                    choiceTexts[1] = element;
                    break;
                case "Trivia Choice Text 3":
                    choiceTexts[2] = element;
                    break;
                case "Trivia Choice Text 4":
                    choiceTexts[3] = element;
                    break;
                case "Trivia Podium Question":
                    podiumQuestions.push(element);
                    break;
                case "Trivia Podium Reveal":
                    podiumReveals.push(element);
                    break;
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
        var formattedQuestion = htmlEnDeCode.htmlDecode(triviaData[0].question);
        Entities.editEntity(questionText, { text: formattedQuestion });
        Entities.editEntity(answerText, {
            text: "",
            visible: false
        });
        if (triviaData[0].type === "boolean") {
            Entities.editEntity(choiceTexts[0], {
                text: "",
                visible: false
            });
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
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({
            type: "newQuestion",
            question: formattedQuestion,
            choices: currentChoices
        }));
        startTimer();
        Script.setTimeout(function() {
            Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({type: "reveal"}));
        }, TEN_SECONDS_MS);
    }

    function clearGame() {
        podiumQuestions.forEach(function(textEntity) {
            Entities.editEntity(textEntity, {
                text: "Questions will appear here"
            });
        });
        podiumReveals.forEach(function(textEntity) {
            Entities.editEntity(textEntity, {
                text: "?",
                backgroundColor: { red: 131, blue: 252, green: 238 }
            });
        });
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({type: "clearPodium"}));
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
    }

    function startTimer() {
        playSound(TIMER_SOUND);
    }

    function showCorrect() {
        var formattedAnswer = htmlEnDeCode.htmlDecode(triviaData[0].correct_answer);
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({
            type: "check",
            correct: formattedAnswer
        }));
        Entities.editEntity(answerText, {
            text: formattedAnswer,
            visible: true
        });
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            switch (event.type) {
                case 'begin':
                    begin();
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
                case 'showCorrect':
                    showCorrect();
                    break;
                case 'correctAnswer':
                    playSound(CORRECT_SOUND);
                    break;
                case 'wrongAnswer':
                    playSound(WRONG_SOUND);
                    break;
                case 'gameBegin':
                    playSound(GAME_BEGIN_SOUND);
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

    Messages.subscribe(TRIVIA_CHANNEL);
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(appEnding);
}());
