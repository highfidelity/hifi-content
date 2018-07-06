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

// Math
// ----------------------------------------------------------------------------
function checkIfIn(currentPosition, minMaxObj, margin) {
    margin = margin || 0.05;
    return (
        (currentPosition.x >= minMaxObj.xMin - margin && currentPosition.x <= minMaxObj.xMax + margin) &&
        (currentPosition.y >= minMaxObj.yMin - margin && currentPosition.y <= minMaxObj.yMax + margin) &&
        (currentPosition.z >= minMaxObj.zMin - margin && currentPosition.z <= minMaxObj.zMax + margin)
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

function vec(x, y, z) {
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.z = z;
    return obj;
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

function makeColor(red, green, blue) {
    var obj = {};
    obj.red = red;
    obj.green = green;
    obj.blue = blue;
    return obj;
}

// Debug
// ----------------------------------------------------------------------------


module.exports = {
    Color: {
        colorMix: colorMix,
        hslToRgb: hslToRgb,
        makeColor: makeColor
    },
    Debug: {
        formatObj: function formatObj(obj) {
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
        },
        log: function (configGroup) {
            var deBounceGroup = {};
            var deBounceCheck = function(oldTime, newTime, bounceTime) {
                if (newTime - oldTime > bounceTime) {
                    return true;
                }
                return false;
            };
            return function (group, title, value, bounce) {
                if (configGroup[group]) {
                    if (bounce) {
                        var key = group+title+value+bounce;
                        if (!deBounceGroup[key]) {
                            deBounceGroup[key] = Date.now();
                            print(group + " :: " + title + " :: " + JSON.stringify(value));
                        } else {
                            if (deBounceCheck(deBounceGroup[key], Date.now(), bounce)) {
                                deBounceGroup[key] = Date.now();
                                print(group + " :: " + title + " :: " + JSON.stringify(value));
                            } else {
                                return;
                            }
                        }
                    } else {
                        print(group + " :: " + title + " :: " + JSON.stringify(value));
                    }
                    
                }
            };
        },
        LOG_ENTER: "Log_Enter",
        LOG_UPDATE: "Log_Update",
        LOG_ERROR: "Log_Error",
        LOG_VALUE: "Log_Value",
        LOG_ARCHIVE: "Log_Archive"
    },
    Entity: {
        getNameProps: getNameProps,
        getProps: getProps
    },
    Maths: {
        checkIfIn: checkIfIn,
        clamp: clamp,
        largestAxisVec: largestAxisVec,
        lerp: lerp,
        makeMinMax: makeMinMax,
        vec: vec,
        whereOnRange: whereOnRange
    }
};
