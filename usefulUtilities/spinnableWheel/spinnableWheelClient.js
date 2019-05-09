/* eslint-disable no-magic-numbers */
//
// spinnableWheelClient.js
// 
// Created by Zach Fox on 2019-04-19
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var that;

    var SpinnableWheel = function() {
        that = this;
    };

    SpinnableWheel.prototype = {
        // When the entity client script loads, store a reference to the attached entity's ID.
        preload: function(entityID) {
            that.entityID = entityID;
        },

        // When a user clicks on the entity, send a message to the entity's server script to
        // spin the wheel.
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button !== "Primary") {
                return;
            }

            Entities.callEntityServerMethod(that.entityID, 'spinWheel');
        }
    };
    
    return new SpinnableWheel();
});
