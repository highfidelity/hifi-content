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
        /* ON LOADING THE APP: Save a reference to this entity ID */
        preload: function(entityID) {
            that.entityID = entityID;
        },

        // When left-clicking/triggering on the wheel, tell the server script on the wheel
        // to spin the wheel
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button !== "Primary") {
                return;
            }

            Entities.callEntityServerMethod(that.entityID, 'spinWheel');
        }
    };
    
    return new SpinnableWheel();
});
