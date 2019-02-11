//
// ShatterPlateSpawner.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {

    var CLIENT_SCRIPT_URL = Script.resolvePath("ShatterPlateClient.js?" + Date.now());
    var SERVER_SCRIPT_URL = Script.resolvePath("ShatterPlateServer.js?" + Date.now());

    var PLATE_MODEL_URL = Script.resolvePath("plate-whole.fbx");
    var PLATE_COLLISION_HULL_URL = Script.resolvePath("plate-whole-hub.obj");

    var INTERVAL = 5000;
    var DISTANCE = 0.3;

    var PLATE_DIMENSIONS = {x: 0.4040, y: 0.0303, z: 0.4040};
    var POSITION_Y_OFFSET = 0.1;

    var position;

    var dishProperties = {};

    function checkClonesAndUpdate() {
        var count = 0;
        var found = Entities.findEntities(position, DISTANCE);
        found.forEach(function(foundEntity) {
            var name = Entities.getEntityProperties(foundEntity, 'name').name;
            if (name === "Plate") {
                count++;
            }
        });
        if (count === 0) {
            Entities.addEntity(dishProperties);
        }
    }

    var PlateSpawner = function() {

    };

    PlateSpawner.prototype = {
        preload: function(entityID) {
            position = Entities.getEntityProperties(entityID, 'position').position;
            dishProperties.position = { x: position.x, y: position.y + POSITION_Y_OFFSET, z: position.z};
            dishProperties.name = "Plate";
            dishProperties.type = "Model";
            dishProperties.modelURL = PLATE_MODEL_URL;
            dishProperties.script = CLIENT_SCRIPT_URL;
            dishProperties.serverScripts = SERVER_SCRIPT_URL;
            dishProperties.dimensions = PLATE_DIMENSIONS;
            dishProperties.gravity = {x:0, y: -4, z: 0};
            dishProperties.userData = "{\"grabbableKey\":{\"grabbable\":true}}";
            dishProperties.shapeType = "Compound";
            dishProperties.compoundShapeURL = PLATE_COLLISION_HULL_URL,
            dishProperties.dynamic = true,
            dishProperties.collidesWith = "";
            dishProperties.friction = 0.9;
            dishProperties.restitution = 0.1;
            position = dishProperties.position;

            Script.setInterval(checkClonesAndUpdate, INTERVAL);
        },
        unload: function() {
            Script.clearInterval(checkClonesAndUpdate);
        }
    };

    return new PlateSpawner();

});
