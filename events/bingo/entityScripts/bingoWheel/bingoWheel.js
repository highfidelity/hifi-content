//
// bingoWheel.js
// 
// Created by Rebecca Stankus on 10/16/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global AccountServices, Audio, Entities, Math, MyAvatar, Script, String */

(function() {
    var GAME_AUDIO_POSITION = { x: -79, y: -14, z: 6 };
    var ANGULAR_VELOCITY = { x: 0, y: 0, z: -10 };
    var ANGULAR_VELOCITY_CHECK_MS = 100;
    var USERS_ALLOWED_TO_SPIN_WHEEL = ['ryan','Becky','zfox'];
    var BLIP_SOUND = SoundCache.getSound(Script.resolvePath('sounds/blip.wav'));
    var SPIN_SOUND = SoundCache.getSound(Script.resolvePath('sounds/wheelSpin.mp3?0'));
    var WAIT_BETWEEN_SPINS_MS = 500;
    var BINGO_WHEEL_ENTITY_ID = "{3a78b930-eba5-4f52-b906-f4fd78ad1ca9}";

    var _this;
    var angularVelocityDecrement = 0.5;
    var wheelReadyToSpin = true;
    var requestedAlreadyCalledNumbers = false;
    var SPIN_TIMEOUT_MS = 7500;
    var angularVelocityCheckInterval;
    var minimumVelocityLimit = -10;
    

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    /* SHUFFLE AN ARRAY: Return randomized array */
    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        while (currentIndex !== 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    /* PLAY A SOUND: Plays the specified sound at the specified volume and position */
    var injector;
    function playSound(sound, position, volume) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        remotelyCallable: ['alreadyCalledNumbersReply'],
        
        /* ON LOADING THE APP: Save a reference to this entity ID and its position */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* ON MOUSE CLICKING THE WHEEL (THIS WILL INCLUDE TRIGGERING ON WHEEL): If a right mouse click, ignore. Otherwise, 
        if at least 4 seconds have passed since the last spin, check the user's name aginst those allowed to spin the wheel. 
        If the user is allowed to spin, give the wheel an angular velocity of -10 in the z direction and play a ticking 
        sound, then set a timeout for 100MS to ensure we do not check velocity before the wheeel is spinning. Next, clear 
        any interval to be sure we do not have more than one interval running and set a new interval to check the velocity 
        of the wheel every 100MS. At this point, we have a shuffled list of possible bingo calls and the last number in 
        that list will be the final number that is chosen. To give the appearance of the wheel spinning through the list, 
        we update the text entity every interval, iterating over the list of possible calls. When the wheel has slowed to 
        a minimum velocity, we update the text entity with the final number. so, for every 100MS, we check the velocity. 
        If velocity is greater than the minimum, less than 0, and we are not on the final interval where the final number 
        will be shown, we edit the text with the next number in the list of possible numbers and increase the minimum 
        velocity to dynamically narrow the amount of time before the text entity will change again. If the angular velocity 
        is between 0 and -0.1 and we are not on the final text edit, the wheel will stop spinning soon so we pop the array 
        of possible calls and edit the text with the popped call. We send the called number to the server script and set 
        a flag that this is the final number. Now, the wheel text will not be edited during subsequent intervals and when 
        it slows to less than -0.05, we consider the spin finished and play the final beep sound, clear the interval, reset 
        the list of possible bingo calls, and set a timeout for 4seconds before the wheel can be spun again to allow time 
        for the server script to complete its tasks for this spin. */
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(AccountServices.username) >= 0 && wheelReadyToSpin){
                wheelReadyToSpin = false;
                requestedAlreadyCalledNumbers = true;
                Entities.callEntityServerMethod(_this.entityID, 'requestAlreadyCalledNumbers', ["bingoWheel", MyAvatar.sessionUUID, AccountServices.username]);

                Script.setTimeout(function() {
                    if (requestedAlreadyCalledNumbers) {
                        console.log("ERROR when requesting called numbers! Please try again.");
                        requestedAlreadyCalledNumbers = false;
                        wheelReadyToSpin = true;
                    }
                }, SPIN_TIMEOUT_MS);
            }
        },

        /* RECEIVE NUMBERS CALLED DATA FROM SERVER: Take a list of called numbers and add the appropriate prefix letter 
        then compare each possible bingo call to that list. Save all calls that have not been called into a new list and 
        shuffle that list. Then start the spin logic. */
        alreadyCalledNumbersReply: function(id, args) {
            var userWhoSpunWheel = args[1];
            requestedAlreadyCalledNumbers = false;

            if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(AccountServices.username) >= 0 &&
                userWhoSpunWheel === AccountServices.username) {
                var alreadyCalledNumbers = JSON.parse(args[0]);
                var i = 1;
                var currentGeneratedBingoCall;
                var possibleBingoCalls = [];

                while (i < 16) {
                    currentGeneratedBingoCall = "B " + String(i);
                    if (alreadyCalledNumbers.indexOf(currentGeneratedBingoCall) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 31) {
                    currentGeneratedBingoCall = "I " + String(i);
                    if (alreadyCalledNumbers.indexOf(currentGeneratedBingoCall) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 46) {
                    currentGeneratedBingoCall = "N " + String(i);
                    if (alreadyCalledNumbers.indexOf(currentGeneratedBingoCall) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 61) {
                    currentGeneratedBingoCall = "G " + String(i);
                    if (alreadyCalledNumbers.indexOf(currentGeneratedBingoCall) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                while (i < 76) {
                    currentGeneratedBingoCall = "O " + String(i);
                    if (alreadyCalledNumbers.indexOf(currentGeneratedBingoCall) === -1) {
                        possibleBingoCalls.push(currentGeneratedBingoCall);
                    }
                    i++;
                }
                shuffle(possibleBingoCalls);

                Entities.editEntity(_this.entityID, {
                    angularVelocity: ANGULAR_VELOCITY
                });
                playSound(SPIN_SOUND, GAME_AUDIO_POSITION, 0.8);

                if (angularVelocityCheckInterval) {
                    Script.clearInterval(angularVelocityCheckInterval);
                }

                var finalNumber = false;
                var listCounter = 0;
                angularVelocityCheckInterval = Script.setInterval(function() {
                    var currentAngularVelocity = Entities.getEntityProperties(
                        _this.entityID, 'angularVelocity').angularVelocity;
                    if (currentAngularVelocity.z >= minimumVelocityLimit && currentAngularVelocity.z 
                            < 0 && !finalNumber) {
                        Entities.editEntity(BINGO_WHEEL_ENTITY_ID, {
                            text: possibleBingoCalls[listCounter],
                            lineHeight: 1.58
                        });
                        listCounter++;
                        listCounter = listCounter >= possibleBingoCalls.length ? 0 : listCounter;
                        angularVelocityDecrement *= 1.001;
                        minimumVelocityLimit += angularVelocityDecrement;
                    } else if (currentAngularVelocity.z >= -0.1 && !finalNumber) {
                        finalNumber = true;
                        minimumVelocityLimit = -10;
                        var bingoCall = possibleBingoCalls.pop();
                        // Called numbers are currently generated on the client who spun the wheel.
                        Entities.callEntityServerMethod(_this.entityID, 'addCalledLetterAndNumber', [bingoCall]);
                        Entities.editEntity(BINGO_WHEEL_ENTITY_ID, {
                            text: bingoCall
                        });
                    } else if (currentAngularVelocity.z >= -0.05) {
                        if (angularVelocityCheckInterval) {
                            Script.clearInterval(angularVelocityCheckInterval);
                            angularVelocityCheckInterval = false;
                        }

                        playSound(BLIP_SOUND, GAME_AUDIO_POSITION, 0.5);

                        Script.setTimeout(function() {
                            wheelReadyToSpin = true;
                        }, WAIT_BETWEEN_SPINS_MS);
                    }
                }, ANGULAR_VELOCITY_CHECK_MS);
            }
        },

        /* ON UNLOADING THE APP: Clear any angularVelocityCheckInterval */
        unload: function(entityID) {
            if (angularVelocityCheckInterval) {
                Script.clearInterval(angularVelocityCheckInterval);
            }
        }
    };
    
    return new Wheel();
});
