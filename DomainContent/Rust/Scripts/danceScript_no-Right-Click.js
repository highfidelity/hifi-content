//
// danceCube.js
//
// Paste in a URL to an animation FBX, set the playback FPS, and the number of frames in the animation
// Clicking on the object will override your animation or reset it to the default
//
// Written by Liv Erickson 2/12/2018
// Copyright 2018, High Fidelity Inc. 
//
// Licensed under the Apache 2.0 License
//
/* globals MyAvatar, Entities */
(function () { 
    var danceAnimationURL;
    var danceAnimationFrames;
    var danceAnimationFPS;
    var rustDancing;

    var DanceCube = function(){

    };

    function onClick(){
        rustDancing = Settings.getValue("isRustDancing", false);
        if (!rustDancing & !MyAvatar.isFlying()) {
            MyAvatar.overrideAnimation(danceAnimationURL, danceAnimationFPS, true, 0, danceAnimationFrames);

            Settings.setValue("isRustDancing", true);
        } else {
            MyAvatar.restoreAnimation();
            
            Settings.setValue("isRustDancing", false);
        }
    }

    DanceCube.prototype = {
        preload: function(entityID) {
            var userData = JSON.parse(Entities.getEntityProperties(entityID, 'userData').userData);
            danceAnimationURL = userData.danceAnimationURL;
            danceAnimationFrames = userData.danceAnimationFrames;
            danceAnimationFPS = userData.danceAnimationFPS;
        },
        clickDownOnEntity: function (entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                onClick();
            }
        }
    };

    return new DanceCube();
});
