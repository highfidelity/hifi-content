//
//  checkoutZone.js
//
//  Created by Rebecca Stankus on 9/29/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This zone will provide an area at which a user may purchase an item. When the avatar enters the zone wearing a marketplace item, 
//  the tablet will open to the marketplace home page for that item, allowing the user to quickly make the purchase.

(function () {
    var SHARED = Script.require('./attachmentZoneShared.js');
    var _this = this;
    _this.enterEntity = function (entityID) {
        SHARED.getAvatarChildEntities(MyAvatar).forEach(function (entityID) {
            var childUserData = Entities.getEntityProperties(entityID, 'userData').userData;
            var isAttachment = childUserData.indexOf("Attachment");
            var marketplaceID = Entities.getEntityProperties(entityID, 'marketplaceID').marketplaceID;
            print("marketplace id is : " + marketplaceID);
            var marketplaceURL = "https://metaverse.highfidelity.com/marketplace/items/" + marketplaceID;
            if (isAttachment !== -1 && marketplaceID !== null) {
                var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
                tablet.gotoWebScreen(marketplaceURL);
            }
        });
    };
});