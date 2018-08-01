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

    var audioVolume = 0.7;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('trivia.html?136');
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
                '&rsquo;': '"'
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
            print(triviaURL);
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
        Entities.editEntity(questionText, { text: htmlEnDeCode.htmlDecode(triviaData[0].question) });
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
        } else {
            var choices = [];
            choices.push(triviaData[0].correct_answer);
            triviaData[0].incorrect_answers.forEach(function(choice) {
                choices.push(choice);
            });
            shuffle(choices);
            choices.forEach(function(choice, index) {
                Entities.editEntity(choiceTexts[index], {
                    text: htmlEnDeCode.htmlDecode(choice),
                    visible: true
                });
            });
        }
    }

    function startTimer() {
        playSound(TIMER_SOUND);
    }

    function revealAnswers() {
    }

    function showCorrect() {
        Entities.editEntity(answerText, {
            text: triviaData[0].correct_answer,
            visible: true
        });
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            findTargets();
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
                case 'startTimer':
                    startTimer();
                    break;
                case 'revealAnswers':
                    revealAnswers();
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
    
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(appEnding);
}());
