//
//  HelpMeZoneServer.js
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  Audio clip from FreeSound - Brandon Reese 'Help Me' with modifications
(function() {
    var AUDIO_CLIP_URL_SCARY = Script.resolvePath("./resources/help-me-scary.wav");
    var SPIDER_ENTITY_ID = "{7c26a8fc-2167-4e31-9237-f1bafb3ae04f}";
    var AUDIO_POSITION = {x: 15.22, y:-3.58, z: -76.9};
    var TIMEOUT = 10000;
    var LONGER_TIMEOUT = 20000;
    var audioElement;
    
    var ScaryZone = function() {

    };
    ScaryZone.prototype = {
        remotelyCallable: ['startZoneEffect', 'leaveZoneEffect'],
        preload: function(entityID) {
            audioElement = SoundCache.getSound(AUDIO_CLIP_URL_SCARY);
        }, 
        unload: function() {

        }, 
        startZoneEffect : function() { 
            if (audioElement.downloaded) {
                Audio.playSound(audioElement, {
                    position: AUDIO_POSITION,
                    volume: Math.random(),
                    localOnly: true
                });
                Script.setTimeout(function(){
                    Entities.editEntity(SPIDER_ENTITY_ID, {'visible' : true});
                }, TIMEOUT);
                Script.setTimeout(function() {
                    Entities.editEntity(SPIDER_ENTITY_ID, {'visible' : false});
                }, LONGER_TIMEOUT);
            }
        }, 
        leaveZoneEffect : function() {
        }
    };
    return new ScaryZone();
});