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

// From Luis Vector Library
(function(){
    var Vector3 = new (function() {
        var self = this;
        this.EPSILON = 0.000001;
        this.EPSILON_SQUARED = self.EPSILON * self.EPSILON;
        this.PI = 3.14159265358979;
        this.ALMOST_ONE= 1.0 - self.EPSILON;
        this.PI_OVER_TWO = 1.57079632679490;
        
        this.cross = function(A, B) {
            return {x: (A.y * B.z - A.z * B.y), y: (A.z * B.x - A.x * B.z), z: (A.x * B.y - A.y * B.x)};
        };
        this.distance = function(A, B) {
            return Math.sqrt((A.x - B.x) * (A.x - B.x) + (A.y - B.y) * (A.y - B.y) + (A.z - B.z) * (A.z - B.z));
        };
        this.dot = function(A, B) {
            return A.x * B.x + A.y * B.y + A.z * B.z;
        };
        this.length = function(V) {
            return Math.sqrt(V.x * V.x + V.y * V.y + V.z * V.z);
        };
        this.subtract = function(A, B) {
            return {x: (A.x - B.x), y: (A.y - B.y), z: (A.z - B.z)};
        };
        this.sum = function(A, B) {
            return {x: (A.x + B.x), y: (A.y + B.y), z: (A.z + B.z)};
        };
        this.multiply = function(V, scale) {
            return {x: scale * V.x, y: scale * V.y, z: scale * V.z};
        };
        this.normalize = function(V) {
            var L2 = V.x*V.x + V.y*V.y + V.z*V.z;
            if (L2 < self.EPSILON_SQUARED) {
                return {x: V.x, y: V.y, z: V.z};
            }
            var invL = 1.0/Math.sqrt(L2);
            return {x: invL * V.x, y: invL * V.y, z: invL * V.z}; 
        };
        this.multiplyQbyV = function(Q,V) {
            var num = Q.x * 2.0;
            var num2 = Q.y * 2.0;
            var num3 = Q.z * 2.0;
            var num4 = Q.x * num;
            var num5 = Q.y * num2;
            var num6 = Q.z * num3;
            var num7 = Q.x * num2;
            var num8 = Q.x * num3;
            var num9 = Q.y * num3;
            var num10 = Q.w * num;
            var num11 = Q.w * num2;
            var num12 = Q.w * num3;
            var result = {x: 0, y: 0, z: 0};
            result.x = (1.0 - (num5 + num6)) * V.x + (num7 - num12) * V.y + (num8 + num11) * V.z;
            result.y = (num7 + num12) * V.x + (1.0 - (num4 + num6)) * V.y + (num9 - num10) * V.z;
            result.z = (num8 - num11) * V.x + (num9 + num10) * V.y + (1.0 - (num4 + num5)) * V.z;
            return result;
        };  
    })();

    var Quaternion = new (function() {
        var self = this;
        
        this.IDENTITY = function() {
            return {x:0, y:0, z:0, w:1};
        };
        
        this.multiply = function(Q, R) {
            // from this page:
            // http://mathworld.wolfram.com/Quaternion.html
            return {
                w: Q.w * R.w - Q.x * R.x - Q.y * R.y - Q.z * R.z,
                x: Q.w * R.x + Q.x * R.w + Q.y * R.z - Q.z * R.y,
                y: Q.w * R.y - Q.x * R.z + Q.y * R.w + Q.z * R.x,
                z: Q.w * R.z + Q.x * R.y - Q.y * R.x + Q.z * R.w};
        };

        this.angleAxis = function(angle, axis) {
            var s = Math.sin(0.5 * angle);
            return {w: Math.cos(0.5 * angle),x: s * axis.x, y: s * axis.y, z: s * axis.z};
        };
        
        this.inverse = function(Q) {
            return {w: -Q.w, x: Q.x, y: Q.y, z: Q.z};
        };
        
        this.rotationBetween = function(orig, dest) {
            var v1 = Vector3.normalize(orig);
            var v2 = Vector3.normalize(dest);
            var cosTheta = Vector3.dot(v1, v2);
            var rotationAxis;
            if(cosTheta >= 1 - Vector3.EPSILON){
                return self.IDENTITY();
            }

            if(cosTheta < -1 + Vector3.EPSILON)
            {
                // special case when vectors in opposite directions :
                // there is no "ideal" rotation axis
                // So guess one; any will do as long as it's perpendicular to start
                // This implementation favors a rotation around the Up axis (Y),
                // since it's often what you want to do.
                rotationAxis = Vector3.cross({x: 0, y: 0, z: 1}, v1);
                if(Vector3.length(rotationAxis) < Vector3.EPSILON) { // bad luck, they were parallel, try again!
                    rotationAxis = Vector3.cross({x:1, y:0, z:0}, v1);
                }
                rotationAxis = Vector3.normalize(rotationAxis);
                return self.angleAxis(Vector3.PI, rotationAxis);
            }
            // Implementation from Stan Melax's Game Programming Gems 1 article
            rotationAxis = Vector3.cross(v1, v2);

            var s = Math.sqrt((1 + cosTheta) * 2);
            var invs = 1 / s;

            return {
                w: s * 0.5,
                x: rotationAxis.x * invs, 
                y: rotationAxis.y * invs,
                z: rotationAxis.z * invs,
            }
        }
    })();
    Script.registerValue("VEC3", Vector3);
    Script.registerValue("QUAT", Quaternion);
})();

// Avatar
// ----------------------------------------------------------------------------

// Place something in front of your avatar
function inFrontOf(distance, position, orientation) {
    return Vec3.sum(position || MyAvatar.position,
        Vec3.multiply(distance, Quat.getForward(orientation || MyAvatar.orientation)));
}

// Color
// ----------------------------------------------------------------------------

// Mix between two colors
function colorMix(colorA, colorB, mix) {
    var result = {};
    for (var key in colorA) {
        result[key] = (colorA[key] * (1 - mix)) + (colorB[key] * mix);
    }
    return result;
}

// Going from hsl color space to RGB
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

// Formating an object in debug log for overlay windows
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

// Custom log functions for groups and custom debouncing
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

// Get props of particular name
function getNameProps(name, position, radius) {
    position = position || MyAvatar.position;
    radius = radius || 20;
    var ents = Entities.findEntitiesByName(name, position, radius)[0];
    if (ents) {
        return [ents, Entities.getEntityProperties(ents)];
    }
}

// Get props
function getProps(id, props) {
    if (props) {
        return Entities.getEntityProperties(id, props);
    } else {
        return Entities.getEntityProperties(id);
    }
}

// Get only userData for an entity
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

// Search for Children of an entity and then run a callback after they are found
function searchForChildren(parentID, names, callback, timeoutMs, outputPrint) {
    // Map from name to entity ID for the children that have been found
    var foundEntities = {};
    var foundAllEntities = false;
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
            print("\check:", check);

        }
        for (var i = 0; i < childrenIDs.length; ++i) {


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
            if (outputPrint) {
                print("names: " + JSON.stringify(names));
            }
            if (names.length > 0) {
                callback(foundEntities, foundAllEntities, names);
            } else {
                foundAllEntities = true;
                callback(foundEntities, foundAllEntities);
            }
            Script.clearInterval(intervalID);
        }
    }, CHECK_EVERY_MS);
}

// Search for a list of entity names and then run a callback after they are found
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

// Update userData with an object
function updateUserData(id, userData) {
    var stringified = JSON.stringify(userData);
    var props = { userData: stringified};
    Entities.editEntity(id, props);
}

// Functional
// ----------------------------------------------------------------------------

// Return back true or false for debouncing
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

// Fire every n count
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

// HTTP
// ----------------------------------------------------------------------------

// Encode params for get request helper
function encodeURLParams (params) {
    var paramPairs = [];
    for (var key in params) {
        paramPairs.push(key + "=" + params[key]);
    }
    return paramPairs.join("&");
}

// Math
// ----------------------------------------------------------------------------

// Get an orientation that is in front of you but to the closet axis
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

// Check if a point is in an axis aligned space
function checkIfIn(currentPosition, minMaxObj, margin) {
    margin = margin || 0.05;
    return (
        (currentPosition.x >= minMaxObj.xMin - margin && currentPosition.x <= minMaxObj.xMax + margin) &&
        (currentPosition.y >= minMaxObj.yMin - margin && currentPosition.y <= minMaxObj.yMax + margin) &&
        (currentPosition.z >= minMaxObj.zMin - margin && currentPosition.z <= minMaxObj.zMax + margin)
    );
}

// Check if a point is in a non axis aligned space
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

// Clamp a value by a min and max
function clamp(min, max, num) {
    return Math.min(Math.max(num, min), max);
}

// Find the area below you 
function findSurfaceBelowPosition (pos) {
    var result = Entities.findRayIntersection({
        origin: pos,
        direction: { x: 0.0, y: -1.0, z: 0.0 }
    }, true);
    if (result.intersects) {
        return result.intersection;
    }
    return pos;
}

// Get a value between 2 ranges
function lerp(InputLow, InputHigh, OutputLow, OutputHigh, Input) {
    return ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
}

// Get the dimension that is the largest 
function largestAxisVec(dimensions) {
    var dimensionArray = [];
    for (var key in dimensions) {
        dimensionArray.push(dimensions[key]);
    }
    return Math.max.apply(null, dimensionArray);
}

// Make an object of min and max
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


// Make an object of min and max based off the origin
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

// Smoothing Low Pass Filter
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

// Smooth a range
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

// V Vector libary that is object oriented #WIP
function V(x, y, z) {
    if (arguments.length === 0) {
        this.x = 0;
        this.y = 0;
        this.z = 0;
    }
    if (arguments.length === 1) {
        this.x = x;
        this.y = x;
        this.z = x;
    }
    if (arguments.length === 3) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
}

V.prototype = {
    add: function(vector) {
        var returnVector = {};
        returnVector.x = this.x + vector.x;
        returnVector.y = this.y + vector.y;
        returnVector.z = this.z + vector.z;
        return returnVector;
    },
    cross: function(vector) {
        var returnVector = {};
        returnVector.x = this.y * vector.z - this.z * vector.y;
        returnVector.y = this.z * vector.x - this.x * vector.z;
        returnVector.z = this.x * vector.y - this.y * vector.x;
        return returnVector;
    },
    dot: function(vector) {
        return ( 
            this.x * vector.x +
            this.y * vector.y +
            this.z * vector.z
        );
    },
    length: function() {
        return Math.sqrt(
            this.x * this.x +
            this.y * this.y +
            this.z * this.z
        )
    },
    multiply: function(scalar) {
        var returnVector = {};
        returnVector.x = this.x * scalar;
        returnVector.y = this.y * scalar;
        returnVector.z = this.z * scalar;
        return returnVector;
    },
    normalize: function() {
        var len = this.length();
        if (len > 0) {
            var invLen = 1 / len;
            this.x *= invLen;
            this.y *= invLen;
            this.z *= invLen;
        }
        return this;
    },
    subtract: function(vector) {
        var returnVector = {};
        returnVector.x = this.x - vector.x;
        returnVector.y = this.y - vector.y;
        returnVector.z = this.z - vector.z;
        return returnVector;
    }
};

// Make a quick vector (V should replace this)
function vec(x, y, z) {
    var obj = {};
    obj.x = x;
    obj.y = y;
    obj.z = z;
    return obj;
}

// Quick distance true/false return
function withinDistance(vec1, vec2, distance) {
    var vecDistance = Vec3.distance(vec1,vec2);
    return vecDistance <= distance 
        ? true
        : false;
}

// Where on the range is a point
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

// Scripts
// ----------------------------------------------------------------------------

// Helps with managing cache busting
function cacheBuster(debug, baseName, scriptName) {
    if (debug) {
        return baseName + scriptName + "?" + Date.now();
    } else {
        return baseName + scriptName;
    }
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
    HTTP: {
        encodeURLParams: encodeURLParams
    },
    Maths: {
        axisAlignedOrientation: axisAlignedOrientation,
        checkIfIn: checkIfIn,
        checkIfInNonAligned: checkIfInNonAligned,
        clamp: clamp,
        findSurfaceBelowPosition: findSurfaceBelowPosition,
        fireEvery: fireEvery,
        largestAxisVec: largestAxisVec,
        lerp: lerp,
        makeMinMax: makeMinMax,
        makeOriginMinMax: makeOriginMinMax,
        smoothing: smoothing,
        smoothRange: smoothRange,
        V: V,
        vec: vec,
        withinDistance: withinDistance,
        whereOnRange: whereOnRange
    },
    Scripts: {
        cacheBuster: cacheBuster
    }
};
