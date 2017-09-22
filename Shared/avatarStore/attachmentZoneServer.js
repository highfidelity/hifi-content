//
//  attachmentZoneServer.js
//
//  Created by Thijs Wenker on 9/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var shared = Script.require('./attachmentZoneShared.js');

    // var ATTACHMENT_ZONE_CHANNEL_PREFIX = 'io.highfidelity.attachmentZoneServer_';
    var _attachmentZoneChannel = null;
    this.preload = function(entityID) {
        _attachmentZoneChannel = shared.getAttachmentZoneChannel();
        Messages.subscribe(_attachmentZoneChannel);
        Messages.messageReceived.connect(function(channel, message, sender, localOnly) {
            if (channel === _attachmentZoneChannel) {

            }
        });
    };


});
