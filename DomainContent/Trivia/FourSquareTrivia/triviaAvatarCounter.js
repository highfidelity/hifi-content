//
//  triviaAvatarCounter.js
//
//  Created by Rebecca Stankus on 08/19/2018.
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
            Messages.subscribe("TriviaChannel");
        },

        leaveEntity: function() {
            Messages.unsubscribe("TriviaChannel");
        },

        unload: function() {
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };
        
    return new AvatarCounter;
});
 