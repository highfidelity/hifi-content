//
//  marketplaceItemAdvertiser.js
//
//  Created by Zach Fox on 2019-02-25
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    var MarketplaceItemAdvertiser = function() {};

    MarketplaceItemAdvertiser.prototype = {
        mousePressOnEntity: function(id, event) {
            if (event.isLeftButton) {
                var properties = Entities.getEntityProperties(id, ["userData"]);
                var userData;
    
                try {
                    userData = JSON.parse(properties.userData);
                } catch (e) {
                    console.error("Error parsing userData: ", e);
                    return;
                }
    
                if (userData) {
                    if (userData.marketplaceID) {
                        var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
                        tablet.loadQMLSource("hifi/commerce/checkout/Checkout.qml");
                        tablet.sendToQml({
                            method: 'updateCheckoutQMLItemID',
                            params: {itemId: userData.marketplaceID}
                        });
                    } 
                }
            }
        }
    };

    return new MarketplaceItemAdvertiser();
});
