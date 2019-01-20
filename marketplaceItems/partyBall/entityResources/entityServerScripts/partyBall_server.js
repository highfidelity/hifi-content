/*

    Party Ball
    partyBall.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function () {

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
    var DanceGenerator = Script.require("../modules/generator_dance.js?" + Date.now());

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
    var Music = new SoundGenerator();
    var SFX = new SoundGenerator();
    var Dance = new DanceGenerator();

    var numberArray = [];
    var MIN_PARTICLE_ARRAY_AMOUNT = 2;
    var MAX_PARTICLE_ARRAY_AMOUNT = 12;
    var particleRayAmount = randomInt(MIN_PARTICLE_ARRAY_AMOUNT, MAX_PARTICLE_ARRAY_AMOUNT);
    for (var i = 0; i < particleRayAmount; i++) {
        numberArray.push(i);
    }
    var ParticleArray = numberArray.map(function () {
        return new ParticleGenerator();
    });

    var MILISECONDS = 1000;

    var _entityID;

    var lastTouched = { id: null, timeStamp: 0, skeletonModelURL: null };
    var explodeTimer = false;
    var currentPosition = null;


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
    var MIN_DURATION_TIME = 3 * MILISECONDS;
    var MAX_DURATION_TIME = 30 * MILISECONDS;
    var START_TIME = 500;
    function startParty() {
        log("Starting Party");

        currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;
        createIntroSmoke(currentPosition);
        SFX.updatePosition(currentPosition);
        SFX.playRandom();
        Script.setTimeout(createEntities, START_TIME);

        var randomDurationTime = randomInt(MIN_DURATION_TIME, MAX_DURATION_TIME);

        log("randomDuration", randomDurationTime);

        Script.setTimeout(cleanUp, randomDurationTime);
    }


    // Create the inital smoke effect before the actual effects start
    var SMOKE_INTRO_TIME = 0.85 * MILISECONDS;
    function createIntroSmoke(position) {
        log("in Create Smoke");
        var smokeProperties = particleProperties.intro;

        smokeProperties.parentID = _entityID;
        smokeProperties.localPosition = [0, 0.5, 0];
        smokeProperties.rotateWithEntity = false;
        var splat = Entities.addEntity(smokeProperties);

        log("Deleting smoke", splat);
        Script.setTimeout(function() {
            Entities.deleteEntity(splat);
        }, SMOKE_INTRO_TIME);
    }


    // Create the Final ending explosion smoke
    var SMOKE_OUTRO_TIME = 1 * MILISECONDS;
    var SMOKE_ENDING_TIME = 1.5 * MILISECONDS;
    function createOutroSmoke(position) {
        log("in Create outro Smoke");
        var smokeProperties = particleProperties.outro;

        smokeProperties.parentID = _entityID;
        smokeProperties.localPosition = [0, 0.5, 0];
        var splat = Entities.addEntity(smokeProperties);

        log("Deleting smoke", splat);
        Script.setTimeout(function() {
            smokeProperties = { emitRate: 0 };
            Entities.editEntity(splat, smokeProperties);
            Script.setTimeout(function() {
                Entities.deleteEntity(splat);
            }, SMOKE_ENDING_TIME);
        }, SMOKE_OUTRO_TIME);
    }


    // Create the actual entities and start the music
    function createEntities() {
        log("in Create Entities");
        Music.updatePosition(currentPosition);
        Music.playRandom();
        Dance.create(_entityID, lastTouched.skeletonModelURL, currentPosition);
        Lights.create(_entityID);
        ParticleArray.forEach(function (particle) {
            particle.create(_entityID);
        });
    }


    var ENTITY_DELETE_TIME = 1.5 * MILISECONDS;
    var BEFORE_THE_REST_DELETE = 0.5 * MILISECONDS;
    function cleanUp() {
        log("Deleting Entities");
        createOutroSmoke(currentPosition);
        Script.setTimeout(function () {
            SFX.playRandom();
            Music.stop();
            Lights.destroy();
            Dance.destroy();
            ParticleArray.forEach(function (particle) {
                particle.destroy();
            });

            Script.setTimeout(function () {
                explodeTimer = false;
                log("Reseting Ball");
                Entities.deleteEntity(_entityID);
            }, ENTITY_DELETE_TIME);
        }, BEFORE_THE_REST_DELETE);
    }


    // #endregion
    // *************************************
    // END PARTY FUNCTIONS
    // *************************************

    // *************************************
    // START eventHandlers
    // *************************************
    // #region eventHandlers


    function onNewAvatarTouch(uuid, data) {
        log("new Avatar Touch", data);
        try {
            data = JSON.parse(data[0]);
            var newId = data.id;
            var newTimeStamp = data.timeStamp;
            var newSkeletonModelURL = data.skeletonModelURL;

            if ( lastTouched.id === null && newId != undefined) {
                startTimer();
            }

            if (newTimeStamp > lastTouched.timeStamp) {
                lastTouched.id = newId;
                lastTouched.timeStamp = newTimeStamp;
                lastTouched.skeletonModelURL = newSkeletonModelURL;
            }
        } catch (e) {
            console.log(e);
        }
    }


    // #endregion
    // *************************************
    // END eventHandlers
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION


    // Register the entity id with module that need it, make the ball dynamic, and prep the sounds
    var GRAVITY = -9.8;
    function preload(entityID) {
        log("in PreLoad");
        _entityID = entityID;

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


    // Clear the explodeTimer if there is one
    function unload() {
        explodeTimer && Script.clearInterval(explodeTimer);
    }


    function PartyBall() { }

    PartyBall.prototype = {
        remotelyCallable: ["newAvatarTouch"],
        preload: preload,
        newAvatarTouch: onNewAvatarTouch,
        unload: unload
    };

    return new PartyBall();

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
