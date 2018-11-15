//
// bingoWheelServer.js
// 
// Created by Rebecca Stankus on 10/16/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var LIGHT_BLINK_INTERVAL = 500;
    var PLAY_BINGO_SCRIPT = Script.resolvePath('bingoCardSpawner.js');

    var _this;

    var bingoWall = "{df198d93-a9b7-4619-9128-97a53fea2451}";
    var bingoWallLights = [];
    var gameOnLights = [];
    var registrationLight;
    var registrationSign;

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        calledNumbers: [],
        remotelyCallable: ['getCalledNumbers', 'newRound', 'addCalledNumber', 'gameOn', 'gameOver', 
            'openRegistration', 'closeRegistration'],
        
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function() {
                _this.getLights();
            }, 1000);
            Script.setTimeout(function() {
                _this.newRound();
            }, 1000);
        },

        getLights: function() {
            bingoWallLights = [];
            Entities.getChildrenIDs(bingoWall).forEach(function(childEntity) {
                var name = Entities.getEntityProperties(childEntity, 'name').name;
                if (name.indexOf("Bingo Wall Light ") !== -1) {
                    var lightNumber = name.substring(17, name.length);
                    bingoWallLights[lightNumber] = childEntity;
                } else if (name === "Bingo Wall Header Light") {
                    gameOnLights.push(childEntity);
                } else if (name === "Bingo Click To Play Light") {
                    registrationLight = childEntity;
                } else if (name === "Bingo Click To Play Sign") {
                    registrationSign = childEntity;
                } else if (name === "Bingo Wheel Light") {
                    gameOnLights.push(childEntity);
                }
            });
        },

        newRound: function() {
            _this.calledNumbers = [];
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: true });
            });
            bingoWallLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
            var position = Entities.getEntityProperties(_this.entityID, 'position').position;
            var bingoNumberTexts = Entities.findEntitiesByName("Bingo Wheel Number", position, 1);
            Entities.editEntity(bingoNumberTexts[0], {
                text: "BINGO",
                lineHeight: 1.1
            });
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
            _this.closeRegistration();
            Entities.editEntity(registrationSign, { script: "" });
        },
        
        gameOn: function() {
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: true });
            });
        },

        gameOver: function() {
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
            bingoWallLights.forEach(function(light) {
                Entities.editEntity(light, { visible: false });
            });
            _this.closeRegistration();
        },

        openRegistration: function() {
            Entities.editEntity(registrationSign, { visible: true });
        },

        closeRegistration: function() {
            Entities.editEntity(registrationSign, { visible: false});
        },

        lightOn: function(lightNumber) {
            Entities.editEntity(bingoWallLights[lightNumber], {
                visible: true
            });
        },

        lightOff: function(lightNumber) {
            Entities.editEntity(bingoWallLights[lightNumber], {
                visible: false
            });
        },

        getCalledNumbers: function(thisID, params) {
            if (!params[1]) {
                Entities.callEntityClientMethod(params[0], _this.entityID, 'getNumbersFromServer', 
                    [JSON.stringify(_this.calledNumbers)]);
            } else {
                var machineZoneID = params[1];
                Entities.callEntityMethod(machineZoneID, 'getNumbersFromServer', 
                    [JSON.stringify(_this.calledNumbers)]);
            }
        },

        clearCalledNumbers: function() {
            _this.calledNumbers = [];
        },

        addCalledNumber: function(thisID, bingoNumber) {
            _this.calledNumbers.push(bingoNumber[0]);
            var callNumber = bingoNumber[0].substring(2, bingoNumber[0].length);
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
                }
            }, LIGHT_BLINK_INTERVAL);
        }
    };
    
    return new Wheel();
});
