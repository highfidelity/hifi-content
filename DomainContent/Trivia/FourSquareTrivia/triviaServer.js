//
//  triviaServer.js
//
//  Created by Mark Brosche on 11/11/18
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

    this.remotelyCallable = [
        "lightsOn",
        "lightsOff",
        "bubbleOn",
        "bubbleOff",
        "playSound",
        "textUpdate",
        "rezValidator",
        "deleteValidator",
        "checkAnswer"
    ];

    this.preload = function(entityID){
        _entityID = entityID;
        entityProperties = Entities.getEntityProperties(_entityID, ['position', 'name', 'type']);
        gameZone = Entities.getEntityProperties(
            Entities.findEntitiesByName("Trivia Player Game Zone", entityProperties.position, 100)[0], ['position']);

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
        console.log("VALIDATOR PARAMS,", params);
        var exists = Entities.findEntitiesByName(params[0], entityProperties.position, 100);
        console.log("DOES ONE EXIST?,", JSON.stringify(exists));
        if (exists.length === 0) {
            Entities.addEntity({
                type: "Box", 
                name: params[0],
                collisionless: true,
                visible: false,
                position: gameZone.position
            });
            console.log("CREATED VALIDATOR");
        }
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
        Entities.editEntity(_entityID, {
            visible: true,
            collisionless: false,
            collidesWith: "static,dynamic,kinematic,myAvatar,otherAvatar"
        });
    };

    this.bubbleOff = function() {
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

    this.checkAnswer = function(id, params){
        var scriptURL = null;
        switch (params[0]) {
            case 'Blue':
                scriptURL = Script.resolvePath('triviaColorCheckBlue.js');
                break;
            case 'Green':
                scriptURL = Script.resolvePath('triviaColorCheckGreen.js');
                break;
            case 'Yellow':
                scriptURL = Script.resolvePath('triviaColorCheckYellow.js');
                break;
            case 'Red':
                scriptURL = Script.resolvePath('triviaColorCheckRed.js');
                break;
        }
        var checkObject = Entities.findEntitiesByName("Trivia Bubble", entityProperties.position, 100)[0];
        Entities.editEntity(checkObject, {
            script: scriptURL
        });
    };
  
    this.unload = function() {
        if (injector) {
            injector.stop();
        }
    };
    
});