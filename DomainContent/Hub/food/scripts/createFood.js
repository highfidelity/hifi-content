//
// createFood.js
// A script to create avatar entity food clones from the original
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function() {

    var food;
    var LIFETIME = 30; // milliseconds

    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(Entities.getEntityProperties(entityID, "parentID").parentID, 
            ["position", "modelURL", "name", "dimensions", "description"]);
        var position = Vec3.sum(properties.position, {
            x: 0.0,
            y: 0.0,
            z: 0.5
        });

        food = {
            type: "Model",
            modelURL: properties.modelURL,
            name: properties.name + "-clone",
            description: properties.description,
            shapeType: "compound",
            position: position,
            script: Script.resolvePath("./crunch.js"),
            dimensions: properties.dimensions,
            gravity: {
                x: 0.0,
                y: -9.8,
                z: 0.0
            },
            userData: JSON.stringify({ grabbableKey: { grabbable: true } }),
            lifetime: LIFETIME,
            dynamic: true
        };
    };

    this.mousePressOnEntity = function(entityID, mouseEvent) {
        var REZ_OFFSET = {
            x: 0.0,
            y: 0.7,
            z: -0.5
        };
        var position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, REZ_OFFSET));
        food.position = position;
        Entities.addEntity(food, true);
    };

});