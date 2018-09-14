//
//  GifZone.js
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  Audio from Freesound.org licensed under CC Attribution by ZyryTSounds
//  Gif courtesty of giphy

(function(){

    var AUDIO_URL = Script.resolvePath("219110__zyrytsounds__evil-laugh.wav");
    var GIF_URL = "https://media.giphy.com/media/3s4vKvmoHwK5bpHyZa/giphy.gif";
    var ALPHA_INTERVAL = 0.05;
    var HMD_POSITION = {x: 1750, y : 0};
    var DESKTOP_POSITION = {x: Window.innerWidth / 2 - 400 , y: Window.innerHeight / 2 - 300};
    var IMAGE_SCALE = {width: 800, height: 600 };
    var ALPHA_INITIAL = 0.1;
    var overlay;

    var GifZone = function(){

    };

    function animateInGif() {
        var alpha = 0;
        var interval = Script.setInterval(function() {
            Overlays.editOverlay(overlay, {alpha: alpha += ALPHA_INTERVAL});
        }, 50);
        Script.setTimeout(function(){
            Overlays.deleteOverlay(overlay);
            Script.clearInterval(interval);
        }, 2500);
    }

    GifZone.prototype = {
        enterEntity : function() {
            var position = HMD.active ? HMD_POSITION : DESKTOP_POSITION;
            overlay = Overlays.addOverlay('image', {"imageURL" : GIF_URL,
                x: position.x, y: position.y, width: IMAGE_SCALE.width, height: IMAGE_SCALE.height, alpha: ALPHA_INITIAL});
            var sound = SoundCache.getSound(AUDIO_URL);
            Audio.playSound(sound, {localOnly : true});
            animateInGif();
        },
        leaveEntity: function() {
            Overlays.deleteOverlay(overlay);
        }
    };
    return new GifZone;
});