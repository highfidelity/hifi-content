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
    var _this;

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        calledNumbers: [],
        remotelyCallable: ['getCalledNumbers', 'clearCalledNumbers', 'addCalledNumber'],
        
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        getCalledNumbers: function(thisID, params) {
            if (!params[1]) {
                Entities.callEntityClientMethod(params[0], _this.entityID, 'getNumbersFromServer', 
                    [JSON.stringify(_this.calledNumbers)]);
            } else {
                var machineZoneID =params[1];
                Entities.callEntityClientMethod(params[0], machineZoneID, 'getNumbersFromServer', 
                    [JSON.stringify(_this.calledNumbers)]);
            }
        },

        clearCalledNumbers: function() {
            _this.calledNumbers = [];
        },

        addCalledNumber: function(thisID, bingoNumber) {
            _this.calledNumbers.push(bingoNumber[0]);
        }
    };
    
    return new Wheel();
});
