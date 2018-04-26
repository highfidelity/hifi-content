//
//  materialSwapGun.js
//
//  created by Rebecca Stankus on 03/27/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Pointers, Graphics */

(function() { 
    var _this;

    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var TRIGGER_THRESHOLD = 0.97;
    var AUDIO_VOLUME_LEVEL = 0.1;
    var BARREL_LOCAL_OFFSET = {x:0.015, y:0.065, z:-0.25};
    var BARREL_LOCAL_DIRECTION = {x:0, y:0, z:-1000};
    var SOUND_URL = 
        "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Material%20Gun/sounds/shoot.wav";
    var PARTICLE_EFFECT_CHANGE_INTERVAL_MS = 50;
    var ORIGINAL_POSITION = {x: 8.5, y: -11, z: -11};
    // var GUN_SUBMESH_FOR_NEXT_COLOR = "39";

    var equipped = false;
    var currentHand = null;
    var canShoot = true;
    var sound;
    var injector;
    
    
    function Gun() {
        _this = this;
    }

    Gun.prototype = {
        particleEffect: null,
        particleInterval: null,
        colorSpray: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            
            sound = SoundCache.getSound(SOUND_URL);
            // print("attempting to call server method soon...");
            _this.callToCreateNewMaterial();
            Entities.callEntityServerMethod(_this.entityID, 'resetNextMaterials');
            Entities.getChildrenIDs(_this.entityID).forEach(function(element) {
                var name = Entities.getEntityProperties(element, 'name').name;
                if (name === "Gun Particle Effect") {
                    // print("found particle: ", element);
                    _this.particleEffect = element;
                } /* else if (name === "Gun Next Color Material") {
                    print("found color for spray");
                    _this.colorSpray = Entities.getEntityProperties(element) ';
                }*/
            });
        },
        
        callToCreateNewMaterial: function() {
            // print("calling server to create material");
            var params = [];
            // var priority = _this.getHighestMaterialPriorityGun();
            // var priorityAsString = priority.toString();
            params[0] = JSON.stringify(_this.getBarrelPosition());
            // params[1] = (_this.getHighestMaterialPriorityGun()).toString();
            // params[2] = priorityAsString;
            Entities.callEntityServerMethod(_this.entityID, 'createMaterial', params);
        },
        startEquip: function(id, params) {
            Entities.editEntity(_this.entityID, {
                visible: true,
                lifetime: -1 
            });
            // print("equipped");
            equipped = true;
            currentHand = params[0] === "left" ? 0 : 1;
        },
        startNearGrab: function() {
            Entities.editEntity(_this.entityID, {
                visible: true,
                lifetime: -1 
            });
        },
        releaseNearGrab: function() {
            Entities.editEntity(_this.entityID, {
                lifetime: 10 
            });
        },
        continueEquip: function(id, params) {
            if (!equipped) {
                return;
            }
            _this.toggleWithTriggerPressure();
        },
        releaseEquip: function(id, params) {
            // print("unequipped");
            currentHand = null;
            equipped = false;
            Entities.editEntity(_this.entityID, {
                lifetime: 10 
            });
        },
        fire: function() {
            // print("fire client side");
            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
            _this.playSound();
            var params = [];
            params[0] = JSON.stringify(_this.getBarrelDirection());
            params[1] = JSON.stringify(_this.getBarrelPosition());
            // print("sending barrel direction ",params[0]);
            // print("sending barrel position ",params[1]);
            Entities.callEntityServerMethod(_this.entityID, 'fire', params);
            _this.callToCreateNewMaterial();
            _this.addParticleEffect();
        },
        playSound: function() {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: Entities.getEntityProperties(_this.entityID, 'position').position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },
        addParticleEffect: function() {
            if (_this.particleInterval) {
                Script.clearInterval(_this.particleInterval);
                _this.particleInterval = null;
            } else {
                // print("making particle visible ", _this.particleEffect);
                Entities.editEntity(_this.particleEffect, {
                    visible: true
                });
            }
            var emitRate = 1;
            var diminishing = false;
            _this.particleInterval =Script.setInterval(function(){
                if (diminishing) {
                    emitRate /= 4;
                    Entities.editEntity(_this.particleEffect, {
                        emitRate: emitRate
                    });
                    if (emitRate === 1) {
                        Script.clearInterval(_this.particleInterval);
                        _this.particleInterval = null;
                        Entities.editEntity(_this.particleEffect, {
                            visible: false
                        });
                    }
                } else {
                    emitRate *= 4;
                    Entities.editEntity(_this.particleEffect, {
                        emitRate: emitRate
                    });
                    if (emitRate === 256) {
                        diminishing = true;
                    }
                }
            }, PARTICLE_EFFECT_CHANGE_INTERVAL_MS);
        },
        /* getTopMaterialPriority: function(multiMaterial) {
            // For non-models: multiMaterial[0] will be the top material
            // For models, multiMaterial[0] is the base material, and multiMaterial[1] is the highest priority applied material
            if (multiMaterial.length > 1) {
                if (multiMaterial[1].priority > multiMaterial[0].priority) {
                    // print("client method is returning priority ", multiMaterial[1].priority);
                    return multiMaterial[1].priority;
                }
            }
        
            // print("client method is returning priority ", multiMaterial[0].priority);
            return multiMaterial[0].priority;
        },
        getHighestMaterialPriorityGun: function() {
            // print("checking akashic records for priority");
            var topPriority;
            try {
                var gunMesh = Graphics.getModel(_this.entityID);
                var gunMaterialList = gunMesh.materialLayers;
                topPriority = _this.getTopMaterialPriority(gunMaterialList[GUN_SUBMESH_FOR_NEXT_COLOR]);
            } catch (err) {
                print("Could not get model of gun");
                topPriority = 15;
            }
            // print("top priority is ", topPriority);
            return topPriority;
        },*/
        getBarrelPosition: function() {
            // print("getting barrel pos");
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'rotation']);
            // print("position is " + JSON.stringify(properties.position));
            // print("rotation is " + JSON.stringify(properties.rotation));
            var barrelLocalPosition = Vec3.multiplyQbyV(properties.rotation, BARREL_LOCAL_OFFSET);
            // print("barrel local pos is " + JSON.stringify(barrelLocalPosition));
            var barrelWorldPosition = Vec3.sum(properties.position, barrelLocalPosition);
            // print("barrel world pos is " + JSON.stringify(barrelWorldPosition));
            return barrelWorldPosition;
        },
        getBarrelDirection: function() {
            // print("getting barrel dir");
            var rotation = Entities.getEntityProperties(_this.entityID, ['rotation']).rotation;
            var barrelAdjustedDirection = Vec3.multiplyQbyV(rotation, BARREL_LOCAL_DIRECTION);
            return barrelAdjustedDirection;
        },
        toggleWithTriggerPressure: function() {
            var triggerValue = Controller.getValue(TRIGGER_CONTROLS[currentHand]);
            if (triggerValue >= TRIGGER_THRESHOLD) {
                if (canShoot === true) {
                    // print("trigger pulled...firing");
                    _this.fire();
                    canShoot = false;
                }
            } else {
                canShoot = true;
            }
        },
        unload: function() {
        }
    };

    return new Gun();
});
