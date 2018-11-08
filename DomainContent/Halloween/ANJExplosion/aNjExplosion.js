//
// aNjExplosion.js
// 
// Created by Rebecca Stankus on 03/13/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    var MANNEQUIN_ORIGINAL = "{8b0321d5-4d01-445c-9009-8c5a0d6cd6bb}";
    var LIGHTS_THAT_EXTINGUISH = ["{58bbee39-054d-485e-8954-9708d0f33745}", "{288dfe86-9370-4147-9f1b-6fb146f852a1}", 
        "{e4c4dc94-74f6-4f2c-aadc-615e0307ee8f}", "{233044ea-bf3b-4998-b7f9-96a985e2a8a0}",
        "{0a081472-24a8-4ce9-a35e-d57f2ae74d8e}", "{5974b777-f4da-4f89-bb11-0462589ada21},",
        "{df292af4-328a-458e-a243-e9d346acf5c2}", "{8b789e54-5195-4b68-a64a-c41656afdba3}"];
    var LIGHTS_THAT_FLICKER = ["{49e0bb3b-0875-4f23-bac2-00254033ce04}", "{f3a74871-6f21-4f8b-ba12-f60b79d15660}",
        "{a8e4642e-fc95-48b6-818b-8493673b3d26}", "{b1b5af32-6c5e-4b8d-9047-256b79cb0d0c}"];
    var GLASS_PANES = ["{fedd0a44-afcf-4871-ba48-565caf507b7b}", "{eb6e1e0d-2e74-417b-af8a-634654d63e93}",
        "{8f2d5f6c-ee02-4af5-8f68-3a99a60abfa3}"];
    var EXPLOSION_FIRE = "{3808c266-c714-4a79-939a-060992e66e33}";
    var EXPLOSION_SMOKE = "{c9ab074e-b64f-491e-a1cf-7187a79abcef}";
    var RESET_TIMEOUT_MS = 60000;
    var FIRE_CHANGE_INTERVAL_MS = 10;
    var RADIUS_SPREAD_MAX = 9;
    var AUDIO_VOLUME_LEVEL = 0.8;
    var A_N_J_WINDOW_POSITION = {
        x: 24.3405,
        y: -4.4903,
        z: -4.1902
    };
    var FLICKER_SCRIPT = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/zombies/flicker.js";
    var HALF_MULTIPLIER = 0.5;
    var _this = this;
    var isInZone = false;
    var sound;

    this.preload = function(entityID) {
        _this.entityID = entityID;
        sound = SoundCache.getSound(Script.resolvePath("../sounds/156031__iwiploppenisse__explosion.wav"));
        restoreAll();
    };

    var lightsOut = function() {
        LIGHTS_THAT_EXTINGUISH.forEach(function (light) {
            Entities.editEntity(light, {visible: false});
        });
        LIGHTS_THAT_FLICKER.forEach(function (light) {
            Entities.editEntity(light, {serverScripts: FLICKER_SCRIPT});
        });
    };

    var lightsOn = function() {
        LIGHTS_THAT_EXTINGUISH.forEach(function (light) {
            Entities.editEntity(light, {visible: true});
        });
        LIGHTS_THAT_FLICKER.forEach(function (light) {
            Entities.editEntity(light, {serverScripts: ""});
        });
    };

    var fire = function() {
        Entities.editEntity(EXPLOSION_SMOKE, { visible: true });
        var radiusSpread = 0;
        var growing = true;
        var interval =Script.setInterval(function() {
            if (radiusSpread < RADIUS_SPREAD_MAX && growing) {
                radiusSpread++;
                Entities.editEntity(EXPLOSION_FIRE, { radiusSpread: radiusSpread });
            } else {
                growing = false;
                radiusSpread--;
                Entities.editEntity(EXPLOSION_FIRE, { radiusSpread: radiusSpread });
            }
            if (radiusSpread === 0) {
                Script.clearInterval(interval);
            }
        }, FIRE_CHANGE_INTERVAL_MS);
    };

    var explode = function() {
        if (sound.downloaded) {
            Audio.playSound(sound, {
                position: A_N_J_WINDOW_POSITION,
                volume: AUDIO_VOLUME_LEVEL
            });
        }
        fire();
        glassShatters();
        // flying glass pieces
        lightsOut();
        mannequinFlies();
        // lower mannequin falls

        Script.setTimeout(function() {
            restoreAll();
        }, RESET_TIMEOUT_MS);
    };

    var restoreAll = function() {
        lightsOn();
        restoreGlass();
        Entities.editEntity(MANNEQUIN_ORIGINAL, { visible: true });
        Entities.editEntity(EXPLOSION_FIRE, { radiusSpread: 0 });
        Entities.editEntity(EXPLOSION_SMOKE, { visible: false });
    };

    var mannequinFlies = function() {
        Entities.callEntityServerMethod(_this.entityID, 'createMannequin');
    };

    var glassShatters = function() {
        GLASS_PANES.forEach(function(brokenWindow) {
            Entities.editEntity(brokenWindow, { visible: true });
        });
    };

    var restoreGlass = function() {
        GLASS_PANES.forEach(function(brokenWindow) {
            Entities.editEntity(brokenWindow, { visible: false });
        });
    };

    _this.enterEntity = function() {
        isInZone = true;
        // if original mannequin is visible, there is no other explosion already in progress...carry on
        if (Entities.getEntityProperties(MANNEQUIN_ORIGINAL, 'visible').visible) {
            Entities.editEntity(MANNEQUIN_ORIGINAL, {visible: false});
            explode();
        }
    };

    function isPositionInsideBox(position, boxProperties) {
        var localPosition = Vec3.multiplyQbyV(Quat.inverse(boxProperties.rotation),
            Vec3.subtract(position, boxProperties.position));
        var halfDimensions = Vec3.multiply(boxProperties.dimensions, HALF_MULTIPLIER);
        return -halfDimensions.x <= localPosition.x &&
                halfDimensions.x >= localPosition.x &&
               -halfDimensions.y <= localPosition.y &&
                halfDimensions.y >= localPosition.y &&
               -halfDimensions.z <= localPosition.z &&
                halfDimensions.z >= localPosition.z;
    }

    function otherUserInZone(objectProperties) {
        var result = false;
        AvatarList.getAvatarIdentifiers().forEach(function(avatarID) {
            var avatar = AvatarList.getAvatar(avatarID);
            if (avatar.sessionUUID !== MyAvatar.sessionUUID && avatar.displayName !== "") {
                if (isPositionInsideBox(avatar.position, objectProperties)) {
                    result = true;
                }
            }
        });
        return result;
    }

    _this.leaveEntity = function() {
        isInZone = false;
        var zoneProperties = Entities.getEntityProperties(_this.entityID, ["position", "dimensions", "rotation", "userData"]);
        if (!otherUserInZone(zoneProperties)) {
            restoreAll();
        }
    };

    _this.unload = function() {
        if (isInZone) {
            _this.leaveEntity();
        }
    };
});
