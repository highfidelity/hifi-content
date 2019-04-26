//
// workPodReleaseClient.js
// 
// Edited by Rebecca Stankus on 04/22/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/

(function() {

    var _this;

    var panel;

    var OccupyButton = function() {
        _this = this;
    };

    /* Save reference to this and find the panel */
    OccupyButton.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            panel = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
        },

        /* Send the panel server null values to release the room */
        pressButton: function() {
            Entities.callEntityServerMethod(panel, 'setOwnerInfo', [MyAvatar.sessionUUID, null, null]);
        },

        /* If this is a left mouse button release on the entity, the button has been pressed */
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.isLeftButton) {
                return;
            }
            _this.pressButton();
        }
    };

    return new OccupyButton();
});
