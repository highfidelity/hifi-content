//
//  catEyes.js
//
//  Created by Rebecca Stankus on 09/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {

    var UPDATE_EYES_INTERVAL_MS = 200;

    var _this;

    var leftEyeOverlay;
    var rightEyeOverlay;
    var cat;
    var interval;
    var leftEyePosition;
    var rightEyePosition;

    var CatEyes = function() {
        _this = this;
    };

    CatEyes.prototype = {

        preload: function(entityID) {
            _this.entityID = entityID;
            cat = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
        },

        enterEntity: function() {
            leftEyeOverlay = Overlays.addOverlay("model", {
                url: Script.resolvePath("models/catEye.fbx"),
                dimensions: { x: 0.029752083122730255, y: 0.029752083122730255, z: 0.029752083122730255 },
                name: "Cat Eye CC-BY Poly by Google",
                parentID: cat,
                localPosition: { x: -0.024972915649414062, y: -0.1860809326171875, z: 0.14186573028564453 },
                localRotation: { x: 0.6599678993225098, y: 0.07908749580383301, z: 0.0625467300415039, w: 0.7444723844528198 },
                glow: 1
            });

            rightEyeOverlay = Overlays.addOverlay("model", {
                url: Script.resolvePath("models/catEye.fbx"),
                dimensions: { x: 0.03403420001268387, y: 0.03403420001268387, z: 0.03403420001268387 },
                name: "Cat Eye CC-BY Poly by Google",
                parentID: cat,
                localPosition: { x: -0.07740211486816406, y: -0.1835193634033203, z: 0.13999652862548828 },
                localRotation: { x: 0.665918946266174, y: -0.0835736393928527, z: -0.0666666626930236, w: 0.7383078336715698 },
                glow: 1
            });

            leftEyePosition = Overlays.getProperty(leftEyeOverlay, 'position');
            rightEyePosition = Overlays.getProperty(rightEyeOverlay, 'position');
            
            interval = Script.setInterval(function() {
                Overlays.editOverlay(leftEyeOverlay, {
                    rotation: Quat.cancelOutRoll(Quat.lookAtSimple(MyAvatar.getJointPosition("Head"), leftEyePosition))
                });
                Overlays.editOverlay(rightEyeOverlay, {
                    rotation: Quat.cancelOutRoll(Quat.lookAtSimple(MyAvatar.getJointPosition("Head"), rightEyePosition))
                });
            }, UPDATE_EYES_INTERVAL_MS);
        },

        leaveEntity: function() {
            Overlays.deleteOverlay(rightEyeOverlay);
            Overlays.deleteOverlay(leftEyeOverlay);
            if (interval) {
                Script.clearInterval(interval);
            }
        },

        unload: function() {
            _this.leaveEntity();
        }

    };

    return new CatEyes;
});
