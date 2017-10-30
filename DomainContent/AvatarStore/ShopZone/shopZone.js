//
//  shopZone.js
//
//  Created by Thijs Wenker on 10/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {
    var shared = Script.require('../attachmentZoneShared.js');
    this.leaveEntity = function (entityID) {
        shared.getAvatarChildEntities(MyAvatar).forEach(function (entityID) {
            var properties = Entities.getEntityProperties(entityID, ['clientOnly', 'userData']);
            try {
                var isAttachment = JSON.parse(properties.userData).Attachment !== undefined;
                if (isAttachment && !properties.clientOnly) {
                    Entities.deleteEntity(entityID);
                }
            } catch (e) {
                // e
            }
        });
    };
});
