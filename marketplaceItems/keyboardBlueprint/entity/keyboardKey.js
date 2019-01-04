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

(function() { 
    var _this;

    var AUDIO_VOLUME_LEVEL = 1;
    var WHITE_KEY_LOCAL_Y_POSITION_UP = 0.0193;
    var WHITE_KEY_LOCAL_Y_POSITION_DOWN = 0.0083;
    var BLACK_KEY_LOCAL_Y_POSITION_UP = 0.0360;
    var BLACK_KEY_LOCAL_Y_POSITION_DOWN = 0.0230;
    var AUDIO_VOLUME = 1;
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
    var COLOR_CHANGE_TIMEOUT = 250;

    var playing = false;
    var sound;
    var keyColor;

    var Key = function() {
        _this = this;
    };

    Key.prototype = {

        preload: function(entityID){
            _this.entityID = entityID;
            _this.setKeyData();
        },

        /* ON COLLISION WITH AN ENTITY: When an entity collides with a keyboard key, play the corresponding key sound */
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0) {
                _this.playSound();
            } 
        },

        /* PLAY SOUND: Plays the specified sound at the position of the key */
        playSound: function() {
            var colorChange = Math.floor(Math.random() * 4);
            var newColor;
            _this.homePosition = Entities.getEntityProperties(_this.entityID, ["position"]).position;
            _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME});
            if (sound.downloaded && !playing) {
                var position = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
                if (keyColor === "White") {
                    switch (colorChange) {
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
                    position.y = WHITE_KEY_LOCAL_Y_POSITION_DOWN;
                } else {
                    switch (colorChange) {
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
                    position.y = BLACK_KEY_LOCAL_Y_POSITION_DOWN;
                }
                Entities.editEntity(_this.entityID, {
                    localPosition: position,
                    color: newColor
                });
                Audio.playSound(sound, {
                    position: _this.homePosition,
                    volume: AUDIO_VOLUME_LEVEL
                });
                playing = true;
                Script.setTimeout(function() {
                    if (keyColor === "White") {
                        position.y = WHITE_KEY_LOCAL_Y_POSITION_UP;
                        newColor = WHITE;
                    } else {
                        position.y = BLACK_KEY_LOCAL_Y_POSITION_UP;
                        newColor = BLACK;
                    }
                    Entities.editEntity(_this.entityID, {
                        localPosition: position,
                        color: newColor
                    });
                    playing = false;
                }, COLOR_CHANGE_TIMEOUT);
            }
        },

        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                _this.playSound();
            }
        },

        setKeyData: function(){
            var keyName = Entities.getEntityProperties(_this.entityID, 'name').name;
            keyColor = keyName.substr(KEY_COLOR_INDEX_START, KEY_COLOR_LENGTH);
            var soundFile = Script.resolvePath("Assets/Sounds/" + keyName.substr(KEY_NUMBER_INDEX) + ".wav");
            sound = SoundCache.getSound(Script.resolvePath(soundFile));
        }
    };

    return new Key();
});
