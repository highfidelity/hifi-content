//
// boatServer.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var BOAT_DOCKED_POSITION = {x:14.2899,y:-7.4687,z:36.7669};
    var BOAT_INITIAL_DOCKED_ROTATION = {x:-1.0571,y:36.3584,z:-2.4509};
    var BOAT_RETURN_DOCKED_ROTATION = {x:1.0571,y:-143.6416,z:-2.4509};
    var BOAT_MOVEMENT_INCREMENT_X = 0.01;
    var BOAT_MOVEMENT_INCREMENT_Z = 0.01;
    var BOAT_MOVEMENT_INTERVAL_MS = 10;
    var AUDIO_VOLUME_LEVEL = 0.2;
    var DEBUG = 0;
    var TARGET_X_POSITION_AWAY = -36.2899;
    var BOAT_HORN_SOUND = "sounds/346108__limetoe__boat-horn.wav";

    var _this;
    var currentPosition = JSON.parse(JSON.stringify(BOAT_DOCKED_POSITION));
    var boatSound;
    var boatSoundInjector;
    var returning = false;
    var moving;

    if (DEBUG) {
        print("boat server script running");
    }

    var Boat = function() {
        _this = this;
    };

    Boat.prototype = {
        remotelyCallable: ['reset', 'horn', 'leaveIsland', 'approachIsland'],
        preload: function(entityID) {
            if (DEBUG) {
                print("hello boat server script with movement print");
            }
            _this.entityID = entityID;
            boatSound = SoundCache.getSound(Script.resolvePath(BOAT_HORN_SOUND));
            _this.reset();
        },
        reset: function() {
            print("resetting boat");
            _this.docked = true;
            if (moving) {
                Script.clearInterval(moving);
            }
            if (boatSoundInjector) {
                boatSoundInjector.stop();
            }
            if (DEBUG) {
                print("moving boat to docked position at " + JSON.stringify(BOAT_DOCKED_POSITION));
            }
            Entities.editEntity(_this.entityID, {
                position: BOAT_DOCKED_POSITION,
                rotation: Quat.fromPitchYawRollDegrees(BOAT_INITIAL_DOCKED_ROTATION.x,BOAT_INITIAL_DOCKED_ROTATION.y,
                    BOAT_INITIAL_DOCKED_ROTATION.z)
            });
            currentPosition = JSON.parse(JSON.stringify(BOAT_DOCKED_POSITION));
            print("position from getEntityProperties is " + JSON.stringify(Entities.getEntityProperties(_this.entityID, 
                'position').position));
        },
        horn: function(){
            if (boatSound.downloaded) {
                if (boatSound) {
                    boatSound.stop();
                }
                boatSoundInjector = Audio.playSound(boatSound, {
                    position: currentPosition,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },
        approachIsland: function() {
            if (DEBUG) {
                print("approachIsland method");
                print("calling turnAround");
            }
            _this.turnAround();
            if (!_this.docked && !returning) {
                if (DEBUG) {
                    print("has left and has not started to come back...returning to island now");
                }
                returning = true;
                if (moving) {
                    Script.clearInterval(moving);
                }
                moving = Script.setInterval(function() {
                    if (currentPosition.x < BOAT_DOCKED_POSITION.x) {
                        if (DEBUG) {
                            print("moving");
                        }
                        currentPosition.x += BOAT_MOVEMENT_INCREMENT_X;
                        currentPosition.z -= BOAT_MOVEMENT_INCREMENT_Z;
                        Entities.editEntity(_this.entityID, {
                            position: currentPosition
                        });
                    } else {
                        if (moving) {
                            Script.clearInterval(moving);
                        }
                    }
                }, BOAT_MOVEMENT_INTERVAL_MS);
            }
        },
        leaveIsland: function() {
            if (DEBUG) {
                print("leaveIsland method");
            }
            if (_this.docked) {
                if (DEBUG) {
                    print("has not left yet...leaving now");
                }
                _this.docked = false;
                if (moving) {
                    Script.clearInterval(moving);
                }
                moving = Script.setInterval(function() {
                    if (currentPosition.x > TARGET_X_POSITION_AWAY) {
                        if (DEBUG) {
                            print("moving");
                        }
                        currentPosition.x -= BOAT_MOVEMENT_INCREMENT_X;
                        currentPosition.z += BOAT_MOVEMENT_INCREMENT_Z;
                        Entities.editEntity(_this.entityID, {
                            position: currentPosition
                        });
                    } else {
                        if (moving) {
                            Script.clearInterval(moving);
                        }
                    }
                }, BOAT_MOVEMENT_INTERVAL_MS);
            }
        },
        turnAround: function() {
            if (DEBUG) {
                print("turning");
            }
            Entities.editEntity(_this.entityID, {
                rotation: Quat.fromPitchYawRollDegrees(BOAT_RETURN_DOCKED_ROTATION.x,BOAT_RETURN_DOCKED_ROTATION.y,
                    BOAT_RETURN_DOCKED_ROTATION.z)
            });
        },
        unload: function() {
            if (boatSoundInjector) {
                boatSoundInjector.stop();
            }
            if (moving) {
                Script.clearInterval(moving);
            }
        }
    };

    return new Boat();
});
