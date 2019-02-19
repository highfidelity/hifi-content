//
// ShatterPlateClient.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities, SoundCache, Script */

(function() {
    var VELOCITY_TO_BREAK = 1.2;
    var breakURL = Script.resolvePath('sound/glass-break1.wav');
    var breakSound = SoundCache.getSound(breakURL);
    var volumeLevel = 0.65;
    var _entityID;
    
    var Plate = function(){};
    var shouldBreak = function(velocity){
        if (velocity) {
            return Math.abs(velocity.x) >= VELOCITY_TO_BREAK ||
            Math.abs(velocity.y) >= VELOCITY_TO_BREAK ||
            Math.abs(velocity.z) >= VELOCITY_TO_BREAK;
        }

    };

    function makeFragile() {
        Entities.callEntityServerMethod(_entityID, 'makeFragile', '');
    }
  
    Plate.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
        },
        startNearGrab: function() {
            makeFragile();
        },
        mousePressOnEntity: function() {
            makeFragile();
        },
        collisionWithEntity : function(myID, theirID, collision) {
            var velocity = Entities.getEntityProperties(myID, 'velocity').velocity;
            if (shouldBreak(velocity)) {
                if (breakSound.downloaded) {
                    Audio.playSound(breakSound, {
                        volume: volumeLevel,
                        position: Entities.getEntityProperties(myID, 'position').position
                    });
                }
                Entities.callEntityServerMethod(myID, 'breakPlate', '');
            }
        }
    };
  
    return new Plate();

});
