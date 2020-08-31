//
//  privacyButton_client.js
//
//  Created by Rebecca Stankus on 0/09/19.
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var MAX_DISTANCE_TO_OPERATE_M = 3.11309;

    var buttonPosition;

    var PrivacyButton = function() {
        _this = this;
    };

    PrivacyButton.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            buttonPosition = Entities.getEntityProperties(_this.entityID, 'position').position;
        },

        mousePressOnEntity: function(entityID, event) {
            if (event.isPrimaryButton && Vec3.distance(MyAvatar.position, buttonPosition) < MAX_DISTANCE_TO_OPERATE_M) {
                Entities.callEntityServerMethod(_this.entityID, "transition");
            }
        }
    };

    return new PrivacyButton();
});
