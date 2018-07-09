// GayageumSpawner.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Utilizes InstrumentSpawner.js constructor to create Gayageum that spawns clonable playable Gayageums when held. 
// 
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    
    var spawner = Script.require(Script.resolvePath("../InstrumentSpawner.js"));
    var InstrumentSpawner = spawner.instrumentSpawner;

    var NAME = "Gayageum";
    var MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/gayageum.fbx";
    var DIMENSIONS = {
        x: 0.3526,
        y: 0.1614,
        z: 1.6474
    };
    var CLONE_LIFETIME = 18;
    var SCRIPT_URL = Script.resolvePath("GayageumClone.js");

    var gayageum = {
        name: NAME,
        modelURL: MODEL_URL,
        dimensions: DIMENSIONS,
        cloneLifetime: CLONE_LIFETIME,
        scriptURL: SCRIPT_URL
    };

    var gayageumSpawner = new InstrumentSpawner(gayageum);
    gayageumSpawner.createSpawner();

})();
