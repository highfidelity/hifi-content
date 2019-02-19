//
// crunch.js
// Play a crunch sound and delete an entity when it is brought close to the head ("Eaten")
//
// Modified by: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function () {
    var TELEPORT_SOUND_VOLUME = 0.40;
    var teleportSound;
    var portalDestination;
    var position;
    var image;

    var CHECK_RADIUS = 0.25; // meters
    var LIFETIME = 10; // seconds
    var GRAVITY = {x: 0, y: -9.8, z: 0};
    var DEBUG = false;

    var _entityID;
    var _this;

    var portalProps = Script.require("./portalEntityProps.js");
    var portalSphereOutlineProps = portalProps.portalSphereOutline;
    var particleEffectProps = portalProps.particleEffect;
    var portalSphereOutlineMaterialProps = portalProps.portalSphereOutlineMaterial;
    var portalSphereMaterialProps = portalProps.portalSphereMaterial;
    var portalSphereProps = portalProps.portalSphere;

    var portalSphereOutline;
    var particleEffect;
    var portalSphereOutlineMaterial;
    var portalSphereMaterial;
    var portalSphere;

    var portalSphereUserData;

    try {
        var portalSphereMaterialData = JSON.parse(portalSphereMaterialProps.materialData);
    } catch (e) {
        console.log("portal sphere material json parse error: ", e);
    }

    // var childProps = [portalSphereOutline, particleEffect, portalSphereOutlineMaterial, portalSphereMaterial];

    function PortalSphere() {
        return;
    }

    PortalSphere.prototype = {
        isInactive: true,

        preload: function (entityID) {
            _this = this;
            if (DEBUG) {
                print("loading new portal");
            }
            try {
                teleportSound = SoundCache.getSound("http://s3.amazonaws.com/hifi-public/birarda/teleport.raw");
                _this.getProps(entityID);
                portalSphereProps.position = position;
                image = portalSphereUserData.imageURL;

            } catch (err) {
                print("Could not retrieve sound URLs");
            }
            Script.update.connect(_this.checkIfNearHead);
            _entityID = entityID;
            
            portalSphereProps.parentID = _entityID;
            portalSphere = Entities.addEntity(portalSphereProps, true);

            Script.setTimeout(function(){
                particleEffectProps.parentID = portalSphere;
                particleEffect = Entities.addEntity(particleEffectProps, true);
            }, 250)

            Script.setTimeout(function () {
                particleEffectProps.parentID = portalSphere;
                particleEffect = Entities.addEntity(particleEffectProps, true);
            }, 500)

            Script.setTimeout(function () {
                portalSphereMaterialProps.parentID = portalSphere;
                portalSphereMaterialData.materials.albedoMap = image;
                portalSphereMaterialData.materials.emissiveMap = image;
                portalSphereMaterialProps.materialData = JSON.stringify(portalSphereMaterialData);
                portalSphereMaterial = Entities.addEntity(portalSphereMaterialProps, true);
            }, 750)

            Script.setTimeout(function () {
                portalSphereOutline.parentID = portalSphere;
                portalSphereOutline = Entities.addEntity(portalSphereOutlineProps, true);
            }, 1000)

            Script.setTimeout(function () {
                portalSphereOutlineMaterialProps.parentID = portalSphereMaterial;
                portalSphereOutlineMaterial = Entities.addEntity(portalSphereOutlineMaterialProps, true);
            }, 1250)
            

        },

        playSound: function(entityID) {
            if (teleportSound.downloaded) {
                if (!position) {
                    _this.getProps(entityID);
                }
                Audio.playSound(teleportSound, { position: position, volume: TELEPORT_SOUND_VOLUME, localOnly: true });
            }
        },
    
        getProps: function(entityID) {
            var properties = Entities.getEntityProperties(entityID);
            if (properties) {
                position = properties.position;
                portalSphereUserData = properties.userData;
                try {
                    portalDestination = JSON.parse(portalSphereUserData).location;

                } catch (e) {
                    console.log("Error reading userdata: ", e);
                }
            }
        }, 

        startNearGrab: function(entityID) {
            if (DEBUG) {
                print("starting portal grab");
            }
            var editProps = {
                lifetime: 30,
                dynamic: true,
                collisionless: true,
                gravity: GRAVITY
            };
            Entities.editEntity(entityID, editProps);
        },
      
        checkIfNearHead: function() {
            if (_this.isInactive && HMD.active) {
                var position = Entities.getEntityProperties(_entityID, "position").position;
                var portalDistance = CHECK_RADIUS * MyAvatar.scale;
                if (Vec3.distance(position, MyAvatar.getJointPosition("Head")) < portalDistance || 
                    Vec3.distance(position, MyAvatar.getJointPosition("Neck")) < portalDistance) {
                    if (DEBUG) {
                        print("swallowing portal");
                    }
                    _this.isInactive = false;
                    _this.teleport();
                }
            }
        },

        teleport: function() {
            Entities.deleteEntity(portalSphere);
            Entities.deleteEntity(_entityID);
            _this.getProps(_entityID);
    
            if (portalDestination.length > 0) {
                _this.playSound(_entityID);
                Window.location = "hifi://" + portalDestination;
            }
        },

        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.isLeftButton) {
                if (!HMD.active && _this.isInactive) {
                    if (DEBUG) {
                        print("portal has been clicked");
                    }
                    _this.isInactive = false;
                    _this.teleport();
                }
            }
        },


        unload: function(entityID) {
            if (DEBUG) {
                print("unloading portal");
            }
            Script.update.disconnect(_this.checkIfNearHead);
        }
    };

    var self = new PortalSphere();
    return self;

});