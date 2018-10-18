//
//  trivia.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge Users AccountServices */

(function() {

    var TRIVIA_CHANNEL = "TriviaChannel";
    var url="put_google_script_URL_here";
    var TABLET_BUTTON_IMAGE = Script.resolvePath('assets/icons/questionMark-i.png');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('assets/icons/questionMark-a.png');
    var NEXT_QUESTION_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/new-question.wav'));
    var TIMER_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/intense-countdown-10-sec.wav'));
    var GAME_INTRO = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/game-show-intro-music-cheer.wav'));
    var NEW_GAME_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/new-game.wav'));
    var POT_INCREASE_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/pot-increase-1.wav'));
    var POT_DECREASE_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/everyone-wrong-combo.wav'));
    var WINNER_MUSIC = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/winner-ta-dah-horns-oneshot-cheers.wav'));
    var SEARCH_RADIUS = 100;
    var ONE_SECOND_MS = 1000;
    var FOUR_SECOND_MS = 4000;
    var TEN_SECONDS_MS = 10000;
    var ZONE_COLOR_INDEX = 19;
    var HALF_MULTIPLIER = 0.5;
    var FIRST_WAIT_TO_COUNT_AVATARS = 1500;
    var WAIT_TO_SHOW_QUESTION = 500;
    var MIN_PLAYERS = 3;
    var HFC_INCREMENT = 100;
    var HFC_HALVER = 0.5;
    var MIN_PRIZE = 300;
    var HOST_PERCENTAGE = 0.1;
    var AC_SCRIPT_RUNNING = false;

    var audioVolume = 0.1;
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('trivia.html?006');
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
    var gameZone;
    var gameZoneProperties;
    var avatarCounter;
    var bubble;
    var introPlayed = false;
    var correctCount = null;
    var previousCount = null;
    var prizeDisplay;
    var prizeMoney;
    var confetti = [];
    var increaseParticle = [];
    var decreaseParticle = [];
    var winnerID = null;

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
        clearGame();
        lights.forEach(function(light) {
            Entities.editEntity(light, { locked: false });
            Entities.editEntity(light, { visible: true });
            Entities.editEntity(light, { locked: true });
        });
        bubbleOn();
        updateAvatarCounter();
        prizeCalculator("new game");
        if (!introPlayed) {
            playSound(GAME_INTRO);
            introPlayed = true;
        } else {
            playSound(NEW_GAME_SFX);
        }
        for (var j = 0; j < confetti.length; j++){
            Entities.editEntity(confetti[j], { locked: false });
            Entities.editEntity(confetti[j], { visible: false });
            Entities.editEntity(confetti[j], { locked: true });
        }
        
    }

    function bubbleOn() {
        Entities.editEntity(bubble, { locked: false });
        Entities.editEntity(bubble, {
            visible: true,
            collisionless: false,
            collidesWith: "static,dynamic,kinematic,myAvatar,otherAvatar"
        });
        Entities.editEntity(bubble, { locked: true });
    }

    function bubbleOff() {
        Entities.editEntity(bubble, { locked: false });
        Entities.editEntity(bubble, {
            visible: false,
            collidesWith: "static,dynamic,kinematic"
        });
        Entities.editEntity(bubble, { locked: true });
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
                            gameZone = element;
                            gameZoneProperties = Entities.getEntityProperties(gameZone, 
                                ["position", "dimensions", "rotation", "userData"]);
                            break;
                        case "Trivia Prize Amount":
                            prizeDisplay = element;
                            break;                            
                        case "Trivia Bubble":
                            bubble = element;
                            break;
                        case "Trivia Confetti Particle":
                            confetti.push(element);
                            break;
                        case "Trivia Pot Decrease Particle":
                            decreaseParticle.push(element);
                            break;
                        case "Trivia Pot Increase Particle":
                            increaseParticle.push(element);
                            break;
                        case "Trivia Particle Coin Lose":
                            decreaseParticle.push(element);
                            break;
                        case "Trivia Particle Coin Increase":
                            increaseParticle.push(element);
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
        playSound(NEXT_QUESTION_SFX);
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
                Entities.editEntity(choice, { locked: false });
                Entities.editEntity(choice, {
                    text: "",
                    visible: true
                });
                Entities.editEntity(choice, { locked: true });
            });
            var formattedQuestion = htmlEnDeCode.htmlDecode(triviaData[0].question);

            Entities.editEntity(questionText, { locked: false });
            Entities.editEntity(questionText, { text: formattedQuestion });
            Entities.editEntity(questionText, { locked: true });

            Entities.editEntity(answerText, { locked: false });
            Entities.editEntity(answerText, {
                text: "",
                visible: false
            });
            Entities.editEntity(answerText, { locked: true });

            Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({
                type: "newQuestion"
            }));
        }, WAIT_TO_SHOW_QUESTION);
    }

    function showAnswers() {
        if (triviaData[0].type === "boolean") {
            Entities.editEntity(choiceTexts[0], { locked: false });
            Entities.editEntity(choiceTexts[0], {
                text: "",
                visible: false
            });
            Entities.editEntity(choiceTexts[0], { locked: true });

            Entities.editEntity(choiceTexts[1], { locked: false });
            Entities.editEntity(choiceTexts[1], {
                text: "True",
                visible: true
            });
            Entities.editEntity(choiceTexts[1], { locked: true });

            Entities.editEntity(choiceTexts[2], { locked: false });
            Entities.editEntity(choiceTexts[2], {
                text: "False",
                visible: true
            });
            Entities.editEntity(choiceTexts[2], { locked: true });

            Entities.editEntity(choiceTexts[3], { locked: false });
            Entities.editEntity(choiceTexts[3], {
                text: "",
                visible: false
            });
            Entities.editEntity(choiceTexts[3], { locked: true });

            currentChoices = [];
            currentChoices.push("True");
            currentChoices.push("False");
            lights.forEach(function(light) {
                var lightName = Entities.getEntityProperties(light, 'name').name;
                if (lightName.indexOf("Green") !== -1) {
                    Entities.editEntity(light, { locked: false });
                    Entities.editEntity(light, { visible: false });
                    Entities.editEntity(light, { locked: true });
                } else if (lightName.indexOf("Blue") !== -1) {
                    Entities.editEntity(light, { locked: false });
                    Entities.editEntity(light, { visible: false });
                    Entities.editEntity(light, { locked: true });
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
                Entities.editEntity(choiceTexts[index], { locked: false });
                Entities.editEntity(choiceTexts[index], {
                    text: choice,
                    visible: true
                });
                Entities.editEntity(choiceTexts[index], { locked: true });
            });
        }
        
    }

    function clearGame() {
        previousCount = null;
        correctCount = null;
        prizeMoney = null;
        winnerID = null;
        bubbleOff();
        lights.forEach(function(light) {
            Entities.editEntity(light, { locked: false });
            Entities.editEntity(light, { visible: false });
            Entities.editEntity(light, { locked: true });
        });

        correctHighlights.forEach(function(highlight) {
            Entities.editEntity(highlight, { locked: false });
            Entities.editEntity(highlight, { visible: false });
            Entities.editEntity(highlight, { locked: true });
        });

        Entities.editEntity(questionText, { locked: false });
        Entities.editEntity(questionText, { text: "Questions will appear here" });
        Entities.editEntity(questionText, { locked: true });

        choiceTexts.forEach(function(choice) {
            Entities.editEntity(choice, { locked: false });
            Entities.editEntity(choice, {
                text: "Answers appear here",
                visible: true
            });
            Entities.editEntity(choice, { locked: true });
        });

        Entities.editEntity(answerText, { locked: false });
        Entities.editEntity(answerText, {
            text: "",
            visible: false
        });
        Entities.editEntity(answerText, { locked: true });

        Entities.editEntity(avatarCounter, { locked: false });
        Entities.editEntity(avatarCounter, { text: 0});
        Entities.editEntity(avatarCounter, { locked: true });

        Entities.editEntity(prizeDisplay, { locked: false });
        Entities.editEntity(prizeDisplay, { text: 0});
        Entities.editEntity(prizeDisplay, { locked: true });
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
        AvatarList.getAvatarIdentifiers().forEach(function(avatarID) {
            var avatar = AvatarList.getAvatar(avatarID);
            if (avatar.sessionUUID) {
                if (isPositionInsideBox(avatar.position, gameZoneProperties)) {
                    count++;
                }
            }
        });
        return count;
    }

    function updateAvatarCounter() {
        var count = usersInZone(gameZoneProperties);
        Entities.editEntity(avatarCounter, { locked: false });
        Entities.editEntity(avatarCounter, { text: count});
        Entities.editEntity(avatarCounter, { locked: true });
        if (count === previousCount && correctCount === 0) {
            prizeCalculator("everyone wrong");
        } else if (count <= 1) {
            prizeCalculator("game over");
            previousCount = count;
        } else {
            prizeCalculator("increase pot");
            previousCount = count;
        }
    }
       
    function prizeCalculator(gameState) {
        console.log("CALCULATING PRIZE POT");
        var count = usersInZone(gameZoneProperties);
        switch (gameState) {
            case "new game":
                if ( count < MIN_PLAYERS ) {
                    prizeMoney = MIN_PRIZE;
                } else {
                    prizeMoney = count * HFC_INCREMENT; 
                }
                console.log("NEW GAME, POT IS HFC", JSON.stringify(prizeMoney));
                break;
            case "everyone wrong":                
                prizeMoney *= HFC_HALVER;
                if (prizeMoney <= MIN_PRIZE) { 
                    prizeMoney = MIN_PRIZE;
                }
                playSound(POT_DECREASE_SFX);
                for (var i = 0; i < decreaseParticle.length; i++){
                    Entities.editEntity(decreaseParticle[i], { locked: false });
                    Entities.editEntity(decreaseParticle[i], { visible: true });
                    Entities.editEntity(decreaseParticle[i], { locked: true });
                }
                Script.setTimeout( function(){
                    for (var i = 0; i < decreaseParticle.length; i++){
                        Entities.editEntity(decreaseParticle[i], { locked: false });
                        Entities.editEntity(decreaseParticle[i], { visible: false });
                        Entities.editEntity(decreaseParticle[i], { locked: true });
                    }
                }, FOUR_SECOND_MS );
                console.log("Everyone is Wrong, halving HFC ", JSON.stringify(prizeMoney));
                break;
            case "increase pot":
                prizeMoney += HFC_INCREMENT;
                playSound(POT_INCREASE_SFX);
                for (var i = 0; i < increaseParticle.length; i++){
                    Entities.editEntity(increaseParticle[i], { locked: false });
                    Entities.editEntity(increaseParticle[i], { visible: true });
                    Entities.editEntity(increaseParticle[i], { locked: true });
                }
                Script.setTimeout( function(){
                    for (var i = 0; i < increaseParticle.length; i++){
                        Entities.editEntity(increaseParticle[i], { locked: false });
                        Entities.editEntity(increaseParticle[i], { visible: false });
                        Entities.editEntity(increaseParticle[i], { locked: true });
                    }
                }, FOUR_SECOND_MS );
                console.log("Increase the pot! HFC ", JSON.stringify(prizeMoney));
                break;
            case "game over":
                prizeMoney += HFC_INCREMENT;
                playSound(WINNER_MUSIC);                
                for (var i = 0; i < confetti.length; i++){
                    Entities.editEntity(confetti[i], { locked: false });
                    Entities.editEntity(confetti[i], { visible: true });
                    Entities.editEntity(confetti[i], { locked: true });
                }
                Script.setTimeout( function(){
                    for (var j = 0; j < confetti.length; j++){
                        Entities.editEntity(confetti[j], { locked: false });
                        Entities.editEntity(confetti[j], { visible: false });
                        Entities.editEntity(confetti[j], { locked: true });
                    }
                }, TEN_SECONDS_MS );
                console.log("We have a winner! They get HFC", JSON.stringify(prizeMoney));   
                if (AC_SCRIPT_RUNNING){
                    Messages.sendMessage(TRIVIA_CHANNEL, 
                        JSON.stringify({
                            type: "winner", 
                            winnerID: winnerID, 
                            winningPayout: prizeMoney, 
                            triviaMaster: AccountServices.username
                        })
                    );          
                } else {
                    if (prizeMoney >= 300 && winnerID !== MyAvatar.sessionUUID) {
                        Users.requestUsernameFromID(winnerID);
                    }
                }
                // TODO: award winner's crown.
                break;
        }   
        Entities.editEntity(prizeDisplay, { locked: false });
        Entities.editEntity(prizeDisplay, { text: prizeMoney });
        Entities.editEntity(prizeDisplay, { locked: true });
    }

    function sendInput(winningUserName) {     
        var hostPayout = prizeMoney * HOST_PERCENTAGE;    
        var paramString = encodeURLParams({
            date: new Date(),
            triviaMasterUserName: AccountServices.username,
            triviaMasterPayout: hostPayout,
            winnerUserName: winningUserName,
            winnings: prizeMoney,
            senderID: AccountServices.username
        });

        print("sendInput is", JSON.stringify(paramString));

        var request = new XMLHttpRequest();
        request.open('GET', url + "?" + paramString);
        request.timeout = 10000;
        request.send();
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
        console.log("the winning user is: ", userName);
    }

    function clearBoard() {
        lights.forEach(function(light) {
            Entities.editEntity(light, { locked: false });
            Entities.editEntity(light, { visible: true });
            Entities.editEntity(light, { locked: true });
        });

        correctHighlights.forEach(function(highlight) {
            Entities.editEntity(highlight, { locked: false });
            Entities.editEntity(highlight, { visible: false });
            Entities.editEntity(highlight, { locked: true });
        });

        Entities.editEntity(questionText, { locked: false });
        Entities.editEntity(questionText, { text: "" });
        Entities.editEntity(questionText, { locked: true });

        choiceTexts.forEach(function(choice) {
            Entities.editEntity(choice, { locked: false });
            Entities.editEntity(choice, {
                text: "",
                visible: true
            });
            Entities.editEntity(choice, { locked: true });
        });

        Entities.editEntity(answerText, { locked: false });
        Entities.editEntity(answerText, {
            text: "",
            visible: false
        });
        Entities.editEntity(answerText, { locked: true });
    }

    function startTimer() {
        playSound(TIMER_SOUND);
        var seconds = 10;
        Entities.editEntity(timer, { locked: false });
        Entities.editEntity(timer, { text: JSON.stringify(seconds) });
        Entities.editEntity(timer, { locked: true });
        var interval = Script.setInterval(function() {
            seconds--;
            Entities.editEntity(timer, { locked: false });
            Entities.editEntity(timer, { text: JSON.stringify(seconds) });
            Entities.editEntity(timer, { locked: true });
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
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Red", MyAvatar.position, SEARCH_RADIUS);
                break;
            case "Green":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Green", MyAvatar.position, SEARCH_RADIUS);
                break;
            case "Yellow":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Yellow", MyAvatar.position, SEARCH_RADIUS);
                break;
            case "Blue":
                correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Blue", MyAvatar.position, SEARCH_RADIUS);
                break;
        }
        var correctColorZoneProperties = Entities.getEntityProperties(
            correctZoneColorID[0], 
            ["position", "dimensions", "rotation"]);
        result = usersInZone(correctColorZoneProperties);    
        if (result === 1) {
            AvatarList.getAvatarIdentifiers().forEach(function(avatarID) {
                var avatar = AvatarList.getAvatar(avatarID);
                if (avatar.sessionUUID) {
                    if (isPositionInsideBox(avatar.position, correctColorZoneProperties)) {
                        winnerID = avatar.sessionUUID;
                        console.log("The winnerID is: ", JSON.stringify(winnerID));
                    }    
                }
            });
        }
        return result;          
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
                Entities.editEntity(light, { locked: false });
                Entities.editEntity(light, { visible: false });
                Entities.editEntity(light, { locked: true });
            }
        });
        correctHighlights.forEach(function(highlight) {
            var highlightName = Entities.getEntityProperties(highlight, 'name').name;
            if (highlightName.indexOf(correctColor) !== -1) {
                Entities.editEntity(highlight, { locked: false });
                Entities.editEntity(highlight, { visible: true });
                Entities.editEntity(highlight, { locked: true });
            }
        });
        Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({
            type: "check",
            correct: correctColor
        }));

        Entities.editEntity(answerText, { locked: false });
        Entities.editEntity(answerText, {
            text: formattedAnswer,
            visible: true
        });
        Entities.editEntity(answerText, { locked: true });

        Script.setTimeout(function() {
            correctCount = isAnyAvatarCorrect(correctColor);
            updateAvatarCounter();
        }, FIRST_WAIT_TO_COUNT_AVATARS);
        // Script.setTimeout(function() {
        //     updateAvatarCounter();
        // }, SECOND_WAIT_TO_COUNT_AVATARS);
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
                            Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({type: "timeUp"}));
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
                position: gameZoneProperties.position,
                volume: audioVolume
            });
        }
    }

    this.unload = function() {
        clearGame();
        introPlayed = false;
        Users.usernameFromIDReply.disconnect(setUserName);
    };

    findTargets();
    Messages.subscribe(TRIVIA_CHANNEL);
    Users.usernameFromIDReply.connect(setUserName);
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    clearGame();

    Script.scriptEnding.connect(appEnding);
}());
