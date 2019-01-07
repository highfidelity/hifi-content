//
//  keyboardKey.js
//
//  created by Rebecca Stankus on 01/16/18
//  updated on 01/02/19
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Audio, Entities, Script, SoundCache */

(function() { 
    var _this;

    var COLOR_CHANGE_TIMEOUT_MS = 250;
    var AUDIO_VOLUME_LEVEL = 0.5;
    var WHITE = { blue: 255, green: 255, red: 255 };
    var BLACK = { blue: 0, green: 0, red: 0 };
    var RANDOM_COLOR_LIGHT_1 = { blue: 162, green: 77, red: 214 };
    var RANDOM_COLOR_LIGHT_2 = { blue: 214, green: 105, red: 77 };
    var RANDOM_COLOR_LIGHT_3 = { blue: 87, green: 214, red: 71 };
    var RANDOM_COLOR_LIGHT_4 = { blue: 64, green: 170, red: 219 };
    var RANDOM_COLOR_DARK_1 = { blue: 48, green: 2, red: 77 };
    var RANDOM_COLOR_DARK_2 = { blue: 102, green: 37, red: 13 };
    var RANDOM_COLOR_DARK_3 = { blue: 11, green: 54, red: 5 };
    var RANDOM_COLOR_DARK_4 = { blue: 0, green: 64, red: 94 };
    var KEY_COLOR_INDEX_START = 13;
    var KEY_COLOR_LENGTH = 5;
    var KEY_NUMBER_INDEX = 19;
    var MINIMUM_KEY_REPEAT_MS = 10;

    var sound;
    var keyDefaultColor;
    var keyPosition;
    var playing = false;

    var Key = function() {
        _this = this;
    };

    Key.prototype = {

        /* ON PRELOAD: Save a reference to this key and set up some data about its position, sound, and color */
        preload: function(entityID){
            _this.entityID = entityID;
            _this.setKeyData();
        },

        /* ON COLLISION WITH AN ENTITY: When an entity starts to collide with this keyboard key, change the key color, 
        and play the corresponding key sound. When the entity stops colliding, return the key to its default color */
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0 && playing === false) {
                playing = true;
                Script.setTimeout(function() {
                    playing = false;
                }, MINIMUM_KEY_REPEAT_MS);
                var newColor = _this.getRandomColor();
                Entities.editEntity(_this.entityID, { color: newColor });
                _this.playSound();
            } else if (collision.type === 2) {
                Entities.editEntity(_this.entityID, { color: keyDefaultColor });
            }
        },

        /* GET RANDOM COLOR: Return one randomly chosen color out of 4 light colors for a white key or one of 4 dark 
        colors for a black key */
        getRandomColor: function() {
            var newColorIndex = Math.floor(Math.random() * 4);
            var newColor;
            if (keyDefaultColor === WHITE) {
                switch (newColorIndex) {
                    case 0:
                        newColor = RANDOM_COLOR_LIGHT_1;
                        break;
                    case 1:
                        newColor = RANDOM_COLOR_LIGHT_2;
                        break;
                    case 2:
                        newColor = RANDOM_COLOR_LIGHT_3;
                        break;
                    case 3:
                        newColor = RANDOM_COLOR_LIGHT_4;
                        break;
                    default:
                        newColor = RANDOM_COLOR_LIGHT_4;
                }
            } else {
                switch (newColorIndex) {
                    case 0:
                        newColor = RANDOM_COLOR_DARK_1;
                        break;
                    case 1:
                        newColor = RANDOM_COLOR_DARK_2;
                        break;
                    case 2:
                        newColor = RANDOM_COLOR_DARK_3;
                        break;
                    case 3:
                        newColor = RANDOM_COLOR_DARK_4;
                        break;
                    default:
                        newColor = RANDOM_COLOR_DARK_4;
                }
            }
            return newColor;
        },

        /* PLAY SOUND: Plays the specified sound at the position of the key and a volume of 1 (loudest setting) */
        playSound: function() {
            Audio.playSound(sound, {
                position: keyPosition,
                volume: AUDIO_VOLUME_LEVEL
            });
        },

        /* CLICK RELEASE ON ENTITY: Handle desktop clicks on this key by changing its color and playing the sound */
        clickDownOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                var newColor = _this.getRandomColor();
                Entities.editEntity(_this.entityID, { color: newColor });
                _this.playSound();
            }
        },

        /* CLICK RELEASE ON ENTITY: Handle desktop click releases on this key by returning the color to normal */
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            Script.setTimeout(function() {
                Entities.editEntity(_this.entityID, { color: keyDefaultColor });
            }, COLOR_CHANGE_TIMEOUT_MS);
        },

        /* SET KEY DATA: Retrieve the name of the entity to get its color and key number, then set up the corresponding 
        sound to be used later. Save it's initial position. */
        setKeyData: function(){
            var keyProperties = Entities.getEntityProperties(_this.entityID, [ 'position', 'name']);
            keyPosition = keyProperties.position;
            var keyColorString = keyProperties.name.substr(KEY_COLOR_INDEX_START, KEY_COLOR_LENGTH);
            if (keyColorString === "White") {
                keyDefaultColor = WHITE;
            } else {
                keyDefaultColor = BLACK;
            }
            var soundFile = Script.resolvePath("../sounds/" + keyProperties.name.substr(KEY_NUMBER_INDEX) + ".wav");
            sound = SoundCache.getSound(Script.resolvePath(soundFile));
        }
    };

    return new Key();
});
