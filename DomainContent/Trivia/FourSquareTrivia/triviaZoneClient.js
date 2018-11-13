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
    var DISQUALIFIED_POSITION = { x: -69.4697, y: -19, z: 6.3204 }; // futvrelands
    // var DISQUALIFIED_POSITION = { x: 30.3719, y: -9, z: -1.45635 }; // warroom
    // var DISQUALIFIED_POSITION = { x: 84.8138, y: 12.5, z: 88.744 }; // trivia
    // var DISQUALIFIED_POSITION = { x: -64.7559, y: -75, z: 57.1503 }; // studio
    // var DISQUALIFIED_POSITION = { x: 2.57328, y: 5, z: -47.86263 }; // zombies
    var HALF_MULTIPLIER = 0.5;
    var TRIVIA_CHANNEL = "TriviaChannel";

    var currentZoneOverlayPosition;
    var currentZoneOverlay;
    var zoneProperties;
    var _this;
    var gameOn = false;
    var gameZone;
    var bubble;

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
                Entities.findEntitiesByName("Trivia Player Game Zone", MyAvatar.position, 100)[0], ['position', 'rotation', 'dimensions']);
            bubble = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, 100)[0], ['visible']);
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
                // if (message.type === 'newQuestion') {
                //     _this.newQuestion(message.question, message.choices);
                // } else if (message.type === 'timeUp') {
                //     finalAnswer = _this.color;
                // } else if (message.type === 'check') {
                //     if (finalAnswer === "Game Protection"){
                //         while (finalAnswer === "Game Protection") {
                //             finalAnswer = _this.color;
                //         }
                //     }
                //     _this.showIfCorrect(message.correct);
                if (message.type === 'game on') {
                    console.log("Trivia Master started the game");
                    bubble = Entities.getEntityProperties(
                        Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, 100)[0], ['visible']);
                    gameOn = bubble.visible;
                    try {
                        Entities.callEntityServerMethod(_this.entityID, "rezValidator", [MyAvatar.sessionUUID]);
                        console.log("GENERATED VALIDATOR");
                    } catch (e) {
                        console.log("FAILED TO GENERATE VALIDATOR", e);
                    }
                } else if (message.type === 'game off') {
                    console.log("Trivia Master ended the game");
                    Script.setTimeout(function(){
                        bubble = Entities.getEntityProperties(
                            Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, 100)[0], ['visible']);
                        gameOn = bubble.visible;
                        var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, 5);
                        for (var i = 0; i < playerValidator.length; i++){
                            Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
                        }
                        playerValidator = null;
                    }, 200);
                }
            }
        },

        ejectUser: function() {
            bubble = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, 100)[0], ['visible']);
            gameOn = bubble.visible;
            if (gameOn === true && _this.isAvatarInsideZone(MyAvatar.position, gameZone)) {
                console.log("Ejecting user from zone");
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
            }
        },

        enterEntity: function() {
            if (_this.color !== "Game Protection") {
                console.log("Entering zone");
                bubble = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, 100)[0], ['visible']);
                gameOn = bubble.visible;
                Messages.messageReceived.connect(_this.triviaListener);
                Messages.subscribe(TRIVIA_CHANNEL);    
                var playerValidator = Entities.getEntityProperties(
                    Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, 5)[0],['name']);
                try {
                    if (playerValidator.name === MyAvatar.sessionUUID && gameOn === false){
                        console.log("Game not started, and no validator present, user can stay");
                        playerValidator = null;
                    } else if (playerValidator.name !== MyAvatar.sessionUUID && gameOn === true){
                        console.log("Game in progress, and no validator present, eject user");
                        playerValidator = null;
                        _this.ejectUser();
                    } else {
                        playerValidator = null;
                    }
                } catch (e) {
                    console.log("no validator present", e);
                }
                Settings.setValue("activeTriviaColor", _this.color);
                _this.createChoiceOverlay();
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
