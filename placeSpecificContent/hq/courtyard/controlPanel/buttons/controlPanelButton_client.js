//
// controlPanelButton_client.js
// 
// Created by Rebecca Stankus on 07/16/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {

    var _this;

    var MAX_DISTANCE_TO_OPERATE_M = 3.11309;

    var buttonPosition;
    var controlPanel;

    var PrivacyButton = function() {
        _this = this;
    };

    PrivacyButton.prototype = {

        /* Get Id for control panel to send button press actions */
        preload: function(entityID) {
            _this.entityID = entityID;
            controlPanel = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            buttonPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
        },

        /* Tell the control panel server that a button was pressed. It will receive the ID of this button with the message */
        mousePressOnEntity: function(entityID, event) {
            if (event.isPrimaryButton && Vec3.distance(MyAvatar.position, buttonPosition) < MAX_DISTANCE_TO_OPERATE_M) {
                Entities.callEntityServerMethod(controlPanel, "pressButton", [_this.entityID]);
            }
        }
    };

    return new PrivacyButton();
});
