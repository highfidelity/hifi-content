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

    this.preload = function(entityID) {
        var properties = Entities.getEntityProperties(entityID, 
            ["position", "modelURL", "name", "dimensions", "description"]);
        var position = Vec3.sum(properties.position, {
            x: -0.5,
            y: 0.0,
            z: -1.0
        });

        food = {
            type: "Model",
            modelURL: properties.modelURL,
            name: properties.name + "-clone",
            description: properties.description,
            shapeType: "compound",
            position: position,
            script: Script.resolvePath("./crunch.js?03"),
            dimensions: properties.dimensions,
            gravity: {
                x: 0.0,
                y: -9.8,
                z: 0.0
            },
            userData: JSON.stringify({ grabbableKey: { grabbable: true } }),
            lifetime: 30,
            dynamic: true
        };
    };

    this.mousePressOnEntity = function(entityID, mouseEvent) {
        Entities.addEntity(food, true);
    };

});