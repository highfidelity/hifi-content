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

    var GAME_AUDIO_POSITION = Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).gameAudioPosition;
    var MOVEMENT_VELOCITY_M_PER_SEC = 1.4;
    var POSITION_CHECK_INTERVAL_MS = 25;
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("sounds/openGate.wav"));
    var EPSILON_M = 0.01;

    var gatePositionCheckInterval;
    var openedLocalPosition;
    var closedLocalPosition;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the specified sound at specified position and volume */
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

        // Sets up this entity's closed and opened positions
        preload: function(entityID){
            _this.entityID = entityID;
            var name = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (name === "Bingo Scanner Entry Gate") {
                closedLocalPosition = { x: -1.0363, y: 1.4044, z: 0.0796 };
                openedLocalPosition = { x: closedLocalPosition.x, y: -0.9608, z: closedLocalPosition.z };
            } else if (name === "Bingo Stage Entry Gate") {
                closedLocalPosition = { x: 1.0367, y: 1.3896, z: 0.0816 };
                openedLocalPosition = { x: closedLocalPosition.x, y: -0.8328, z: closedLocalPosition.z };
            } else if (name === "Prize Door 1 Gate") {
                closedLocalPosition = { x: -2.8130, y: -0.8786, z: -1.2755 };
                openedLocalPosition = { x: closedLocalPosition.x, y: -3.6787, z: closedLocalPosition.z };
            } else if (name === "Prize Door 2 Gate") {
                closedLocalPosition = { x: 0.0067, y: -0.8784, z: -1.2755 };
                openedLocalPosition = { x: closedLocalPosition.x, y: -3.6787, z: closedLocalPosition.z };
            } else if (name === "Prize Door 3 Gate") {
                closedLocalPosition = { x: 2.8165, y: -0.8782, z: -1.2755 };
                openedLocalPosition = { x: closedLocalPosition.x, y: -3.6787, z: closedLocalPosition.z };
            }
            
            Entities.editEntity(_this.entityID, { localPosition: closedLocalPosition});
        },

        // Gate moves DOWN to open
        openGate: function() {
            // Clear check interval if one exists.
            if (gatePositionCheckInterval) {
                Script.clearInterval(gatePositionCheckInterval);
                gatePositionCheckInterval = false;
            }

            // Check if already open.
            var currentPosition = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
            if (currentPosition.y >= openedLocalPosition.y - EPSILON_M &&
                currentPosition.y <= openedLocalPosition.y + EPSILON_M) {
                return;
            }

            playSound(OPEN_SOUND, GAME_AUDIO_POSITION, 1);
            playSound(OPEN_SOUND, Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition, 1);

            // Start opening the gate.
            Entities.editEntity(_this.entityID,
                {
                    velocity: {x: 0, y: -MOVEMENT_VELOCITY_M_PER_SEC, z: 0}
                }
            );

            // Start the check interval that stops the gate when it's open.
            gatePositionCheckInterval = Script.setInterval(function() {
                var localPosition = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
                if (localPosition.y <= openedLocalPosition.y) {
                    Entities.editEntity(_this.entityID,
                        {
                            localPosition: openedLocalPosition,
                            velocity: {x: 0, y: 0, z: 0}
                        }
                    );
                    Script.clearInterval(gatePositionCheckInterval);
                    gatePositionCheckInterval = false;
                }
            }, POSITION_CHECK_INTERVAL_MS);
        },

        // Gate moves UP to close
        closeGate: function() {
            // Clear check interval if one exists.
            if (gatePositionCheckInterval) {
                Script.clearInterval(gatePositionCheckInterval);
                gatePositionCheckInterval = false;
            }

            // Check if already closed.
            var currentPosition = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
            if (currentPosition.y >= closedLocalPosition.y - EPSILON_M &&
                currentPosition.y <= closedLocalPosition.y + EPSILON_M) {
                return;
            }

            // Start closing the gate.
            Entities.editEntity(_this.entityID,
                {
                    velocity: {x: 0, y: MOVEMENT_VELOCITY_M_PER_SEC, z: 0}
                }
            );

            // Start the check interval that stops the gate when it's closed.
            gatePositionCheckInterval = Script.setInterval(function() {
                var localPosition = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
                if (localPosition.y >= closedLocalPosition.y) {
                    Entities.editEntity(_this.entityID,
                        {
                            localPosition: closedLocalPosition,
                            velocity: {x: 0, y: 0, z: 0}
                        }
                    );
                    Script.clearInterval(gatePositionCheckInterval);
                    gatePositionCheckInterval = false;
                }
            }, POSITION_CHECK_INTERVAL_MS);
        },

        // Ensures the gate is closed when the script stops
        unload: function() {
            if (gatePositionCheckInterval) {
                Script.clearInterval(gatePositionCheckInterval);
                gatePositionCheckInterval = false;
            }
            Entities.editEntity(_this.entityID,
                {
                    localPosition: closedLocalPosition,
                    velocity: {x: 0, y: 0, z: 0}
                }
            );
        }
    };

    return new Gate();
});
