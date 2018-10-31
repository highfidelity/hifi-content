//
//  bingoCardSpawner.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge, AccountServices Script, Xform */

(function() {
   
    var GET_CARD_SOUND = SoundCache.getSound(Script.resolvePath("assets/sounds/bingoWish.wav"));
    var BINGO_STRING = "BINGO";
    var COLUMN_RANGE = 15;

    var _this;

    var injector;
    var userCardNumbers = [];
    var rowMinimum;
    var spreadsheetURL;
    var userName;
    var canClick = true;

    var isRunningStandaloneBingoApp = function() {
        var _standaloneScriptName = 'card.js?007';
        var isRunning = false;
        ScriptDiscoveryService.getRunning().forEach(function(script){
            if (script.name === _standaloneScriptName) {
                isRunning = true;
            }
        });
        return isRunning;
    };

    var BingoCardSpawner = function() {
        _this = this;
    };

    BingoCardSpawner.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            spreadsheetURL = "https://script.google.com/macros/s/AKfycbzFuuJ30c_qUZmBB8PnjLtunaJx1VbhSRFjsy_6wocR2_p7wohJ/exec";
        },

        endGame: function() {
            ScriptDiscoveryService.stopScript(Script.resolvePath('./card/card.js'));     
            canClick = true;
        },

        encodeURLParams: function (params) {
            var paramPairs = [];
            for (var key in params) {
                paramPairs.push(key + "=" + params[key]);
            }
            return paramPairs.join("&");
        },

        mousePressOnEntity: function(id, event) {
            if (event.isLeftButton && canClick) {
                userName = AccountServices.username;
                canClick = false;
                _this.playSound(GET_CARD_SOUND, 0.5, true);
                var searchParamString = this.encodeURLParams({
                    type: "search",
                    username: userName
                });
                var searchRequest = new XMLHttpRequest();
                searchRequest.open('GET', spreadsheetURL + "?" + searchParamString);
                searchRequest.timeout = 10000;
                searchRequest.ontimeout = function() {
                    print("bingo: request timed out");
                };
                searchRequest.onreadystatechange = function() { 
                    if (searchRequest.readyState === 4) {
                        if (searchRequest.response === "New username") {
                            _this.createCard(true);
                            
                        } else if (searchRequest.response) {
                            var userNumbersToSplit = searchRequest.response.substring(2, searchRequest.response.length - 2);
                            userCardNumbers = userNumbersToSplit.split(",");
                        }
                        if (!isRunningStandaloneBingoApp()) {
                            ScriptDiscoveryService.loadScript(Script.resolvePath('./card/card.js'));
                        } 
                    }
                };
                searchRequest.send();
                canClick = true;
            }
        },

        createCard: function() {
            userCardNumbers = [];
            rowMinimum = 1;
            for (var i = 0; i < BINGO_STRING.length; i++) {
                var rows = 5;
                for (var currentRow = 0; currentRow < rows; currentRow++) {
                    if (!(i === 2 && currentRow === 2)) {
                        _this.getRandomNumber();
                    }
                } 
                rowMinimum += COLUMN_RANGE;
            }
            _this.storeUser();
        },

        storeUser: function() {
            var addParamString = _this.encodeURLParams({
                type: "add",
                username: userName,
                cardNumbers: JSON.stringify(userCardNumbers)
            });
            var addRequest = new XMLHttpRequest();
            addRequest.open('GET', spreadsheetURL + "?" + addParamString);
            addRequest.timeout = 10000;
            addRequest.ontimeout = function() {
                print("bingo: request timed out");
            };
            addRequest.onreadystatechange = function() { 
                if (addRequest.readyState === 4) {
                    print(addRequest.response);
                }
            };
            addRequest.send();
        },

        contains: function(array, number) {
            for (var i = 0 ; i < array.length; i++) {
                if (array[i] === number) {
                    return true;
                }
            }
            return false;
        },

        getRandomNumber: function() {
            var randomNumber = Math.floor(Math.random() * Number(COLUMN_RANGE) + Number(rowMinimum));
            if (!_this.contains(userCardNumbers, randomNumber)) {
                userCardNumbers.push(randomNumber);
                return randomNumber;
            }
            return _this.getRandomNumber();
        },

        playSound: function(sound, volume, localOnly) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: MyAvatar.position,
                    volume: volume,
                    localOnly: localOnly
                });
            }
        }
    };

    return new BingoCardSpawner();
});
