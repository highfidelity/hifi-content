//
//  alien.js
//
//  Created by David Back on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var invasionUtils = Script.require('./invasionUtils.js');
    
    var FIRE_LASER_INTERVAL = 100;

    var _this;
    var previousStatus = -1;
    var laserID;
    var laserInterval;
    var laserSound;
    var healthBarID;
    var healthBarBGID;

    function Alien() {
        _this = this;
    }

    Alien.prototype = {
        update: function() {
            var alienHealth = invasionUtils.getAlienHealth(_this.entityID);
            invasionUtils.updateHealthBar(healthBarID, alienHealth);
            var alienStatus = invasionUtils.getAlienStatus(_this.entityID);
            if (alienStatus !== previousStatus) {
                if (alienStatus === invasionUtils.UFO_STATUS.ATTACKING) {
                    _this.fireLaser();
                } else if (alienStatus !== invasionUtils.UFO_STATUS.ATTACKING) {
                    _this.stopLaser();
                }
                previousStatus = alienStatus;
            }
        },
        
        fireLaser: function() {
            var targetEntity = invasionUtils.getAlienTarget(this.entityID);
            var targetPosition = Entities.getEntityProperties(targetEntity, ['position']).position;
            var barrelPosition = invasionUtils.getAlienBarrelPosition(this.entityID);
            Overlays.editOverlay(laserID, {
                start: invasionUtils.getAlienBarrelPosition(this.entityID),
                end: targetPosition,
                visible: true
            });
            laserInterval = Script.setInterval(function() {
                var currentVisible = Overlays.getProperty(laserID, 'visible');
                Overlays.editOverlay(laserID, {visible: !currentVisible});
            }, FIRE_LASER_INTERVAL);
            laserSound = Audio.playSound(SoundCache.getSound(invasionUtils.LASER_SOUND), {
                position: barrelPosition,
                volume: invasionUtils.LASER_VOLUME,
                loop: true,
                localOnly: true
            });
        },
        
        stopLaser: function() {
            Overlays.editOverlay(laserID, {visible: false});
            if (laserInterval !== undefined) {
                Script.clearInterval(laserInterval);
            }
            if (laserSound !== undefined) {
                laserSound.stop();
            }
        },
        
        unload: function() {
            this.stopLaser();
            Overlays.deleteOverlay(healthBarID);
            Overlays.deleteOverlay(healthBarBGID);
            Script.update.disconnect(this.update);
        },
    
        preload: function(entityID) {
            this.entityID = entityID;
            
            laserID = Overlays.addOverlay("line3d", {
                color: { red:0, green:255, blue:0 },
                alpha: 1,
                visible: false,
                lineWidth: 10
            });
            
            healthBarBGID = invasionUtils.addHealthBarBG(this.entityID, { x: 0, y: 3, z: 0 });
            healthBarID = invasionUtils.addHealthBar(healthBarBGID);
            
            Script.update.connect(this.update);
        }
    };

    return new Alien();
});
