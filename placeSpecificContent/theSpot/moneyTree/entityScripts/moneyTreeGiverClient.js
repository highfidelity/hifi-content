// moneyTreeClient.js

//  Created by Mark Brosche on 10-18-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* global EventBridge Users AccountServices Agent Avatar */

(function (){
// get userData
// spawn Overlays for clients with ID == giverID
// delete after overlay after click event or after timer expires.
// send data to google sheet
    var SECRETS = Script.require(Script.resolvePath('../moneyTreeURLs.json'));
    var COINS_AVAILABLE = SoundCache.getSound(Script.resolvePath('../resources/sounds/chimes-loop.wav')),
        COIN_CLICKED = SoundCache.getSound(Script.resolvePath('../resources/sounds/coin-click.wav')),
        PAYOUT = SoundCache.getSound(Script.resolvePath('../resources/sounds/payout.wav'));
    var AUDIO_VOLUME = 0.05,
        MONEY_TREE_CHANNEL = SECRETS.GIVER_CHANNEL,
        COIN_PARTICLE_TIMEOUT_MS = 4000,
        PAYOUT_AUDIO_DELAY_MS = 700,
        ONE_MINUTE = 60000,
        FRAME_UPDATE = 30;

    var _this,
        spinInterval,
        injector,
        spawnerProperties,
        userData,
        giverID,
        coinOverlay,
        modelURL = Script.resolvePath("../resources/models/coinFlat8.fbx"),
        coinParticleEffects,
        messageOverlay,
        clickCount = 0;

    var MoneyTree = function(){
        _this = this;
    };

    MoneyTree.prototype = {

        preload: function(entityID){
            _this.entityID = entityID;
            _this.getEntityData();
            Messages.messageReceived.connect(_this.moneyListener);
            Overlays.mousePressOnOverlay.connect(_this.mousePressOnOverlay);
            _this.spawnCoinOverlay();
            clickCount = 0;
        },
        
        moneyListener: function (channel, message, sender) {
            if (channel === MONEY_TREE_CHANNEL) {
                message = JSON.parse(message);
                if (message.type === 'delete') {
                    clickCount++;
                    _this.deleteOverlay();
                }
            }
        },

        playSound: function(sound, position, localOnly) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: AUDIO_VOLUME,
                    localOnly: localOnly
                });
            }
        },

        getEntityData: function() {     
            spawnerProperties = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "userData", "parentID"]);
            if (!spawnerProperties.userData || spawnerProperties.userData === "{}") {
                print("spawner ", _this.entityID, " is missing user data.");
                return;
            }
            try {
                userData = JSON.parse(spawnerProperties.userData);
                giverID = userData.giverID;
                // verify that settings are legit
            } catch (e) {
                print("Error in retrieving entity Data");
                return;
            }
        },

        deleteOverlay: function() {
            if (spinInterval){
                Script.clearInterval(spinInterval);
                spinInterval = false;
            }
            if (coinParticleEffects){
                Entities.editEntity(coinParticleEffects, { parentID: null });
                Entities.deleteEntity(coinParticleEffects);
                coinParticleEffects = null;
            }
            if (coinOverlay) {
                Overlays.deleteOverlay(coinOverlay);
                coinOverlay = null;
            }
            if (messageOverlay) {
                Overlays.deleteOverlay(messageOverlay);
                messageOverlay = null;
            }
            if (injector) {
                injector.stop();
            }
        },

        spawnCoinOverlay: function() {
            if (MyAvatar.sessionUUID === giverID){ // 
                var text = "The Money Tree has chosen you\nto be its secret giver!\nClick a coin over someone's head\nto give them a gift from High Fidelity!";
                messageOverlay = Overlays.addOverlay("text3d", {
                    name: "MESSAGE OVERLAY",
                    text: text,
                    color: {red: 255, green: 255, blue: 255},
                    backgroundAlpha: 0,
                    dimensions: { x: 0.5, y: 0.05, z: 0.5 },
                    position: Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: -2.5, y: 0, z: -2 })),
                    rotation: Camera.orientation,
                    isSolid: true,
                    drawInFront: true,
                    parentID: MyAvatar.sessionUUID,
                    lineHeight: 0.3
                });                       
                var position = Vec3.sum(
                    spawnerProperties.position, Vec3.multiplyQbyV(MyAvatar.orientation, {x: 0, y: 0.5, z: 0}));
                _this.playSound(COINS_AVAILABLE, MyAvatar.position, false);
                coinOverlay = Overlays.addOverlay("model", {
                    name: "COIN OVERLAY",
                    url: modelURL,
                    dimensions: { x: 0.5, y: 0.05, z: 0.5 },
                    position: position,
                    rotation:  Quat.fromPitchYawRollDegrees(-90,0,90),
                    isSolid: true,
                    parentID: spawnerProperties.parentID
                });  
                spinInterval = Script.setInterval(function(){
                    var newRotation = Quat.fromPitchYawRollRadians(Math.PI/16, 0, 0 );
                    var lastRotation = Overlays.getProperties(coinOverlay, ['rotation']);
                    Overlays.editOverlay(coinOverlay, {
                        rotation: Quat.multiply(lastRotation.rotation, newRotation)
                    });               
                }, FRAME_UPDATE);
                Script.setTimeout(function(){
                    if (spinInterval){
                        Script.clearInterval(spinInterval);
                        spinInterval = false;
                    }
                    _this.deleteOverlay();
                }, ONE_MINUTE);
            }
        },

        mousePressOnOverlay: function(id, event) {
            if (id === coinOverlay && clickCount === 0) {
                clickCount++;
                _this.playSound(COIN_CLICKED, spawnerProperties.position, false);
                Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                    type: "moneyGiven",
                    recipientID: spawnerProperties.parentID
                }));
                Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                    type: "delete"
                }));
                Script.setTimeout(function(){
                    Entities.editEntity(coinParticleEffects, { isEmitting: true });
                    _this.playSound(PAYOUT, spawnerProperties.position, false);
                }, PAYOUT_AUDIO_DELAY_MS);
                Script.setTimeout(function(){
                    if (spinInterval){
                        Script.clearInterval(spinInterval);
                        spinInterval = false;
                    }
                    _this.deleteOverlay();
                }, COIN_PARTICLE_TIMEOUT_MS);
            } else if (id === coinOverlay && clickCount > 0) {
                Messages.sendMessage(MONEY_TREE_CHANNEL, JSON.stringify({
                    type: "delete"
                }));
            }
        },

        unload: function(){
            if (injector) {
                injector.stop();
            }
            if (spinInterval) {
                Script.clearInterval(spinInterval);
            }
            _this.deleteOverlay();
            Messages.messageReceived.disconnect(_this.moneyListener);
            Messages.unsubscribe(MONEY_TREE_CHANNEL);
        }
    };

    Messages.subscribe(MONEY_TREE_CHANNEL);
    return new MoneyTree;
});