//
// bingoPlayerCounterserver.js
// 
// Created by Rebecca Stankus on 12/10/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global Entities */

(function() {
    var _this;

    var Counter = function() {
        _this = this;
    };

    Counter.prototype = {
        count: 0,
        remotelyCallable: ['addOne', 'reset'],
        
        /* ON LOADING THE APP: Save a reference to this entity ID */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* ADD ANOTHER USER: Increase total user by one and update the text */
        addOne: function() {
            _this.count++;
            Entities.editEntity(_this.entityID, { text: _this.count.toString() });
        },

        /* RESET THE COUNTER: Set the count and text back to 0 */
        reset: function() {
            _this.count = 0;
            Entities.editEntity(_this.entityID, { text: "0" });
        }
    };
    
    return new Counter();
});
