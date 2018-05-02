//
// ShatterPlatePiece.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities, SoundCache */

(function(){
    var VELOCITY_TO_BREAK = 2;
    var breakURL = "https://hifi-content.s3.amazonaws.com/liv/dev/250709__aiwha__glass-break-2.wav";
    var breakSound = SoundCache.getSound(breakURL);
    var volumeLevel = 0.25;
    var canBreak = false;
    var _entityID;
  
    var PlatePiece = function(){};
    var shouldBreak = function(velocity){
        return Math.abs(velocity.x) >= VELOCITY_TO_BREAK ||
      Math.abs(velocity.y) >= VELOCITY_TO_BREAK ||
      Math.abs(velocity.z) >= VELOCITY_TO_BREAK;
    };
  
    PlatePiece.prototype = {
        preload: function(entityID) {
            _entityID = entityID;
        },
        startNearGrab: function() {
            Entities.editEntity(_entityID, {
                visible : true,
                collidesWith: "static,dynamic,kinematic,"
            });
            canBreak = true;
        },
        collisionWithEntity : function(myID, theirID, collision) {
            if (canBreak) {
                var velocity = Entities.getEntityProperties(myID, 'velocity').velocity;
                if (shouldBreak(velocity)) {
                    if (breakSound.downloaded){
                        Audio.playSound(breakSound, {
                            volume: volumeLevel,
                            position: Entities.getEntityProperties(myID, 'position').position
                        });
                    }
                    Entities.deleteEntity(myID);
                }
            }
           
        }
    };
  
    return new PlatePiece();

});
