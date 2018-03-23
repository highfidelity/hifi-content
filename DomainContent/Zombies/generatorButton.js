//
// generatorButton.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* global Pointers*/

(function() {
    var AUDIO_VOLUME_LEVEL = 0.2;
    var DOWN_TIME_MS = 3000;
    var DISABLED_TIME_MS = 10000;
    var SOS_BUTTON = "{a106c159-b533-47c4-93cc-a34fc4ed9b58}";
    var POSITION_INACTIVE = {x:3.4711,y:-8.9907,z:4.6893};
    var POSITION_ACTIVE = {x:3.4155,y:-8.9907,z:4.7278};

    var YELLOW = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonYellow.fbx";
    var RED = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonRed.fbx";
    var GREEN = "https://hifi-content.s3.amazonaws.com/jimi/environment/201802_Shop/buttons/buttonGreen.fbx";

    var _this;
    var currentHand = 0;
    var sound;
    var generatorSound;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            sound = SoundCache.getSound(Script.resolvePath("sounds/259912__daroc__dieselgenerator.wav"));
            _this.reset();
        },
        reset: function(){
            if (generatorSound) {
                generatorSound.stop();
            }
            _this.color = GREEN;
            Entities.editEntity(_this.entityID, {
                modelURL: GREEN,
                position: POSITION_INACTIVE
            });
        },
        pressButton: function(){
            if (_this.color === GREEN) {
                _this.lowerButton();
                _this.changeColorToYellow();
                if (sound.downloaded) {
                    print("playing sound");
                    if (generatorSound) {
                        generatorSound.stop();
                    }
                    generatorSound = Audio.playSound(sound, {
                        position: POSITION_ACTIVE,
                        volume: AUDIO_VOLUME_LEVEL
                    });
                }
                Entities.callEntityMethod(SOS_BUTTON, 'changeColorToGreen');
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
                modelURL: GREEN
            });
            _this.color = GREEN;
        },
        changeColorToRed: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: RED
            });
            _this.color = RED;
        },
        changeColorToYellow: function() {
            Entities.editEntity(_this.entityID, {
                modelURL: YELLOW
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
            // print("mouse press on button");
            if (_this.color === GREEN) {
                _this.pressButton();
            }
        },
        unload: function() {
            if (generatorSound) {
                generatorSound.stop();
            }
        }
    };

    return new Button();
});
