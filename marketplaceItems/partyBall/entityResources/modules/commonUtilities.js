/*

    Party Ball
    commonUtilities.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Common utilities between modules

*/
print("in common utilities");


// Get a random float between low and high 
function randomFloat(low, high) {
    return low + Math.random() * (high - low);
}


// Get a random number but make sure it's an integer
function randomInt(low, high) {
    return Math.floor(low + Math.random() * (high - low));
}


// Color generator that picks a random value to dial down.  This is to help make nicer colors when generating random colors
function makeColor(red, green, blue, colorScaler) {
    colorScaler = colorScaler ? colorScaler : 0.20;
    var colorArray = [red, green, blue];
    var arrayToGet0 = Math.floor(Math.random() * colorArray.length);
    colorArray[arrayToGet0] = colorArray[arrayToGet0] * colorScaler;
    var finalColorObject = {
        red: colorArray[0],
        green: colorArray[1],
        blue: colorArray[2]
    };
    return finalColorObject;
}


module.exports = {
    randomInt: randomInt,
    randomFloat: randomFloat,
    makeColor: makeColor
};
