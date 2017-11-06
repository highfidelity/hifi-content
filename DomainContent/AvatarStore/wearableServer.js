//
//  wearableServer.js
//
//  Creates invisible clones to be used so people can attach entities without rez rights
//  Copyright 2017 High Fidelity, Inc.
//
//  Version 2: Requires Entities.callEntityClientMethod() functionality (RC 58 or later)
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var properties; 
    var newEntityProperties;

    var Wearable = function() {

    };
    Wearable.prototype = {
        remotelyCallable: ['spawnNewChild'],
        preload: function(entityID){
            properties = Entities.getEntityProperties(entityID, ['position', 'rotation', 'dimensions', 'userData', 'modelURL']);
            newEntityProperties = {
                type: 'Model',
                position: properties.position,
                rotation: properties.rotation,
                dimensions: properties.dimensions,
                userData: properties.userData,
                modelURL : properties.modelURL,
                script: Script.resolvePath("wearableClient.js"),
                serverScripts: Script.resolvePath("wearableServer.js"),
                visible: true,
                shapeType: "box",
                collidesWith: "dynamic,",
            };
        },
        unload: function() {

        },
        spawnNewChild: function(entityID, params) {
            if (params[0] === entityID) {
                Entities.addEntity(newEntityProperties);
            } 
        }
    };
    return new Wearable();
});
