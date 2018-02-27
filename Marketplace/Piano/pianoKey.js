//
//  pianoKey.js
//
//  created by Rebecca Stankus on 01/16/18
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
    var COLOR_WHITE_1 = { blue: 162, green: 77, red: 214 };
    var COLOR_WHITE_2 = { blue: 214, green: 105, red: 77 };
    var COLOR_WHITE_3 = { blue: 87, green: 214, red: 71 };
    var COLOR_WHITE_4 = { blue: 64, green: 170, red: 219 };
    var COLOR_BLACK_1 = { blue: 48, green: 2, red: 77 };
    var COLOR_BLACK_2 = { blue: 102, green: 37, red: 13 };
    var COLOR_BLACK_3 = { blue: 11, green: 54, red: 5 };
    var COLOR_BLACK_4 = { blue: 0, green: 64, red: 94 };
    var KEY_INDEX = 10;
    var COLOR_CHANGE_TIMEOUT = 250;
    var NEGATIVE = -1;

    var white = true;
    var playing = false;
    var sound;
    var Key = function() {
        _this = this;
    };

    Key.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            var soundFile = "PianoKeys/" + _this.getKeyNumber() + ".wav";
            sound = SoundCache.getSound(Script.resolvePath(soundFile));
            _this.setKeycolor();
        },
        setKeycolor: function() {
            var colorObject = Entities.getEntityProperties(_this.entityID, 'color').color;
            if (JSON.stringify(colorObject).indexOf("0") !== NEGATIVE) {
                white = false;
            }
        },
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0) {
                this.playSound();
            } 
        },
        playSound: function() {
            var colorChange = Math.floor(Math.random() * 4);
            var newColor;
            _this.homePosition = Entities.getEntityProperties(_this.entityID, ["position"]).position;
            _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME});
            if (sound.downloaded && !playing) {
                var position = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
                if (white) {
                    switch (colorChange) {
                        case 0:
                            newColor = COLOR_WHITE_1;
                            break;
                        case 1:
                            newColor = COLOR_WHITE_2;
                            break;
                        case 2:
                            newColor = COLOR_WHITE_3;
                            break;
                        case 3:
                            newColor = COLOR_WHITE_4;
                            break;
                        default:
                            newColor = COLOR_WHITE_4;
                    } 
                    position.y = WHITE_KEY_LOCAL_Y_POSITION_DOWN;
                } else {
                    switch (colorChange) {
                        case 0:
                            newColor = COLOR_BLACK_1;
                            break;
                        case 1:
                            newColor = COLOR_BLACK_2;
                            break;
                        case 2:
                            newColor = COLOR_BLACK_3;
                            break;
                        case 3:
                            newColor = COLOR_BLACK_4;
                            break;
                        default:
                            newColor = COLOR_BLACK_4;
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
                    if (white) {
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
                this.playSound();
            }
        },
        getKeyNumber: function(){
            var keyName = Entities.getEntityProperties(_this.entityID, 'name').name;
            print(keyName.substr(KEY_INDEX));
            return keyName.substr(KEY_INDEX);
        }
    };

    return new Key();
});
