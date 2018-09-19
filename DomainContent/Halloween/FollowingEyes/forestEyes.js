//
//  forestEyes.js
//
//  Created by Rebecca Stankus on 09/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {

    var UPDATE_EYES_INTERVAL_MS = 200;
    var SEARCH_RADIUS = 100;
    var EYE_LOCAL_X_POSITION = -0.024972915649414062;
    var MAX_EYE_SIZE = 0.7;
    var MIN_EYE_SIZE = 0.1;

    var _this;

    var eyesParents = [];
    var interval;
    var eyes = [];

    var Eyes = function() {
        _this = this;
    };

    Eyes.prototype = {

        preload: function(entityID) {
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            
        },

        enterEntity: function() {
            eyesParents = Entities.findEntitiesByName("Creepy Eyes Parent", _this.position, SEARCH_RADIUS, true);
            eyesParents.forEach(function(parentObject) {
                var eyeSize = Math.random() * MAX_EYE_SIZE - MIN_EYE_SIZE + MIN_EYE_SIZE;
                eyes.push(Overlays.addOverlay("model", {
                    url: Script.resolvePath("models/catEye.fbx"),
                    dimensions: { x: eyeSize, y: eyeSize, z: eyeSize },
                    name: "CC-BY Jimi",
                    parentID: parentObject,
                    localPosition: { x: EYE_LOCAL_X_POSITION, y: -0.1860809326171875, z: 0.14186573028564453 },
                    localRotation: { x: 0, y: 0, z: 0, w: 0 },
                    glow: 1
                }));
    
                eyes.push(Overlays.addOverlay("model", {
                    url: Script.resolvePath("models/catEye.fbx"),
                    dimensions: { x: eyeSize, y: eyeSize, z: eyeSize },
                    name: "CC-BY Jimi",
                    parentID: parentObject,
                    localPosition: { x: EYE_LOCAL_X_POSITION + eyeSize, y: -0.1860809326171875, z: 0.14186573028564453 },
                    localRotation: { x: 0, y: 0, z: 0, w: 0 },
                    glow: 1
                }));
            });
            
            interval = Script.setInterval(function() {
                eyes.forEach(function(eyeOverlay) {
                    Overlays.editOverlay(eyeOverlay, {
                        rotation: Quat.cancelOutRoll(Quat.lookAtSimple(MyAvatar.position, 
                            Overlays.getProperty(eyeOverlay, 'position')))
                    });
                });
            }, UPDATE_EYES_INTERVAL_MS);
        },

        leaveEntity: function() {
            eyes.forEach(function(eyeOverlay) {
                Overlays.deleteOverlay(eyeOverlay);
            });
            if (interval) {
                Script.clearInterval(interval);
            }
        },

        unload: function() {
            _this.leaveEntity();
        }

    };

    return new Eyes;
});
