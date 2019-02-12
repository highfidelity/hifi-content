/*

    Party Ball
    generator_dance.js
    Created by Milad Nazeri on 2019-01-19
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Generate a dancing model

*/


Script.require("../modules/polyfill.js")();

var common = Script.require("./commonUtilities.js?" + Date.now());
var randomInt = common.randomInt;

var danceCollection = Script.require("./collection_animations.js?" + Date.now());
var MAX_RETRIES = 3;
var TIMEOUT_AMOUNT = 500;

// Main constructor function for the Dancer
function DanceGenerator() {
    this.partyBallID = null; 
    this.dancer = null;
    this.selectedAvatarUUID = null;
    this.currentTry = 0;
    this.receivedUpdate = false;

    this.ballPosition;
    this.randomAnimation = null;
    this.randomDancer = null;
}


// Try the timeout again if you haven't got the message
function retryTimeOut(){
    this.currentTry++;
    callEntityClientMethodInTimeout.bind(this)();
}


// Timeout function that calls the entity client method to get the correct dimensions.  
// The timeout is to make sure the entity is created first.
function callEntityClientMethodInTimeout(){
    Entities.callEntityClientMethod(this.selectedAvatarUUID, this.partyBallID, "getDancerDimensions", [this.dancer]);
    
    if (this.receivedUpdate || this.currentTry > MAX_RETRIES) {
        return;
    }

    Script.setTimeout(retryTimeOut.bind(this), TIMEOUT_AMOUNT);
}


// Create the dancer by giving it an entity 
function create(partyBallID, dancerURL, selectedAvatarUUID, ballPosition) {
    this.partyBallID = partyBallID;
    this.ballPosition = ballPosition;
    this.selectedAvatarUUID = selectedAvatarUUID;
    this.randomAnimation = danceCollection[randomInt(0, danceCollection.length - 1)];
    this.dancer = Entities.addEntity({
        name: "PartyBall-Dancer",
        type: "Model",
        visible: false,
        modelURL: dancerURL,
        position: ballPosition,
        animation: {
            url: this.randomAnimation,
            running: true
        }
    });

    // This may be a result of creating a model based off a FST, but the dimensions do not come in correctly
    // The naturalDimensions property comes back as [1,1,1].  
    // To work around this, we send a message back to the client who was the last person to touch the ball
    // That client then gets the properties and returns back the correct naturalDimensions
    // After we get the correct naturalDimensions, then we can turn the model back on to visible.
    Script.setTimeout(callEntityClientMethodInTimeout.bind(this), 250);
}


// Update the dancer dimensions since the server can't see the correct naturalDimensions.
var AVATAR_SCALER = 2.5;
function updateDimensions(newDancerDimensions) {
    this.receivedUpdate = true;
    var avatarDimensions = Vec3.multiply(newDancerDimensions, AVATAR_SCALER);
    // The following takes the height of the new avatar and raises it up so that the feet of the dancing avatar
    // is at the origin of the explosion.
    var avatarPositionYOffsetBasedOnNewDimensions = (avatarDimensions.y * 0.90) * 0.5;
    var newPositon = Vec3.sum(this.ballPosition, [0, avatarPositionYOffsetBasedOnNewDimensions, 0]);
    var newProperties = {
        dimensions: avatarDimensions,
        position: newPositon,
        visible: true
    };

    Entities.editEntity(this.dancer, newProperties);
}


// Handle dancer cleanup
function destroy() {
    Entities.deleteEntity(this.dancer);
}
 

DanceGenerator.prototype = {
    create: create,
    updateDimensions: updateDimensions,
    destroy: destroy
};


module.exports = DanceGenerator;
