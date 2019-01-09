//
// bingoPlayerCounterserver.js
// 
// Created by Rebecca Stankus on 12/10/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var _this;

    var Counter = function() {
        _this = this;
    };

    Counter.prototype = {
        count: 0,
        remotelyCallable: ['addOne', 'reset'],
        
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        addOne: function() {
            _this.count++;
            Entities.editEntity(_this.entityID, { text: _this.count.toString() });
        },

        reset: function() {
            _this.count = 0;
            Entities.editEntity(_this.entityID, { text: "0" });
        }
    };
    
    return new Counter();
});
