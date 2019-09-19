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

    var DONE_SOUND = SoundCache.getSound(Script.resolvePath("resources/sounds/DONE_SOUND.mp3"));
    var TRANSITION_SOUND = SoundCache.getSound(Script.resolvePath("resources/sounds/TRANSITION_SOUND.mp3"));
    var DONE_VOLUME = 0.2;
    var TRANSITION_VOLUME = 0.05;

    var INDEX_WHERE_STATE_NAME_BEGINS = 21;

    var NUMBER_OF_BUTTONS = 3;
    var BUTTON_TO_ENTITY_POSITIONING_MAP = {};

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

    var TRANSITION_VELOCITY_M_PER_S = 0.3;

    var CHECK_INTERVAL_MS = 70;
    
    var BUTTON_TRANSITION_COLOR = { red: 153, green: 153, blue: 153 };
    var BUTTON_ACTIVE_COLOR = { red: 77, green: 207, blue: 52 };
    var BUTTON_INACTIVE_COLOR = { red: 17, green: 17, blue: 17 };

    var EPSILON_FOR_COORDINATE_VALUES = 0.005;

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

    var roundtableYVelocity;
    var courtyardYVelocity;

    var roundtableInPlace;
    var courtyardInPlace;

    var checkInterval;

    var soundPosition;
    

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
            dataRetrievalTimeout = Script.setTimeout(function() {
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

                            // This will be a central position relative to all movement that occurs
                            soundPosition = courtyardRaisedPosition; 

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

            if (checkInterval) {
                Script.clearInterval(checkInterval);
                checkInterval = null;
            }

            courtyardInPlace = false;
            roundtableInPlace = false;
            courtyardYVelocity = 0;
            roundtableYVelocity = 0;

            var buttonID = params[0];
            
            var targetCourtyardPosition = BUTTON_TO_ENTITY_POSITIONING_MAP[buttonID].courtyardPosition;
            var targetRoundtablePosition = BUTTON_TO_ENTITY_POSITIONING_MAP[buttonID].roundtablePosition;

            roundtableYVelocity = _this.setUpMovementReturnYVelocity(roundtable, targetRoundtablePosition);
            courtyardYVelocity = _this.setUpMovementReturnYVelocity(courtyard, targetCourtyardPosition);

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

            _this.playSound(TRANSITION_SOUND, TRANSITION_VOLUME, soundPosition, false, true);
            
            if (!roundtableInPlace && roundtableYVelocity) {
                Entities.editEntity(roundtable, {
                    velocity: { x: 0, y: roundtableYVelocity, z: 0 }
                });
            }

            if (!courtyardInPlace && courtyardYVelocity) {
                Entities.editEntity(courtyard, {
                    velocity: { x: 0, y: courtyardYVelocity, z: 0 }
                });
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
            var courtyardCurrentPosition = Entities.getEntityProperties(courtyard, 'position').position;
            if (courtyardYVelocity && !courtyardInPlace) {
                var courtyardYDisplacementFromTarget = courtyardCurrentPosition.y - targetCourtyardPosition.y;
                // If an entity is moving down along the y axis(it has - velocity) and is below the target point 
                // (displacement is less than 0) on the y axis, it is in place. If an entity is moving up along 
                // the y axis(it has + velocity) and is above the target point(displacement is greater than 0), it is in place. 
                if ((courtyardYVelocity < 0 && courtyardYDisplacementFromTarget <= 0) || 
                    (courtyardYVelocity > 0 && courtyardYDisplacementFromTarget >= 0)) {
                    courtyardInPlace = true;
                }
                if (courtyardInPlace) {
                    courtyardYVelocity = { x: 0, y: 0, z: 0 };
                    Entities.editEntity(courtyard, {
                        velocity: courtyardYVelocity,
                        position: targetCourtyardPosition
                    });
                }
            }
            
            if (roundtableYVelocity && !roundtableInPlace){
                var roundtableCurrentPosition = Entities.getEntityProperties(roundtable, 'position').position;

                var currentRoundtableTopPosition = roundtableCurrentPosition.y + tableHeight * HALF;
                var roundtableYDisplacementFromTarget = roundtableCurrentPosition.y - targetRoundtablePosition.y;

                // Same idea as explained in comment above (line 261) but with the extra check for the following:
                // If roundtable is completely below the courtyard mid point on the y axis and moving down, 
                // snap it to lowered position. This only happens if moving from roundtable state to courtyard 
                // and will prevent the sound from continuing after the observer stops seeing movement. Using 
                // the courtyard midpoint on the y axis gives us some leeway to ensure the table is out of sight
                if ((roundtableYVelocity < 0 && 
                    (currentRoundtableTopPosition < courtyardCurrentPosition.y || roundtableYDisplacementFromTarget <= 0)) || 
                    (roundtableYVelocity > 0 && roundtableYDisplacementFromTarget >= 0)) {
                    roundtableInPlace = true;
                }

                if (roundtableInPlace) {
                    roundtableYVelocity = { x: 0, y: 0, z: 0 };
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
        setUpMovementReturnYVelocity: function(entityID, targetPosition) {
            var currentPosition = Entities.getEntityProperties(entityID, 'position').position;
    
            // If the roundtable is moving up from beneath the courtyard, place it just veneath the surface of the 
            // courtyard before moving so the observer sees movement immediately
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
            
            var yDisplacementFromTarget = currentPosition.y - targetPosition.y;

            // If entity is very close to target position, slam into exact position and return
            if (Math.abs(yDisplacementFromTarget) < EPSILON_FOR_COORDINATE_VALUES) {
                currentPosition = targetPosition;
                Entities.editEntity(entityID, {
                    position: targetPosition
                });
                if (entityID === roundtable) {
                    roundtableInPlace = true;
                } else {
                    courtyardInPlace = true;
                }
                return 0;
            // If the entity has somehow been moved far away, slam it into lowered position to avoid hitting anyone
            } else if (Math.abs(yDisplacementFromTarget) > MAX_DISTANCE_TO_TRANSITION_ENTITIES_M) {
                currentPosition = entityID === roundtable ? roundtableLoweredPosition : courtyardLoweredPosition;
                yDisplacementFromTarget = currentPosition.y - targetPosition.y;
                Entities.editEntity(entityID, {
                    position: currentPosition
                });
            }
            // If entity is not aligned along x and z axes, slam into correct position on those axes
            if (Math.abs(currentPosition.x - targetPosition.x) > EPSILON_FOR_COORDINATE_VALUES || 
                Math.abs(currentPosition.z - targetPosition.z) > EPSILON_FOR_COORDINATE_VALUES) {
                currentPosition = {
                    x: targetPosition.x,
                    y: currentPosition.y,
                    z: targetPosition.z
                };
                Entities.editEntity(entityID, {
                    position: currentPosition
                });
            }
            
            // get velocity, + or -, needed to move to target along y axis. A positive displacement requires a negative 
            // velocity to get to the target and vice versa
            return yDisplacementFromTarget > 0 ? -TRANSITION_VELOCITY_M_PER_S : TRANSITION_VELOCITY_M_PER_S;
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
