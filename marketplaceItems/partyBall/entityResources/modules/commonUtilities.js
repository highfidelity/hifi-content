/*

    Party Ball
    commonUtilities.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Common utilities between modules

*/


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
    var randomColorToScale = Math.floor(Math.random() * colorArray.length);
    colorArray[randomColorToScale] = Math.floor(colorArray[randomColorToScale] * colorScaler);
    var finalColorObject = {
        red: colorArray[0],
        green: colorArray[1],
        blue: colorArray[2]
    };
    return finalColorObject;
}


// Return back an on going average from a given set
function AveragingFilter(length, initValue) {
    // initialize the array of past values
    initValue = initValue || 0;
    this.pastValues = [];
    for (var i = 0; i < length; i++) {
        this.pastValues.push(initValue);
    }
    // single arg is the nextInputValue
    this.process = function () {
        if (this.pastValues.length === 0 && arguments[0]) {
            return arguments[0];
        } else if (arguments[0] !== null) {
            this.pastValues.push(arguments[0]);
            this.pastValues.shift();
            var nextOutputValue = 0;
            for (var value in this.pastValues) {
                nextOutputValue += this.pastValues[value];
            }
            return nextOutputValue / this.pastValues.length;
        } else {
            return 0;
        }
    };
}


module.exports = {
    randomInt: randomInt,
    randomFloat: randomFloat,
    makeColor: makeColor,
    AveragingFilter: AveragingFilter
};
