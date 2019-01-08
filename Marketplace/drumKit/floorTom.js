//
//  floorTom.js
//
//  created by Rebecca Stankus on 01/24/18
//  updated 12/26/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var _this;

    var AUDIO_VOLUME_LEVEL = 1;
    var COLOR_1 = { blue: 255, green: 79, red: 255 };
    var COLOR_2 = { blue: 214, green: 105, red: 77 };
    var COLOR_3 = { blue: 87, green: 214, red: 71 };
    var COLOR_4 = { blue: 64, green: 170, red: 219 };
    var OFF_WHITE = { blue: 145, green: 145, red: 145 };
    var TIMEOUT_MS = 100;
    var FLOOR_TOM_SOUND = SoundCache.getSound(Script.resolvePath("Assets/Sounds/floorTom.wav"));

    var playing = false;
    var injector;
    
    var FloorTom = function() {
        _this = this;
    };

    FloorTom.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
        },
        
        // In HMD, listen for collisions and then change to a random color and play a sound. Collision type 0 is the 
        // start of a collision, whereas 1 would be the continuation and 2 would be the end. The use of the variable 
        // "playing" with a timeout prevents the drum from being played too quickly in succession.
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0 && !playing) {
                _this.playSound(FLOOR_TOM_SOUND);
                _this.colorChange();
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                    Entities.editEntity(_this.entityID, {color: OFF_WHITE});
                }, TIMEOUT_MS);
            }
        },

        // In desktop, listen for mouse clicks and then check that it was the left mouse button before playing the drum.
        // This will initiate the color change, sound, and timeout as above.
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton && !playing) {
                _this.playSound(FLOOR_TOM_SOUND);
                _this.colorChange();
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                    Entities.editEntity(_this.entityID, {color: OFF_WHITE});
                }, TIMEOUT_MS);
            }
        },

        colorChange: function() {
            var colorChange = Math.floor(Math.random() * 4);
            var newColor;
            switch (colorChange) {
                case 0:
                    newColor = COLOR_1;
                    break;
                case 1:
                    newColor = COLOR_2;
                    break;
                case 2:
                    newColor = COLOR_3;
                    break;
                case 3:
                    newColor = COLOR_4;
                    break;
                default:
                    newColor = COLOR_4;
            }
            Entities.editEntity(_this.entityID, {color: newColor});
        },

        playSound: function(sound) {
            if (sound.downloaded) {
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, ["position"]).position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },

        unload: function() {
            if (injector) {
                injector.stop();
            }
        }
    };

    return new FloorTom();
});
