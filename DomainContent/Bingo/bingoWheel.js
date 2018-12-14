//
// bingoWheel.js
// 
// Created by Rebecca Stankus on 10/16/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Avatar, AccountServices */

(function() {
    var ANGULAR_VELOCITY = {
        x: 0,
        y: 0,
        z: -10
    };
    var ANGULAR_VELOCITY_CHECK_MS = 100;
    var CHECKING_INTERVAL_DELAY = 100;
    var USERS_ALLOWED_TO_SPIN_WHEEL = ['ryan','Kaceyton', 'kaceytron', "Kaceytron"];
    var BLIP_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/blip.wav'));
    var SPIN_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/wheelSpin4Stretch.mp3'));
    var WAIT_BETWEEN_SPINS = 4000;

    var _this;
    var audioVolume = 0.4;
    var injector;
    var bingoSquares = [];
    var listCounter = 0;
    var angularVelocityDecrement = 0.5;
    var position;
    var canSpin = true;
    var calledNumbers = [];

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

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        remotelyCallable: ['getNumbersFromServer'],
        interval: null,
        angularVelocityLimit: 10,
        nameText: null,
        
        preload: function(entityID) {
            _this.entityID = entityID;
            position = Entities.getEntityProperties(_this.entityID, 'position').position;
        },

        getNumbersFromServer: function(id, numbers) {
            calledNumbers = JSON.parse(numbers[0]);
            var i = 1;
            var newNumber;
            while (i < 16) {
                newNumber = "B " + String(i);
                if (calledNumbers.indexOf(newNumber) === -1) {
                    bingoSquares.push(newNumber);
                }
                i++;
            }
            while (i < 31) {
                newNumber = "I " + String(i);
                if (calledNumbers.indexOf(newNumber) === -1) {
                    bingoSquares.push(newNumber);
                }
                i++;
            }
            while (i < 46) {
                newNumber = "N " + String(i);
                if (calledNumbers.indexOf(newNumber) === -1) {
                    bingoSquares.push(newNumber);
                }
                i++;
            }
            while (i < 61) {
                newNumber = "G " + String(i);
                if (calledNumbers.indexOf(newNumber) === -1) {
                    bingoSquares.push(newNumber);
                }
                i++;
            }
            while (i < 76) {
                newNumber = "O " + String(i);
                if (calledNumbers.indexOf(newNumber) === -1) {
                    bingoSquares.push(newNumber);
                }
                i++;
            }
            shuffle(bingoSquares);
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (canSpin){
                canSpin = false;
                Entities.callEntityServerMethod(_this.entityID, 'getCalledNumbers', [MyAvatar.sessionUUID]);
                var bingoNumberTexts = Entities.findEntitiesByName("Bingo Wheel Number", position, 1);
                if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(AccountServices.username) >= 0) {
                    _this.angularVelocityLimit = -10;
                    Entities.editEntity(_this.entityID, {
                        angularVelocity: ANGULAR_VELOCITY
                    });
                    _this.playSound(SPIN_SOUND);
                    Script.setTimeout(function() {
                        if (_this.interval) {
                            Script.clearInterval(_this.interval);
                        }
                        var finalNumber = false;
                        var bingoCall;
                        _this.interval = Script.setInterval(function() {
                            var currentAngularVelocity = Entities.getEntityProperties(
                                _this.entityID, 'angularVelocity').angularVelocity;
                            if (currentAngularVelocity.z >= _this.angularVelocityLimit && currentAngularVelocity.z 
                                    < 0 && !finalNumber) {
                                Entities.editEntity(bingoNumberTexts[0], {
                                    text: bingoSquares[listCounter],
                                    lineHeight: 1.58
                                });
                                listCounter++;
                                listCounter = listCounter >= bingoSquares.length ? 0 : listCounter;
                                angularVelocityDecrement *= 1.001;
                                _this.angularVelocityLimit += angularVelocityDecrement;
                            } else if (currentAngularVelocity.z >= -0.1 && !finalNumber) {
                                finalNumber = true;
                                bingoCall = bingoSquares.pop();
                                if (!bingoCall) {
                                    return;
                                }
                                Entities.callEntityServerMethod(_this.entityID, 'addCalledNumber', [bingoCall]);
                                Entities.editEntity(bingoNumberTexts[0], {
                                    text: bingoCall
                                });
                            } else if (currentAngularVelocity.z >= -0.05) {
                                if (_this.interval) {
                                    _this.playSound(BLIP_SOUND);
                                    Script.clearInterval(_this.interval);
                                    bingoSquares = [];
                                    Script.setTimeout(function() {
                                        canSpin = true;
                                    }, WAIT_BETWEEN_SPINS);
                                }
                            }
                        }, ANGULAR_VELOCITY_CHECK_MS);
                    }, CHECKING_INTERVAL_DELAY);
                }
            }
        },

        playSound: function(sound) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                // print("PLAYING SOUND AT ", JSON.stringify(position));
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: audioVolume
                });
            }
        },

        unload: function(entityID) {
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };
    
    return new Wheel();
});
