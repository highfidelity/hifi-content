//
//  christmasItem.js
//
//  created by Rebecca Stankus on 11/13/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This client script stops an object from moving when it collides with an entity to prevent bouncing.

(function() { 
    var _this;
    
    function ChristmasItem() {
        _this = this;
    }

    ChristmasItem.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        // When an item collides, we set its velocity to 0 and make it not dynamic so it will stay in place
        collisionWithEntity: function(idA, idB, collision) {
            if (collision.type === 0) {
                var nameOfOtherEntity = Entities.getEntityProperties(idB, 'name').name;
                if (nameOfOtherEntity !== "Christmas App Gun") {
                    Entities.editEntity(idA, {
                        velocity: { x: 0, y: 0, z: 0 },
                        dynamic: false
                    });
                }
            }
        }
    };

    return new ChristmasItem();
});
