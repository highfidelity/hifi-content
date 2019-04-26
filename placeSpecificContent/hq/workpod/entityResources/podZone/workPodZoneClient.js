//
//  workPodPanelClient.js
//
//  Created by Rebecca Stankus on 04/24/19.
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var username;
    var panel;

    var PodZoneClient = function() {
        _this = this;
    };

    PodZoneClient.prototype = {
        /* Save reference to this, find the panel, connect a listener for receiving a username, and request 
        the user's username */
        preload: function(entityID){
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
        to clear any release timer for this user */
        enterEntity: function() {
            if (!username) {
                Users.requestUsernameFromID(MyAvatar.sessionUUID);
                return;
            }
            Entities.callEntityServerMethod(panel, 'clearPodReleaseTimeout', [username]);
        },

        /* If no username has been received yet, try again. Otherwise, send the panel server the user's info 
        to set a timer for 2 hours to release the pod if this user own it */
        leaveEntity: function(id, params) {
            if (!username) {
                Users.requestUsernameFromID(MyAvatar.sessionUUID);
                return;
            }
            Entities.callEntityServerMethod(panel, 'setPodReleaseTimeout', [username]);
        },

        /* Disconnect the username listener */
        unload: function() {
            Users.usernameFromIDReply.disconnect(_this.usernameFromIDReply);
        }
    };

    return new PodZoneClient();
});
