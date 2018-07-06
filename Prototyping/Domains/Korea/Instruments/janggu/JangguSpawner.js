// JangguSpawner.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Utilizes InstrumentSpawner.js constructor to create Janggu that spawns clonable playable Janggu when held. 
// 
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    
    var spawner = Script.require(Script.resolvePath("../InstrumentSpawner.js"));
    var InstrumentSpawner = spawner.instrumentSpawner;

    var NAME = "Janggu";
    var MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/janggu.fbx";
    var DIMENSIONS = {
        x: 0.2150,
        y: 0.2171,
        z: 0.2150
    };
    var CLONE_LIFETIME = 18;
    var SCRIPT_URL = Script.resolvePath("JangguClone.js?v1" + Math.random());

    var janggu = {
        name: NAME,
        modelURL: MODEL_URL,
        dimensions: DIMENSIONS,
        cloneLifetime: CLONE_LIFETIME,
        scriptURL: SCRIPT_URL
    };

    var jangguSpawner = new InstrumentSpawner(janggu);
    jangguSpawner.createSpawner();

})();