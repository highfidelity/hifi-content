//
//  materialSwapBullet.js
//
//  created by Rebecca Stankus on 03/27/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global Graphics */

(function() {

    var _this;

    var NEGATIVE = -1;
    var SWAP_SOUND = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Material%20Gun/sounds/swap.wav";
    var MISS_SOUND = "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Hub/Material%20Gun/sounds/miss.wav";
    var AUDIO_VOLUME_LEVEL = 0.5;
    var BARREL_LOCAL_OFFSET = {x:0.015, y:0.065, z:-0.25};
    var BARREL_LOCAL_DIRECTION = {x:0, y:0, z:-1000};
    var VELOCITY_FACTOR = 50;
    var SEARCH_RADIUS = 0.2;
    // var WAIT_TO_SHOOT = 100;

    var material;
    var swapSound;
    var missSound;
    // var injector;
    var gun;
    var doNotRayPick = [];
    // var startPosition;
    // var startDirection;
    var firstCollision = true;

    function Bullet() {
        _this = this;
    }

    Bullet.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            var userData = Entities.getEntityProperties(_this.entityID, 'userData').userData;
            material = JSON.parse(userData).material;
            gun = JSON.parse(userData).gun;
            doNotRayPick = Entities.getChildrenIDs(gun);
            doNotRayPick.push(gun, _this.entityID, material);
            // startPosition = JSON.parse(userData).startPosition;
            // startDirection = JSON.parse(userData).startDirection;
            swapSound = SoundCache.getSound(SWAP_SOUND);
            missSound = SoundCache.getSound(MISS_SOUND);
            var normalizedDirection = Vec3.normalize(_this.getBarrelDirection());
            var velocity = Vec3.multiply(normalizedDirection, VELOCITY_FACTOR);
            // print("adding velocity  to hull...", JSON.stringify(velocity));
            Entities.editEntity(_this.entityID, {
                velocity: velocity
            });
        },
        collisionWithEntity: function(myID, otherID, collisionInfo) {
            
            if (collisionInfo.type === 0 && firstCollision) {
                firstCollision = false;
                var properties = Entities.getEntityProperties(otherID, ['position', 'name']);
                // var velocityOnCollision = Entities.getEntityProperties(_this.entityID, 'velocity').velocity;
                var name = properties.name;
                // print("velocity on collision", JSON.stringify(velocityOnCollision));
                // print("direction from start point ", JSON.stringify(startDirection));
                var isGun = false;
                var isGunMaterial = false;
                if (name) {
                    isGun = (name ==="Material Swapping Gun") ? true : false;
                    isGunMaterial = (name ==="Gun Material") ? true : false;
                }
                // print("ouch! ", myID, " collided with " + otherID + " " + name);
                // print("isGun: ", isGun, " and collision type: ", collisionInfo.type);
                if ((!isGun || (isGun === NEGATIVE)) && (!isGunMaterial || (isGunMaterial === NEGATIVE))) {
                    print("NEW INTERSECTION DATA!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                    // print(JSON.stringify(collisionInfo));
                    Entities.getChildrenIDs(otherID).forEach(function(element) {
                        var name = Entities.getEntityProperties(element, 'name').name;
                        if (name === "Gun Material" && (element !== material)) {
                            // check submesh!!!!!!!!!!!!!!!!!!!!only delete if same submesh
                            Entities.deleteEntity(element);
                        }
                    });
                    // var origin = startPosition;
                    // print("origin: ", JSON.stringify(origin));
                    // var direction = Vec3.sum(collisionInfo.contactPoint, -0.1);
                    // print("direction ", JSON.stringify(direction));
                    // var laserStart = Vec3.sum(collisionInfo.contactPoint, 0.1);
                    // var endPoint = Vec3.sum(startPosition, startDirection);

                    Entities.findEntities(collisionInfo.contactPoint, SEARCH_RADIUS).forEach(function(nearbyEntity) {
                        var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
                        if (name === "Gun Material") {
                            // print("adding to doNotPick list: ", nearbyEntity);
                            doNotRayPick.push(nearbyEntity);
                        }
                    });
                    

                    var origin = Vec3.sum(collisionInfo.contactPoint, Vec3.multiply(0.2, 
                        Vec3.normalize(collisionInfo.penetration)));
                    var direction = Vec3.multiply(-1, Vec3.normalize(collisionInfo.penetration));

                    var pickRay = ({
                        origin: origin,
                        direction: direction
                    });

                    // print(JSON.stringify(doNotRayPick));
                    var intersection = Entities.findRayIntersection(pickRay, true, [otherID], doNotRayPick);
                    /* var beginning = Entities.addEntity({
                        "color": {
                            "blue": 0,
                            "green": 255,
                            "red": 0
                        },
                        "dimensions": {
                            "x": 0.01,
                            "y": 0.01,
                            "z": 0.01
                        },
                        "collisionless":true,
                        "lifetime": 120,
                        "dynamic": false,
                        "name": "origin",
                        "position": origin,
                        "type": "Sphere"
                    });
                    var contact = Entities.addEntity({
                        "color": {
                            "blue": 255,
                            "green": 0,
                            "red": 0
                        },
                        "dimensions": {
                            "x": 0.01,
                            "y": 0.01,
                            "z": 0.01
                        },
                        "collisionless":true,
                        "dynamic": false,
                        "name": "contact",
                        "lifetime": 120,
                        "position": collisionInfo.contactPoint,
                        "type": "Sphere"
                    });*/
                    /* var end = Entities.addEntity({
                        "color": {
                            "blue": 0,
                            "green": 0,
                            "red": 255
                        },
                        "collisionless":true,
                        "dimensions": {
                            "x": 0.02,
                            "y": 0.02,
                            "z": 0.02
                        },
                        "dynamic": false,
                        "name": "gun hit point",
                        "position": intersection.intersection,
                        "type": "Sphere"
                    }); */
                    /* var laserID = Overlays.addOverlay("line3d", {
                        start: origin,
                        end: intersection.intersection,
                        color: {red:255, green:0, blue:0},
                        alpha: 1,
                        visible: true,
                        lineWidth: 10
                    });*/
                    print("intersection data: ", JSON.stringify(intersection));
                    /* if (Entities.getEntityProperties(intersection.entityID, 'name').name === "Gun Material"){
                        // what if it hit another material...can i make a material collisionless
                    }*/
                    // print("intersected: ", Entities.getEntityProperties(intersection.entityID, 'name').name);
                    if (!intersection.intersects) {
                        print("FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL>>>FAIL");
                        _this.playSound(collisionInfo.contactPoint, missSound);
                    } else {
                        print("intersected entity is ", Entities.getEntityProperties(intersection.entityID, 'name').name,
                            " ID: ", intersection.entityID);
                        var mesh = Graphics.getModel(otherID);
                        var priority;
                        var submesh;
                        var materialList;
                        if (mesh) {
                            materialList = mesh.materialLayers;
                            // print("intersectedEntity.extrainfo: ", JSON.stringify(intersection.extraInfo));
                            if (intersection.extraInfo) {
                                submesh = intersection.extraInfo.subMeshIndex;
                                print("submesh index is ", submesh);
                                print("submesh name is ", intersection.extraInfo.subMeshName);
                            }
                        } else {
                            print("could not get mesh");
                        }
                        if (materialList) {
                            if (materialList[submesh]) {
                                // print(JSON.stringify(materialList[submesh]));
                                priority = this.getTopMaterialPriority(materialList[submesh]);
                                print("priority is ", priority);
                            }
                        } else {
                            print("could not get material list");
                        }
                        if (submesh === null) {
                            print("setting submesh to 0...couldn't get mesh");
                            submesh = "0";
                            
                        }
                        if (submesh === null) {
                            print("setting priority to 10...couldn't get mesh");
                            priority = 10;
                        }
                        _this.playSound(collisionInfo.contactPoint, swapSound);
                        // delete other materials
                    
                        priority += 1;
                        print("otherID is ", otherID, "intersection ID is ", intersection.entityID);
                        print("swapping material (ID: ", material, ") for ", otherID, " name: ", name, 
                            " submesh ", submesh, " priority: ", priority);
                        Entities.editEntity(material, {
                            parentID: otherID,
                            priority: priority,
                            parentMaterialName: submesh
                        });
                        Entities.deleteEntity(_this.entityID);
                    }
                }
            }
        },
        getBarrelPosition: function() {
            var properties = Entities.getEntityProperties(gun, ['position', 'rotation']);
            var barrelLocalPosition = Vec3.multiplyQbyV(properties.rotation, BARREL_LOCAL_OFFSET);
            var barrelWorldPosition = Vec3.sum(properties.position, barrelLocalPosition);
            return barrelWorldPosition;
        },
        getBarrelDirection: function() {
            var rotation = Entities.getEntityProperties(gun, ['rotation']).rotation;
            var barrelAdjustedDirection = Vec3.multiplyQbyV(rotation, BARREL_LOCAL_DIRECTION);
            return barrelAdjustedDirection;
        },
        getTopMaterialPriority: function(multiMaterial) {
            // For non-models: multiMaterial[0] will be the top material
            // For models, multiMaterial[0] is the base material, and multiMaterial[1] is the highest priority applied material
            if (multiMaterial.length > 1) {
                print("mulitimaterial.length > 1...this is a model");
                if (multiMaterial[1].priority > multiMaterial[0].priority) {
                    print("material 1 is greater than material 0, returning priority of ", multiMaterial[1].priority);
                    return multiMaterial[1].priority;
                }
            } else {
                print("only 1 item in multimaterial...not a model");
            }
            print("returningn multimaterial 0  priority of ", multiMaterial[0].priority);
            return multiMaterial[0].priority;
        },
        playSound: function(position, sound) {
            if (sound.downloaded) {
                Audio.playSound(sound, {
                    position: position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        },
        unload: function() {}
    };

    return new Bullet();
});
