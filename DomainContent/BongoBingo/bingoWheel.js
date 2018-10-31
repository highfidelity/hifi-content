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
    var USERS_ALLOWED_TO_SPIN_WHEEL = ['ryan'];
    var BLIP_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/blip.wav'));
    var SEARCH_RADIUS = 200;
    var LIGHT_BLINK_INTERVAL = 500;

    var _this;
    var audioVolume = 0.4;
    var injector;
    var bingoSquares = [];
    var bingoWallLights = [];
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
        remotelyCallable: ['reset', 'getNumbersFromServer'],
        interval: null,
        angularVelocityLimit: 10,
        nameText: null,
        
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.getLights();
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

        getLights: function() {
            Entities.findEntities(position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
                var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
                if (name.indexOf("Bingo Wall Light") !== -1) {
                    var lightNumber = name.substring(17, name.length);
                    bingoWallLights[lightNumber] = nearbyEntity;
                }
            });
        },

        reset: function() {
            Entities.callEntityServerMethod(_this.entityID, 'clearCalledNumbers');
            bingoWallLights.forEach(function(light) {
                Entities.editEntity(light, { locked: false });
                Entities.editEntity(light, { visible: false });
                Entities.editEntity(light, { locked: true });
            });
            var position = Entities.getEntityProperties(_this.entityID, 'position').position;
            var bingoNumberTexts = Entities.findEntitiesByName("Bingo Wheel Number", position, 1);
            Entities.editEntity(bingoNumberTexts[0], {
                locked: false
            });
            Entities.editEntity(bingoNumberTexts[0], {
                text: "BINGO",
                lineHeight: 1.1
            });
            Entities.editEntity(bingoNumberTexts[0], {
                locked: true
            });
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (canSpin){
                canSpin = false;
                Entities.callEntityServerMethod(_this.entityID, 'getCalledNumbers', [MyAvatar.sessionUUID]);
                var position = Entities.getEntityProperties(_this.entityID, 'position').position;
                var bingoNumberTexts = Entities.findEntitiesByName("Bingo Wheel Number", position, 1);
                if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(AccountServices.username) >= 0) {
                    _this.angularVelocityLimit = -10;
                    Entities.editEntity(_this.entityID, {
                        angularVelocity: ANGULAR_VELOCITY
                    });
                    Script.setTimeout(function() {
                        if (_this.interval) {
                            Script.clearInterval(_this.interval);
                        }
                        var finalNumber = false;
                        var bingoCall;
                        var callNumber;
                        _this.interval = Script.setInterval(function() {
                            var currentAngularVelocity = Entities.getEntityProperties(
                                _this.entityID, 'angularVelocity').angularVelocity;
                            if (currentAngularVelocity.z >= _this.angularVelocityLimit && currentAngularVelocity.z 
                                    < 0 && !finalNumber) {
                                Entities.editEntity(bingoNumberTexts[0], {
                                    locked: false
                                });
                                Entities.editEntity(bingoNumberTexts[0], {
                                    text: bingoSquares[listCounter],
                                    lineHeight: 1.58
                                });
                                Entities.editEntity(bingoNumberTexts[0], {
                                    locked: true
                                });
                                listCounter++;
                                listCounter = listCounter >= bingoSquares.length ? 0 : listCounter;
                                angularVelocityDecrement *= 1.001;
                                _this.angularVelocityLimit += angularVelocityDecrement;
                            } else if (currentAngularVelocity.z >= -0.1 && !finalNumber) {
                                finalNumber = true;
                                bingoCall = bingoSquares.pop();
                                if (!bingoCall) {
                                    print("ALL NUMBERS HAVE BEEN CALLED. START A NEW GAME");
                                    return;
                                }
                                Entities.callEntityServerMethod(_this.entityID, 'addCalledNumber', [bingoCall]);
                                callNumber = bingoCall.substring(2, bingoCall.length);
                                Entities.editEntity(bingoNumberTexts[0], {
                                    locked: false
                                });
                                Entities.editEntity(bingoNumberTexts[0], {
                                    text: bingoCall
                                });
                                Entities.editEntity(bingoNumberTexts[0], {
                                    locked: true
                                });
                            } else if (currentAngularVelocity.z >= -0.05) {
                                if (_this.interval) {
                                    _this.playSound(BLIP_SOUND);
                                    Script.clearInterval(_this.interval);
                                    bingoSquares = [];
                                    var lightOn = false;
                                    var blinks = 0;
                                    _this.interval = Script.setInterval(function() {
                                        blinks++;
                                        if (lightOn) {
                                            _this.lightOff(callNumber);
                                            lightOn = false;
                                        } else {
                                            _this.lightOn(callNumber);
                                            lightOn = true;
                                        }
                                        if (blinks > 6) {
                                            Script.clearInterval(_this.interval);
                                            canSpin = true;
                                        }
                                    }, LIGHT_BLINK_INTERVAL);
                                }
                            }
                        }, ANGULAR_VELOCITY_CHECK_MS);
                    }, CHECKING_INTERVAL_DELAY);
                }
            }
        },

        lightOn: function(lightNumber) {
            Entities.editEntity(bingoWallLights[lightNumber], {
                locked: false
            });
            Entities.editEntity(bingoWallLights[lightNumber], {
                visible: true
            });
            Entities.editEntity(bingoWallLights[lightNumber], {
                locked: true
            });
        },

        lightOff: function(lightNumber) {
            Entities.editEntity(bingoWallLights[lightNumber], {
                locked: false
            });
            Entities.editEntity(bingoWallLights[lightNumber], {
                visible: false
            });
            Entities.editEntity(bingoWallLights[lightNumber], {
                locked: true
            });
        },

        playSound: function(sound) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
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
