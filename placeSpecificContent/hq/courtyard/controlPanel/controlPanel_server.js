//
// controlPanel_server.js
// 
// Created by Rebecca Stankus on 07/16/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var HALF = 0.5;

    var DATA_RETRIEVAL_TIMEOUT_MS = 500;
    var PRELOAD_DATA_RETRIEVAL_MAX_ATTEMPTS = 10;

    var DONE_SOUND = SoundCache.getSound(Script.resolvePath("resources/sounds/DONE_SOUND.mp3?1"));
    var TRANSITION_SOUND = SoundCache.getSound(Script.resolvePath("resources/sounds/TRANSITION_SOUND.mp3?1"));
    var DONE_VOLUME = 0.2;
    var TRANSITION_VOLUME = 0.05;

    var INDEX_WHERE_STATE_NAME_BEGINS = 21;

    var NUMBER_OF_BUTTONS = 3;
    var BUTTON_TO_ENTITY_POSITIONING_MAP = {};

    var FIXED_DECIMAL_PLACES = 2;
    /* MAP WILL LOOK LIKE THIS BUT BUTTONS MAY NOT BE LISTED IN THIS ORDER: 

    {
        "{00000000-0000-0000-0000-000000000000}"(id of stage button): {
            "courtyardPosition": { x: 0, y: 0, z: 0 } (position of courtyard when in the stage state)
            "roundtablePosition": { x: 0, y: 0, z: 0 } (position of courtyard when in the stage state)
        },
        "{00000000-0000-0000-0000-000000000000}"(id of courtyard button): {
            "courtyardPosition": { x: 0, y: 0, z: 0 } (position of courtyard when in the courtyard state)
            "roundtablePosition": { x: 0, y: 0, z: 0 } (position of courtyard when in the courtyard state)
        },
        "{00000000-0000-0000-0000-000000000000}"(id of roundtable button): {
            "courtyardPosition": { x: 0, y: 0, z: 0 } (position of courtyard when in the roundtable state)
            "roundtablePosition": { x: 0, y: 0, z: 0 } (position of courtyard when in the roundtable state)
        }
    }

    LISTING BY BUTTON ID ALLOWS US TO DIRECTLY LINK THE INCOMING BUTTON PRESS TO A TARGET STATE
    */

    var MAX_DISTANCE_TO_TRANSITION_ENTITIES_M = 10;
    var MIN_DISTANCE_TO_TRANSITION_ENTITIES_M = 0.01;

    var TARGET_DEVIATION_ALLOWANCE = 0.005;

    var TRANSITION_VELOCITY_M_PER_S = 0.3;

    var CHECK_INTERVAL_MS = 70;
    
    var BUTTON_TRANSITION_COLOR = { red: 153, green: 153, blue: 153 };
    var BUTTON_ACTIVE_COLOR = { red: 77, green: 207, blue: 52 };
    var BUTTON_INACTIVE_COLOR = { red: 17, green: 17, blue: 17 };

    var _this;

    var injector;

    var preloadIntervalCount = 0;
    var dataRetrievalTimeout;
    var ready = false;

    var roundtable;
    var courtyard;

    var tableHeight;

    var courtyardLoweredPosition;
    var roundtableLoweredPosition;

    var roundtableVelocity;
    var courtyardVelocity;

    var roundtableInPlace;
    var courtyardInPlace;

    var checkInterval;
    

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        remotelyCallable: ['pressButton'],

        /* Save a reference to this and call another function to begin trying to read entity data */
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.setDataRequestTimeout();
        },

        /* Try to get entity data. If all data is retrieved or more than 10 attempts are made, stop trying. */
        preloadSetupAttempt: function() {
            preloadIntervalCount++;
            try {
                _this.getEntityData();
            } catch (err) {
                print("Attempt ", preloadIntervalCount, " to get entity data failed.");
            }
            if (JSON.stringify(BUTTON_TO_ENTITY_POSITIONING_MAP) !== "{}" && roundtable && courtyard) {
                ready = true;
            } else if (preloadIntervalCount < PRELOAD_DATA_RETRIEVAL_MAX_ATTEMPTS) {
                _this.setDataRequestTimeout();
            }
        },

        /* Set a timeout for 500ms after which we will attempt to read entity data */
        setDataRequestTimeout: function() {
            dataRetrievalTimeout = Script .setTimeout(function() {
                dataRetrievalTimeout = null;
                _this.preloadSetupAttempt();
            }, DATA_RETRIEVAL_TIMEOUT_MS);
        },

        /* Use parenting relationships to get IDs of required entities and userData of this entity. Use the user data 
        and IDs of buttons to create a map for where each entity should be at each state. Save the lowered position 
        of each entity and the height of the table. If unable to get all necessary data, erase everything so we are 
        not left with partial data that will cause errors. */
        getEntityData: function() {
            if (JSON.stringify(BUTTON_TO_ENTITY_POSITIONING_MAP) === "{}") {

                var controlPanelProperties = Entities.getEntityProperties(_this.entityID, 'userData');
                var controlPanelUserData = JSON.parse(controlPanelProperties.userData);

                Entities.getChildrenIDs(_this.entityID).forEach(function(controlPanelChildID) {

                    var name = Entities.getEntityProperties(controlPanelChildID, 'name').name;
                    if (name.indexOf("Control Panel Button") > -1) {

                        var stateName = name.substr(INDEX_WHERE_STATE_NAME_BEGINS).toLowerCase();
                        if (controlPanelUserData) {

                            courtyard = controlPanelUserData.movableCourtyardParts.courtyard.id;
                            roundtable = controlPanelUserData.movableCourtyardParts.roundtable.id;

                            tableHeight = Entities.getEntityProperties(roundtable, 'dimensions').dimensions.y;

                            var courtyardRaisedPosition = controlPanelUserData.movableCourtyardParts.courtyard.raisedPosition;
                            courtyardLoweredPosition = controlPanelUserData.movableCourtyardParts.courtyard.loweredPosition;
                            var roundtableRaisedPosition = controlPanelUserData.movableCourtyardParts.roundtable.raisedPosition;
                            roundtableLoweredPosition = 
                                controlPanelUserData.movableCourtyardParts.roundtable.loweredPosition;

                            var targetCourtyardPosition = (stateName === "stage") ? courtyardLoweredPosition 
                                : courtyardRaisedPosition;
                            var targetRoundtablePosition = (stateName === "roundtable") ? roundtableRaisedPosition 
                                : roundtableLoweredPosition;

                            BUTTON_TO_ENTITY_POSITIONING_MAP[controlPanelChildID] = {
                                "courtyardPosition": targetCourtyardPosition,
                                "roundtablePosition": targetRoundtablePosition
                            };
                        }
                    }
                });
            }
            
            if (Object.keys(BUTTON_TO_ENTITY_POSITIONING_MAP).length !== NUMBER_OF_BUTTONS) {
                BUTTON_TO_ENTITY_POSITIONING_MAP = {};
            }
        },

        /* PLAY A SOUND: Plays a sound at the specified position, volume, local mode, and playback 
        mode requested. */
        playSound: function(sound, volume, position, localOnly, loop) {
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

        /* Remotely called when the user presses a button. The id of the button is sent as a param and then used to 
        match an index of the map to get target positions for each entity. Call another function to set up movement 
        for each entity and then set the current button to transition color and all other buttons to inactive color.
         Play the transition sound and edit the velocity of entities that will move.
         */
        pressButton: function(thisID, params) {
            if (!ready) {
                return;
            }

            courtyardInPlace = false;
            roundtableInPlace = false;
            courtyardVelocity = 0;
            roundtableVelocity = 0;

            var buttonID = params[0];
            
            var targetCourtyardPosition = BUTTON_TO_ENTITY_POSITIONING_MAP[buttonID].courtyardPosition;
            var targetRoundtablePosition = BUTTON_TO_ENTITY_POSITIONING_MAP[buttonID].roundtablePosition;

            _this.setUpMovement(roundtable, targetRoundtablePosition);
            _this.setUpMovement(courtyard, targetCourtyardPosition);

            Object.keys(BUTTON_TO_ENTITY_POSITIONING_MAP).forEach(function(button) {
                if (button === buttonID) {
                    Entities.editEntity(button, {
                        backgroundColor: BUTTON_TRANSITION_COLOR,
                        textColor: BUTTON_INACTIVE_COLOR
                    });
                } else {
                    Entities.editEntity(button, {
                        backgroundColor: BUTTON_INACTIVE_COLOR,
                        textColor: BUTTON_TRANSITION_COLOR
                    });
                }
            });

            var soundPosition = Entities.getEntityProperties(courtyard, 'position').position;
            _this.playSound(TRANSITION_SOUND, TRANSITION_VOLUME, soundPosition, false, true);
            
            if (!roundtableInPlace && roundtableVelocity) {
                Entities.editEntity(roundtable, {
                    velocity: { x: 0, y: roundtableVelocity, z: 0 }
                });
            }

            if (!courtyardInPlace && courtyardVelocity) {
                Entities.editEntity(courtyard, {
                    velocity: { x: 0, y: courtyardVelocity, z: 0 }
                });
            }

            if (checkInterval) {
                Script.clearInterval(checkInterval);
                checkInterval = null;
            }

            checkInterval = Script.setInterval(function() {
                _this.checkEntityPositions(buttonID, targetCourtyardPosition, targetRoundtablePosition);
            }, CHECK_INTERVAL_MS);
        },

        /* Check each moveable entity and if it is still moving and close enough to its target position, slam it and clear 
        its velocity. If both entities are in place, play the done sound and set the button color to active and stop the 
        position checking interval.
        */
        checkEntityPositions: function(buttonID, targetCourtyardPosition, targetRoundtablePosition) {
            if (!courtyardInPlace) {
                var courtyardCurrentPosition = Entities.getEntityProperties(courtyard, 'position').position;
                var courtyardDistanceToTarget = courtyardCurrentPosition.y.toFixed(FIXED_DECIMAL_PLACES) - 
                targetCourtyardPosition.y.toFixed(FIXED_DECIMAL_PLACES);
                if ((courtyardVelocity < 0 && courtyardDistanceToTarget <= 0) || 
                    (courtyardVelocity > 0 && courtyardDistanceToTarget >= 0)) {
                    courtyardInPlace = true;
                }
                if (courtyardInPlace) {
                    courtyardVelocity = { x: 0, y: 0, z: 0 };
                    Entities.editEntity(courtyard, {
                        velocity: { x: 0, y: 0, z: 0 },
                        position: targetCourtyardPosition
                    });
                }
            }

            if (!roundtableInPlace){
                var roundtableCurrentPosition = Entities.getEntityProperties(roundtable, 'position').position;
                var roundtableDistanceToTarget = roundtableCurrentPosition.y.toFixed(FIXED_DECIMAL_PLACES) - 
                targetRoundtablePosition.y.toFixed(FIXED_DECIMAL_PLACES);
                if ((roundtableVelocity < 0 && roundtableDistanceToTarget <= 0) || 
                    (roundtableVelocity > 0 && roundtableDistanceToTarget >= 0)) {
                    roundtableInPlace = true;
                }
                if (roundtableInPlace) {
                    roundtableVelocity = { x: 0, y: 0, z: 0 };
                    Entities.editEntity(roundtable, {
                        velocity: { x: 0, y: 0, z: 0 },
                        position: targetRoundtablePosition
                    });
                }
            }

            if (courtyardInPlace && roundtableInPlace) {
                _this.playSound(DONE_SOUND, DONE_VOLUME, courtyardCurrentPosition, false, false);

                Entities.editEntity(buttonID, {
                    backgroundColor: BUTTON_ACTIVE_COLOR,
                    textColor: BUTTON_INACTIVE_COLOR
                });
                
                if (checkInterval) {
                    Script.clearInterval(checkInterval);
                    checkInterval = null;
                }
            }
        },

        /* Make sure this entity is in a reasonable place to begin movement. If it is too far away slam it into position 
        beneath the stage. If it is already very close to its target position, slam it into exact position and 
        always ensure it is aligned correctly on the x and z axes. Use its distance to its target positon to determine 
        the velocity it needs to get there. */ 
        setUpMovement: function(entityID, targetPosition) {
            var currentPosition = Entities.getEntityProperties(entityID, 'position').position;
    
            // This part will ensure that the observer sees movement immediately
            if (entityID === roundtable) {
                var courtyardProperties = Entities.getEntityProperties(courtyard, ['dimensions', 'position']);
                var courtyardHeight = courtyardProperties.dimensions.y;
                
                // if the top of the table is below the top of the courtyard, reposition it to be just the top of 
                // the courtyard. Using the top of the courtyard gives a little leeway to ensure the table ends up below it
                if (currentPosition.y + tableHeight * HALF <= courtyardProperties.position.y + courtyardHeight * HALF) {
                    currentPosition = {
                        x: currentPosition.x,
                        y: courtyardProperties.position.y - tableHeight * HALF,
                        z: currentPosition.z
                    };
                    Entities.editEntity(roundtable, { position: currentPosition });
                }
            }
            
            var distanceToTarget = currentPosition.y.toFixed(FIXED_DECIMAL_PLACES) - 
                targetPosition.y.toFixed(FIXED_DECIMAL_PLACES);
            if (distanceToTarget.toFixed(FIXED_DECIMAL_PLACES) === 0 || 
                Math.abs(distanceToTarget.toFixed(FIXED_DECIMAL_PLACES)) < TARGET_DEVIATION_ALLOWANCE) {
                Entities.editEntity(entityID, {
                    position: targetPosition
                });
                if (entityID === roundtable) {
                    roundtableInPlace = true;
                } else {
                    courtyardInPlace = true;
                }
                return;
            }
            
            // If the entity has somehow been moved far away, slam it into lowered position to avoid hitting anyone
            if (Math.abs(distanceToTarget) > MAX_DISTANCE_TO_TRANSITION_ENTITIES_M && 
                Math.abs(distanceToTarget) < -MAX_DISTANCE_TO_TRANSITION_ENTITIES_M) {
                currentPosition = entityID === roundtable ? roundtableLoweredPosition : courtyardLoweredPosition;
                Entities.editEntity(entityID, {
                    position: currentPosition
                });
            // If entity is very close to target position, slam into exact position
            } else if (Math.abs(distanceToTarget) < MIN_DISTANCE_TO_TRANSITION_ENTITIES_M && 
                Math.abs(distanceToTarget) > -MIN_DISTANCE_TO_TRANSITION_ENTITIES_M) {
                currentPosition = targetPosition;
                Entities.editEntity(entityID, {
                    position: targetPosition
                });
                if (entityID === roundtable) {
                    roundtableInPlace = true;
                } else {
                    courtyardInPlace = true;
                }
            }
            // If entity is not aligned along x and z axes, slam into correct position on those axes
            if (currentPosition.x.toFixed(FIXED_DECIMAL_PLACES) !== targetPosition.x.toFixed(FIXED_DECIMAL_PLACES) || 
                currentPosition.z.toFixed(FIXED_DECIMAL_PLACES) !== targetPosition.z.toFixed(FIXED_DECIMAL_PLACES)) {
                    
                currentPosition = {
                    x: targetPosition.x,
                    y: currentPosition.y,
                    z: targetPosition.z
                };
                Entities.editEntity(entityID, {
                    position: currentPosition
                });
            }
            
            // get velocity, + or -, needed to move to target along y axis 
            if (entityID === roundtable) {
                roundtableVelocity = distanceToTarget > 0 ? -TRANSITION_VELOCITY_M_PER_S : TRANSITION_VELOCITY_M_PER_S;
            } else {
                courtyardVelocity = distanceToTarget > 0 ? -TRANSITION_VELOCITY_M_PER_S : TRANSITION_VELOCITY_M_PER_S;
            }
        },

        /* Set entity velocities to 0, clear intervals and timeouts and stop the injector. */
        unload: function() {
            Entities.editEntity(roundtable, {
                velocity: { x: 0, y: 0, z: 0 }
            });
            Entities.editEntity(courtyard, {
                velocity: { x: 0, y: 0, z: 0 }
            });
            if (checkInterval) {
                Script.clearInterval(checkInterval);
                checkInterval = null;
            }
            if (injector) {
                injector.stop();
            }
            if (dataRetrievalTimeout) {
                Script.clearTimeout(dataRetrievalTimeout);
            }
        }
    };

    return new Button();
});
