//
// flicker.js
// 
// Created by Milad
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    var id;
    var maxLightIntensity = 15; // userData
    var interval = 1000;
    var lightTimer = null;

    var isOn = false;

    this.remotelyCallable = [
        "turnOn"
    ];

    this.turnOn = function (deltaTime) {

        Entities.editEntity(id, {
            intensity: maxLightIntensity
        });

        Script.setTimeout(function () {
            Entities.editEntity(id, {
                intensity: 0
            });
        }, deltaTime);

    };

    function flash() {
        isOn = !isOn;
        Entities.editEntity(id, {
            intensity: isOn ? maxLightIntensity : 0
        });
    }

    this.preload = function(entityID) {
        id = entityID;
        // lightTimer = Script.setInterval(flash, interval);
    };

    this.unload = function() {
        // Script.clearInterval(lightTimer);
    };

});