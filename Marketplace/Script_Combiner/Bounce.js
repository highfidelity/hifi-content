//
//  Bounce.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/22/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for script combiner
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function () {
    var _this = this;
    
    _this.preload = function (entityID) {
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(entityID);
        Entities.editEntity(entityID, {"dynamic" : true});
        print("Dynamic True");
        var newProperties = {
            dynamic: true,
            //since -9.8 is gravity I changed it to positive 2
            gravity: {x: 0, y: -2, z: 0},
            //Makes it bounce
            restitution: 0.9,
            //change both linear and angular damping for increased bounce
            damping: 0.0,
            angularDamping: 0.0
        };
        Entities.editEntity(entityID, newProperties);
    }

    _this.unload = function (entityID) {
    }
})