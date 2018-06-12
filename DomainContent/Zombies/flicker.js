//
// flicker.js
// 
// Created by Milad
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function(){
    var id;
    var maxLightIntensity;
    var currentLightIntensity;
    var interval;
    var lightTimer = null;

    function getProps(entityID) {
        var properties = Entities.getEntityProperties(entityID).userData;
        var data = JSON.parse(properties);
        if (properties) {
            maxLightIntensity = data.maxLightIntensity;
            interval = data.interval;
        }
    }

    function onUpdate(){
        Math.abs(Math.sin(Date.now())) * maxLightIntensity;
        var oldInterval = interval;
        var oldMaxLightIntensity = maxLightIntensity;
        getProps(id);
        if (oldInterval !== interval || oldMaxLightIntensity !== maxLightIntensity){
            Script.clearInterval(lightTimer);
            lightTimer = Script.setInterval(onLightTimer, interval);
        }
    }

    function onLightTimer(){
        currentLightIntensity = Math.abs(Math.sin(Date.now())) * maxLightIntensity;
        Entities.editEntity(id, {
            intensity: currentLightIntensity
        });
    }

    this.preload = function(entityID) {
        id = entityID;
        getProps(id);
        lightTimer = Script.setInterval(onLightTimer, interval);
        Script.update.connect(onUpdate);
    };

    this.unload = function() {
        Script.update.disconnect(onUpdate);
        Script.clearInterval(lightTimer);
    };

});
