//
//  trivia.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge Users AccountServices */

(function() {

    var NEXT_QUESTION_SFX;
    var TIMER_SOUND;
    var GAME_INTRO;
    var NEW_GAME_SFX;
    var POT_INCREASE_SFX;
    var POT_DECREASE_SFX;
    var WINNER_MUSIC;

    var AUDIO_VOLUME = 0.1;

    var _entityID;
    var entityProperties;
    var injector;
    var gameZone;
    var gameOn;

    this.remotelyCallable = [
        "lightsOn",
        "lightsOff",
        "bubbleOn",
        "bubbleOff",
        "playSound",
        "textUpdate",
        "rezValidator",
        "deleteValidator",
        "isGameOn"
    ];

    this.preload = function(entityID){
        _entityID = entityID;
        entityProperties = Entities.getEntityProperties(_entityID, ['position', 'name', 'type']);
        gameZone = Entities.getEntityProperties(Entities.findEntitiesByName("Trivia Player Game Zone", entityProperties.position, 100)[0], ['position']);

        if (entityProperties.name == 'Trivia Player Game Zone') {
            console.log("LOADING SOUNDS");
            NEXT_QUESTION_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/new-question.wav'));
            TIMER_SOUND = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/intense-countdown-10-sec.wav'));
            GAME_INTRO = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/game-show-intro-music-cheer.wav'));
            NEW_GAME_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/new-game.wav'));
            POT_INCREASE_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/pot-increase-1.wav'));
            POT_DECREASE_SFX = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/everyone-wrong-combo.wav'));
            WINNER_MUSIC = SoundCache.getSound(Script.resolvePath('assets/sounds/finished/winner-ta-dah-horns-oneshot-cheers.wav'));
        }
    };
    this.rezValidator = function(id, params){
        Entities.addEntity({
            type: "Box", 
            name: params[0],
            collisionless: true,
            visible: false,
            position: gameZone.position
        });
    };

    this.deleteValidator = function(id, params){
        Entities.deleteEntity(params[0]);
    };

    this.playSound = function(id, sound) {
        console.log("play sound called", sound[0]);
        switch (sound[0]){
            case 'NEXT_QUESTION_SFX':
                sound = NEXT_QUESTION_SFX;
                break;
            case 'TIMER_SOUND':
                sound = TIMER_SOUND;
                break;
            case 'GAME_INTRO':
                sound = GAME_INTRO;
                break;
            case 'NEW_GAME_SFX':
                sound = NEW_GAME_SFX;
                break;
            case 'POT_INCREASE_SFX':
                sound = POT_INCREASE_SFX;
                break;
            case 'POT_DECREASE_SFX':
                sound = POT_DECREASE_SFX;
                break;
            case 'WINNER_MUSIC':
                sound = WINNER_MUSIC;
                break;
        }
        if (sound.downloaded) {
            console.log("sound downloaded", sound);
            if (injector) {
                console.log("stopping sound");
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: entityProperties.position,
                volume: AUDIO_VOLUME,
                localOnly: false
            });
        } else {
            console.log("no sound downloaded");
        }
    };

    this.bubbleOn = function() {
        gameOn = true;
        Entities.editEntity(_entityID, {
            visible: true,
            collisionless: false,
            collidesWith: "static,dynamic,kinematic,myAvatar,otherAvatar"
        });
    };

    this.getGameState = function(id, uuid) {
        console.log("Game State");
        if (entityProperties.type === "Zone") {
            Entities.callEntityClientMethod(uuid[0], _entityID, "setGameState", [gameOn]);
        }
    };

    this.bubbleOff = function() {
        gameOn = false;
        Entities.editEntity(_entityID, {
            visible: false,
            collidesWith: "static,dynamic,kinematic"
        });
        if (injector) {
            injector.stop();
        }
    };

    this.lightsOn = function(){
        Entities.editEntity(_entityID, {
            visible: true
        });
    };

    this.lightsOff = function(){
        Entities.editEntity(_entityID, {
            visible: false
        });
    };

    this.textUpdate = function(id, params){
        Entities.editEntity(_entityID, {
            text: params[0],
            visible: params[1]
        });
    };  
  
    this.unload = function() {
        if (injector) {
            injector.stop();
        }
    };
    
});