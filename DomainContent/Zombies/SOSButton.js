//
// SOSButton.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Pointers */

(function() {
    var AUDIO_VOLUME_LEVEL = 0.2;
    var DOWN_TIME_MS = 3000;
    var DISABLED_TIME_MS = 10000;
    var BOAT = "{4691d6ad-93f5-4456-90b9-95c9f2ef00b2}";
    var BLOCK_BOAT_ACCESS = "{838f0103-1bfa-4c7c-a786-b3e8c0f71f8a}";
    var BOAT_HORN_SOUND = "sounds/346108__limetoe__boat-horn.wav";
    var BOAT_SOUND_POSITION = {
        x:-4.8,
        y:4.5,
        z:-52
    };
    var POSITION_INACTIVE = {
        x: -6.2397,
        y: 4.4977,
        z: -51.5015
    };
    var POSITION_ACTIVE = {
        x: -6.2397,
        y: 4.4031,
        z: -51.5015
    };

    var YELLOW = {
        red: 237,
        green: 220,
        blue: 26
    };

    var RED = {
        red: 255,
        green: 0,
        blue: 0
    };

    var GREEN = {
        red: 28,
        green: 165,
        blue: 23
    };

    var _this;
    var currentHand = 0;
    var sound;
    var boatSound;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath(BOAT_HORN_SOUND));
            _this.reset();
        },
        reset: function() {
            if (boatSound) {
                boatSound.stop();
            }
            _this.color = RED;
            _this.changeColorToRed();
            _this.raiseButton();
        },
        pressButton: function(){
            if (_this.color === GREEN) {
                _this.lowerButton();
                _this.changeColorToYellow();
                if (sound.downloaded) {
                    if (boatSound) {
                        boatSound.stop();
                    }
                    boatSound = Audio.playSound(sound, {
                        position: BOAT_SOUND_POSITION,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                    Entities.editEntity(BLOCK_BOAT_ACCESS, {
                        collisionless: true
                    });
                    Entities.callEntityServerMethod(BOAT, 'approachIsland');
                }
                Script.setTimeout(function() {
                    _this.changeColorToRed();
                    _this.raiseButton();
                }, DOWN_TIME_MS);
                Script.setTimeout(function() {
                    _this.changeColorToGreen();
                }, DISABLED_TIME_MS);
            }
        },
        changeColorToGreen: function() {
            Entities.editEntity(_this.entityID, {
                color: GREEN
            });
            _this.color = GREEN;
        },
        changeColorToRed: function() {
            Entities.editEntity(_this.entityID, {
                color: RED
            });
            _this.color = RED;
        },
        changeColorToYellow: function() {
            Entities.editEntity(_this.entityID, {
                color: YELLOW
            });
            _this.color = YELLOW;
        },
        raiseButton: function() {
            Entities.editEntity(_this.entityID, {
                position: POSITION_INACTIVE
            });
        },
        lowerButton: function() {
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            Entities.editEntity(_this.entityID, {
                position: POSITION_ACTIVE
            });
        },
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.button === "Primary") {
                return;
            }
            if (!Pointers.isMouse(mouseEvent.id)) {
                if (Pointers.isLeftHand(mouseEvent.id)) {
                    currentHand = 0;
                } else if (Pointers.isRightHand(mouseEvent.id)) {
                    currentHand = 1;
                }
            }
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        unload: function() {
            if (boatSound) {
                boatSound.stop();
            }
        }
    };

    return new Button();
});
