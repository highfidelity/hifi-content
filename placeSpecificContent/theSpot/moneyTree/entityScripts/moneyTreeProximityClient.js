// moneyTreeProximityClient.js
//
//  Created by Mark Brosche on 10-18-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* global EventBridge Users AccountServices Agent Avatar */

(function(){
    var SECRETS = Script.require(Script.resolvePath('../moneyTreeURLs.json')),
        MONEY_TREE_CHANNEL = SECRETS.MONEY_TREE_CHANNEL,
        HALF_MULTIPLIER = 0.5;

    var _this,
        zoneProperties;

    var TreeZone = function(){
        _this = this;
    };

    TreeZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            zoneProperties = Entities.getEntityProperties(_this.entityID, 
                ['name', 'parentID', 'rotation', 'position', 'dimensions']); 
            MyAvatar.wentAway.connect(_this.isAway);
            MyAvatar.wentActive.connect(_this.hasReturned);
        },

        isAvatarInsideZone: function(position, zoneProperties) {
            var localPosition = Vec3.multiplyQbyV(Quat.inverse(zoneProperties.rotation),
                Vec3.subtract(position, zoneProperties.position));
            var halfDimensions = Vec3.multiply(zoneProperties.dimensions, HALF_MULTIPLIER);
            return -halfDimensions.x <= localPosition.x &&
                    halfDimensions.x >= localPosition.x &&
                   -halfDimensions.y <= localPosition.y &&
                    halfDimensions.y >= localPosition.y &&
                   -halfDimensions.z <= localPosition.z &&
                    halfDimensions.z >= localPosition.z;
        },        

        isAway: function() {
            if (AccountServices.loggedIn){
                if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {   
                    Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                        type: 'leaving',
                        username: AccountServices.username,
                        nodeID: MyAvatar.sessionUUID
                    }));
                }
            }
        },

        hasReturned: function() {
            if (AccountServices.loggedIn){
                if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {   
                    Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                        type: 'entering',
                        username: AccountServices.username,
                        nodeID: MyAvatar.sessionUUID
                    }));
                }
            } else {
                Window.announcement("You must be logged in to participate in the Money Tree.");
            }
        },

        enterEntity: function() {
            if (AccountServices.loggedIn){
                Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                    type: 'entering',
                    username: AccountServices.username,
                    nodeID: MyAvatar.sessionUUID
                }));
            } else {
                Window.announcement("You must be logged in to participate in the Money Tree.");
            }
        },

        leaveEntity: function() {
            if (AccountServices.loggedIn){
                Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                    type: 'leaving',
                    username: AccountServices.username,
                    nodeID: MyAvatar.sessionUUID
                }));
            }
        },

        unload: function() {
            if (_this.isAvatarInsideZone(MyAvatar.position, zoneProperties)) {
                _this.leaveEntity();
            }
        }
    };

    return new TreeZone;
});