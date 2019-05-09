//
// workPodClaimClient.js
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

    OccupyButton.prototype = {
        /* Save reference to this, find the panel, connect a listener for receiving a username, and request 
        the user's username */
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

        /* If no username has been received yet, try again. Otherwise, send the panel server the user's info 
        to claim the pod */
        pressButton: function() {
            if (!username) {
                Users.requestUsernameFromID(MyAvatar.sessionUUID);
                return;
            }
            Entities.callEntityServerMethod(panel, 'setOwnerInfo', [MyAvatar.sessionUUID, username, 
                MyAvatar.sessionDisplayName, false, JSON.stringify(Settings.getValue("workSpace"))]);
        },

        /* If this is a left mouse button release on the entity, the button has been pressed */
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.isLeftButton) {
                return;
            }
            _this.pressButton();
        },

        /* Disconnect the username listener */
        unload: function() {
            Users.usernameFromIDReply.disconnect(_this.usernameFromIDReply);
        }
    };

    return new OccupyButton();
});
