//
//  gateServer.js
//
//  Created by Rebecca Stankus on 3/6/18.
//  Edited for Bingo on 01/15/19
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this;

    var GAME_AUDIO_POSITION = { x: -79, y: -14, z: 6 };
    var MOVEMENT_INCREMENT_M = 0.02;
    var MOVEMENT_INTERVAL_MS = 12.5;
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("sounds/openGate.wav"));

    var moving;
    var currentLocalPosition;
    var openedLocalPosition;
    var closedLocalPosition;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at specified position  and volume */
    var injector;
    function playSound(sound, position, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: GAME_AUDIO_POSITION,
                volume: volume
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    var Gate = function() {
        _this = this;
    };

    Gate.prototype = {
        remotelyCallable: ['openGate', 'closeGate'],
        preload: function(entityID){
            _this.entityID = entityID;
            var name = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (name === "Bingo Scanner Entry Gate") {
                closedLocalPosition = { x: -0.9310, y: 1.1957 , z: 0.0811 };
                openedLocalPosition = { x: -0.9310, y: -0.9731 , z: 0.0811 };
                currentLocalPosition = { x: -0.9310, y: 1.1957 , z: 0.0811 };
                Entities.editEntity(_this.entityID, { position: currentLocalPosition});
            } else if (name === "Bingo Stage Entry Gate") {
                closedLocalPosition = { x: 1, y: 1.1957 , z: 0.0811 };
                openedLocalPosition = { x: 1, y: -0.9731 , z: 0.0811 };
                currentLocalPosition = { x: 1, y: 1.1957 , z: 0.0811 };
                Entities.editEntity(_this.entityID, { position: currentLocalPosition});
            }
        },

        gateDown: function() {
            if (currentLocalPosition.y > openedLocalPosition.y) {
                currentLocalPosition.y -= MOVEMENT_INCREMENT_M;
                Entities.editEntity(_this.entityID, {
                    position: currentLocalPosition
                });
            } else {
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },

        gateUp: function() {
            if (currentLocalPosition.y < closedLocalPosition.y) {
                currentLocalPosition.y += MOVEMENT_INCREMENT_M;
                Entities.editEntity(_this.entityID, {
                    position: currentLocalPosition
                });
            } else {
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },

        openGate: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
            playSound(OPEN_SOUND, GAME_AUDIO_POSITION, 1);
            playSound(OPEN_SOUND, Entities.getEntityProperties(_this.entityID, 'position').position, 1);
            moving = Script.setInterval(function() {
                _this.gateDown();
            }, MOVEMENT_INTERVAL_MS);
        },

        closeGate: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                _this.gateUp();
            }, MOVEMENT_INTERVAL_MS);
        },

        unload: function() {
            if (moving) {
                Script.clearInterval(moving);
            }
        }
    };

    return new Gate();
});
