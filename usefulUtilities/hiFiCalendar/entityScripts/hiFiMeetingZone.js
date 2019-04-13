// hiFiMeetingZone.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    
    var _this;

    var MeetingZone = function() {  
        _this = this;     
    };

    MeetingZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.userData = Entities.getEntityProperties(_this.entityID, ['userData']).userData;
            AvatarManager.avatarRemovedEvent.connect(_this.leaveDomain);
            if (_this.userData.length !== 0) {
                try {
                    _this.userData = JSON.parse(_this.userData);
                } catch (e) {
                    console.log(e, "Could not parse userData");
                    return;
                }
                _this.occupantsListID = _this.userData.occupantsListID;
            } else {
                console.log("No userData found");
            }
        },

        enterEntity: function() {
            Entities.callEntityServerMethod(_this.occupantsListID, "enteredMeetingZone", [MyAvatar.sessionUUID, MyAvatar.sessionDisplayName]);
        },

        leaveEntity: function() {
            Entities.callEntityServerMethod(_this.occupantsListID, "leftMeetingZone", [MyAvatar.sessionUUID]);
        },

        leaveDomain: function(uuid) {
            Entities.callEntityServerMethod(_this.occupantsListID, "leftMeetingZone", [uuid]);
        },

        unload: function() {
            AvatarManager.avatarRemovedEvent.disconnect(_this.leaveDomain);
        }
    };
    return new MeetingZone;
});