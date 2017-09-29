//
//  attachmentRemoval.js
//
//  Created by Rebecca Stankus on 9/26/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script acts on a zone to make it remove all avatar attachments when an avatar enters the zone.

(function () {
    var shared = Script.require('./attachmentZoneShared.js');
    var _this = this;
    _this.enterEntity = function (entityID) {
        shared.getAvatarChildEntities(MyAvatar).forEach(function (entityID) {
            var childUserData = Entities.getEntityProperties(entityID, 'userData').userData;
            var isAttachment = childUserData.indexOf("Attachment");
            if (isAttachment !== -1) {
                Entities.deleteEntity(entityID);
            } 
        });
    };
});
