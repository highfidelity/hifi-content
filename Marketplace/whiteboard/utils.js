//
//  Created by Bradley Austin Davis on 2015/08/29
//  Copyright 2015 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals Entities, Vec3, Quat, Overlays, module */

var map = function(value, min1, max1, min2, max2) {
    return min2 + (max2 - min2) * ((value - min1) / (max1 - min1));
};

var vec3toStr = function(v, digits) {
    if (!digits) {
        digits = 3;
    }
    return "{ " + v.x.toFixed(digits) + ", " + v.y.toFixed(digits) + ", " + v.z.toFixed(digits) + " }";
};

var quatToStr = function(q, digits) {
    if (!digits) {
        digits = 3;
    }
    return "{ " + q.w.toFixed(digits) + ", " + q.x.toFixed(digits) + ", " +
        q.y.toFixed(digits) + ", " + q.z.toFixed(digits) + " }";
};

var vec3equal = function(v0, v1) {
    return (v0.x === v1.x) && (v0.y === v1.y) && (v0.z === v1.z);
};

var colorMix = function(colorA, colorB, mix) {
    var result = {};
    for (var key in colorA) {
        result[key] = (colorA[key] * (1 - mix)) + (colorB[key] * mix);
    }
    return result;
};

var findAction = function(name) {
    return Controller.findAction(name);
};

// FIXME fetch from a subkey of user data to support non-destructive modifications
var setEntityUserData = function(id, data) {
    var json = JSON.stringify(data);
    Entities.editEntity(id, {
        userData: json
    });
};

// FIXME do non-destructive modification of the existing user data
var getEntityUserData = function(id) {
    var results = null;
    var properties = Entities.getEntityProperties(id, "userData");
    if (properties.userData) {
        try {
            results = JSON.parse(properties.userData);
        } catch (err) {
            logDebug(err);
            logDebug(properties.userData);
        }
    }
    return results ? results : {};
};


// Non-destructively modify the user data of an entity.
var setEntityCustomData = function(customKey, id, data) {
    var userData = getEntityUserData(id);
    if (data === null) {
        delete userData[customKey];
    } else {
        userData[customKey] = data;
    }
    setEntityUserData(id, userData);
};

var getEntityCustomData = function(customKey, id, defaultValue) {
    var userData = getEntityUserData(id);
    if (undefined !== userData[customKey]) {
        return userData[customKey];
    } else {
        return defaultValue;
    }
};

var mergeObjects = function(proto, custom) {
    var result = {};
    var attrname;
    for (attrname in proto) {
        result[attrname] = proto[attrname];
    }
    for (attrname in custom) {
        result[attrname] = custom[attrname];
    }
    return result;
};

var LOG_WARN = 1;

var logWarn = function(str) {
    if (LOG_WARN) {
        print(str);
    }
};

var LOG_ERROR = 1;

var logError = function(str) {
    if (LOG_ERROR) {
        print(str);
    }
};

var LOG_INFO = 1;

var logInfo = function(str) {
    if (LOG_INFO) {
        print(str);
    }
};

var LOG_DEBUG = 0;

var logDebug = function(str) {
    if (LOG_DEBUG) {
        print(str);
    }
};

var LOG_TRACE = 0;

var logTrace = function(str) {
    if (LOG_TRACE) {
        print(str);
    }
};

// Computes the penetration between a point and a sphere (centered at the origin)
// if point is inside sphere: returns true and stores the result in 'penetration'
// (the vector that would move the point outside the sphere)
// otherwise returns false
var findSphereHit = function(point, sphereRadius) {
    var EPSILON = 0.000001; // smallish positive number - used as margin of error for some computations
    var vectorLength = Vec3.length(point);
    if (vectorLength < EPSILON) {
        return true;
    }
    var distance = vectorLength - sphereRadius;
    if (distance < 0.0) {
        return true;
    }
    return false;
};

var findSpherePointHit = function(sphereCenter, sphereRadius, point) {
    return findSphereHit(Vec3.subtract(point, sphereCenter), sphereRadius);
};

var findSphereSphereHit = function(firstCenter, firstRadius, secondCenter, secondRadius) {
    return findSpherePointHit(firstCenter, firstRadius + secondRadius, secondCenter);
};

// Given a vec3 v, return a vec3 that is the same vector relative to the avatars
// DEFAULT eye position, rotated into the avatars reference frame.
var getEyeRelativePosition = function(v) {
    return Vec3.sum(MyAvatar.getDefaultEyePosition(), Vec3.multiplyQbyV(MyAvatar.orientation, v));
};

var getAvatarRelativeRotation = function(q) {
    return Quat.multiply(MyAvatar.orientation, q);
};

var pointInExtents = function(point, minPoint, maxPoint) {
    return (point.x >= minPoint.x && point.x <= maxPoint.x) &&
        (point.y >= minPoint.y && point.y <= maxPoint.y) &&
        (point.z >= minPoint.z && point.z <= maxPoint.z);
};

/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
var hslToRgb = function(hsl) {
    var r, g, b;
    if (hsl.s === 0) {
        r = g = b = hsl.l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) {
                t += 1;
            }
            if (t > 1) {
                t -= 1;
            }
            if (t < 1 / 6) {
                return p + (q - p) * 6 * t;
            }
            if (t < 1 / 2) {
                return q;
            }
            if (t < 2 / 3) {
                return p + (q - p) * (2 / 3 - t) * 6;
            }
            return p;
        };

        var q = hsl.l < 0.5 ? hsl.l * (1 + hsl.s) : hsl.l + hsl.s - hsl.l * hsl.s;
        var p = 2 * hsl.l - q;
        r = hue2rgb(p, q, hsl.h + 1 / 3);
        g = hue2rgb(p, q, hsl.h);
        b = hue2rgb(p, q, hsl.h - 1 / 3);
    }

    return {
        red: Math.round(r * 255),
        green: Math.round(g * 255),
        blue: Math.round(b * 255)
    };
};


var orientationOf = function(vector) {
    var Y_AXIS = {
        x: 0,
        y: 1,
        z: 0
    };
    var X_AXIS = {
        x: 1,
        y: 0,
        z: 0
    };

    var RAD_TO_DEG = 180.0 / Math.PI;
    var direction, yaw, pitch;
    direction = Vec3.normalize(vector);
    yaw = Quat.angleAxis(Math.atan2(direction.x, direction.z) * RAD_TO_DEG, Y_AXIS);
    pitch = Quat.angleAxis(Math.asin(-direction.y) * RAD_TO_DEG, X_AXIS);
    return Quat.multiply(yaw, pitch);
};

var randFloat = function(low, high) {
    return low + Math.random() * (high - low);
};


var randInt = function(low, high) {
    return Math.floor(randFloat(low, high));
};

var hexToRgb = function(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        red: parseInt(result[1], 16),
        green: parseInt(result[2], 16),
        blue: parseInt(result[3], 16)
    } : null;
};

var calculateHandSizeRatio = function() {
    // Get the ratio of the current avatar's hand to Owen's hand

    var standardCenterHandPoint = 0.11288;
    var jointNames = MyAvatar.getJointNames();
    // get distance from handJoint up to leftHandIndex3 as a proxy for center of hand
    var wristToFingertipDistance = 0;
    for (var i = 0; i < jointNames.length; i++) {
        var jointName = jointNames[i];
        print(jointName);
        if (jointName.indexOf("LeftHandIndex") !== -1) {
            // translations are relative to parent joint, so simply add them together
            // joints face down the y-axis
            var translation = MyAvatar.getDefaultJointTranslation(i).y;
            wristToFingertipDistance += translation;
        }
    }
    // Right now units are in cm, so convert to meters
    wristToFingertipDistance /= 100;

    var centerHandPoint = wristToFingertipDistance / 2;

    // Compare against standard hand (Owen)
    var handSizeRatio = centerHandPoint / standardCenterHandPoint;
    return handSizeRatio;
};

var clamp = function(val, min, max) {
    return Math.max(min, Math.min(max, val));
};

var attachChildToParent = function(childName, parentName, position, searchRadius) {
    var childEntity, parentEntity;
    var entities = Entities.findEntities(position, searchRadius);
    var i;
    var entity;
    var name;
    for (i = 0; i < entities.length; i++) {
        // first go through and find the entity we want to attach to its parent
        entity = entities[i];
        name = Entities.getEntityProperties(entity, "name").name;
        if (name === childName) {
            childEntity = entity;
            break;
        }
    }

    if (!childEntity) {
        print("You are trying to attach an entity that doesn't exist! Returning");
    }

    for (i = 0; i < entities.length; i++) {
        // first go through and find the entity we want to attach to its parent
        entity = entities[i];
        name = Entities.getEntityProperties(entity, "name").name;
        if (name === parentName) {
            parentEntity = entity;
            break;
        }
    }

    if (!parentEntity) {
        print("You are trying to attach an entity to a parent that doesn't exist! Returning");
        return;
    }

    print("Successfully attached " + childName + " to " + parentName);
    Entities.editEntity(childEntity, {parentID: parentEntity});
};


var parseJSON = function(json) {
    try {
        return JSON.parse(json);
    } catch (e) {
        return undefined;
    }
};
var findSurfaceBelowPosition = function(pos) {
    var result = Entities.findRayIntersection({
        origin: pos,
        direction: { x: 0.0, y: -1.0, z: 0.0 }
    }, true);
    if (result.intersects) {
        return result.intersection;
    }
    return pos;
};


module.exports = {
    map: map,
    vec3toStr: vec3toStr,
    quatToStr: quatToStr,
    vec3equal: vec3equal,
    colorMix: colorMix,
    findAction: findAction,
    setEntityUserData: setEntityUserData,
    getEntityUserData: getEntityUserData,
    setEntityCustomData: setEntityCustomData,
    getEntityCustomData: getEntityCustomData,
    mergeObjects: mergeObjects,
    LOG_WARN: LOG_WARN,
    logWarn: logWarn,
    LOG_ERROR: LOG_ERROR,
    logError: logError,
    LOG_INFO: LOG_INFO,
    logInfo: logInfo,
    LOG_DEBUG: LOG_DEBUG,
    logDebug: logDebug,
    LOG_TRACE: LOG_TRACE,
    logTrace: logTrace,
    findSphereHit: findSphereHit,
    findSpherePointHit: findSpherePointHit,
    findSphereSphereHit: findSphereSphereHit,
    getEyeRelativePosition: getEyeRelativePosition,
    getAvatarRelativeRotation: getAvatarRelativeRotation,
    pointInExtents: pointInExtents,
    hslToRgb: hslToRgb,
    orientationOf: orientationOf,
    randFloat: randFloat,
    randInt: randInt,
    hexToRgb: hexToRgb,
    calculateHandSizeRatio: calculateHandSizeRatio,
    clamp: clamp,
    attachChildToParent: attachChildToParent,
    findSurfaceBelowPosition: findSurfaceBelowPosition 
};