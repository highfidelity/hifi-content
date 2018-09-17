//
//  HelpMeZoneServer.js
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  Audio clip from FreeSound - Brandon Reese 'Help Me'
(function() {

    var AUDIO_CLIP_URL_HELP = Script.resolvePath("./resources/help-me.wav");
    var AUDIO_POSITION = {x: 15.22, y:-3.58, z: -76.9};
    var audioElement;

    var HelpMeZone = function() {

    };

    HelpMeZone.prototype = {
        remotelyCallable: ['startZoneEffect', 'leaveZoneEffect'],
        preload: function(entityID) {
            audioElement = SoundCache.getSound(AUDIO_CLIP_URL_HELP);
        }, 
        unload: function() {

        }, 
        startZoneEffect : function() { 
            if (audioElement.downloaded) {
                Audio.playSound(audioElement, {
                    position: AUDIO_POSITION,
                    volume: Math.random(),
                    pitch: 1
                });
            }
        }, 
        leaveZoneEffect : function() {

        }
    };

    return new HelpMeZone();

});