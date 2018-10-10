//
//  gameZone.js
//
//  Created by Rebecca Stankus on 08/19/2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var HALF_MULTIPLIER = 0.5;

    var _this;

    var zoneProperties;
    var preloadWhileInZone = false;

    var GameZone = function() {
        _this = this;
    };

    GameZone.prototype = {
        interval: null,

        preload: function(entityID) {
            _this.entityID = entityID;
            zoneProperties = Entities.getEntityProperties(_this.entityID, 
                ['name', 'parentID', 'rotation', 'position', 'dimensions']);
            if (_this.isAvatarInsideZone()) {
                _this.enterEntity();
            }
        },

        isAvatarInsideZone: function() {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(MyAvatar.position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF_MULTIPLIER);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },

        enterEntity: function() {
            Messages.subscribe("TriviaChannel");
        },

        leaveEntity: function() {
            Messages.unsubscribe("TriviaChannel");
        },

        unload: function() {
            if (_this.isAvatarInsideZone) {
                _this.leaveEntity();
            }
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };
        
    return new GameZone;
});
 