//  triviaMasterClientStandard.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This is the standard version of "Last Avatar Standing" Trivia 
//  that draws from a third-party database of thousands of questions.

/* global EventBridge Users AccountServices */

(function() {

    var SECRETS = Script.require(Script.resolvePath('triviaInfo.json')),
        TRIVIA_CHANNEL = SECRETS.TRIVIA_CHANNEL,
        GOOGLE_URL = SECRETS.GOOGLE_URL,
        TABLET_BUTTON_IMAGE = Script.resolvePath('../entities/icons/questionMark-i.png'),
        TABLET_BUTTON_PRESSED = Script.resolvePath('../entities/icons/questionMark-a.png'),
        SEARCH_RADIUS = 100,
        ONE_SECOND_MS = 1000,
        TEN_SECONDS_MS = 10000,
        ZONE_COLOR_INDEX = 19,
        HALF_MULTIPLIER = 0.5,
        FIRST_WAIT_TO_COUNT_AVATARS = 1500,
        WAIT_TO_SHOW_QUESTION = 500,
        MIN_PLAYERS = 3,
        HFC_INCREMENT = 100,
        HFC_HALVER = 0.5,
        MIN_PRIZE = 300,
        HOST_PERCENTAGE = 0.1;

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system'),
        appPage = Script.resolvePath('trivia.html?006'),
        button = tablet.addButton({
            text: 'TRIVIA',
            icon: TABLET_BUTTON_IMAGE,
            activeIcon: TABLET_BUTTON_PRESSED
        });

    var open = false,
        intervalBoard,
        questionText,
        choiceTexts = [],
        answerText,
        triviaData,
        request = Script.require('../entities/modules/request.js').request,
        type = null,
        category = null,
        difficulty = null,
        currentChoices = [],
        lights = [],
        correctHighlights = [],
        timer,
        gameZone,
        gameZoneProperties,
        avatarCounter,
        bubble,
        introPlayed = false,
        correctCount = null,
        prizeDisplay,
        prizeMoney,
        winnerID = null,
        correctColor = null;
    
    // The following function from https://stackoverflow.com/questions/3700326/decode-amp-back-to-in-javascript
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
                key, encodedChar;
            for (key in newEntities) {
                encodedChar = newEntities[key];
                entityToChar[key] = encodedChar;
                charToEntity[encodedChar] = key;
                charKeys.push(encodedChar);
                entityKeys.push(key);
            }
            charToEntityRegex = new RegExp('(' + charKeys.join('|') + ')', 'g');
            entityToCharRegex = new RegExp('(' + entityKeys.join('|') + '|&#[0-9]{1,5};' + ')', 'g');
        }
    
        function htmlEncode(value) {
            var htmlEncodeReplace = function(match, capture) {
                return charToEntity[capture];
            };
    
            return (!value) ? value : String(value).replace(charToEntityRegex, htmlEncodeReplace);
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
        bubbleOn();
        prizeCalculator("new game");
        if (!introPlayed) {
            Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['GAME_INTRO']);
            introPlayed = true;
        } else {
            Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['NEW_GAME_SFX']);
        }
        Entities.callEntityServerMethod(gameZoneProperties.id, "stopConfetti");
        lights.forEach(function(light) {
            Entities.callEntityServerMethod(light, "lightsOn");
        }); 
    }

    function bubbleOn() {
        Entities.callEntityServerMethod(bubble, "bubbleOn");
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({ 
            type: "game on" 
        }));
        if (!intervalBoard) {
            intervalBoard = Script.setInterval(function(){
                updateAvatarCounter(false);
                Entities.callEntityServerMethod(prizeDisplay, "textUpdate", [prizeMoney, true]);
            }, ONE_SECOND_MS);
        } else {
            Script.clearInterval(intervalBoard);
            intervalBoard = Script.setInterval(function(){
                updateAvatarCounter(false);
                Entities.callEntityServerMethod(prizeDisplay, "textUpdate", [prizeMoney, true]);
            }, ONE_SECOND_MS);
        }
    }

    function bubbleOff() {
        Entities.callEntityServerMethod(bubble, "bubbleOff");
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({ type: "game off" }));
        if (intervalBoard) {
            Script.clearInterval(intervalBoard);
            intervalBoard = false;
        }
        type = null;
        category = null;
        difficulty = null;
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
                        case "Trivia Player Game Zone":
                            gameZone = element;
                            gameZoneProperties = Entities.getEntityProperties(gameZone, 
                                ["id", "position", "dimensions", "rotation", "userData"]);
                            break;
                        case "Trivia Prize Amount":
                            prizeDisplay = element;
                            break;                            
                        case "Trivia Bubble":
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
        Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['NEXT_QUESTION_SFX']);
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
                } else {
                    tablet.emitScriptEvent("error");
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
                Entities.callEntityServerMethod(choice, "textUpdate", ["", true]);
            });
            var formattedQuestion = htmlEnDeCode.htmlDecode(triviaData[0].question);
            // var formattedQuestion = triviaData.question;
            Entities.callEntityServerMethod(questionText, "textUpdate", [formattedQuestion, true]);
            Entities.callEntityServerMethod(answerText, "textUpdate", ["", false]);
        }, WAIT_TO_SHOW_QUESTION);
    }

    function showAnswers() {
        if (triviaData[0].type === "boolean") {
            Entities.callEntityServerMethod(choiceTexts[0], "textUpdate", ["",false]);
            Entities.callEntityServerMethod(choiceTexts[1], "textUpdate", ["True", true]);
            Entities.callEntityServerMethod(choiceTexts[2], "textUpdate", ["False", true]);
            Entities.callEntityServerMethod(choiceTexts[3], "textUpdate", ["", false]);

            currentChoices = [];
            currentChoices.push("True");
            currentChoices.push("False");
            lights.forEach(function(light) {
                var lightName = Entities.getEntityProperties(light, 'name').name;
                if ((lightName.indexOf("Green") !== -1) || (lightName.indexOf("Blue") !== -1)) {
                    Entities.callEntityServerMethod(light, "lightsOff");
                }
            });
        } else {
            currentChoices = [];
            currentChoices.push(triviaData[0].correct_answer);
            triviaData[0].incorrect_answers.forEach(function(choice) {
                currentChoices.push(choice);
            });
            shuffle(currentChoices);
            currentChoices.forEach(function(choice, index) {
                Entities.callEntityServerMethod(choiceTexts[index], "textUpdate", [choice, true]);
            });
        }        
    }

    function clearGame() {
        correctCount = null;
        prizeMoney = 0;
        winnerID = null;

        bubbleOff();
        lights.forEach(function(light) {
            Entities.callEntityServerMethod(light, "lightsOff");
        });
        correctHighlights.forEach(function(highlight) {
            Entities.callEntityServerMethod(highlight, "lightsOff");
        });
        Entities.callEntityServerMethod(questionText, "textUpdate", ["Questions will appear here", true]);
        choiceTexts.forEach(function(choice) {
            Entities.callEntityServerMethod(choice, "textUpdate", ["Answers appear here", true]);
        });
        Entities.callEntityServerMethod(answerText, "textUpdate", ["", true]);
        Entities.callEntityServerMethod(avatarCounter, "textUpdate", [0, true]);
        Entities.callEntityServerMethod(prizeDisplay, "textUpdate", [0, true]);
    }

    function isPositionInsideBox(position, gameZoneProperties) {
        var localPosition = Vec3.multiplyQbyV(Quat.inverse(gameZoneProperties.rotation),
            Vec3.subtract(position, gameZoneProperties.position));
        var halfDimensions = Vec3.multiply(gameZoneProperties.dimensions, HALF_MULTIPLIER);
        return -halfDimensions.x <= localPosition.x &&
                halfDimensions.x >= localPosition.x &&
               -halfDimensions.y <= localPosition.y &&
                halfDimensions.y >= localPosition.y &&
               -halfDimensions.z <= localPosition.z &&
                halfDimensions.z >= localPosition.z;
    }

    function usersInZone(gameZoneProperties) {
        var count = 0;
        AvatarManager.getAvatarIdentifiers().forEach(function(avatarID) {
            var avatar = AvatarManager.getAvatar(avatarID);
            if (avatar.sessionUUID && isPositionInsideBox(avatar.position, gameZoneProperties) ) {
                count++;                
            }
        });
        return count;
    }

    function updateAvatarCounter(roundOver) {
        var count = usersInZone(gameZoneProperties);
        if (roundOver) {
            Script.setTimeout(function(){
                if (correctCount === 1) {
                    prizeCalculator("game over");
                } else {
                    prizeCalculator("increase pot");
                }
            }, 1500);
        } 
        Entities.callEntityServerMethod(avatarCounter, "textUpdate", [count, true]);
    }
       
    function prizeCalculator(gameState) {
        var count = usersInZone(gameZoneProperties);
        switch (gameState) {
            case "new game":
                if (count <= MIN_PLAYERS) {
                    prizeMoney = MIN_PRIZE;
                } else {
                    prizeMoney = count * HFC_INCREMENT; 
                }
                break;
            case "everyone wrong":                
                prizeMoney *= HFC_HALVER;
                if (prizeMoney <= MIN_PRIZE) { 
                    prizeMoney = MIN_PRIZE;
                }
                Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['POT_DECREASE_SFX']);
                Entities.callEntityServerMethod(gameZoneProperties.id, "loseCoins");
                Entities.callEntityServerMethod(gameZoneProperties.id, "halfHFC");
                break;
            case "increase pot":
                prizeMoney += HFC_INCREMENT;
                Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['POT_INCREASE_SFX']);
                Entities.callEntityServerMethod(gameZoneProperties.id, "winCoins");
                Entities.callEntityServerMethod(gameZoneProperties.id, "plusHFC");
                break;
            case "game over":
                prizeMoney += HFC_INCREMENT;
                Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['WINNER_MUSIC']);    
                Entities.callEntityServerMethod(gameZoneProperties.id, "startConfetti");              
                if (prizeMoney >= 300 && winnerID !== MyAvatar.sessionUUID) {
                    var winnerBanner = AvatarManager.getAvatar(winnerID).sessionDisplayName + " wins the game!";
                    Entities.callEntityServerMethod(questionText, "textUpdate", [winnerBanner, true]);
                    Users.requestUsernameFromID(winnerID);
                }                
                break;
        }   
    }

    function sendInput(winningUserName) {     
        if (prizeMoney >= 300 && winnerID !== MyAvatar.sessionUUID && winningUserName !== AccountServices.username) {
            var hostPayout = prizeMoney * HOST_PERCENTAGE;    
            var paramString = encodeURLParams({
                date: new Date(),
                triviaMasterUserName: AccountServices.username,
                triviaMasterPayout: hostPayout,
                winnerUserName: winningUserName,
                winnings: prizeMoney,
                senderID: AccountServices.username
            });
            var request = new XMLHttpRequest();
            request.open('GET', GOOGLE_URL + "?" + paramString);
            request.timeout = 10000;
            request.send();
        }
    }

    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    function setUserName(uuid, userName) {     
        sendInput(userName);
    }

    function clearBoard() {
        lights.forEach(function(light) {
            Entities.callEntityServerMethod(light,"lightsOn");
        });
        correctHighlights.forEach(function(highlight) {
            Entities.callEntityServerMethod(highlight, "lightsOff");
        });
        Entities.callEntityServerMethod(questionText, "textUpdate", ["", true]);
        choiceTexts.forEach(function(choice) {
            Entities.callEntityServerMethod(choice, "textUpdate", ["", true]);
        });
        Entities.callEntityServerMethod(answerText, "textUpdate", ["", false]);
    }

    function startTimer() {
        Entities.callEntityServerMethod(gameZoneProperties.id, "playSound", ['TIMER_SOUND']);
        var seconds = 10;
        Entities.callEntityServerMethod(timer, "textUpdate", [seconds, true]);
        var interval = Script.setInterval(function() {
            seconds--;
            Entities.callEntityServerMethod(timer, "textUpdate", [seconds, true]);
            if (seconds === 0) {
                Script.clearInterval(interval);
            }
        }, ONE_SECOND_MS);
    }

    function isAnyAvatarCorrect(correctColor) {
        var result = null;
        var correctZoneColorID = null;
        switch (correctColor){
            case "Red":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Red", MyAvatar.position, SEARCH_RADIUS)[0];
                break;
            case "Green":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Green", MyAvatar.position, SEARCH_RADIUS)[0];
                break;
            case "Yellow":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Yellow", MyAvatar.position, SEARCH_RADIUS)[0];
                break;
            case "Blue":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Blue", MyAvatar.position, SEARCH_RADIUS)[0];
                break;
        }
        var correctColorZoneProperties = Entities.getEntityProperties(
            correctZoneColorID, 
            ["position", "dimensions", "rotation"]);
        result = usersInZone(correctColorZoneProperties);  

        if (result === 1) {
            AvatarManager.getAvatarIdentifiers().forEach(function(avatarID) {
                var avatar = AvatarManager.getAvatar(avatarID);
                if (avatar.sessionUUID) {
                    if (isPositionInsideBox(avatar.position, correctColorZoneProperties)) {
                        winnerID = avatar.sessionUUID;
                    }    
                }
            });
        }
        return result;          
    }

    function showCorrect() {
        var formattedAnswer = htmlEnDeCode.htmlDecode(triviaData[0].correct_answer);
        correctColor = null;
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
                Entities.callEntityServerMethod(light, "lightsOff");
            }
        });
        correctHighlights.forEach(function(highlight) {
            var highlightName = Entities.getEntityProperties(highlight, 'name').name;
            if (highlightName.indexOf(correctColor) !== -1) {

                Entities.callEntityServerMethod(highlight, "lightsOn");
            }
        });
        var anyCorrect = isAnyAvatarCorrect(correctColor);
        if (anyCorrect === 0) {
            Script.setTimeout(function() {
                prizeCalculator("everyone wrong");
            }, FIRST_WAIT_TO_COUNT_AVATARS);
        } else {
            Script.setTimeout(function() {
                Entities.callEntityServerMethod(bubble, "checkAnswer", [correctColor]);
                correctCount = isAnyAvatarCorrect(correctColor);
                updateAvatarCounter(true);
            }, FIRST_WAIT_TO_COUNT_AVATARS);
        }

        Entities.callEntityServerMethod(answerText, "textUpdate", [formattedAnswer, true]);
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            if (event.app === 'trivia') {
                switch (event.type) {
                    case 'begin':
                        begin();
                        break;
                    case 'end':
                        clearGame();
                        break;
                    case 'type':
                        switch (event.value) {
                            case "Any Type":
                                type = null;
                                break;
                            case "Multiple Choice":
                                type = "multiple";
                                break;
                            case "True or False":
                                type = "boolean";
                                break;
                        }
                        break;
                    case 'difficulty':
                        switch (event.value) {
                            case "Any Difficulty":
                                difficulty = null;
                                break;
                            case "Easy":
                                difficulty = "easy";
                                break;
                            case "Medium":
                                difficulty = "medium";
                                break;
                            case "Hard":
                                difficulty = "hard";
                                break;
                        }
                        break;
                    case 'category':
                        switch (event.value) {
                            case "Any Category":
                                category = null;
                                break;
                            case "General Knowledge":
                                category = "9";
                                break;
                            case "Books":
                                category = "10";
                                break;
                            case "Film":
                                category = "11";
                                break;
                            case "Music":
                                category = "12";
                                break;
                            case "Musicals and Theatres":
                                category = "13";
                                break;
                            case "Television":
                                category = "14";
                                break;
                            case "Video Games":
                                category = "15";
                                break;
                            case "Board Games":
                                category = "16";
                                break;
                            case "Comics":
                                category = "29";
                                break;
                            case "Japanese Anime and Manga":
                                category = "31";
                                break;
                            case "Cartoon and Animations":
                                category = "32";
                                break;
                            case "Computers":
                                category = "18";
                                break;
                            case "Mathematics":
                                category = "19";
                                break;
                            case "Gadgets":
                                category = "30";
                                break;
                            case "Art":
                                category = "25";
                                break;
                            case "Celebrities":
                                category = "26";
                                break;
                            case "Animals":
                                category = "27";
                                break;
                            case "Vehicles":
                                category = "28";
                                break;
                            case "Mythology":
                                category = "20";
                                break;
                            case "Sports":
                                category = "21";
                                break;
                            case "History":
                                category = "23";
                                break;
                            case "Geography":
                                category = "22";
                                break;
                            case "Politics":
                                category = "24";
                                break;
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
                        startTimer();
                        Script.setTimeout(function() {
                            showCorrect();
                        }, TEN_SECONDS_MS);
                        break;
                    case 'showCorrect':
                        showCorrect();
                        break;
                    case 'clearBoard':
                        clearBoard();
                        break;  
                    default:
                        print(JSON.stringify(event));
                        print("error in detecting event.type");
                }
            }
        }
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
    }

    function appEnding() {
        if (intervalBoard) {
            Script.clearInterval(intervalBoard);
        }
        Messages.unsubscribe(TRIVIA_CHANNEL);
        clearGame(); 
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        AvatarManager.avatarRemovedEvent.disconnect(function(){
            updateAvatarCounter(false);
        });
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        Users.usernameFromIDReply.disconnect(setUserName);
    }

    this.unload = function() {
        clearGame();
        introPlayed = false;
    };

    findTargets();
    Messages.subscribe(TRIVIA_CHANNEL);
    AvatarManager.avatarRemovedEvent.connect(function(){
        updateAvatarCounter(false);
    });
    Users.usernameFromIDReply.connect(setUserName);
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(appEnding);
}());
