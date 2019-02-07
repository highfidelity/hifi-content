// triviaColorCheckBlue.js

//  Created by Mark Brosche on 11/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge Users AccountServices */

(function(){
    var _this,
        injector,
        gameZone;
    
    var DISQUALIFIED_POSITION = Script.require(Script.resolvePath('../clientScripts/triviaInfo.json')).DISQUALIFIED_POSITION,
        HALF_MULTIPLIER = 0.5,
        RADIUS = 50,
        RANGE = 1000,
        AUDIO_VOLUME = 0.5,
        SOUND = SoundCache.getSound(Script.resolvePath('../entities/sounds/wrong-local.wav'));

    var ColorCheck = function(){
        _this = this;
    };

    ColorCheck.prototype = {
        preload: function(entityID){
            console.log("color check blue loaded");
            _this.entityID = entityID;
            gameZone = Entities.getEntityProperties(
                Entities.findEntitiesByName(
                    "Trivia Player Game Zone", MyAvatar.position, RADIUS)[0], ['position', 'rotation', 'dimensions']);
            if (Settings.getValue("activeTriviaColor") !== "Blue") {
                console.log("my color was ", Settings.getValue("activeTriviaColor"), "which is not blue");
                _this.ejectUser();
            }
            Script.setTimeout(function(){
                _this.unload();
            }, 10000);
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

        ejectUser: function() {
            if (_this.isAvatarInsideZone(MyAvatar.position, gameZone)) {
                MyAvatar.position = DISQUALIFIED_POSITION;
                Script.setTimeout(function(){
                    MyAvatar.orientation = Quat.cancelOutRollAndPitch(Quat.lookAt(MyAvatar.position, gameZone.position, Vec3.UNIT_Y));
                }, 100);
                console.log("ejected by color check blue");
                _this.playSound(SOUND, true);
                try {
                    var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, RANGE);
                    playerValidator.forEach(function(id){
                        Entities.callEntityServerMethod(id, "deleteValidator");          
                    });          
                    playerValidator = null;
                } catch (e) {
                    console.log("Error finding validator, nothing to delete", e);
                }
            }
        },

        unload: function(){
            Entities.editEntity(_this.entityID, {
                script: null
            });
        }
    };

    return new ColorCheck;
});