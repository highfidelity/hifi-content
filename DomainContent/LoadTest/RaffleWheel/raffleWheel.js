//
// raffleWheel.js
// 
// Created by Rebecca Stankus on 07/05/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Avatar, AccountServices */

(function() {
    var ANGULAR_VELOCITY = {
        x: 10,
        y: 0,
        z: 0
    };
    var ANGULAR_VELOCITY_CHECK_MS = 50;
    var ANGULAR_VELOCITY_DECREMENT = 0.09;
    var CHECKING_INTERVAL_DELAY = 100;
    var USERS_ALLOWED_TO_SPIN_WHEEL = ['philip', 'ryan', 'Becky', 'MissLiviRose', 'Firebird25', 'Alan_'];
    var MAX_CHAR_PER_LINE = 9;
    var CUT_OFF_1 = 13;
    var CUT_OFF_2 = 18;
    var CUT_OFF_3 = 24;
    var CUT_OFF_4 = 32;
    var LINE_HEIGHT_1 =0.21;
    var LINE_HEIGHT_2 =0.15;
    var LINE_HEIGHT_3 =0.115;
    var LINE_HEIGHT_4 =0.075;
    var DEFAULT_LINE_HEIGHT = 0.3;
    var SHUFFLE_DELAY = 200;


    var _this;

    function shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
      
        while (0 !== currentIndex) {
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
        interval: null,
        angularVelocityLimit: 10,
        nameText: null,
        avatarList: [],
        usernameList: [],
        listCounter: 0,

        preload: function(entityID) {
            _this.entityID = entityID;
            Users.usernameFromIDReply.connect(_this.usernameFromIDReply);
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            var position = Entities.getEntityProperties(_this.entityID, 'position').position;
            var winnerTextEntitiesArray = Entities.findEntitiesByName("Raffle Wheel Winner", position, 1);
            _this.usernameList = [];
            if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(AccountServices.username) >= 0) {
                _this.angularVelocityLimit = 10;
                _this.avatarList = AvatarList.getAvatarIdentifiers();
                _this.avatarList.forEach(function(id) {
                    Users.requestUsernameFromID(id);
                });
                Entities.editEntity(_this.entityID, {
                    angularVelocity: ANGULAR_VELOCITY
                });
                Script.setTimeout(function() {
                    shuffle(_this.usernameList);
                }, SHUFFLE_DELAY);
                Script.setTimeout(function() {
                    if (_this.interval) {
                        Script.clearInterval(_this.interval);
                    }
                    var winner;
                    _this.interval = Script.setInterval(function() {
                        var lineHeight;
                        var currentAngularVelocity = Entities.getEntityProperties(
                            _this.entityID, 'angularVelocity').angularVelocity;
                        if (currentAngularVelocity.x <= _this.angularVelocityLimit && currentAngularVelocity.x > 0) {
                            winner = _this.usernameList[_this.listCounter];
                            if (winner.length <= MAX_CHAR_PER_LINE) {
                                lineHeight = DEFAULT_LINE_HEIGHT;
                            } else if (winner.length <= CUT_OFF_1) {
                                lineHeight = LINE_HEIGHT_1;
                            } else if (winner.length <= CUT_OFF_2) {
                                lineHeight = LINE_HEIGHT_2;
                            } else if (winner.length <= CUT_OFF_3) {
                                lineHeight = LINE_HEIGHT_3;
                            } else if (winner.length <= CUT_OFF_4) {
                                lineHeight = LINE_HEIGHT_4;
                            } else {
                                winner = winner.slice(0, CUT_OFF_4 + 1);
                            }
                            Entities.editEntity(winnerTextEntitiesArray[0], {
                                lineHeight: lineHeight,
                                text: winner
                            });
                            _this.listCounter += 1;
                            _this.listCounter = _this.listCounter >= _this.usernameList.length ? 0 : _this.listCounter;
                            _this.angularVelocityLimit -= ANGULAR_VELOCITY_DECREMENT;
                        } else if (currentAngularVelocity.x === 0) {
                            if (_this.interval) {
                                // this print is purposely left as a backup way to see winner via logs
                                print("-------------RAFFLE WINNER IS: ", winner);
                                Script.clearInterval(_this.interval);
                            }
                        }
                    }, ANGULAR_VELOCITY_CHECK_MS);
                }, CHECKING_INTERVAL_DELAY);
            }
        },

        usernameFromIDReply: function(nodeID, userName, machineFingerprint, isAdmin) {
            _this.usernameList.push(userName);
        },

        unload: function(entityID) {
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };
    
    return new Wheel();
});
