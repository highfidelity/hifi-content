/*

    Light Generator
    generator_lights.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Makes random animated lights

*/
print("in generator lights");


Script.resetModuleCache(true);

var common = Script.require("../modules/commonUtilities.js?" + Date.now());
var randomFloat = common.randomFloat;
var randomInt = common.randomInt;
var makeColor = common.makeColor;
var _this; 


var lightProps = {
    name: "Party lights",
    type: "Light",
    dimensions: {
        x: 10,
        y: 10,
        z: 10
    },
    angularDamping: 0,
    color: {
        red: 255,
        blue: 255,
        green: 255
    },
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
    this.box = null;
    this.lights = [];
    this.spotLight = null;
    this.lightProps = {};
    this.interval = null;
    this.lightProps = lightProps;
    _this = this;
}


// Runs all the functions involved with creating and then animating
function create(position){
    this.position = position;
    this.makeProps();
    this.makeBox();
    this.makeLights();
    this.animate();
}


// Make sure we have the correct position before we use the light props to make entities
function makeProps(position){
    this.lightProps.position = position;
}


// Make the box the lights are attached to so it is easier to spin around
function makeBox(position) {
    this.box = Entities.addEntity({
        name: "Party-Box",
        type: "Box",
        position: this.position,
        dimensions: {
            x: 0.35,
            y: 0.35,
            z: 0.35
        },
        angularDamping: 0,
        friction: 0,
        color:{
            red: 100,
            blue: 0,
            green: 0
        },
        visible: false
    }, true);
}


// Actually creates all the lights from the base light props
function makeLights() {
    this.lightProps.parentID = this.box;
    this.lightProps.isSpotlight = 0;
    this.spotLight = Entities.addEntity(this.lightProps, true);

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(90,0,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(180,0,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,90,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-90,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,45,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-45,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,0);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,180);
    this.lights.push(Entities.addEntity(this.lightProps, true));

    this.lightProps.isSpotlight = 1;
    this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,-180);
    this.lights.push(Entities.addEntity(this.lightProps, true));
}


// Make random light properties for use in the interval animator
var INTENSITY_MIN = 2;
var INTENSITY_MAX = 25;
var COLOR_MIN = 0;
var COLOR_MAX = 255;
var FALL_OFF_MIN = 0;
var FALL_OFF_MAX = 10;
var CUTOFF_MIN = 0;
var CUTOFF_MAX = 100;
function makeRandomLightProps(){
    var lightProps = {
        intensity: randomFloat(INTENSITY_MIN, INTENSITY_MAX),
        color: makeColor(
            randomInt(COLOR_MIN, COLOR_MAX),
            randomInt(COLOR_MIN, COLOR_MAX),
            randomInt(COLOR_MIN, COLOR_MAX)
        ),
        falloffRadius: randomFloat(FALL_OFF_MIN, FALL_OFF_MAX),
        cutoff: randomFloat(CUTOFF_MIN, CUTOFF_MAX)
    };     
    return lightProps;        
}


// Used by animate to control how the entity looks at each interval
var ANGULAR_VELOCITY_MIN = 1;
var ANGULAR_VELOCITY_MAX = 5;
function intervalAnimator(){
    var angularVelocity = {
        x: randomInt(ANGULAR_VELOCITY_MIN, ANGULAR_VELOCITY_MAX),
        y: randomInt(ANGULAR_VELOCITY_MIN, ANGULAR_VELOCITY_MAX),
        z: randomInt(ANGULAR_VELOCITY_MIN, ANGULAR_VELOCITY_MAX)
    };
    Entities.editEntity(_this.box, {
        angularVelocity: angularVelocity
    });

    Entities.editEntity(_this.spotLight, _this.makeRandomLightProps());
    _this.lights.forEach(function(light){
        Entities.editEntity(light, _this.makeRandomLightProps());
    });
}


// Controller for how often the animator should run this session
function animate(){    
    var UDPATE_MIN = 25;
    var UPDATE_MAX = 200;

    var intervalAmount = randomInt(UDPATE_MIN, UPDATE_MAX);
    
    this.interval = Script.setInterval(intervalAnimator, intervalAmount);
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
    makeProps: makeProps,
    makeRandomLightProps: makeRandomLightProps,
    create: create,
    makeBox: makeBox,
    animate: animate,
    destroy: destroy
};


module.exports = LightGenerator;
