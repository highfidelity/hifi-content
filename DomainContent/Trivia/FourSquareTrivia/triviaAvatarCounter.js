//
//  avatarCounter.js
//
//  Created by Rebecca Stankus on 07/09/2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AvatarCounter = function() {
        _this = this;
    };

    AvatarCounter.prototype = {
        interval: null,

        preload: function(entityID) {
            _this.entityID = entityID;
        },

        enterEntity: function() {
            // print("SUBSCRIBING");
            Messages.subscribe("TriviaChannel");
        },

        leaveEntity: function() {
            Messages.unsubscribe("TriviaChannel");
            // print("unsubscribing");
        },

        unload: function() {
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };
        
    return new AvatarCounter;
});
 