/*

    Dance Generator
    generator_dance.js
    Created by Milad Nazeri on 2019-01-19
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Generate a dancing model

*/


var common = Script.require("./commonUtilities.js?" + Date.now());
var randomInt = common.randomInt;

var danceCollection = Script.require("./collection_animations.js?" + Date.now());

// Main constructor function for the Dancer
function DanceGenerator() {
    this.dancer = null;
    
    this.randomAnimation = null;
    this.randomDancer = null;
}


// Create the dancer by giving it an entity 
// This uses a hack because I was getting back [1,1,1] when trying to get back the naturalDimensions and apply it to the model which comes in with a default dimensions of .1,.1,.1 
// Get's a good enough dimension to be used for a short animation vignette
var GENERIC_AVATAR_DIMENSIONS = { "x": 1.4842414855957031, "y": 1.714798092842102, "z": 0.30008745193481445 };
var AVATAR_SCALER = 2;
var avatarDimensions = Vec3.multiply(GENERIC_AVATAR_DIMENSIONS, AVATAR_SCALER);
var avatarPositionOffsetBasedOnDimensions = (avatarDimensions.y * 0.90) / 2;
function create(dancerURL, ballPosition) {
    this.randomAnimation = danceCollection[randomInt(0, danceCollection.length - 1)];
    this.dancer = Entities.addEntity({
        type: "Model",
        name: "Suprise-Dancer",
        modelURL: dancerURL,
        dimensions: avatarDimensions,
        position: Vec3.sum(ballPosition, [0, avatarPositionOffsetBasedOnDimensions, 0]),
        animation: {
            url: this.randomAnimation,
            running: true
        }
    });
}


// Handle dancer cleanup
function destroy() {
    Entities.deleteEntity(this.dancer);
}
 

DanceGenerator.prototype = {
    create: create,
    destroy: destroy
};


module.exports = DanceGenerator;