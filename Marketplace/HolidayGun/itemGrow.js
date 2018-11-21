//
//  ItemGrow.js
//
//  created by Rebecca Stankus on 11/12/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This server script will make items larger once they stop moving.

(function() { 
    var _this;
    var GROWTH_INTERVAL = 50;
    var CHECK_VELOCITY_INTERVAL = 50;
    var ITEM_NAME_INDEX = 12;

    var interval;
    var maxHeight;
    var shapeType = "simple-compound";
    
    function GrowingItem() {
        _this = this;
    }

    GrowingItem.prototype = {
        // When the script first loads, we check the item type and set it's maximum height to grow to. Then, we begin 
        // checking its velocity every 50ms. When the velocity is almost 0, we call the grow function and stop checking
        preload: function(entityID) {
            _this.entityID = entityID;
            var name = Entities.getEntityProperties(_this.entityID).name;
            var item = name.substr(ITEM_NAME_INDEX);
            switch (item) {
                case "Tree":
                    maxHeight = 2.5;
                    shapeType = "static-mesh";
                    break;
                case "Candy Cane":
                    maxHeight = 0.17;
                    break;
                case "Gift":
                    maxHeight = 0.5;
                    break;
                case "Gifts":
                    maxHeight = 0.4;
                    break;
                case "Snowman":
                    maxHeight = 1;
                    break;
                default:
                    maxHeight = 1;
            }
            // check velocity on interval
            interval = Script.setInterval(function() {
                var velocity = Entities.getEntityProperties(_this.entityID, 'velocity').velocity;
                if (velocity.x === 0 && velocity.y === 0 && velocity.z === 0) {
                    Script.clearInterval(interval);
                    _this.grow();
                }
            }, CHECK_VELOCITY_INTERVAL);
        },

        // At this point, the object has basically stopped moving. We will clear any gravity properties, make it not 
        // dynamic, reset its rotation, and change its sp=hpetype to the desired collsion hull first. Then we increase 
        // its size every 50ms until it has reached its max and then we stop the growth interval. If it's a tree, 
        // we reset rotaion again during every interval to keep it from tipping.
        grow: function() {
            Entities.editEntity(_this.entityID, {
                gravity: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                rotation: {x:0,y:0,z:0, w:0},
                dynamic: false,
                shapeType: shapeType
            });
            var properties = Entities.getEntityProperties(_this.entityID, [ 'position', 'dimensions', 'name' ]);
            var oldDimensions = properties.dimensions;
            interval = Script.setInterval(function() {
                if (properties.name === "Holiday App Tree") {
                    Entities.editEntity(_this.entityID, {
                        rotation: {x:0,y:0,z:0, w:0}
                    });
                }
                var newDimensions = Vec3.multiply(oldDimensions, 1.01);
                properties.position.y += 0.43 * ( newDimensions.y - oldDimensions.y);
                if (newDimensions.y > maxHeight) {
                    Script.clearInterval(interval);
                    return;
                }
                Entities.editEntity(_this.entityID, {
                    dimensions: newDimensions,
                    position: properties.position
                });
                oldDimensions = newDimensions;
            }, GROWTH_INTERVAL);
        },
        
        // check for running intervals and clear them
        unload: function() {
            if (interval) {
                Script.clearInterval(interval);
            }
        }
    };

    return new GrowingItem();
});
