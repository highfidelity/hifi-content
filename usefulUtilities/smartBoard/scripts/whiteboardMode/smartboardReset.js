//
//  SmartboardReset.js
//
//  created by Rebecca Stankus on 03/28/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var RESET_SOUND = SoundCache.getSound(Script.resolvePath('./resources/sounds/resetSmartboard.mp3'));
    var RESET_SOUND_VOLUME = 0.05;
    var HALF = 0.5;

    var injector;
    var smartboardZone = null;
    var thisSmartboard;

    var SmartboardReset = function() {
        _this = this;
    };

    SmartboardReset.prototype = {
        remotelyCallable: ['mousePressOnEntity'],

        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.getSmartboardZone();
        },

        /* Search children of smartboard to get zone. */
        getSmartboardZone: function() {
            thisSmartboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            Entities.getChildrenIDs(thisSmartboard).forEach(function(smartboardChild) {
                var name = Entities.getEntityProperties(smartboardChild, 'name').name;
                if (name === "Smartboard Zone") {
                    smartboardZone = smartboardChild;
                }
            });
            return smartboardZone;
        },

        /* Check if user is inside zone */
        isUserInZone: function(zoneID) {
            var zoneProperties = Entities.getEntityProperties(zoneID, ['position', 'rotation', 'dimensions']);
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(MyAvatar.position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF);
            var inZone = -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
            return inZone;
        },

        /* PLAY A SOUND: Plays a sound at the specified position, volume, local mode, and playback 
        mode requested. */
        playSound: function(sound, volume, position, localOnly, loop){
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                    injector = null;
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: volume,
                    localOnly: localOnly,
                    loop: loop
                });
            }
        },

        /* Find all nearby smartboard lines and delete them if you are in the smartboard zone */
        resetSmartboard: function() {
            if (!smartboardZone && !_this.getSmartboardZone()) {
                return;
            }
            if (!_this.isUserInZone(smartboardZone)) {
                return;
            }
            _this.playSound(RESET_SOUND, RESET_SOUND_VOLUME, MyAvatar.position, true, false);
            Entities.getChildrenIDs(thisSmartboard).forEach(function(childOfSmartboard) {
                var name = Entities.getEntityProperties(childOfSmartboard, 'name').name;
                if (name === "Smartboard Polyline") {
                    Entities.deleteEntity(childOfSmartboard);
                }
            });
        },

        /* When clicked or triggered, reset board. */
        mousePressOnEntity: function( entityID, event ) {
            if (!smartboardZone) {
                _this.getSmartboardZone();
            }

            var currentBoardState = false;

            try {
                currentBoardState = JSON.parse(Entities.getEntityProperties(smartboardZone, "userData").userData).currentBoardState;
            } catch (e) {
                console.log("error parsing smartBoardZone's userData: " + e);
            }

            if (currentBoardState !== "whiteboard") {
                return;
            }

            if (event.isLeftButton) {
                _this.resetSmartboard();
            }
        }
    };

    return new SmartboardReset();
});
