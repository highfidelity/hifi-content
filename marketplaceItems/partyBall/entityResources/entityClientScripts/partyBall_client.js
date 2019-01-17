/*

    Party Ball
    partyBall.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function(){

    // *************************************
    // START MODULES
    // *************************************
    // #region MODULES
    
    Script.resetModuleCache(true);
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js');
    
    var common = Script.require("../modules/commonUtilities.js?" + Date.now());

    var LightGenerator = Script.require("../modules/generator_lights.js?" + Date.now());
    var ParticleGenerator = Script.require("../modules/generator_particles.js?" + Date.now());
    var SoundGenerator = Script.require("../modules/generator_sound.js?" + Date.now());

    var musicCollection = Script.require("../modules/collection_music.js?" + Date.now());
    var sfxCollection = Script.require("../modules/collection_sfx.js?" + Date.now());
    var particleProperties = Script.require("../modules/particleProperties.js?" + Date.now());
    

    // #endregion
    // *************************************
    // END MODULES
    // *************************************

    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    
    
    var randomInt = common.randomInt;
    
    var Lights = new LightGenerator();
    var Particles = new ParticleGenerator();
    var Music = new SoundGenerator();
    var SFX = new SoundGenerator();

    var _entityID;
    var explodeTimer = false;
    var currentPosition = null;
    var currentUserID = null;

    var MILISECONDS = 1000;
    
    
    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START PARTY FUNCTIONS
    // *************************************
    // #region PARTY FUNCTIONS
    

    // Start the actual timer anywhere between 2 to 10 seconds
    var MIN_START_TIME = 2 * MILISECONDS;
    var MAX_START_TIME = 10 * MILISECONDS;
    function startTimer() {
        log("Starting Timer");
        if (explodeTimer) {
            log("returning from Explode");
            return;
        }
        var randomTimeToExplode = randomInt(MIN_START_TIME, MAX_START_TIME);
        log("starting explode timer");
        explodeTimer = Script.setTimeout(initExplode, randomTimeToExplode);
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

    
    // This is where the main sequence of events takes place
    var MIN_DURATION_TIME = 7 * MILISECONDS;
    var MAX_DURATION_TIME = 25 * MILISECONDS;
    function startParty() {
        log("Starting Party");

        currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;
        log("current position", currentPosition);

        var START_TIME = 500;
        if (currentUserID === MyAvatar.sessionUUID) {
            createSmoke(currentPosition);
            SFX.updatePosition(currentPosition);
            SFX.playRandom();
            Script.setTimeout(createEntities, START_TIME);

            var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);

            log("randomDuration", randomDurationTime);

            Script.setTimeout(cleanUp, randomDurationTime);
        }
    }


    // Create the inital smoke effect before the actual effects start
    var SMOKE_TIME = 0.85 * MILISECONDS;
    function createSmoke(position) {
        log("in Create Smoke");
        var smokeProperties = particleProperties.smoke1;

        smokeProperties.position = position;
        smokeProperties.parentId = _entityID;
        var splat = Entities.addEntity(smokeProperties, true);

        Script.setTimeout(function () {
            Entities.deleteEntity(splat);
        }, SMOKE_TIME);
    }


    function createEntities(){
        log("in Create Entities");
        // Music.updatePosition(currentPosition);
        // Music.playRandom();
        Lights.create(currentPosition);
        Particles.create(currentPosition);
    }


    function cleanUp(){
        log("Deleting Entities");
        if (currentUserID === MyAvatar.sessionUUID) {
            createSmoke(currentPosition);
            SFX.playRandom();
            // Music.stop();
            Lights.destroy();
            Particles.destory();
    
            explodeTimer = false;
            log("Reseting Ball");
            Entities.deleteEntity(_entityID);
        }
    }
    
  
    // #endregion
    // *************************************
    // END PARTY FUNCTIONS
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    // Register the entity id with module that need it, make the ball dynamic, and prep the sounds
    var GRAVITY = -9.8;
    function preload(entityID){
        log("in PreLoad");
        _entityID = entityID;

        Particles.registerEntity(_entityID);

        Entities.editEntity(_entityID, {
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


    // Grab the User ID of whoever last clicked on it
    function mousePressOnEntity(){
        log("mousePressOnEntity");
        currentUserID = MyAvatar.sessionUUID;
    }


    // Grab the User ID of whoever last grabbed it
    function startNearGrab(){
        log("startNearGrab");
        currentUserID = MyAvatar.sessionUUID;
    }


    // Start the timer if the mouse releases
    function mouseReleaseOnEntity(entityID, mouseEvent){
        log("mouseReleaseOnEntity");
        if (!mouseEvent.button === "Primary") {
            return;
        }
        startTimer();
    }


    // Start the timer if the controller let's go of the ball
    function releaseGrab(id, hand){
        log("release grab");
        startTimer();
    }


    // Clear the explodeTimer if there is one
    function unload(){
        explodeTimer && Script.clearInterval(explodeTimer);
    }


    function PartyBall(){}
    
    PartyBall.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        mouseReleaseOnEntity: mouseReleaseOnEntity,
        releaseGrab: releaseGrab,
        startNearGrab: startNearGrab,
        unload: unload
    };

    return new PartyBall();
    
    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
