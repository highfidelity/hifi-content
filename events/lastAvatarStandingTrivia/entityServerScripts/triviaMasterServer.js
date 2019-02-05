//  triviaMasterServer.js
//
//  Created by Mark Brosche on 11/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global EventBridge Users AccountServices */

(function() {

    var NEXT_QUESTION_SFX,
        TIMER_SOUND,
        GAME_INTRO,
        NEW_GAME_SFX,
        POT_INCREASE_SFX,
        POT_DECREASE_SFX,
        WINNER_MUSIC,
        RANGE = 100000;

    var AUDIO_VOLUME = 0.1;

    var _entityID,
        entityProperties,
        injector,
        gameZone,
        confetti,
        coin,
        boardCorners;

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
        "stopSound",
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
            Entities.findEntitiesByName("Trivia Player Game Zone", entityProperties.position, RANGE)[0], ['position']);
        coin = Entities.getEntityProperties(
            Entities.findEntitiesByName("Trivia Coin Model", gameZone.position, RANGE)[0], ['position']);
        boardCorners = [
            Vec3.sum(gameZone.position, {x:  4.5, y: -2, z:  4.5}),
            Vec3.sum(gameZone.position, {x: -4.5, y: -2, z: -4.5}),
            Vec3.sum(gameZone.position, {x:  4.5, y: -2, z: -4.5}),
            Vec3.sum(gameZone.position, {x: -4.5, y: -2, z:  4.5})
        ];   

        if (entityProperties.name === 'Trivia Player Game Zone') {
            NEXT_QUESTION_SFX = SoundCache.getSound(Script.resolvePath('../entities/sounds/new-question.wav'));
            TIMER_SOUND = SoundCache.getSound(Script.resolvePath('../entities/sounds/intense-countdown-10-sec.wav'));
            GAME_INTRO = SoundCache.getSound(Script.resolvePath('../entities/sounds/game-show-intro-music-cheer.wav'));
            NEW_GAME_SFX = SoundCache.getSound(Script.resolvePath('../entities/sounds/new-game.wav'));
            POT_INCREASE_SFX = SoundCache.getSound(Script.resolvePath('../entities/sounds/pot-increase-1.wav'));
            POT_DECREASE_SFX = SoundCache.getSound(Script.resolvePath('../entities/sounds/everyone-wrong-combo.wav'));
            WINNER_MUSIC = SoundCache.getSound(Script.resolvePath('../entities/sounds/winner-ta-dah-horns-oneshot-cheers.wav'));
        }
    };

    this.rezValidator = function(id, params){
        var exists = Entities.findEntitiesByName(params[0], entityProperties.position, RANGE);
        if (exists.length === 0) {
            Entities.addEntity({
                type: "Box", 
                name: params[0],
                collisionless: true,
                visible: false,
                position: gameZone.position
            });
        }
    };

    this.startConfetti = function(){
        confetti = [];
        confetti.push(Entities.addEntity({
            type: "ParticleEffect",
            name: "Trivia Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  boardCorners[0],
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 5,
            maxParticles: 3200,
            textures: Script.resolvePath("../entities/pictures/sprite-confetti.jpg"),
            emitRate: 150,
            emitSpeed:5.27,
            speedSpread: 0,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
                x:0,
                y:-2.5,
                z:0
            },
            accelerationSpread:{
                x:1,
                y:0,
                z:1
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
            name: "Trivia Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  boardCorners[1],
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 5,
            maxParticles: 3200,
            textures: Script.resolvePath("../entities/pictures/sprite-confetti.jpg"),
            emitRate: 150,
            emitSpeed:5.27,
            speedSpread: 0,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
                x:0,
                y:-2.5,
                z:0
            },
            accelerationSpread:{
                x:1,
                y:0,
                z:1
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
            name: "Trivia Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  boardCorners[2],
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 5,
            maxParticles: 3200,
            textures: Script.resolvePath("../entities/pictures/sprite-confetti.jpg"),
            emitRate: 150,
            emitSpeed:5.27,
            speedSpread: 0,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
                x:0,
                y:-2.5,
                z:0
            },
            accelerationSpread:{
                x:1,
                y:0,
                z:1
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
            name: "Trivia Confetti Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position:  boardCorners[3],
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 5,
            maxParticles: 3200,
            textures: Script.resolvePath("../entities/pictures/sprite-confetti.jpg"),
            emitRate: 150,
            emitSpeed:5.27,
            speedSpread: 0,
            emitDimensions: {
                x: 1,
                y: 1,
                z: 1
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
                x:0,
                y:-2.5,
                z:0
            },
            accelerationSpread:{
                x:1,
                y:0,
                z:1
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
        var findConfetti = Entities.findEntitiesByName("Trivia Confetti Particle", entityProperties.position, RANGE);
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
            position:   Vec3.sum(coin.position, {x: -1, y: 3, z: -2}),
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 2,
            maxParticles: 1,
            textures: Script.resolvePath("../entities/pictures/raise-prize.png"),
            emitRate: 1,
            emitSpeed: 3,
            speedSpread: 0,
            emitDimensions: {
                x: 0,
                y: 0,
                z: 0
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
            position: Vec3.sum(coin.position, {x: -1, y: 3, z: -2}),
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 4,
            maxParticles: 1,
            textures: Script.resolvePath("../entities/pictures/lose-half.png"),
            emitRate: 1,
            emitSpeed: 3,
            speedSpread: 0,
            emitDimensions: {
                x: 0,
                y: 0,
                z: 0
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
            position:  coin.position,
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 2,
            maxParticles: 200,
            textures: Script.resolvePath("../entities/pictures/coin.png"),
            emitRate: 5,
            emitSpeed: 0,
            speedSpread: 5,
            emitDimensions: {
                x: 0,
                y: 0,
                z: 0
            },
            emitOrientation: {
                x: 0,
                y: 0,
                z: 0,
                w: 1
            },
            emitterShouldTrail: true,
            particleRadius: 1,
            radiusSpread: 0,
            radiusStart: 1.25,
            radiusFinish: 0,
            color:{
                red:255,
                blue:0,
                green:0
            },
            colorSpread:{
                red: 0,
                blue: 255,
                green: 0
            },
            colorStart:{
                red:255,
                blue:0,
                green:0
            },
            colorFinish:{
                red: 0,
                blue: 0,
                green: 0
            },
            emitAcceleration:{
                x:0,
                y:-2,
                z:0
            },
            accelerationSpread:{
                x:2,
                y:0,
                z:2
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 0,
            particleSpin: 5,
            spinSpread: 0,
            spinStart: 0,
            spinFinish: 0,
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
            position:  Vec3.sum(coin.position, { x: 0, y: 3, z: 0 }),
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 0.5,
            maxParticles: 5,
            textures: Script.resolvePath("../entities/pictures/coin.png"),
            emitRate: 5,
            emitSpeed: 20,
            speedSpread: 0,
            emitDimensions: {
                x: 0,
                y: 1,
                z: 0
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
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
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            rotateWithEntity: true
        });
    };

    this.deleteValidator = function(id, params){
        Entities.deleteEntity(params[0]);
    };

    this.stopSound = function(id) {
        console.log("stopping sound");
        if (injector) {
            injector.stop();
        }
    };

    this.playSound = function(id, sound) {
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
            if (injector) {
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
                scriptURL = Script.resolvePath('../entityScripts/triviaColorCheckBlue.js');
                break;
            case 'Green':
                scriptURL = Script.resolvePath('../entityScripts/triviaColorCheckGreen.js');
                break;
            case 'Yellow':
                scriptURL = Script.resolvePath('../entityScripts/triviaColorCheckYellow.js');
                break;
            case 'Red':
                scriptURL = Script.resolvePath('../entityScripts/triviaColorCheckRed.js');
                break;
        }
        var checkObject = Entities.findEntitiesByName("Trivia Bubble", entityProperties.position, RANGE)[0];
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