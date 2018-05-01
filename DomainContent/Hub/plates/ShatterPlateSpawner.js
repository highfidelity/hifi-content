//
// ShatterPlateSpawner.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function(){

    var CLIENT_SCRIPT_URL = Script.resolvePath("ShatterPlateClient.js");
    var SERVER_SCRIPT_URL = Script.resolvePath("ShatterPlateServer.js");

    var INTERVAL = 2000;
    var DISTANCE = 0.5;

    var PLATE_DIMENSIONS = {x: 0.4657, y: 0.0141, z: 0.4657};

    var position;

    var dishProperties;

    function checkClonesAndUpdate(){
        var found = Entities.findEntitiesByName("Plate", position, DISTANCE);
        if (found.length === 0) {
            Entities.addEntity(dishProperties);
        }
    }

    var PlateSpawner = function(){

    };

    PlateSpawner.prototype = {
        preload: function(entityID) {
            dishProperties = Entities.getEntityProperties(entityID, ['name', 'position', 'modelURL']);
            dishProperties.visible = false;
            dishProperties.script = CLIENT_SCRIPT_URL;
            dishProperties.serverScripts = SERVER_SCRIPT_URL;
            dishProperties.dimensions = PLATE_DIMENSIONS;
            dishProperties.gravity = {x:0, y: -4, z: 0};
            dishProperties.userData = "{\"grabbableKey\":{\"grabbable\":true}}";
            dishProperties.shapeType = "Box";
            dishProperties.dynamic = true,
            dishProperties.collidesWith = "";
            position = dishProperties.position;

            Script.setInterval(checkClonesAndUpdate, INTERVAL);
        },
        unload: function(){
            Script.clearInterval(checkClonesAndUpdate);
        }
    };

    return new PlateSpawner();

});
