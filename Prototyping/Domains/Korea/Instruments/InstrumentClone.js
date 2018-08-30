// InstrumentClone.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
// Expands on guitarMexico.js created by Rebecca Stankus 01/31/18
//
// Entity script that plays the sound while holding the entity. 
// Chooses the sound bite randomly from a list passed in.
// Takes two parameters : 
//     musicURLs - list of relative music urls
//     audioVolumeLevel - sets the magnitude of the sounds defaults to 0.3
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global module */

var NO_HANDS = 0;
var ONE_HAND = 1;
var BOTH_HANDS = 2;
var LIFETIME_ON_PICKUP = 18;
var LIFETIME_ON_RELEASE = 8;

var SECS_TO_MS = 1000;
var UPDATE_POSITION_MS = 50;
var FIRST_LOAD_TIMEOUT = 50;
var DEFAULT_VOLUME_LEVEL = 0.1;
var DEBUG = false;

var InstrumentClone = function (musicURLs, audioVolumeLevel) {
    this.musicURLs = musicURLs;
    this.audioVolumeLevel = audioVolumeLevel || DEFAULT_VOLUME_LEVEL;
    this.injector = null;
    this.playing = false;
    this.sounds = [];
    this.firstLoad = true;
    this.handNum = 0;
    this.updatePositionInterval = null;
    this.currentPosition;
};

InstrumentClone.prototype = {

    // ENTITY METHODS
    preload: function (entityID) {
        this.entityID = entityID;

        var entityProperties = Entities.getEntityProperties(this.entityID, ["position", "name", "age"]);
        this.currentPosition = entityProperties.position;
        this.handNum = 0;

        Script.setTimeout(function(){
            if (entityProperties.name && entityProperties.name.indexOf("clone") !== -1){
                if (DEBUG) {
                    print("Instrument clone: preload edit lifetime ", entityProperties.name);
                }
                Entities.editEntity(this.entityID, { lifetime: entityProperties.age + LIFETIME_ON_PICKUP });
            }
        }, FIRST_LOAD_TIMEOUT);

        this.loadSounds();
    },

    startNearGrab: function (thisEntity, otherEntity, collision) {

        if (DEBUG) {
            print("Instrument clone: Start near grab");
        }

        if (this.handNum === NO_HANDS) {
            this.handNum = ONE_HAND;
        } else {
            this.handNum = BOTH_HANDS;
        }

        var age = Entities.getEntityProperties(this.entityID, "age").age;
        Entities.editEntity(this.entityID, { lifetime: age + LIFETIME_ON_PICKUP });
        this.startSound();
    },

    releaseGrab: function () {
        if (DEBUG) {
            print("Instrument clone: release grab");
        }

        if (this.handNum === BOTH_HANDS) {
            this.handNum = ONE_HAND;
        } else {
            this.stopSound();

            var age = Entities.getEntityProperties(this.entityID, "age").age;
            Entities.editEntity(this.entityID, { lifetime: age + LIFETIME_ON_RELEASE });
            this.handNum = NO_HANDS;
        }
    },

    // clickReleaseOnEntity: function (entityID, mouseEvent) {

    //     if (mouseEvent.isLeftButton) {
    //         if (!this.playing) {
    //             this.startSound();
    //         } else {
    //             this.stopSound();
    //         }
    //     }
    // },

    unload: function () {
        this.stopSound();
        this.handNum = NO_HANDS;
    },
    // END ENTITY METHODS

    // SOUND UTILITIES
    loadSounds: function () {

        if (DEBUG) {
            print("Instrument clone: load sounds ", JSON.stringify(this.musicURLs));
        }

        var _this = this;

        this.musicURLs.forEach(function (soundURL, idx) {
            _this.sounds[idx] = SoundCache.getSound(Script.resolvePath(soundURL));
        });

        this.firstLoad = true;

        if (DEBUG) {
            print("Instrument clone: Sounds are:", JSON.stringify(this.sounds));
        }
    },

    startSound: function () {
        var _this = this;

        if (DEBUG) {
            print("Instrument clone: Start sound, first load is ", this.firstLoad);
        }

        if (this.firstLoad) {
            // Give time to ensure random sound is downloaded on first pickup
            Script.setTimeout(function () {
                _this.playSound();
            }, FIRST_LOAD_TIMEOUT);

            this.firstLoad = false;
        } else {
            this.playSound();
        }
    },

    getRandomSound: function () {
        var randSound = this.sounds[Math.floor(Math.random() * this.sounds.length)];
        return randSound;
    },

    playSound: function () {

        var _this = this;
        var sound = this.getRandomSound();

        if (DEBUG) {
            print("Instrument clone: isPlaying ", !this.playing, " soundDownloaded", sound.downloaded);
            print("Instrument clone: Random soung ", JSON.stringify(sound));
        }

        if (!this.playing && sound.downloaded) {

            var position = Entities.getEntityProperties(this.entityID, 'position').position;

            // Play sound
            this.injector = Audio.playSound(sound, {
                position: position,
                inputVolume: _this.audioVolumeLevel
            });

            this.playing = true;

            var injector = this.injector;
            var entityID = this.entityID;

            // Update sound position using interval
            this.updatePositionInterval = Script.setInterval(function () {
                var position = Entities.getEntityProperties(entityID, 'position').position;
                injector.options = { position: position };
            }, UPDATE_POSITION_MS);

            // length of sound timeout
            var soundLength = sound.duration * SECS_TO_MS;

            Script.setTimeout(function () {
                if (_this.playing) {
                    _this.stopSound();
                }
            }, soundLength);
        }
    },

    stopSound: function () {

        if (DEBUG) {
            print("Instrument clone: stop sound");
        }

        this.playing = false;

        if (this.injector) {
            this.injector.stop();
            this.injector = null;
        }
        if (this.updatePositionInterval) {
            Script.clearInterval(this.updatePositionInterval);
            this.updatePositionInterval = null;
        }
    }
    // END SOUND UTILITIES
};

module.exports = {
    instrumentClone: InstrumentClone
};
