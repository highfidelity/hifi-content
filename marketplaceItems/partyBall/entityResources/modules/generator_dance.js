/*

    Dance Generator
    generator_dance.js
    Created by Milad Nazeri on 2019-01-19
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Generate a dancing model

*/


var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js');

var common = Script.require("./commonUtilities.js?" + Date.now());
var randomInt = common.randomInt;

var danceCollection = Script.require("./collection_animations.js?" + Date.now());

// Main constructor function for the Dancer
function DanceGenerator() {
    this._entityID = null;

    this.dancer = null;
    this.randomAnimation = null;
    this.randomDancer = null;
}


// Create the dancer by giving it an entity 
function create(entityID, dancerURL) {
    this.randomAnimation = danceCollection[randomInt(0, danceCollection.length - 1)];
    this.dancer = Entities.addEntity({
        type: "Model",
        name: "Suprise-Dancer",
        modelURL: dancerURL,
        localPosition: [0, 0.75, 0],
        parentID: entityID,
        animation: {
            url: this.randomAnimation,
            running: true
        }
    });
    var dancerDimensions = Entities.getEntityProperties(this.dancer, "dimensions").dimensions;
    Entities.editEntity(this.dancer, {
        dimensions: Vec3.multiply(dancerDimensions, 20)
    });
}


function destroy() {
    Entities.deleteEntity(this.dancer);
}
 

DanceGenerator.prototype = {
    create: create,
    destroy: destroy
};


module.exports = DanceGenerator;