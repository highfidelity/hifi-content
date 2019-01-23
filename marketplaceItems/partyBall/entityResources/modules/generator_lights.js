/*

    Light Generator
    generator_lights.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Makes random animated lights

*/


Script.require("../modules/polyfill.js")();

var common = Script.require("../modules/commonUtilities.js?" + Date.now());
var randomFloat = common.randomFloat;
var randomInt = common.randomInt;
var makeColor = common.makeColor;
var AveragingFilter = common.AveragingFilter;

var lightProps = {
    name: "Party lights",
    type: "Light",
    dimensions: [10, 10, 10],
    angularDamping: 0,
    color: [255, 255, 255],
    intensity: 1000,
    falloffRadius: 0,
    isSpotlight: 0,
    exponent: 1,
    cutoff: 10,
    collisionless: true,
    userData: "{ \"grabbableKey\": { \"grabbable\": false} }" 
};

// Main contructor function for the Lights
function LightGenerator(){
    this.parentID = null;

    this.box = null;
    this.spotLight = null;
    this.lights = [];
    this.lightProps = lightProps;
    this.interval = null;
}


// Runs all the functions involved with creating and then animating
function create(parentID){
    this.parentID = parentID;
    this.makeBox();
    this.makeLights();
    this.animate();
}


// Make the box the lights are attached to so it is easier to spin around
function makeBox() {
    this.box = Entities.addEntity({
        name: "Party-Box",
        type: "Box",
        parentID: this.parentID,
        dimensions: [0.35, 0.35, 0.35],
        angularDamping: 0,
        friction: 0,
        visible: false
    });
}


// Actually creates all the lights from the base light props
function makeLights() {
    this.lightProps.parentID = this.box;
    this.lightProps.isSpotlight = 0;
    this.spotLight = Entities.addEntity(this.lightProps);

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(180,0,0);
    this.lights.push(Entities.addEntity(this.lightProps));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-90,0);
    this.lights.push(Entities.addEntity(this.lightProps));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,0);
    this.lights.push(Entities.addEntity(this.lightProps));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,180);
    this.lights.push(Entities.addEntity(this.lightProps));
}


// Make random light properties for use in the interval animator
var INTENSITY_MIN = 2;
var INTENSITY_MAX = 25;
var COLOR_MIN = 0;
var COLOR_MAX = 255;
var FALL_OFF_MIN = 0;
var FALL_OFF_MAX = 50;
var CUTOFF_MIN = 0;
var CUTOFF_MAX = 50;
var MINIMUM_COLOR_SCALER = 0;
var MAXIMUM_COLOR_SCALER = 0.55;
var AVERAGING_LENGTH = 20;
var filterStore = {
    intensity: new AveragingFilter(AVERAGING_LENGTH, 10),
    falloffRadius: new AveragingFilter(AVERAGING_LENGTH, 1.0),
    cutoff: new AveragingFilter(AVERAGING_LENGTH, 10),
    color: {
        red: new AveragingFilter(AVERAGING_LENGTH, 1.10),
        green: new AveragingFilter(AVERAGING_LENGTH, 2.80),
        blue: new AveragingFilter(AVERAGING_LENGTH, 2.10)
    }
};
function makeRandomLightProps(){
    var lightProps = {
        intensity: 
            filterStore.intensity.process(randomFloat(INTENSITY_MIN, INTENSITY_MAX)),
        color: makeColor(
            filterStore.color.red.process(randomInt(COLOR_MIN, COLOR_MAX)),
            filterStore.color.green.process(randomInt(COLOR_MIN, COLOR_MAX)),
            filterStore.color.blue.process(randomInt(COLOR_MIN, COLOR_MAX)),
            randomFloat(MINIMUM_COLOR_SCALER, MAXIMUM_COLOR_SCALER)
        ),
        falloffRadius: 
            filterStore.falloffRadius.process(randomFloat(FALL_OFF_MIN, FALL_OFF_MAX)),
        cutoff: 
            filterStore.cutoff.process(randomFloat(CUTOFF_MIN, CUTOFF_MAX))
    };     

    return lightProps;        
}


// Used by animate to control how the entity looks at each interval
var ANGULAR_VELOCITY_MIN = -1;
var ANGULAR_VELOCITY_MAX = 1;
function intervalAnimator(){
    var angularVelocity = [
        randomFloat(ANGULAR_VELOCITY_MIN, ANGULAR_VELOCITY_MAX),
        randomFloat(ANGULAR_VELOCITY_MIN, ANGULAR_VELOCITY_MAX),
        randomFloat(ANGULAR_VELOCITY_MIN, ANGULAR_VELOCITY_MAX)
    ];
    Entities.editEntity(this.box, {
        angularVelocity: angularVelocity
    });

    Entities.editEntity(this.spotLight, this.makeRandomLightProps());
    this.lights.forEach(function(light){
        Entities.editEntity(light, this.makeRandomLightProps());
    }, this);
}


// Controller for how often the animator should run this session
function animate(){    
    var UDPATE_MIN = 25;
    var UPDATE_MAX = 200;

    var intervalAmount = randomInt(UDPATE_MIN, UPDATE_MAX);
    
    this.interval = Script.setInterval(intervalAnimator.bind(this), intervalAmount);
}


// Cleanup and stop the animation interval
function destroy(){
    Script.clearInterval(this.interval);
    Entities.deleteEntity(this.box);
    Entities.deleteEntity(this.spotLight);
    this.lights.forEach(function(light){
        Entities.deleteEntity(light);
    });
    Entities.deleteEntity(this.box);
}


LightGenerator.prototype = {
    makeLights: makeLights,
    makeRandomLightProps: makeRandomLightProps,
    create: create,
    makeBox: makeBox,
    animate: animate,
    destroy: destroy
};


module.exports = LightGenerator;
