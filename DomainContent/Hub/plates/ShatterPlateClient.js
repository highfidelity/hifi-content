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
    console.log("in shatter plate clinent");
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
        console.log("making fragile");
        Entities.callEntityServerMethod(_entityID, 'makeFragile', '');
    }
  
    Plate.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
        },
        startNearGrab: function() {
            console.log("start near grab");
            makeFragile();
        },
        mousePressOnEntity: function() {
            console.log("start mouse press");
            makeFragile();
        },
        collisionWithEntity : function(myID, theirID, collision) {
            console.log("myid", myID);
            console.log("in collision");
            var velocity = Entities.getEntityProperties(myID, 'velocity').velocity;
            console.log("velocity", JSON.stringify(velocity));
            if (shouldBreak(velocity)) {
                console.log("in should velocity");
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
