// hiFiMeetingZone.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var ORIGIN = {x:0, y:0, z: 0};
    var RADIUS = 100000;
    
    var _this;
    var roomName;
    var occupantTextEntityId;

    var MeetingZone = function() {
        _this = this;        
    };

    MeetingZone.prototype = {
        preload: function(entityId) {
            _this.entityId = entityId;
            roomName = Entities.getEntityProperties(_this.entityId, ['name']).name;
            occupantTextEntityId = Entities.findEntitiesByName(roomName + '_OCCUPANTS', ORIGIN, RADIUS)[0];
        },

        enterEntity: function() {
            Entities.callEntityServerMethod(occupantTextEntityId, "enteredMeetingZone", [MyAvatar.sessionDisplayName]);
        },

        leaveEntity: function() {
            Entities.callEntityServerMethod(occupantTextEntityId, "leftMeetingZone", [MyAvatar.sessionDisplayName]);
        }
    };
    return new MeetingZone;
});