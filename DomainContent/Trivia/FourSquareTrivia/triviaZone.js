//
//  triviaZone.js
//
//  Created by Rebecca Stankus on 08/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var ZONE_COLOR_INDEX = 12;
    var DISQUALIFIED_POSITION = { x: 30.3719, y: -9, z: -1.45635 }; // warroom
    // var DISQUALIFIED_POSITION = { x: 84.8138, y: 12.5, z: 88.744 }; // trivia
    // var DISQUALIFIED_POSITION = { x: -64.7559, y: -75, z: 57.1503 }; // studio
    // var DISQUALIFIED_POSITION = { x: 2.57328, y: 5, z: -47.86263 }; // zombies
    var HALF_MULTIPLIER = 0.5;
    var ZONE_SQUARE_RADIUS = 1.5;
    var TRIVIA_CHANNEL = "TriviaChannel";
    var RADIUS = 50;

    var myColor;
    var currentZoneOverlayPosition;
    var currentZoneOverlay;
    var finalAnswer;
    var zoneProperties;
    var _this;
    var gameOn = false;
    var gameZone;

    var TriviaZone = function() {
        _this = this;
    };

    TriviaZone.prototype = {
        disqualifiedPosition: null,
        
        preload: function(entityID) {
            _this.entityID = entityID;
            zoneProperties = Entities.getEntityProperties(_this.entityID, 
                ['name', 'parentID', 'rotation', 'position', 'dimensions']);
            var name = zoneProperties.name;
            _this.color = name.substr(ZONE_COLOR_INDEX);
            if (_this.color !== "Game Protection") {
                var zoneMarker = zoneProperties.parentID;
                var zoneMarkerPosition = Entities.getEntityProperties(zoneMarker, 'position').position;
                zoneMarkerPosition.y += 0.01;
                currentZoneOverlayPosition = zoneMarkerPosition;
            }
            MyAvatar.wentAway.connect(_this.ejectUser);
            gameZone = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Player Game Zone", MyAvatar.position, 100)[0], ['position']);
        },
            
        setGameState: function(onOrOff) {
            console.log("Setting Game State", onOrOff);
            gameOn = onOrOff;
        },

        isAvatarInsideZone: function(position, zoneProperties) {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF_MULTIPLIER);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },

        createChoiceOverlay: function() {
            currentZoneOverlay = Overlays.addOverlay("model", {
                url: Script.resolvePath("assets/models/highlight.fbx"),
                dimensions: { x: 4, y: 0.01, z: 4 },
                position: currentZoneOverlayPosition,
                rotation: zoneProperties.rotation,
                glow: 1
            });
        },

        deleteOverlay: function() {
            var foundOverlays = Overlays.findOverlays(MyAvatar.position, 5);
            if (currentZoneOverlay || foundOverlays) {
                try {
                    Overlays.deleteOverlay(currentZoneOverlay);
                } catch (e) {
                    print ("failed", e);
                }
                try {
                    for (var i = 0; i < foundOverlays.length; i++) {
                        Overlays.deleteOverlay(foundOverlays[i]);
                    }
                } catch (e) {
                    print ("failed", e);
                }
                currentZoneOverlay = null;
            }
        },

        triviaListener: function(channel, message, sender) {
            if (channel === "TriviaChannel") {
                console.log("Trivia Zone Message Contents", message);
                message = JSON.parse(message);
                if (message.type === 'newQuestion') {
                    _this.newQuestion(message.question, message.choices);
                } else if (message.type === 'timeUp') {
                    finalAnswer = myColor;
                } else if (message.type === 'check') {
                    _this.showIfCorrect(message.correct);
                } else if (message.type === 'game on') {
                    console.log("Trivia Master started the game");
                    Entities.callEntityServerMethod(_this.entityID, "getGameState", [MyAvatar.sessionUUID]);
                    Script.setTimeout(function(){
                        if (gameOn) {
                            Entities.callEntityServerMethod(_this.entityID, "rezValidator", [MyAvatar.sessionUUID]);
                        }
                    }, 100);
                } else if (message.type === 'game off') {
                    console.log("Trivia Master ended the game");
                    Entities.callEntityServerMethod(_this.entityID, "getGameState", [MyAvatar.sessionUUID]);
                    Script.setTimeout(function(){
                        if (!gameOn) {
                            var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, 5);
                            for (var i = 0; i < playerValidator.length; i++){
                                Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
                            }
                            playerValidator = null;
                        }
                    }, 100);
                }
            }
        },

        ejectUser: function() {
            console.log("Ejecting user");
            MyAvatar.orientation = { x: 0, y: 0, z: 0 };
            MyAvatar.position = DISQUALIFIED_POSITION;
            try {
                var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, 5);
                for (var i = 0; i < playerValidator.length; i++){
                    Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
                }
                playerValidator = null;
            } catch (e) {
                console.log("Error finding validator, nothing to delete", e);
            }
            _this.leaveEntity();
            Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({ type: "remove user"}));
        },

        enterEntity: function() {
            Entities.callEntityServerMethod(_this.entityID, "isGameOn", [MyAvatar.sessionUUID]);
            console.log("Entering zone");
            if (_this.color === "Game Protection") {
                return;
            } 
            Messages.messageReceived.connect(_this.triviaListener);
            Messages.subscribe(TRIVIA_CHANNEL);

            var playerValidator = Entities.getEntityProperties(
                Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, 5)[0],['name']);
            try {
                if (playerValidator.name === MyAvatar.sessionUUID && !gameOn){
                    console.log("Game not started, and no validator present, user can stay");
                    playerValidator = null;
                } else if (playerValidator.name !== MyAvatar.sessionUUID && gameOn){
                    console.log("Game in progress, and no validator present, eject user");
                    playerValidator = null;
                    _this.ejectUser();
                } else {
                    playerValidator = null;
                }
            } catch (e) {
                console.log(e, "no validator present");
                console.log("REQUESTING GAME ENTRY");
                Messages.sendMessage(TRIVIA_CHANNEL, JSON.stringify({type: "user entry request"}));
            }
            myColor = _this.color;
            if (_this.color !== "Game Protection") {
                _this.createChoiceOverlay();
            } 
        },

        newQuestion: function() {
            finalAnswer = null;
            myColor = _this.color;
        },

        isAnyAvatarCorrect: function(correctColor) {
            var result = false;
            var correctZoneColorID = null;
            switch (correctColor){
                case "Red":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Red", MyAvatar.position, RADIUS);
                    break;
                case "Green":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Green", MyAvatar.position, RADIUS);
                    break;
                case "Yellow":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Yellow", MyAvatar.position, RADIUS);
                    break;
                case "Blue":
                    correctZoneColorID = Entities.findEntitiesByName("Trivia Zone Blue", MyAvatar.position, RADIUS);
                    break;
            }
            var correctColorZoneProperties = Entities.getEntityProperties(
                correctZoneColorID[0], 
                ["position", "dimensions", "rotation"]);
            var correctAvatarsList = AvatarList.getAvatarsInRange(correctColorZoneProperties.position, ZONE_SQUARE_RADIUS);
            var i = 0;
            while ( i < correctAvatarsList.length){
                var correctAvatarPosition = AvatarList.getAvatar(correctAvatarsList[i]).position;
                result = _this.isAvatarInsideZone(correctAvatarPosition, correctColorZoneProperties) ? true : false;
                if ( result === true ) { 
                    return result;
                } else { 
                    i++; 
                }
            }
            return result;
        },

        showIfCorrect: function(correctColor) {
            if ( finalAnswer === null) {
                finalAnswer = myColor;
            }
            console.log("The correct color is,", correctColor, "but my color is,", finalAnswer);
            var someOneIsCorrect = _this.isAnyAvatarCorrect(correctColor) ? true : false;
            console.log("is any one correct?", someOneIsCorrect);
            if (someOneIsCorrect){
                if (finalAnswer !== correctColor) {
                    console.log("ejecting myself");
                    _this.ejectUser();
                } 
            } 
        },

        leaveEntity: function() {
            if (_this.color === "Game Protection") {
                return;
            } 
            try {
                Messages.messageReceived.disconnect(_this.triviaListener);
                Messages.unsubscribe(TRIVIA_CHANNEL);
                console.log("Exiting zone");
            } catch (err) {
                print("could not disconnect from messages");
            }
            _this.deleteOverlay();
        },

        unload: function() {
            console.log("UNLOADING");
            if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {
                _this.leaveEntity();
            } 
        }
    };

    return new TriviaZone;
});
