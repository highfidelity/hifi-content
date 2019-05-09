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
    var username;

    var OccupyButton = function() {
        _this = this;
    };

    /* Save reference to this and find the panel. Request this user's username. */
    OccupyButton.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            panel = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            Users.usernameFromIDReply.connect(_this.usernameFromIDReply);
            Users.requestUsernameFromID(MyAvatar.sessionUUID);
        },

        /* Receive the user's username via signal and store it */
        usernameFromIDReply: function(nodeID, userName, machineFingerprint, isAdmin) {
            username = userName;
        },

        /* Send the panel server null values to release the room */
        pressButton: function() {
            if (!username) {
                Users.requestUsernameFromID(MyAvatar.sessionUUID);
                return;
            }
            Entities.callEntityServerMethod(panel, 'setOwnerInfo', [MyAvatar.sessionUUID, username, null, true]);
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
