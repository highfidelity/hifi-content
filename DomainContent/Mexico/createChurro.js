//
// createChurro.js
// A script to create churros from the churro stand
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

    var churro;

    this.preload = function(entityID) {
        this.position = Entities.getEntityProperties(entityID, "position").position;
        var position = Vec3.sum(this.position, {
            x: -0.5,
            y: 0.0,
            z: -1.0
        });
        churro = {
            type: "Model",
            modelURL: Script.resolvePath("./assets/churro/model.obj"),
            name: "Churro",
            shapeType: "compound",
            position: position,
            script: Script.resolvePath("./crunch.js"),
            dimensions: {
                x: 0.5531,
                y: 0.1373,
                z: 0.2526
            },
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
        Entities.addEntity(churro);
    };

});
