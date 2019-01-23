/*

    Party Ball
    partyBall_server.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function() {
    
    // *************************************
    // START MODULES
    // *************************************
    // #region MODULES

    var common = Script.require("../modules/commonUtilities.js?" + Date.now());
    var randomInt = common.randomInt;
    var randomFloat = common.randomFloat;

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


    var Lights = new LightGenerator();
    var Music = new SoundGenerator();
    var SFX = new SoundGenerator();
    var Dance = new DanceGenerator();

    var MIN_PARTICLE_ARRAY_AMOUNT = 1;
    var MAX_PARTICLE_ARRAY_AMOUNT = 4;
    var numberOfParticleEntities = randomInt(MIN_PARTICLE_ARRAY_AMOUNT, MAX_PARTICLE_ARRAY_AMOUNT);
    var ParticleArray = [];
    for (var i = 0; i < numberOfParticleEntities; i++) {
        ParticleArray.push(new ParticleGenerator());
    }

    var MS_PER_S = 1000;

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
    var MIN_START_TIME = 2 * MS_PER_S;
    var MAX_START_TIME = 10 * MS_PER_S;
    function startTimer() {
        if (explodeTimer) {
            return;
        }
        var randomTimeToExplode = randomFloat(MIN_START_TIME, MAX_START_TIME);
        explodeTimer = Script.setTimeout(initExplode, randomTimeToExplode);
    }


    // Initiate explosion
    function initExplode() {
        Entities.editEntity(_entityID, {
            gravity: [0, 0, 0],
            angularVelocity: [0, 0, 0],
            velocity: [0, 0, 0],
            dynamic: false,
            visible: false,
            rotation: Quat.IDENTITY,
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
        });
        startParty();
    }


    // Create the opening explosion and sound effect, followed by creating the main party elements.  After that cleanup gets called.
    var MIN_PARTY_DURATION_TIME = 5 * MS_PER_S;
    var MAX_PARTY_DURATION_TIME = 15 * MS_PER_S;
    var CREATE_ENTITIES_START_TIME_MS_AFTER_INITIAL_EXPLOSION = 500;
    function startParty() {
        currentPosition = Entities.getEntityProperties(_entityID, ["position"]).position;
        introSmokeEntity();
        SFX.updatePosition(currentPosition);
        SFX.playRandom();
        Script.setTimeout(createEntities, CREATE_ENTITIES_START_TIME_MS_AFTER_INITIAL_EXPLOSION);

        var randomPartyDurationTime = randomInt(MIN_PARTY_DURATION_TIME, MAX_PARTY_DURATION_TIME);

        Script.setTimeout(cleanUp, randomPartyDurationTime);
    }


    // Create the inital smoke effect before the actual party starts
    var SMOKE_INTRO_TIME = 0.85 * MS_PER_S;
    function introSmokeEntity() {
        var smokeProperties = particleProperties.intro;

        smokeProperties.parentID = _entityID;
        smokeProperties.localPosition = [0, 0.5, 0];
        smokeProperties.rotateWithEntity = false;
        var splat = Entities.addEntity(smokeProperties);

        Script.setTimeout(function() {
            Entities.deleteEntity(splat);
        }, SMOKE_INTRO_TIME);
    }


    // Create the Final ending explosion smoke
    var SMOKE_OUTRO_TIME = 1 * MS_PER_S;
    var SMOKE_ENDING_TIME = 1.5 * MS_PER_S;
    function outroSmokeEntity() {
        var smokeProperties = particleProperties.outro;

        smokeProperties.parentID = _entityID;
        smokeProperties.localPosition = [0, 0.5, 0];
        var splat = Entities.addEntity(smokeProperties);

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
        Music.updatePosition(currentPosition);
        Music.playRandom();
        Dance.create(_entityID, lastTouched.skeletonModelURL, lastTouched.id, currentPosition);
        Lights.create(_entityID);
        ParticleArray.forEach(function(particle) {
            particle.create(currentPosition);
        });
    }


    var ENTITY_DELETE_TIME = 1.5 * MS_PER_S;
    var BEFORE_THE_REST_DELETE = 0.5 * MS_PER_S;
    function cleanUp() {
        outroSmokeEntity();
        Script.setTimeout(function() {
            SFX.playRandom();
            Music.stop();
            Lights.destroy();
            Dance.destroy();
            ParticleArray.forEach(function(particle) {
                particle.destroy();
            });

            Script.setTimeout(function() {
                explodeTimer = false;
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


    // Checks to see if the last touch message received is the latest.  If so, replace the properties.
    function onNewAvatarTouch(uuid, data) {
        try {
            data = JSON.parse(data[0]);
            var newId = data.id;
            var newTimeStamp = data.timeStamp;
            var newSkeletonModelURL = data.skeletonModelURL;

            if (lastTouched.id === null) {
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


    // Handles the client sending back a message about what the correct natural dimensions are
    function onUpdateNaturalDimensions(uuid, data) {
        try {
            var newNaturalDimensions = JSON.parse(data[0]);
            Dance.updateDimensions(newNaturalDimensions);
        } catch (e) {
            console.log(e);
        }
    }


    // *************************************
    // END eventHandlers
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION


    // Make the ball dynamic and prep the sounds
    var GRAVITY_M_PER_S = -9.8;
    function preload(entityID) {
        _entityID = entityID;
        Entities.editEntity(_entityID, {
            gravity: [0, GRAVITY_M_PER_S, 0],
            dynamic: true,
            rotation: Quat.IDENTITY,
            visible: true
        });

        // To cut down on how many files to cache, we get a random song and add two random SFX to the possible list.
        // Ok if the same sfx is added twice

        Music.addSound(
            musicCollection[randomInt(0, musicCollection.length - 1)]
        );
        
        SFX.addSound(
            sfxCollection[randomInt(0, sfxCollection.length - 1)]
        );

        SFX.addSound(
            sfxCollection[randomInt(0, sfxCollection.length - 1)]
        );

    }


    // Clear the explodeTimer if there is one
    function unload() {
        explodeTimer && Script.clearInterval(explodeTimer);
    }


    function PartyBall() { }

    PartyBall.prototype = {
        remotelyCallable: ["newAvatarTouch", "updateNaturalDimensions"],
        preload: preload,
        updateNaturalDimensions: onUpdateNaturalDimensions,
        newAvatarTouch: onNewAvatarTouch,
        unload: unload
    };

    return new PartyBall();

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
