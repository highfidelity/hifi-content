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
    var BLACK_KEY_LOCAL_Y_POSITION_UP = 0.0320;
    var BLACK_KEY_LOCAL_Y_POSITION_DOWN = 0.0230;
    var AUDIO_VOLUME = 1;

    var white = true;
    var playing = false;
    var sound;

    var Key = function() {
        _this = this;
    };

    Key.prototype = {
        preload: function(entityID){
            _this.entityID = entityID;
            switch (this.getKeyNumber()) {
                case "Piano Key 1":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/1.wav"));
                    break;
                case "Piano Key 2":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/2.wav"));
                    white = false;
                    break;
                case "Piano Key 3":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/3.wav"));
                    break;
                case "Piano Key 4":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/4.wav"));
                    white = false;
                    break;
                case "Piano Key 5":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/5.wav"));
                    break;
                case "Piano Key 6":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/6.wav"));
                    break;
                case "Piano Key 7":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/7.wav"));
                    white = false;
                    break;
                case "Piano Key 8":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/8.wav"));
                    break;
                case "Piano Key 9":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/9.wav"));
                    white = false;
                    break;
                case "Piano Key 10":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/10.wav"));
                    break;
                case "Piano Key 11":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/11.wav"));
                    white = false;
                    break;
                case "Piano Key 12":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/12.wav"));
                    break;
                case "Piano Key 13":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/13.wav"));
                    break;
                case "Piano Key 14":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/14.wav"));
                    white = false;
                    break;
                case "Piano Key 15":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/15.wav"));
                    break;
                case "Piano Key 16":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/16.wav"));
                    white = false;
                    break;
                case "Piano Key 17":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/17.wav"));
                    break;
                case "Piano Key 18":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/18.wav"));
                    break;
                case "Piano Key 19":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/19.wav"));
                    white = false;
                    break;
                case "Piano Key 20":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/20.wav"));
                    break;
                case "Piano Key 21":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/21.wav"));
                    white = false;
                    break;
                case "Piano Key 22":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/22.wav"));
                    break;
                case "Piano Key 23":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/23.wav"));
                    white = false;
                    break;
                case "Piano Key 24":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/24.wav"));
                    break;
                case "Piano Key 25":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/25.wav"));
                    break;
                case "Piano Key 26":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/26.wav"));
                    white = false;
                    break;
                case "Piano Key 27":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/27.wav"));
                    break;
                case "Piano Key 28":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/28.wav"));
                    white = false;
                    break;
                case "Piano Key 29":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/29.wav"));
                    break;
                case "Piano Key 30":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/30.wav"));
                    break;
                case "Piano Key 31":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/31.wav"));
                    white = false;
                    break;
                case "Piano Key 32":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/32.wav"));
                    break;
                case "Piano Key 33":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/33.wav"));
                    white = false;
                    break;
                case "Piano Key 34":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/34.wav"));
                    break;
                case "Piano Key 35":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/35.wav"));
                    white = false;
                    break;
                case "Piano Key 36":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/36.wav"));
                    break;
                case "Piano Key 37":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/37.wav"));
                    break;
                case "Piano Key 38":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/38.wav"));
                    white = false;
                    break;
                case "Piano Key 39":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/39.wav"));
                    break;
                case "Piano Key 40":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/40.wav"));
                    white = false;
                    break;
                case "Piano Key 41":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/41.wav"));
                    break;
                case "Piano Key 42":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/42.wav"));
                    break;
                case "Piano Key 43":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/43.wav"));
                    white = false;
                    break;
                case "Piano Key 44":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/44.wav"));
                    break;
                case "Piano Key 45":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/45.wav"));
                    white = false;
                    break;
                case "Piano Key 46":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/46.wav"));
                    break;
                case "Piano Key 47":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/47.wav"));
                    white = false;
                    break;
                case "Piano Key 48":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/48.wav"));
                    break;
                case "Piano Key 49":
                    sound = SoundCache.getSound(Script.resolvePath("PianoKeys/49.wav"));
                    break;
                default:
                    break;
            } 
        },
        collisionWithEntity: function() {
            _this.homePos = Entities.getEntityProperties(_this.entityID, ["position"]).position;
            _this.injector = Audio.playSound(_this.sound, {position: _this.homePos, volume: AUDIO_VOLUME});
            if (sound.downloaded && !playing) {
                var position = Entities.getEntityProperties(_this.entityID, 'localPosition').localPosition;
                if (white) {
                    position.y = WHITE_KEY_LOCAL_Y_POSITION_DOWN;
                } else {
                    position.y = BLACK_KEY_LOCAL_Y_POSITION_DOWN;
                }
                Entities.editEntity(_this.entityID, {localPosition: position});
                Audio.playSound(sound, {
                    position: _this.homePos,
                    volume: AUDIO_VOLUME_LEVEL
                });
                playing = true;
                Script.setTimeout(function() {
                    if (white) {
                        position.y = WHITE_KEY_LOCAL_Y_POSITION_UP;
                    } else {
                        position.y = BLACK_KEY_LOCAL_Y_POSITION_UP;
                    }
                    Entities.editEntity(_this.entityID, {localPosition: position});
                    playing = false;
                }, 250);
            }
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                this.collisionWithEntity();
            }
        },
        getKeyNumber: function(){
            var keyName = Entities.getEntityProperties(_this.entityID, 'name').name;
            return keyName;
        }
    };

    return new Key();
});
