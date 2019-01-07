//  gameZoneClient.js
//
//  Created by Rebecca Stankus on 08/19/2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var HALF_MULTIPLIER = 0.5;
    var TRIVIA_CHANNEL = Script.require(Script.resolvePath("../Client Scripts/triviaInfo.json")).TRIVIA_CHANNEL;

    var _this;
    var zoneProperties;
    var isSubscribedToChannel = false;
    var gameZone;

    var GameZone = function() {
        _this = this;
    };

    GameZone.prototype = {
        interval: null,

        preload: function(entityID) {
            _this.entityID = entityID;
            zoneProperties = Entities.getEntityProperties(_this.entityID, 
                ['name', 'parentID', 'rotation', 'position', 'dimensions']);
            if (this.isAvatarInsideZone() && !isSubscribedToChannel) {
                Messages.subscribe(TRIVIA_CHANNEL);
                isSubscribedToChannel = true;
            }
            gameZone = Entities.getEntityProperties(
                Entities.findEntitiesByName("Trivia Player Game Zone", MyAvatar.position, 100)[0], ['position']);
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
            if (!isSubscribedToChannel) {
                Messages.subscribe(TRIVIA_CHANNEL);
                isSubscribedToChannel = true;
            }
        },

        leaveEntity: function() {
            if (isSubscribedToChannel) {
                Messages.unsubscribe(TRIVIA_CHANNEL);
                isSubscribedToChannel = false;
            }
            var playerValidator = Entities.findEntitiesByName(MyAvatar.sessionUUID, gameZone.position, 5);
            for (var i = 0; i < playerValidator.length; i++){
                Entities.callEntityServerMethod(_this.entityID, "deleteValidator", [playerValidator[i]]);
            }
            Settings.setValue("activeTriviaColor", null);
        },

        unload: function() {
            _this.leaveEntity();
        }
    };
        
    return new GameZone;
});
 