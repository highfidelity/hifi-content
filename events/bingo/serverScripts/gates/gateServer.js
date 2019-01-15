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

    var MOVEMENT_INCREMENT_M = 0.02;
    var MOVEMENT_INTERVAL_MS = 12.5;
    var DEBUG = 1;
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath("sounds/openGate.wav"));

    var moving;
    var currentLocalPosition;
    var openedLocalPosition;
    var closedLocalPosition;

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* PLAY A SOUND: Plays the open sound at the position of the gate */
    function playSound() {
        if (OPEN_SOUND.downloaded) {
            Audio.playSound(OPEN_SOUND, {
                position: Entities.getEntityProperties(_this.entityID, 'position').position,
                volume: 1
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    if (DEBUG) {
        print("gate server script with debug statements running");
    }
    var Gate = function() {
        _this = this;
    };

    Gate.prototype = {
        remotelyCallable: ['openGate', 'closeGate'],
        preload: function(entityID){
            _this.entityID = entityID;
            if (DEBUG) {
                print("_this.entityID is " + _this.entityID);
            }
            var name = Entities.getEntityProperties(_this.entityID, 'name').name;
            if (name === "Bingo Scanner Entry Gate") {
                closedLocalPosition = { x: -1, y: 0.85 , z: 0 };
                openedLocalPosition = { x: -1, y: 0.85 , z: -2.5 };
                currentLocalPosition = { x: -1, y: 0.85 , z: 0 };
                Entities.editEntity(_this.entityID, { position: currentLocalPosition});
            } else if (name === "Bingo Stage Entry Gate") {
                closedLocalPosition = { x: 1, y: 0.85 , z: 0 };
                openedLocalPosition = { x: 1, y: 0.85 , z: -2.5 };
                currentLocalPosition = { x: 1, y: 0.85 , z: 0 };
                Entities.editEntity(_this.entityID, { position: currentLocalPosition});
            }
        },

        gateLeft: function() {
            if (DEBUG) {
                print("sliding left");
                print("current z position is " + currentLocalPosition.z);
            }
            if (currentLocalPosition.z > openedLocalPosition.z) {
                currentLocalPosition.z -= MOVEMENT_INCREMENT_M;
                Entities.editEntity(_this.entityID, {
                    position: currentLocalPosition
                });
            } else {
                if (moving) {
                    Script.clearInterval(moving);
                }
            }
        },

        gateRight: function() {
            if (DEBUG) {
                print("lowering");
                print("current position is " + JSON.stringify(currentLocalPosition));
            }
            if (currentLocalPosition.z < closedLocalPosition.z) {
                currentLocalPosition.z += MOVEMENT_INCREMENT_M;
                if (DEBUG) {
                    print("moving " + _this.entityID + " to " + currentLocalPosition.z);
                }
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
            if (DEBUG) {
                print("opening gate");
            }
            if (moving) {
                Script.clearInterval(moving);
            }
            playSound(OPEN_SOUND);
            moving = Script.setInterval(function() {
                _this.gateLeft();
            }, MOVEMENT_INTERVAL_MS);
        },

        closeGate: function() {
            if (DEBUG) {
                print("closing gate");
            }
            if (moving) {
                if (DEBUG) {
                    print("clearing opening interval");
                }
                Script.clearInterval(moving);
            }
            moving = Script.setInterval(function() {
                _this.gateRight();
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
