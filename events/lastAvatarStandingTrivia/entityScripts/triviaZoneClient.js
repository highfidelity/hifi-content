//  triviaZoneClient.js
//
//  Created by Rebecca Stankus on 08/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var ZONE_COLOR_INDEX = 12;
    var DISQUALIFIED_POSITION = Script.require(Script.resolvePath('../clientScripts/triviaInfo.json')).DISQUALIFIED_POSITION; 
    var RANGE = 100;
    var DELAY = 200;
    var MIN_RANGE = 5;
    var HALF_MULTIPLIER = 0.5;
    var TRIVIA_CHANNEL = Script.require(Script.resolvePath("../clientScripts/triviaInfo.json")).TRIVIA_CHANNEL;
    var AUDIO_VOLUME = 0.5,
        SOUND = SoundCache.getSound(Script.resolvePath('../entities/sounds/wrong-local.wav'));

    var currentZoneOverlayPosition;
    var currentZoneOverlay;
    var zoneProperties;
    var _this;
    var gameOn = false;
    var gameZone;
    var injector,
        bubble;

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
                zoneMarkerPosition.y += 0.02;
                currentZoneOverlayPosition = zoneMarkerPosition;
            }
            MyAvatar.wentAway.connect(_this.ejectUser);
            gameZone = Entities.getEntityProperties(
                Entities.findEntitiesByName(
                    "Trivia Player Game Zone", MyAvatar.position, RANGE)[0], ['position', 'rotation', 'dimensions']);
            bubble = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, RANGE)[0], ['visible']);
        },

        playSound: function(sound, localOnly){
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: MyAvatar.position,
                    volume: AUDIO_VOLUME,
                    localOnly: localOnly
                });
            } else {
                console.log("no sound downloaded");
            }
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
                url: Script.resolvePath("../entities/models/highlight.fbx"),
                dimensions: { x: 4, y: 0.01, z: 4 },
                position: currentZoneOverlayPosition,
                rotation: zoneProperties.rotation,
                glow: 1
            });
        },

        deleteOverlay: function() {
            var foundOverlays = Overlays.findOverlays(MyAvatar.position, MIN_RANGE);
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
            if (channel === TRIVIA_CHANNEL) {
                message = JSON.parse(message);
                if (message.type === 'game on') {
                    console.log("Host started the game, making a validator");
                    bubble = Entities.getEntityProperties(
                        Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, RANGE)[0], ['visible']);
                    Entities.callEntityServerMethod("rezValidator", [MyAvatar.sessionUUID]);
                    gameOn = bubble.visible;
                } else if (message.type === 'game off') {
                    Script.setTimeout(function(){
                        bubble = Entities.getEntityProperties(
                            Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, RANGE)[0], ['visible']);
                        gameOn = bubble.visible;
                        var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, MIN_RANGE);
                        for (var i = 0; i < playerValidator.length; i++){
                            Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
                        }
                        playerValidator = null;
                    }, DELAY);
                }
            }
        },

        ejectUser: function() {
            bubble = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, RANGE)[0], ['visible']);
            gameOn = bubble.visible;
            if (gameOn === true && _this.isAvatarInsideZone(MyAvatar.position, gameZone)) {
                MyAvatar.position = DISQUALIFIED_POSITION;
                console.log("Validator not present for: ", MyAvatar.sessionUUID);
                Script.setTimeout(function(){
                    MyAvatar.orientation = Quat.cancelOutRollAndPitch(Quat.lookAt(MyAvatar.position, gameZone.position, Vec3.UNIT_Y));
                }, 100);
                _this.playSound(SOUND, true);
                try {
                    var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, MIN_RANGE);
                    for (var i = 0; i < playerValidator.length; i++){
                        Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
                        console.log("no validator present", JSON.stringify(playerValidator));
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
                bubble = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Trivia Bubble", MyAvatar.position, RANGE)[0], ['visible']);
                gameOn = bubble.visible;
                Messages.messageReceived.connect(_this.triviaListener);
                Messages.subscribe(TRIVIA_CHANNEL);    
                var playerValidator = Entities.getEntityProperties(
                    Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, MIN_RANGE)[0],['name']);
                console.log("validator?", JSON.stringify(playerValidator));
                try {
                    if (playerValidator.name === MyAvatar.sessionUUID && gameOn === false){
                        playerValidator = null;
                    } else if (playerValidator.name !== MyAvatar.sessionUUID && gameOn === true){
                        console.log("no validator present", JSON.stringify(playerValidator));
                        playerValidator = null;
                        _this.ejectUser();
                    } else {
                        playerValidator = null;
                    }
                } catch (e) {
                    console.log("no validator present", e);
                }
                Settings.setValue("activeTriviaColor", _this.color);
                console.log("My Color is now ",Settings.getValue("activeTriviaColor"));
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
            } catch (err) {
                print("could not disconnect from messages");
            }
            _this.deleteOverlay();
        },

        unload: function() {
            if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {
                _this.leaveEntity();
            } 
        }
    };

    return new TriviaZone;
});
