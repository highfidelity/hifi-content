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

    var CLIENT_SCRIPT_URL = Script.resolvePath("ShatterPlateClient.js");
    var SERVER_SCRIPT_URL = Script.resolvePath("ShatterPlateServer.js");

    var INTERVAL = 2000;
    var DISTANCE = 0.5;

    var PLATE_DIMENSIONS = {x: 0.4657, y: 0.0141, z: 0.4657};

    var position;

    var dishProperties;

    function checkClonesAndUpdate() {
        var count = 0;
        var found = Entities.findEntities(position, DISTANCE);
        found.forEach(function(foundEntity){
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
            dishProperties = Entities.getEntityProperties(entityID, ['position', 'modelURL']);
            dishProperties.name = "Plate";
            dishProperties.visible = false;
            dishProperties.script = CLIENT_SCRIPT_URL;
            dishProperties.serverScripts = SERVER_SCRIPT_URL;
            dishProperties.dimensions = PLATE_DIMENSIONS;
            dishProperties.gravity = {x:0, y: -4, z: 0};
            dishProperties.userData = "{\"grabbableKey\":{\"grabbable\":true}}";
            dishProperties.shapeType = "Compound";
            dishProperties.compoundShapeURL = "atp:/plate-whole-hub.obj",
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
