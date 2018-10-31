// InstrumentSpawner.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Creates a spawner for cloneable instruments where each instrument plays on grab
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/*
    @params
    one object with the following keys 

    var arguments = {
        name: , // (String):  name of object, spawner will have name + Spawner
        modelURL: , // (String): model  url
        dimensions: , // (Object): dimensions for model
        cloneLifetime: , // (Integer): length of clones life in ms
        scriptURL: // (String): relative path to cloned entity script URL
    }
*/

/* global module */

var InstrumentSpawner = function (args) {
    this.name = args.name;
    this.modelURL = args.modelURL;
    this.cloneLifetime = args.cloneLifetime;
    this.dimensions = args.dimensions;
    this.scriptURL = args.scriptURL ? args.scriptURL : "";
};

InstrumentSpawner.prototype = {

    createSpawner: function () {

        // Spawns object 3 m in front of Avatar
        var orientation = MyAvatar.orientation;
        orientation = Quat.safeEulerAngles(orientation);
        var spawnPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getForward(MyAvatar.orientation)));

        var cloneLifetime = this.cloneLifetime;
        var userData = {
            "grabbableKey": {
                "grabbable": true
            }
        };

        Entities.addEntity({
            locked: true,
            type: "Model",
            modelURL: this.modelURL,
            rotation: orientation,
            shapeType: "box",
            name: this.name + " Spawner",
            dynamic: false,
            gravity: {
                x: 0,
                y: 0,
                z: 0
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            },

            cloneable: true,
            cloneLifetime: cloneLifetime,

            position: spawnPosition,
            dimensions: this.dimensions,
            restitution: 0,
            friction: 0,
            collisionless: true,
            collidesWith: "",
        
            script: this.scriptURL,
            userData: JSON.stringify(userData)
        });
    }
};

module.exports = {
    instrumentSpawner: InstrumentSpawner
};
