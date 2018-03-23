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
    // var BOAT_AWAY_POSITION = {x:-98.6815,y:-6.8897,z:150.2770};
    var BOAT_INITIAL_DOCKED_ROTATION = {x:-1.0571,y:36.3584,z:-2.4509};
    var BOAT_RETURN_DOCKED_ROTATION = {x:1.0571,y:-143.6416,z:-2.4509};
    var BOAT_MOVEMENT_INCREMENT_X = 0.01;
    var BOAT_MOVEMENT_INCREMENT_Z = 0.01;
    var BOAT_MOVEMENT_INTERVAL_MS = 10;
    var AUDIO_VOLUME_LEVEL = 0.2;
    var DEBUG = 1;
    var TARGET_X_POSITION_AWAY = -36.2899;
    // this can be rotated to move the boat's light
    // var BOAT_LIGHT_ORIGIN = "{242b05c3-5367-4aa2-bb94-63255a6b4b71}";
    // to turn right, x goes down, y goes down, and z goes up

    var _this;
    var currentPosition = JSON.parse(JSON.stringify(BOAT_DOCKED_POSITION));
    // var currentRotation = JSON.parse(JSON.stringify(BOAT_INITIAL_DOCKED_ROTATION));
    var boatSound;
    var boatSoundInjector;
    var hasLeft = false;
    var returning = false;
    var moving;
    // var turning;

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
            boatSound = SoundCache.getSound(Script.resolvePath("sounds/346108__limetoe__boat-horn.wav"));
            _this.reset();
        },
        reset: function() {
            hasLeft = false;
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
            }
            if (DEBUG) {
                print("calling turnAround");
            }
            _this.turnAround();
            if ( hasLeft && !returning) {
                if (DEBUG) {
                    print("has left and has not started to come back...returning to island now");
                }
                returning = true;
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
                
                
                // make this a triangle or circle to get it in position/rotation to head back to the dock

                // move light in sweeping motion
            }
        },
        leaveIsland: function() {
            if (DEBUG) {
                print("leaveIsland method");
            }
            if (!hasLeft) {
                if (DEBUG) {
                    print("has not left yet...leaving now");
                }
                hasLeft = true;
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
                
                // move light in sweeping motion
            }
        },
        turnAround: function() {
            if (DEBUG) {
                print("turning");
            }
            
            //  FIX ME!!!!!!!
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