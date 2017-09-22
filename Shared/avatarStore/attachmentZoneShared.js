//
//  attachmentZoneShared.js
//
//  Created by Thijs Wenker on 9/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var ATTACHMENT_ZONE_CHANNEL_PREFIX = 'io.highfidelity.attachmentZoneServer_';

module.exports = {
    getAttachmentZoneChannel: function(entityID) {
        return ATTACHMENT_ZONE_CHANNEL_PREFIX + entityID;
    }
};
