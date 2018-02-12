//
//  pinataSpawner.js
//
//  Modified by Elisa Lupin-Jimenez on 2017-01-29
//  Derived by Caitlyn Meeks from a script by Seth Alves on 2016-7-05
//  Copyright 2016 High Fidelity, Inc.
//
//  Makes a tetherball that responds to collisions.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//
"use strict";
/* jslint vars: true */
// var Overlays, Entities, Controller, Script, MyAvatar, Vec3; // Referenced globals provided by High Fidelity.

var HIFI_PUBLIC_BUCKET = "http://s3.amazonaws.com/hifi-public/";

var pinataID;
var poleID;
var paddleID;

var pinataPosition = Vec3.sum(MyAvatar.position, {
    x: 1.0,
    y: 0.4,
    z: 0.0
});

pinataID = Entities.addEntity({
    type: "Model",
    modelURL: "https://hifi-content.s3.amazonaws.com/DomainContent/jimjamz/llamarama_textured.fbx",
    name: "Pinata",
    shapeType: "Sphere",
    position: pinataPosition,
    dimensions: {
        x: 0.3167,
        y: 0.6723,
        z: 0.6086
    },
    gravity: {
        x: 0.0,
        y: -9.8,
        z: 0.0
    },
    damping: 0.3,
    angularDamping: 0.1,
    density: 300,
    restitution: 0.5,
    dynamic: true
});

var pinataPointToOffsetFrom = Vec3.sum(pinataPosition, {
    x: 0.0,
    y: 2.0,
    z: 0.0
});

Entities.addAction("offset", pinataID, {
    pointToOffsetFrom: pinataPointToOffsetFrom,
    linearDistance: 2.0,
    linearTimeScale: 0.1
});

var polePosition = Vec3.sum(MyAvatar.position, {
    x: 1.25,
    y: 1.6,
    z: 0.0
});

poleID = Entities.addEntity({
    type: "Model",
    grabbable: false,
    modelURL: "https://hifi-content.s3.amazonaws.com/Examples%20Content/production/paddleball/tballPole_VR.fbx",
    compoundShapeURL: "https://hifi-content.s3.amazonaws.com/Examples%20Content/production/paddleball/tballPole_phys.obj",
    name: "Pinata Pole",
    shapeType: "compound",
    position: polePosition,
    dimensions: {
        x: 0.4,
        y: 5,
        z: 0.4
    },
    userData: JSON.stringify({ grabbableKey: { grabbable: false } })
});

var paddlePosition = Vec3.sum(MyAvatar.position, {
    x: 1.15,
    y: 2.0,
    z: 0.15
});

paddleID = Entities.addEntity({
    "color": {
        "red": 255,
        "green": 87,
        "blue": 210 
    },
    "density": 10000,
    "dimensions": {
        "x": 0.0568,
        "y": 1.7805,
        "z": 0.0892
    },
    "gravity": {
        "x": 0,
        "y": -5,
        "z": 0
    },
    "dynamic": 1,
    "name": "Pinata Paddle",
    "position": paddlePosition,
    "script": "https://hifi-content.s3.amazonaws.com/elisalj/mexico/onPinataHit.js?36",
    "rotation": {
        "w": 0.98437130451202393,
        "x": -1.7827005649451166e-05,
        "y": -0.17610554397106171,
        "z": -9.9647018942050636e-05
    },
    "type": "Box"
});

var paddlePointToOffsetFrom = Vec3.sum(paddlePosition, {
    x: 0.0,
    y: 2.0,
    z: 0.0
});

Entities.addAction("offset", paddleID, {
    pointToOffsetFrom: paddlePointToOffsetFrom,
    linearDistance: 2.0,
    linearTimeScale: 0.1
});

Script.stop();
