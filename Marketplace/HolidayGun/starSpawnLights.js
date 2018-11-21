// starSpawnLights.js
//
//  created by Rebecca Stankus on 11/13/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This server script is attached to the star. It spawns a light to shine on it and the star grows larger.

(function() {
    var GROWTH_INTERVAL = 50;
    var STAR_MAX_HEIGHT = 0.3; // Limit on how tall the star should be at full size
    var CHECK_VELOCITY_INTERVAL = 50;

    var _this;

    var interval;
    
    function Star() {
        _this = this;
    }

    Star.prototype = {
        // When the script begins, we will start checking the velocity of the star every 50 ms. When it has almost 
        // stopped moving, we create the light on it, grow it to a larger size, and clear the checking interval
        preload: function(entityID) {
            _this.entityID = entityID;
            interval = Script.setInterval(function() {
                var velocity = Entities.getEntityProperties(_this.entityID, 'velocity').velocity;
                if (velocity.x < 0.01 && velocity.y < 0.01 && velocity.z < 0.01) {
                    Script.clearInterval(interval);
                    _this.lightAndGrow();
                }
            }, CHECK_VELOCITY_INTERVAL);
        },

        // This function will resize the star every 50ms until it has reached the desired height and then will stop 
        // the checking interval. Every time the star is resized, we must also move it's position up by half of the 
        // difference in added height to keep it in the same position relative to its center. We also add the light here.
        lightAndGrow: function() {
            var properties = Entities.getEntityProperties(_this.entityID, [ 'position', 'dimensions' ]);
            var oldDimensions = properties.dimensions;
            interval = Script.setInterval(function() {
                var newDimensions = Vec3.multiply(oldDimensions, 1.01);
                if (newDimensions.y > STAR_MAX_HEIGHT) {
                    Script.clearInterval(interval);
                    return;
                }
                Entities.editEntity(_this.entityID, { 
                    dimensions: newDimensions,
                    position: properties.position
                });
                oldDimensions = newDimensions;
            }, GROWTH_INTERVAL);
            Entities.addEntity({
                isSpotlight: false,
                color: {
                    blue: 0,
                    green: 115,
                    red: 255
                },
                cutoff: 90,
                dimensions: {
                    x: 0.745607852935791,
                    y: 0.745607852935791,
                    z: 0.745607852935791
                },
                falloffRadius: 3,
                intensity: 22,
                name: "Holiday Star Light",
                parentID: _this.entityID,
                localPosition: {
                    x: -0.010071277618408203,
                    y: 0.10224246978759766,
                    z: 0.00959014892578125
                },
                localRotation: {
                    w: -0.8970626592636108,
                    x: 0.31282520294189453,
                    y: -0.2881666421890259,
                    z: 0.12016475200653076
                },
                type: "Light",
                userData: "{\"grabbableKey\":{\"grabbable\":false}}"
            });
        },
        
        // check to make sure there are no intervals left running
        unload: function() {
            if (interval) {
                Script.clearInterval(interval);
            }
        }
    };

    return new Star();
});
