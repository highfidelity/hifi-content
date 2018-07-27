// Helper.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Util Library for Common Tasks

// DEPENDENCIES
Script.include("./VectorMath.js?" + Date.now());

// Avatar
// ----------------------------------------------------------------------------
function inFrontOf(distance, position, orientation) {
    return Vec3.sum(position || MyAvatar.position,
        Vec3.multiply(distance, Quat.getForward(orientation || MyAvatar.orientation)));
}

// Color
// ----------------------------------------------------------------------------
function colorMix(colorA, colorB, mix) {
    var result = {};
    for (var key in colorA) {
        result[key] = (colorA[key] * (1 - mix)) + (colorB[key] * mix);
    }
    return result;
}

function hslToRgb(hsl) {
    var r, g, b;
    if (hsl.s == 0) {
        r = g = b = hsl.l; // achromatic
    } else {
        var hue2rgb = function hue2rgb(p, q, t) {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        }

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
}

// Debug
// ----------------------------------------------------------------------------

function formatObj(obj) {
    var formatedOBj = {};        
    for (var key in obj) {
        if (typeof obj[key] === "number") {
            formatedOBj[key] = obj[key].toFixed(3);
        }
        if (typeof obj[key] === "object") {
            formatedOBj[key] = formatObj(obj[key]);
        }
        if (typeof obj[key] === "string") {
            formatedOBj[key] === obj[key];
        }
    }
    return formatedOBj;
}

function log(configGroup) {
    var deBounceGroup = {};
    var deBounceCheck = function(oldTime, newTime, bounceTime) {
        if (newTime - oldTime > bounceTime) {
            return true;
        }
        return false;
    };
    return function (group, title, value, bounce) {

        if (configGroup[group]) {
            var printString = arguments.length === 2 || value === null
                ? group + " :: " + title
                : group + " :: " + title + " :: " + JSON.stringify(value);
            if (bounce) {
                var key = group+title+value+bounce;
                
                if (!deBounceGroup[key]) {
                    deBounceGroup[key] = Date.now();
                    console.log(printString);
                } else {
                    if (deBounceCheck(deBounceGroup[key], Date.now(), bounce)) {
                        deBounceGroup[key] = Date.now();
                        console.log(printString);
                    } else {
                        return;
                    }
                }
            } else {
                console.log(printString);
            }
        }
    };
}

function makeColor(red, green, blue) {
    var obj = {};
    obj.red = red;
    obj.green = green;
    obj.blue = blue;
    return obj;
}

// Entities
// ----------------------------------------------------------------------------

function getNameProps(name, position, radius) {
    position = position || MyAvatar.position;
    radius = radius || 20;
    var ents = Entities.findEntitiesByName(name, position, radius)[0];
    if (ents) {
        return [ents, Entities.getEntityProperties(ents)];
    }
}

function getProps(id, props) {
    if (props) {
        return Entities.getEntityProperties(id, props);
    } else {
        return Entities.getEntityProperties(id);
    }
}

function getUserData(id, defaultObject, cb) {
    defaultObject = defaultObject || {};
    var userData = Entities.getEntityProperties(id, ["userData"]).userData;
    var parsedData = defaultObject;
    try {
        parsedData = JSON.parse(userData);
        if (cb) {
            cb(parsedData);
        }
        return parsedData;
    } catch (e) {
        return parsedData;
    }
}

function searchForChildren(parentID, names, callback, timeoutMs, outputPrint) {
    // Map from name to entity ID for the children that have been found
    var foundEntities = {};
    for (var i = 0; i < names.length; ++i) {
        foundEntities[names[i]] = null;
    }

    const CHECK_EVERY_MS = 500;
    const maxChecks = Math.ceil(timeoutMs / CHECK_EVERY_MS);

    var check = 0;
    var intervalID = Script.setInterval(function() {
        check++;

        var childrenIDs = Entities.getChildrenIDs(parentID);
        if (outputPrint) {
            print("\tNumber of children:", childrenIDs.length);
        }
        for (var i = 0; i < childrenIDs.length; ++i) {
            if (outputPrint) {
                print("names: " + JSON.stringify(names));
                print("\t\t" + i + ".", Entities.getEntityProperties(childrenIDs[i]).name);
            }

            var id = childrenIDs[i];
            var name = Entities.getEntityProperties(id, 'name').name;
            var idx = names.indexOf(name);
            if (idx > -1) {
                foundEntities[name] = id;
                print(name, id);
                names.splice(idx, 1);
                childrenIDs.splice(i, 1)
            }
        }

        if (names.length === 0 || check >= maxChecks) {
            Script.clearInterval(intervalID);
            callback(foundEntities);
        }
    }, CHECK_EVERY_MS);
}

function searchForEntityNames(names, position, callback, timeoutMs, outputPrint) {
    var foundEntities = {};
    names.forEach(function(name) {
        foundEntities[name] = null;
    })

    const CHECK_EVERY_MS = 500;
    const maxChecks = Math.ceil(timeoutMs / CHECK_EVERY_MS);

    var check = 0;
    var intervalID = Script.setInterval(function() {
        check++;

        names.forEach(function(name, index) {
            var ents = Entities.findEntitiesByName(name, position, 50);
            if (ents.length === 1) {
                foundEntities[name] = ents[0];
                if (outputPrint) {
                    print(name, ents[0]);
                }
                names.splice(index, 1);
            }
            
        })

        if (names.length === 0 || check >= maxChecks) {
            Script.clearInterval(intervalID);
            callback(foundEntities);
        }
    }, CHECK_EVERY_MS)
}

function updateUserData(id, userData) {
    var stringified = JSON.stringify(userData);
    var props = { userData: stringified};
    Entities.editEntity(id, props);
}

// Functional
// ----------------------------------------------------------------------------

function debounce() {
    var date = Date.now();
    return function(timeToPass) {
        var dateTest = Date.now();
        var timePassed = dateTest-date;

        if (timePassed > timeToPass) {
            date = Date.now();
            return true; 
        }
        else {
            return false; 
        } 
    }; 
}

function fireEvery() {
    var currentCount = 0;
    return function(steps) {
        if (currentCount >= steps) {
            currentCount = 0;
            return true;
        } else {
            currentCount++;
            return false;
        }
    };
}

// Math
// ----------------------------------------------------------------------------

function axisAlignedOrientation(orientation) {
    if (!Math.sign) {
        Math.sign = function(x) {
          return ((x > 0) - (x < 0)) || +x;
        };
      }

    var rotation = MyAvatar.orientation;
    var getForward = Quat.getForward(rotation);

    var sign = {
        x: Math.sign(getForward.x),
        y: Math.sign(getForward.y),
        z: Math.sign(getForward.z)
    };

    var newObj = {
        x: Math.abs(getForward.x),
        y: Math.abs(getForward.y),
        z: Math.abs(getForward.z)
    };

    var keys = Object.keys(newObj);

    function getLargest(obj) {
        var largestKey = "x";
        keys.forEach(function (key) {
            if (newObj[largestKey] < newObj[key]) {
                largestKey = key;
            }
        });
        return largestKey;
    }

    var largestKey = getLargest(newObj);
    keys.splice(keys.indexOf(largestKey), 1);

    var finalObj = {};
    finalObj[largestKey] = sign[largestKey];
    keys.forEach(function (key) {
        finalObj[key] = 0;
    });
    var finalRotation = Quat.fromVec3Degrees(finalObj);

    return [finalRotation, finalObj];
}

function checkIfIn(currentPosition, minMaxObj, margin) {
    margin = margin || 0.05;
    return (
        (currentPosition.x >= minMaxObj.xMin - margin && currentPosition.x <= minMaxObj.xMax + margin) &&
        (currentPosition.y >= minMaxObj.yMin - margin && currentPosition.y <= minMaxObj.yMax + margin) &&
        (currentPosition.z >= minMaxObj.zMin - margin && currentPosition.z <= minMaxObj.zMax + margin)
    );
}

// function checkIfInNonAligned(pointToCheck, position, orientation, dimensions, margin) {
//     var worldOffset = Vec3.subtract(pointToCheck, position),
//         minX = 0 - dimensions.x * 0.5,
//         maxX = 0 + dimensions.x * 0.5,
//         minY = 0 - dimensions.y * 0.5,
//         maxY = 0 + dimensions.y * 0.5,
//         minZ = 0 - dimensions.z * 0.5,
//         maxZ = 0 + dimensions.z * 0.5;

//     pointToCheck = Vec3.multiplyQbyV(Quat.inverse(orientation), worldOffset);
//     margin = margin || 0.03;

//     return (
//         (pointToCheck.x >= minX - margin && pointToCheck.x <= maxX + margin) &&
//         (pointToCheck.y >= minY - margin && pointToCheck.y <= maxY + margin) &&
//         (pointToCheck.z >= minZ - margin && pointToCheck.z <= maxZ + margin)
//     );
// }

function checkIfInNonAligned(pointToCheck, position, orientation, minMaxObj, margin) {
    var worldOffset = VEC3.subtract(pointToCheck, position),
    pointToCheck = VEC3.multiplyQbyV(QUAT.inverse(orientation), worldOffset);
    margin = margin || 0.03;

    return (
        (pointToCheck.x >= minMaxObj.xMin - margin && pointToCheck.x <= minMaxObj.xMax + margin) &&
        (pointToCheck.y >= minMaxObj.yMin - margin && pointToCheck.y <= minMaxObj.yMax + margin) &&
        (pointToCheck.z >= minMaxObj.zMin - margin && pointToCheck.z <= minMaxObj.zMax + margin)
    );
}

function clamp(min, max, num) {
    return Math.min(Math.max(num, min), max);
}

function lerp(InputLow, InputHigh, OutputLow, OutputHigh, Input) {
    return ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
}

function largestAxisVec(dimensions) {
    var dimensionArray = [];
    for (var key in dimensions) {
        dimensionArray.push(dimensions[key]);
    }
    return Math.max.apply(null, dimensionArray);
}

function makeMinMax(dimensions, position) {
    var minMaxObj = {
        xMin: position.x - dimensions.x / 2,
        xMax: position.x + dimensions.x / 2,
        yMin: position.y - dimensions.y / 2,
        yMax: position.y + dimensions.y / 2,
        zMin: position.z - dimensions.z / 2,
        zMax: position.z + dimensions.z / 2
    };

    return minMaxObj;
}

function makeOriginMinMax(dimensions) {
    var minMaxObj = {
        xMin: 0 - dimensions.x / 2,
        xMax: 0 + dimensions.x / 2,
        yMin: 0 - dimensions.y / 2,
        yMax: 0 + dimensions.y / 2,
        zMin: 0 - dimensions.z / 2,
        zMax: 0 + dimensions.z / 2
    };

    return minMaxObj;
}

function smoothing(initialValue, smoothingAmount) {
    var smoothed = initialValue;
    var smoothing = smoothingAmount;
    var lastUpdate = new Date;
    return function smoothedValue( newValue ) { 
        var now = new Date;
        var elapsedTime = now - lastUpdate;
        smoothed += elapsedTime * ( newValue - smoothed ) / smoothing;
        lastUpdate = now;
        return smoothed;
    };
}

function smoothRange(range, smoothingAmount, smoothFunction) {
    var smoothing = smoothFunction;
    var x = range.x;
    var y = range.y;
    var z = range.z;
    var smoothedx = smoothing(x, smoothingAmount);
    var smoothedy = smoothing(y, smoothingAmount);
    var smoothedz = smoothing(z, smoothingAmount);
    return function (newRange) {
        var smoothRange = {};
        smoothRange.x = smoothedx(newRange.x);
        smoothRange.y = smoothedy(newRange.y);
        smoothRange.z = smoothedz(newRange.z);
        return smoothRange;
    };
}

function vec(x, y, z) {
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.z = z;
    return obj;
}

function withinDistance(vec1, vec2, distance) {
    var vecDistance = Vec3.distance(vec1,vec2);
    return vecDistance <= distance 
        ? true
        : false;
}

function whereOnRange(currentPosition, minMax) {
    var whereOnRange = {
        x: 0,
        y: 0,
        z: 0
    };
    for (var key in whereOnRange) {
        var minKey = key + "Min";
        var maxKey = key + "Max";
        var min = minMax[minKey];
        var max = minMax[maxKey];
        var maxMinusMin = max - min;
        var currentMinusMin = currentPosition[key] - min;
        var normalizedTotal = currentMinusMin / maxMinusMin;
        whereOnRange[key] = normalizedTotal;
    }
    return whereOnRange;
}

// Export
// ----------------------------------------------------------------------------

module.exports = {
    Avatar: {
        inFrontOf: inFrontOf
    },
    Color: {
        colorMix: colorMix,
        hslToRgb: hslToRgb,
        makeColor: makeColor
    },
    Debug: {
        formatObj: formatObj,
        log: log,
        LOG_ENTER: "Log_Enter",
        LOG_UPDATE: "Log_Update",
        LOG_ERROR: "Log_Error",
        LOG_VALUE: "Log_Value",
        LOG_VALUE_EZ: "Log_Value_EZ",
        LOG_ARCHIVE: "Log_Archive"
    },
    Entity: {
        getNameProps: getNameProps,
        getProps: getProps,
        getUserData: getUserData,
        searchForChildren: searchForChildren,
        searchForEntityNames: searchForEntityNames,
        updateUserData: updateUserData
    },
    Functional: {
        debounce: debounce,
        fireEvery: fireEvery
    },
    Maths: {
        axisAlignedOrientation: axisAlignedOrientation,
        checkIfIn: checkIfIn,
        checkIfInNonAligned: checkIfInNonAligned,
        clamp: clamp,
        fireEvery: fireEvery,
        largestAxisVec: largestAxisVec,
        lerp: lerp,
        makeMinMax: makeMinMax,
        makeOriginMinMax: makeOriginMinMax,
        smoothing: smoothing,
        smoothRange: smoothRange,
        vec: vec,
        withinDistance: withinDistance,
        whereOnRange: whereOnRange
    }
};
