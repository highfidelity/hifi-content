//
//  invasionUtils.js
//
//  Created by David Back on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* globals Entities, Vec3, Quat, Overlays, module */

var MINIMUM_POWER_DEVICE_HEALTH = 0.0;
var MAXIMUM_POWER_DEVICE_HEALTH = 1.0;
    
var HEALTH_BAR_LENGTH = 5;
var HEALTH_BAR_HEIGHT = 5;

var ALIEN_BARREL_LOCAL_OFFSET = {x:1.35, y:0.09, z:-0.6};
var ALIEN_BARREL_LOCAL_DIRECTION = {x:1.0, y:-0.4, z:-0.3};

var LASER_SOUND = "https://hifi-content.s3.amazonaws.com/davidback/development/themepark/invasion/laser.wav";
var LASER_VOLUME = 0.2;

var ALIEN_CHANNEL_BASE = "AlienChannel";
var INVASION_CHANNEL = "InvasionChannel";
var REPAIR_CHANNEL = "RepairChannel";

var INVASION_STATUS = {
    IDLE: 0,
    WARNING: 1,
    ATTACKING: 2,
    ALIENS_FAILED: 3,
    ALIENS_SUCCEEDED: 4
};

var UFO_STATUS = {
    MOVING: 0,
    ATTACKING: 1,
    CRASHING: 2
};

var getAlienBarrelPosition = function(entityID) {
    var properties = Entities.getEntityProperties(entityID, ['position', 'rotation']);
    var barrelLocalPosition = Vec3.multiplyQbyV(properties.rotation, ALIEN_BARREL_LOCAL_OFFSET);
    var barrelWorldPosition = Vec3.sum(properties.position, barrelLocalPosition);
    return barrelWorldPosition;
};

var getAlienBarrelDirection = function(entityID) {
    var rotation = Entities.getEntityProperties(entityID, ['rotation']).rotation;
    var barrelAdjustedDirection = Vec3.multiplyQbyV(rotation, ALIEN_BARREL_LOCAL_DIRECTION);
    return barrelAdjustedDirection;
};

var getAlienFireRotation = function(alienEntity, fireAtEntity) {
    var targetPosition = Entities.getEntityProperties(fireAtEntity, ['position']).position;
    var barrelDirection = getAlienBarrelDirection(alienEntity);
    var barrelPosition = getAlienBarrelPosition(alienEntity);
    var toTargetDirection = Vec3.subtract(targetPosition, barrelPosition);
    var currentRotation = Entities.getEntityProperties(alienEntity, ['rotation']).rotation;
    var rotationBetween = Quat.rotationBetween(barrelDirection, toTargetDirection);
    var newRotation = Quat.multiply(rotationBetween, currentRotation);
    return newRotation;
};

var getPowerDeviceHealth = function(entityID) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        if (userData.PowerDeviceHealth !== undefined) {
            return userData.PowerDeviceHealth;
        }
    }
    return 1.0;
};

var setPowerDeviceHealth = function(entityID, health) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        userData.PowerDeviceHealth = health;
        Entities.editEntity(entityID, {userData: JSON.stringify(userData)});
        return true;
    }
    return false;
};

var getAlienHealth = function(entityID) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        if (userData.AlienHealth !== undefined) {
            return userData.AlienHealth;
        }
    }
    return 1.0;
};

var setAlienHealth = function(entityID, health) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        userData.AlienHealth = health;
        Entities.editEntity(entityID, {userData: JSON.stringify(userData)});
        return true;
    }
    return false;
};

var getAlienStatus = function(entityID) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        if (userData.AlienStatus !== undefined) {
            return userData.AlienStatus;
        }
    }
    return 0;
};

var setAlienStatus = function(entityID, status) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        userData.AlienStatus = status;
        Entities.editEntity(entityID, {userData: JSON.stringify(userData)});
        return true;
    }
    return false;
};

var getAlienTarget = function(entityID) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        if (userData.TargetEntity !== undefined) {
            return userData.TargetEntity;
        }
    }
    return 0;
};

var setAlienTarget = function(entityID, target) {
    var properties = Entities.getEntityProperties(entityID, ['userData']);
    if (properties.userData) {
        var userData = JSON.parse(properties.userData);
        userData.TargetEntity = target;
        Entities.editEntity(entityID, {userData: JSON.stringify(userData)});
        return true;
    }
    return false;
};


var addHealthBarBG = function(entityID, localOffset) {
    var healthBarBGID = Overlays.addOverlay("image3d", {
        url: "https://hifi-content.s3.amazonaws.com/davidback/development/themepark/invasion/healthBarRed.svg",
        dimensions: { x: HEALTH_BAR_LENGTH, y: HEALTH_BAR_HEIGHT },
        parentID: entityID,
        localPosition: localOffset,
        alpha: 1.0,
        ignoreRayIntersection: true,
        isFacingAvatar: true,
        drawInFront: true,
        visible: true
    });
    return healthBarBGID;
};

var addHealthBar = function(healthBarBGID) {
    var healthBarID = Overlays.addOverlay("image3d", {
        url: "https://hifi-content.s3.amazonaws.com/davidback/development/themepark/invasion/healthBarGreen.svg",
        dimensions: { x: HEALTH_BAR_LENGTH, y: HEALTH_BAR_HEIGHT },
        parentID: healthBarBGID,
        localPosition: { x: 0, y: 0, z: -0.01 },
        localRotation: { x: 0, y: 0, z: 0, w:1 },
        alpha: 1.0,
        ignoreRayIntersection: true,
        isFacingAvatar: true,
        drawInFront: true,
        visible: true
    });
    return healthBarID;
};

var updateHealthBar = function(healthBarID, healthBarPercent) {
    var newLength = HEALTH_BAR_LENGTH * healthBarPercent;
    if (newLength > 0.0) {
        Overlays.editOverlay(healthBarID, {
            dimensions: { x: newLength, y: HEALTH_BAR_HEIGHT },
            visible: true
        });
    } else {
        Overlays.editOverlay(healthBarID, {
            visible: false
        });
    }
};

module.exports = {
    MINIMUM_POWER_DEVICE_HEALTH: MINIMUM_POWER_DEVICE_HEALTH,
    MAXIMUM_POWER_DEVICE_HEALTH: MAXIMUM_POWER_DEVICE_HEALTH,
    HEALTH_BAR_LENGTH: HEALTH_BAR_LENGTH,
    HEALTH_BAR_HEIGHT: HEALTH_BAR_HEIGHT,
    ALIEN_BARREL_LOCAL_OFFSET: ALIEN_BARREL_LOCAL_OFFSET,
    ALIEN_BARREL_LOCAL_DIRECTION: ALIEN_BARREL_LOCAL_DIRECTION,
    LASER_SOUND: LASER_SOUND,
    LASER_VOLUME: LASER_VOLUME,
    ALIEN_CHANNEL_BASE: ALIEN_CHANNEL_BASE,
    INVASION_CHANNEL: INVASION_CHANNEL,
    REPAIR_CHANNEL: REPAIR_CHANNEL,
    
    INVASION_STATUS: INVASION_STATUS,
    UFO_STATUS: UFO_STATUS,

    getAlienBarrelPosition: getAlienBarrelPosition,
    getAlienBarrelDirection: getAlienBarrelDirection,
    getAlienFireRotation: getAlienFireRotation,
    getPowerDeviceHealth: getPowerDeviceHealth,
    setPowerDeviceHealth: setPowerDeviceHealth,
    getAlienHealth: getAlienHealth,
    setAlienHealth: setAlienHealth,
    getAlienStatus: getAlienStatus,
    setAlienStatus: setAlienStatus,
    getAlienTarget: getAlienTarget,
    setAlienTarget: setAlienTarget,
    addHealthBarBG: addHealthBarBG,
    addHealthBar: addHealthBar,
    updateHealthBar: updateHealthBar
};
