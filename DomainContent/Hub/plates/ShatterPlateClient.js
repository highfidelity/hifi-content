//
// ShatterPlateClient.js
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
    var volumeLevel = 0.65;
  
    var Plate = function(){};
  
    var shouldBreak = function(velocity){
        return Math.abs(velocity.x) >= VELOCITY_TO_BREAK ||
      Math.abs(velocity.y) >= VELOCITY_TO_BREAK ||
      Math.abs(velocity.z) >= VELOCITY_TO_BREAK;
    };
  
    Plate.prototype = {
        collisionWithEntity : function(myID, theirID, collision) {
            var velocity = Entities.getEntityProperties(myID, 'velocity').velocity;
            if (shouldBreak(velocity)) {
                if (breakSound.downloaded){
                    print("Should play sound here");
                    Audio.playSound(breakSound, {
                        volume: volumeLevel,
                        position: Entities.getEntityProperties(myID, 'position').position
                    });
                }
                Entities.callEntityServerMethod(myID, 'breakPlate', '');
            }
        },
        enterEntity: function(myID){
            var velocity = Entities.getEntityProperties(myID, 'velocity').velocity;
            if (shouldBreak(velocity)) {
                if (breakSound.downloaded){
                    print("should play sound here");
                    Audio.playSound(breakSound, {
                        volume: 1.0,
                        position: Entities.getEntityProperties(myID, 'position').position
                    });
                }
                Entities.callEntityServerMethod(myID, 'breakPlate', '');
            }
        }
    };
  
    return new Plate();

});