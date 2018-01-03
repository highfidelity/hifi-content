//
// monster_walk.js
// A little angry monster
// Attach to an entity 
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2017
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function () {
    var INTERVAL = 200;

    var _entityID;
    var properties;

    this.preload = function(entityID) {
        _entityID = entityID;
        properties = Entities.getEntityProperties(_entityID, ["position", "rotation"]);
        var faceAwayRot = Quat.multiply(MyAvatar.orientation, {x:0, y:1, z:0, w:0});
        var newProperties = {
            "position": {
                "x": properties.position.x,
                "y": properties.position.y - 1,
                "z": properties.position.z
            },
            "rotation": faceAwayRot
        };
        Entities.editEntity(_entityID, newProperties);
    };

    // Monster walks away from spawner
    Script.setInterval(function () {
        var position = Entities.getEntityProperties(_entityID, "position").position;
        var destination = Vec3.normalize(Vec3.subtract(position, MyAvatar.position));
        var newProperties = {
            "rotation": Quat.multiply(MyAvatar.orientation, {x:0, y:1, z:0, w:0}),
            "velocity": destination
        };
        Entities.editEntity(_entityID, newProperties);
    }, INTERVAL);
    
    this.unload = function() {

    };

});