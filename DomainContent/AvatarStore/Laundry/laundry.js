//
//  laundry.js
//
//  Created by Rebecca Stankus on 9/22/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script can be applied to an object to make it delete avatar attachments when they enter it---as a 
//  laundry basket to get rid of attachments after trying them on.

(function () {
    var _this = this;

    _this.collisionWithEntity = function (thisID, otherID, collisionInfo) {
        var otherUserData = Entities.getEntityProperties(otherID,'userData').userData;
        var isAttachment = otherUserData.indexOf("Attachment");
        var isAttached = otherUserData.indexOf("attached\":true");

        if (isAttachment !== -1 && isAttached === -1) {
            Entities.deleteEntity(otherID);
        }
    };
});
