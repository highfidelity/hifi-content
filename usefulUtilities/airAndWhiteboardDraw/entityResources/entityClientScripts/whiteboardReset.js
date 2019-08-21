//
//  whiteboardReset.js
//
//  created by Rebecca Stankus on 03/28/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var RESET_SOUND = SoundCache.getSound(Script.resolvePath('../resources/sounds/resetWhiteboard.mp3'));
    var RESET_SOUND_VOLUME = 0.05;
    var HALF = 0.5;

    var injector;
    var whiteboardZone = null;
    var thisWhiteboard;

    var WhiteboardReset = function() {
        _this = this;
    };

    WhiteboardReset.prototype = {
        remotelyCallable: ['mousePressOnEntity'],

        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.getWhiteboardZone();
        },

        /* Search children of whiteboard to get zone. */
        getWhiteboardZone: function() {
            thisWhiteboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            Entities.getChildrenIDs(thisWhiteboard).forEach(function(whiteboardChild) {
                var name = Entities.getEntityProperties(whiteboardChild, 'name').name;
                if (name === "Whiteboard Zone") {
                    whiteboardZone = whiteboardChild;
                }
            });
            return whiteboardZone;
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

        /* Find all nearby whiteboard lines and delete them if you are in the whiteboard zone */
        resetWhiteboard: function() {
            if (!whiteboardZone && !_this.getWhiteboardZone()) {
                return;
            }
            if (!_this.isUserInZone(whiteboardZone)) {
                return;
            }
            _this.playSound(RESET_SOUND, RESET_SOUND_VOLUME, MyAvatar.position, true, false);
            Entities.getChildrenIDs(thisWhiteboard).forEach(function(childOfWhiteboard) {
                var name = Entities.getEntityProperties(childOfWhiteboard, 'name').name;
                if (name === "Whiteboard Polyline") {
                    Entities.deleteEntity(childOfWhiteboard);
                }
            });
        },

        /* When clicked or triggered, reset board. */
        mousePressOnEntity: function( entityID, event ) {
            if (event.isLeftButton) {
                _this.resetWhiteboard();
            }
        }
    };

    return new WhiteboardReset();
});
