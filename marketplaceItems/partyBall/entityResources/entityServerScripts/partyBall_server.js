/*

    Party Ball
    partyBall_server.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Main file for Party Ball

*/

(function(){

    // *************************************
    // START MODULES
    // *************************************
    // #region MODULES
    
    Script.resetModuleCache(true);
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js');
    var musicCollection = Script.require("../modules/collection_music");
    var sfxCollection = Script.require("../modules/collection_sfx");
    var textureCollection = Script.require("../modules/collection_textures");
    var common = Script.require("../modules/common.js")

    var LightMaker = Script.require("../modules/lightMaker.js");
    var ParticleMaker = Script.require("../modules/particleMaker.js");
    var SoundMaker = Script.require("../modules/soundMaker.js");

    var smokeProperties = Script.require("../modules/smokeParticleProperties");
    

    // #endregion
    // *************************************
    // END MODULES
    // *************************************

    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    
    
    var randomInt = common.randomInt;
    
    var Lights = new LightMaker();
    var Particles = new ParticleMaker(textureCollection);
    var Music = new SoundMaker();
    var SFX = new SoundMaker();

    var _entityID;
    var explodeTimer = false;
    var canStartTimer = true;
    var currentPosition = null;
    var entities = [];

    var MILISECONDS = 1000;


    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START PARTY FUNCTIONS
    // *************************************
    // #region PARTY FUNCTIONS
    

    function createEntities(){
        // Music.updatePosition(currentPosition);
        // Music.playRandom();
        Lights.create(currentPosition);
        Particles.create(currentPosition);
    }

    
    function cleanUp(){
        log("Deleting Entities");
        createSmoke();
        SFX.playRandom();
        Music.stop();
        Lights.destroy();
        Particles.destory();

        explodeTimer = false;
        log("Reseting Ball");
        Entities.deleteEntity(_entityID);
    }

    var MIN_DURATION_TIME = 7 * MILISECONDS;
    var MAX_DURATION_TIME = 25 * MILISECONDS;
    function startParty() {
        log("Starting Party");

        currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;
        log("current position", currentPosition);

        var START_TIME = 500;
        createSmoke();
        SFX.updatePosition(currentPosition);
        SFX.playRandom();
        Script.setTimeout(createEntities, START_TIME);

        var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);

        log("randomDuration", randomDurationTime);

        Script.setTimeout(cleanUp, randomDurationTime);
    }


    // Initiate explosion
    function initExplode() {
        log("About to explode");
        Entities.editEntity(_entityID, {
            gravity: [0, 0, 0],
            angularVelocity: [0, 0, 0],
            velocity: [0, 0, 0],
            dynamic: false,
            visible: false,
            rotation: Quat.IDENTITY
        });
        log("starting party");
        startParty();
    }


    var MIN_START_TIME = 2 * MILISECONDS;
    var MAX_START_TIME = 10 * MILISECONDS;
    function startTimer() {
        log("inside start Timer");
        if (explodeTimer) {
            log("returning from Explode");
            return;
        }
        var randomTimeToExplode = randomInt(MIN_START_TIME, MAX_START_TIME);
        log("starting explode timer");
        explodeTimer = Script.setTimeout(initExplode, randomTimeToExplode);
    }


    var SMOKE_TIME = 0.85 * MILISECONDS;
    function createSmoke(position) {
        smokeProperties.position = position;
        smokeProperties.parentId = _entityID;
        var splat = Entities.addEntity(smokeProperties);

        Script.setTimeout(function () {
            Entities.deleteEntity(splat);
        }, SMOKE_TIME);
    }
    
    
    // #endregion
    // *************************************
    // END PARTY FUNCTIONS
    // *************************************
    
    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    var GRAVITY = -9.8;
    function preload(entityID){
        log("preload");
        _entityID = entityID;

        Particles.registerEntity(_entityID);

        Entities.editEntity(entityID, {
            gravity: [0, GRAVITY, 0],
            dynamic: true,
            rotation: Quat.IDENTITY,
            visible: true
        });

        musicCollection.forEach(function (sound) {
            Music.addSound(sound);
        });

        sfxCollection.forEach(function (sound) {
            SFX.addSound(sound);
        });
    }


    function startTimer() {
        log("startTimer called");
        if (canStartTimer) {
            startTimer();
            canStartTimer = false;
        }
    }


    function unload(){
        explodeTimer && Script.clearInterval(explodeTimer);
    }


    function PartyBall() {
    }


    PartyBall.prototype = {
        remotelyCallable: [ "startTimer" ],
        preload: preload,
        startTimer: startTimer,
        unload: unload
    };

    return new PartyBall();
    
    
    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});