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
    var PLAY_BINGO_SCRIPT = Script.resolvePath('bingoCardSpawner.js?003');

    var _this;

    var bingoWall = "{df943175-984e-4240-9acd-311351195a64}";
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
        },

        getLights: function() {
            bingoWallLights = [];
            // var childrenIdsofWall = Entities.getChildrenIDs(bingoWall);
            // print(" THE WALL HAS ", childrenIdsofWall.length, " child entities");
            Entities.getChildrenIDs(bingoWall).forEach(function(childEntity) {
                // print("FOUND A CHILD OF BINGO WALL");
                var name = Entities.getEntityProperties(childEntity, 'name').name;
                if (name.indexOf("Bingo Wall Light ") !== -1) {
                    var lightNumber = name.substring(17, name.length);
                    bingoWallLights[lightNumber] = childEntity;
                } else if (name === "Bingo Wall Header Light") {
                    // print("FOUND A HEADER LIGHT");
                    gameOnLights.push(childEntity);
                } else if (name === "Bingo Click To Play Light") {
                    // print("FOUND REGISTRATION LIGHT");
                    registrationLight = childEntity;
                } else if (name === "Bingo Click To Play Sign") {
                    // print("FOUND REGISTRATION SIGN");
                    registrationSign = childEntity;
                } else if (name === "Bingo Wheel Light") {
                    print("FOUND WHEEL LIGHT");
                    gameOnLights.push(childEntity);
                }
            });
            // print("I FOUND ", bingoWallLights.length - 1, " BINGO WALL NUMBER LIGHTS");
            // print(JSON.stringify(bingoWallLights));
        },

        newRound: function() {
            print("NEW ROUND!!!");
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
        },
        
        gameOn: function() {
            print("GAME ON");
            gameOnLights.forEach(function(light) {
                Entities.editEntity(light, { visible: true });
            });
        },

        gameOver: function() {
            print("GAME OVER");
            gameOnLights.forEach(function(light) {
                print("TURNING OFF ", light);
                Entities.editEntity(light, { visible: false });
            });
        },

        openRegistration: function() {
            print("OPEN REGISTRATION");
            Entities.editEntity(registrationLight, { visible: true });
            Entities.editEntity(registrationSign, { script: PLAY_BINGO_SCRIPT });
        },

        closeRegistration: function() {
            print("CLOSE REGISTRATION");
            Entities.editEntity(registrationLight, { visible: false });
            Entities.editEntity(registrationSign, { script: "" });
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
                print("THIS IS WHEEL...I'M SENDING THOSE NUMBERS TO YOU< ZONE!");
                var machineZoneID = params[1];
                Entities.callEntityServerMethod(machineZoneID, 'getNumbersFromServer', 
                    [JSON.stringify(_this.calledNumbers)]);
            }
        },

        clearCalledNumbers: function() {
            _this.calledNumbers = [];
        },

        addCalledNumber: function(thisID, bingoNumber) {
            print("ADDING ", bingoNumber, " TO LIST");
            _this.calledNumbers.push(bingoNumber[0]);
            var callNumber = bingoNumber[0].substring(2, bingoNumber[0].length);
            var lightOn = false;
            var blinks = 0;
            _this.interval = Script.setInterval(function() {
                print("BLINKING LIGHT ", callNumber);
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
