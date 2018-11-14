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
    var confetti;

    this.remotelyCallable = [
        "lightsOn",
        "lightsOff",
        "bubbleOn",
        "bubbleOff",
        "playSound",
        "textUpdate",
        "rezValidator",
        "deleteValidator",
        "checkAnswer",
        "loseCoins",
        "winCoins",
        "halfHFC",
        "plusHFC",
        "startConfetti",
        "stopConfetti"
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
        console.log("DOES ONE EXIST?,", exists);
        if (exists.length === 0) {
            Entities.addEntity({
                type: "Box", 
                name: params[0],
                collisionless: true,
                visible: false,
                position: gameZone.position
            });
            var exists2 = Entities.findEntitiesByName(params[0], entityProperties.position, 100);
            console.log("CREATED VALIDATOR", exists2);
        }
    };

    this.startConfetti = function(){
        confetti = [];
        confetti.push(Entities.addEntity({
            type: "ParticleEffect",
            name: "Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -77.8265, y: -20.6236, z: 10.3893 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 3.29,
            maxParticles: 3200,
            textures: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/sprite-confetti.jpg",
            emitRate: 164,
            emitSpeed: 3.48,
            speedSpread: 2.69,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: 90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: false,
            particleRadius: 0.25,
            radiusSpread: 0,
            radiusStart: 0.1,
            radiusFinish: 0.24,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 255,
                blue: 255,
                green: 255
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 0,
                blue: 0,
                green: 0
            },
            emitAcceleration:{
                x:2,
                y:-3.5,
                z:2
            },
            accelerationSpread:{
                x:0,
                y:1,
                z:2
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            particleSpin: 0,
            spinSpread: 0,
            spinStart: 360,
            spinFinish: 360,
            rotateWithEntity: false
        }));
        confetti.push(Entities.addEntity({
            type: "ParticleEffect",
            name: "Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -86.0814, y: -20.6284, z: 10.5321 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 3.29,
            maxParticles: 3200,
            textures: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/sprite-confetti.jpg",
            emitRate: 164,
            emitSpeed: 3.48,
            speedSpread: 2.69,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: 90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: false,
            particleRadius: 0.25,
            radiusSpread: 0,
            radiusStart: 0.1,
            radiusFinish: 0.24,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 255,
                blue: 255,
                green: 255
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 0,
                blue: 0,
                green: 0
            },
            emitAcceleration:{
                x:-2,
                y:-3.5,
                z:2
            },
            accelerationSpread:{
                x:0,
                y:1,
                z:2
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            particleSpin: 0,
            spinSpread: 0,
            spinStart: 360,
            spinFinish: 360,
            rotateWithEntity: false
        }));
        confetti.push(Entities.addEntity({
            type: "ParticleEffect",
            name: "Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -77.8265, y: -20.6255, z: 1.4926 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 3.29,
            maxParticles: 3200,
            textures: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/sprite-confetti.jpg",
            emitRate: 164,
            emitSpeed: 3.48,
            speedSpread: 2.69,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: 90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: false,
            particleRadius: 0.25,
            radiusSpread: 0,
            radiusStart: 0.1,
            radiusFinish: 0.24,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 255,
                blue: 255,
                green: 255
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 0,
                blue: 0,
                green: 0
            },
            emitAcceleration:{
                x:2,
                y:-3.5,
                z:-2
            },
            accelerationSpread:{
                x:0,
                y:1,
                z:2
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            particleSpin: 0,
            spinSpread: 0,
            spinStart: 360,
            spinFinish: 360,
            rotateWithEntity: false
        }));
        confetti.push(Entities.addEntity({
            type: "ParticleEffect",
            name: "Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -86.73, y: -20.6305, z: 1.644 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 3.29,
            maxParticles: 3200,
            textures: "https://hifi-content.s3.amazonaws.com/alan/dev/Particles/sprite-confetti.jpg",
            emitRate: 164,
            emitSpeed: 3.48,
            speedSpread: 2.69,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: 90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: false,
            particleRadius: 0.25,
            radiusSpread: 0,
            radiusStart: 0.1,
            radiusFinish: 0.24,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 255,
                blue: 255,
                green: 255
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 0,
                blue: 0,
                green: 0
            },
            emitAcceleration:{
                x:-2,
                y:-3.5,
                z:-2
            },
            accelerationSpread:{
                x:0,
                y:1,
                z:2
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            particleSpin: 0,
            spinSpread: 0,
            spinStart: 360,
            spinFinish: 360,
            rotateWithEntity: false
        }));
    };

    this.stopConfetti = function(){
        var findConfetti = Entities.findEntitiesByName("Confetti Particle", entityProperties.position, 100);
        findConfetti.forEach(function(particle){
            Entities.deleteEntity(particle);
        });
    };

    this.plusHFC = function(){        
        Entities.addEntity({
            type: "ParticleEffect",
            name: "Trivia Pot Increase Particle",            
            lifetime: 4,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -87.2123, y: -16.8897, z: -0.2675 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 2,
            maxParticles: 1,
            textures: "https://hifi-content.s3.amazonaws.com/brosche/Trivia/Four%20Square/assets/pictures/raise-prize.png",
            emitRate: 1,
            emitSpeed: 3,
            speedSpread: 0,
            emitDimensions: {
                x: 0,
                y: 0,
                z: 0
            },
            emitOrientation: {
                x: -90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 2,
            radiusSpread: 0,
            radiusStart: 2,
            radiusFinish: 2,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 0,
                blue: 0,
                green: 0
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 255,
                blue: 255,
                green: 255
            },
            emitAcceleration:{
                x:0,
                y:2,
                z:0
            },
            accelerationSpread:{
                x:0,
                y:0,
                z:0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0.5,
            particleSpin: 0,
            spinSpread: 0,
            spinStart: 0,
            spinFinish: 0,
            rotateWithEntity: false
        });
    };

    this.halfHFC = function(){        
        Entities.addEntity({
            type: "ParticleEffect",
            name: "Trivia Pot Decrease Particle",            
            lifetime: 4,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -87.1885, y: -13.2606, z: -0.2737 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 3,
            maxParticles: 1,
            textures: "https://hifi-content.s3.amazonaws.com/brosche/Trivia/Four%20Square/assets/pictures/lose-half.png",
            emitRate: 1,
            emitSpeed: 3,
            speedSpread: 0,
            emitDimensions: {
                x: 0,
                y: -1,
                z: 0
            },
            emitOrientation: {
                x: 90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 2,
            radiusSpread: 0,
            radiusStart: 2,
            radiusFinish: 2,
            color:{
                red:255,
                blue:0,
                green:0
            },
            colorSpread:{
                red: 0,
                blue: 0,
                green: 0
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 255,
                blue: 255,
                green: 255
            },
            emitAcceleration:{
                x:0,
                y:-10,
                z:0
            },
            accelerationSpread:{
                x:0,
                y:0,
                z:0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0.75,
            rotateWithEntity: false
        });
    };

    this.loseCoins = function(){        
        Entities.addEntity({
            type: "ParticleEffect",
            name: "Trivia Particle Coin Lose",            
            lifetime: 4,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -89.8551, y: -17.9604, z: 0.4738 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 1.11,
            maxParticles: 100,
            textures: "https://hifi-content.s3.amazonaws.com/brosche/Trivia/Four%20Square/assets/pictures/tempsnip.png",
            emitRate: 25,
            emitSpeed: 2,
            speedSpread: 0,
            emitDimensions: {
                x: 1,
                y: 0,
                z: 1
            },
            emitOrientation: {
                x: 0,
                y: 0,
                z: 0
            },
            emitterShouldTrail: false,
            particleRadius: 0.2,
            radiusSpread: 0,
            radiusStart: 0.25,
            radiusFinish: 0.1,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 0,
                blue: 0,
                green: 0
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 107,
                blue: 107,
                green: 107
            },
            emitAcceleration:{
                x:0,
                y:-8,
                z:0
            },
            accelerationSpread:{
                x:3,
                y:2,
                z:3
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0,
            particleSpin: 184,
            spinSpread: 0,
            spinStart: -184,
            spinFinish: 220,
            rotateWithEntity: true
        });
    };

    this.winCoins = function(){        
        Entities.addEntity({
            type: "ParticleEffect",
            name: "Trivia Particle Coin Increase",            
            lifetime: 4,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  { x: -89.6846, y: -15.0534, z: 0.5463 },
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 0.5,
            maxParticles: 5,
            textures: "https://hifi-content.s3.amazonaws.com/brosche/Trivia/Four%20Square/assets/pictures/tempsnip.png",
            emitRate: 5,
            emitSpeed: 20,
            speedSpread: 0,
            emitDimensions: {
                x: 0,
                y: 1,
                z: 0
            },
            emitOrientation: {
                x: -90,
                y: 0,
                z: 0
            },
            emitterShouldTrail: false,
            particleRadius: 1,
            radiusSpread: 0,
            radiusStart: 0,
            radiusFinish: 0.75,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red: 0,
                blue: 0,
                green: 0
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red: 255,
                blue: 255,
                green: 255
            },
            emitAcceleration:{
                x:0,
                y:-100,
                z:0
            },
            accelerationSpread:{
                x:0,
                y:0,
                z:0
            },
            alpha: 0,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            rotateWithEntity: true
        });
    };

    this.deleteValidator = function(id, params){
        console.log("DELETING VALIDATOR", params[0]);
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