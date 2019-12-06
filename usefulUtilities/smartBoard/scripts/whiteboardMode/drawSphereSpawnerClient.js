'use strict';
//  drawSphereSpawnerClient.js
//
//  created by Rebecca Stankus on 03/28/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _this;
    var DEBUG = false;

    var RGB_MAX_VALUE = 255;
    var DECIMAL_PLACES = 2;

    var parentJointIndex;
    var dominantHandJoint;
    var dominantHand;

    var smartboardZone;

    var PaintSphereSpawner = function() {
        _this = this;
    };

    PaintSphereSpawner.prototype = {
        remotelyCallable: ['createPaintSphere'],
        /* ON PRELOAD: Save a reference to this */
        preload: function(entityID) {
            _this.entityID = entityID;

            _this.getSmartboardZoneID();
        },

        /* Convert RGB value to 0-1 scale */
        rgbConversion: function(rgbColorValue) {
            return (rgbColorValue/RGB_MAX_VALUE).toFixed(DECIMAL_PLACES);
        },
        
        /* Check for existing paint sphere and delete if found */
        removePaintSpheres: function() {
            MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
                var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
                if (name && (name === "Smartboard Paint Sphere" || name === "Smartboard Paint Sphere Material")) {
                    Entities.deleteEntity(avatarEntity.id);
                }
            });
        },

        /* Remove any existing paint spheres. Get user's dominant hand and find most appropriate joint available to 
        attach paint sphere to. Create a paint sphere using the color of this square that was clicked. Attach a material 
        to the sphere using a texture found inthe userData of this square. */
        createPaintSphere: function() {
            if (DEBUG) {
                console.log("drawSphereSpawnerClient.js: " + _this.entityID +
                    ": `createPaintSphere()`. createPaintSphere...");
            }
            _this.removePaintSpheres();
            dominantHand = MyAvatar.getDominantHand();
            dominantHandJoint = (dominantHand === "right") ? "RightHand" : "LeftHand";
            parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index4");
            if (parentJointIndex === -1) {
                parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint + "Index3");
            }
            if (parentJointIndex === -1) {
                parentJointIndex = MyAvatar.getJointIndex(dominantHandJoint);
                print("ERROR: Falling back to dominant hand joint as index finger tip could not be found");
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['userData', 'color']);
            var userData = JSON.parse(properties.userData);
            var userDataForSphere = JSON.stringify({
                textureURL: userData.textureURL,
                colorPaletteID: _this.entityID
            });
            var paintSphere = Entities.addEntity({
                name: "Smartboard Paint Sphere",
                type: "Model",
                modelURL: Script.resolvePath("./resources/models/sphere-white-emissive.fbx"),
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: parentJointIndex,
                localPosition: { x: 0, y: 0, z: 0 },
                localRotation: Quat.fromVec3Degrees({x:0,y:0,z:0}),
                color: properties.color,
                localDimensions: { x: 0.015, y: 0.015, z: 0.015 },
                script: Script.resolvePath("drawSphereClient.js"),
                grab: { grabbable: false },
                collisionless: true,
                lifetime: 500,
                userData: userDataForSphere
            }, 'avatar');
            var colorRescaled = {};
            colorRescaled.red = _this.rgbConversion(properties.color.red);
            colorRescaled.green = _this.rgbConversion(properties.color.green);
            colorRescaled.blue = _this.rgbConversion(properties.color.blue);
            Entities.addEntity({
                type: "Material",
                name: "Smartboard Paint Sphere Material",
                materialURL: "materialData",
                priority: 1,
                parentID: paintSphere,
                collisionless: true,
                materialData: JSON.stringify({
                    materials: {
                        albedo: colorRescaled,
                        emissive: colorRescaled
                    }
                })
            }, 'avatar');
        },

        getSmartboardZoneID: function(){
            var smartboard = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            var smartboardParts = Entities.getChildrenIDs(smartboard);
            smartboardParts.forEach(function(smartboardPart) {
                var name = Entities.getEntityProperties(smartboardPart, 'name').name;
                if (name === "Smartboard Zone") {
                    smartboardZone = smartboardPart;
                }
            });
        },

        /* Create a paint sphere on hand. */
        mousePressOnEntity: function( entityID, event ) {
            if (!smartboardZone) {
                _this.getSmartboardZoneID();
            }

            var currentBoardState = false;

            try {
                currentBoardState = JSON.parse(Entities.getEntityProperties(smartboardZone, "userData").userData).currentBoardState;
            } catch (e) {
                console.log("error parsing smartBoardZone's userData: " + e);
            }

            if (currentBoardState !== "whiteboard") {
                return;
            }

            if (event.isLeftButton) {
                _this.createPaintSphere();
            }
        }
    };
    return new PaintSphereSpawner();
});
