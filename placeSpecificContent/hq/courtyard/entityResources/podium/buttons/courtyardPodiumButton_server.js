//
// courtyardPodiumButton_server.js
// 
// Created by Rebecca Stankus on 07/16/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {

    var BUTTON_PRESS_OFFSET = 0.02;
    var DEFAULT_LOCAL_Y_POSITION_M = 0.4771347;
    var RED = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonRed.fbx";
    var GREEN = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonGreen.fbx";

    var _this;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        remotelyCallable: ['lowerButton', 'raiseButton'],

        preload: function(entityID) {
            _this.entityID = entityID;
        },

        // Move button up and change to green
        raiseButton: function() {
            var localPosition = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
            Entities.editEntity(_this.entityID, {
                localPosition: { x: localPosition.x, y: DEFAULT_LOCAL_Y_POSITION_M, z: localPosition.z },
                modelURL: GREEN
            });
        },

        // Move button down and change to red
        lowerButton: function() {
            var localPosition = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
            localPosition.y -= BUTTON_PRESS_OFFSET;
            Entities.editEntity(_this.entityID, {
                localPosition: localPosition,
                modelURL: RED
            });
        }
    };

    return new Button();
});
