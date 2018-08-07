// DJ_Tools_Spawner.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// Currently custom made for Rust content set (relies on Phlash's tables for layout)

(function () {
    // Polyfill
    Script.require("../../../Utilities/Polyfills.js")();

    // Helper Functions
    var Util = Script.require("../../../Utilities/Helper.js");
    
    var cacheBuster = Util.Scripts.cacheBuster,
        getNameProps = Util.Entity.getNameProps,
        getUserData = Util.Entity.getUserData,
        updateUserData = Util.Entity.updateUserData,
        makeColor = Util.Color.makeColor,
        vec = Util.Maths.vec;

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init
    var DJ_NAME = "Phlash",
        DJ_TABLE_NAME = "Set_" + DJ_NAME + "_Tables",
        DEBUG = true,
        baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/DomainContent/Rust/DJ-Tools/",
        particlePadLeftModel = "https://hifi-content.s3.amazonaws.com/alan/dev/particle-pad-2.fbx",
        particlePadRightModel = "https://hifi-content.s3.amazonaws.com/alan/dev/particle-pad-1.fbx",
        shortSoundURL = baseURL + 'FlameThrowerBurst.wav',
        longSoundURL = baseURL + 'FlameThrowerRun.wav',
        endPointParticleServerScript = cacheBuster(DEBUG, baseURL, 'DJ_EndPoint_Particle_Server.js'),
        endPointLightServerScript = cacheBuster(DEBUG, baseURL, 'DJ_EndPoint_Light_Server.js'),
        endPointSoundServerScript = cacheBuster(DEBUG, baseURL, 'DJ_EndPoint_Sound_Server.js'),   
        dispatchZoneClientScript = cacheBuster(DEBUG, baseURL, 'DJ_Dispatch_Zone_Client.js'),
        dispatchZoneServerScript = cacheBuster(DEBUG, baseURL, 'DJ_Dispatch_Zone_Server.js'),
        sensorBoxClientScript = cacheBuster(DEBUG, baseURL, 'DJ_Sensor_Box_Client.js'),
        generatorDebugCubeScript = cacheBuster(DEBUG, baseURL, 'DJ_Generator_Debug_Cube_Client.js'),
        emptyServerScript = cacheBuster(DEBUG, baseURL, 'DJ_Empty_ServerScript.js'),
        dispatchZoneID = null,
        CREATE_TIMEOUT = 100,
        LEFT = "Left",
        RIGHT = "Right",
        LEFT_HAND = "LeftHand",
        RIGHT_HAND = "RightHand",
        DEBUG_CUBE = "debugCube",
        GROUP_LEFT = "Group_Left", 
        GROUP_RIGHT = "Group_Right",
        GROUP_ALL = "Group_All",
        GENERATOR = "generator",
        SENSOR = "sensor",
        ENDPOINT = "endPoint",
        SENSOR_BOX_DISTANCE_BACK = -0.70,
        SENSOR_BOX_DISTANCE_LEFT = 0.75;

    // Colections
    var djTableProps = getNameProps(DJ_TABLE_NAME),
        particleBaseProps = {
            type: "ParticleEffect",
            isEmitting: true,
            lifespan: 2.0299999713897705,
            maxParticles: 6717,
            textures: "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
            emitRate: 0,
            emitSpeed: 1.47,
            emitDimensions: {
                x: 0.5,
                y: 0.5,
                z: 0.5
            },
            emitOrientation: {
                x: -90.01,
                y: 0,
                z: 0
            },
            emitterShouldTrail: true,
            particleRadius: 0,
            radiusSpread: 0,
            radiusStart: 0.5799999833106995,
            radiusFinish: 0,
            color: {
                red: 255,
                blue: 255,
                green: 255
            },
            colorSpread: {
                red: 0,
                blue: 0,
                green: 0
            },
            colorStart: {
                red: 255,
                blue: 33,
                green: 33
            },
            colorFinish: {
                red: 239,
                blue: 255,
                green: 13
            },
            emitAcceleration: {
                x: 0.01,
                y: 0.01,
                z: 0.01
            },
            accelerationSpread: {
                x: 1,
                y: 1,
                z: 1
            },
            alpha: 0.6000000238418579,
            alphaSpread: 0,
            alphaStart: 0.09000000357627869,
            alphaFinish: 0,
            polarStart: 0,
            polarFinish: 1.02974,
            azimuthStart: -180.00000500895632,
            azimuthFinish: 180.00000500895632
        },
        lightBaseProps = {
            type: "Light",
            angularDamping: 0,
            color: {
                red: 255,
                blue: 255,
                green: 255
            },
            intensity: 0,
            falloffRadius: 0,
            isSpotlight: 0,
            exponent: 0,
            cutoff: 10,
            collisionless: true
        },
        barrelStageLeftPosition = {
            x: -26.4579,
            y: -9.517,
            z: -23.3428
        },
        barrelStageRightPosition = {
            x: -38.6957,
            y: -9.6874,
            z: -23.3843
        },
        barrelBackRightPosition = {
            x: -37.1513,
            y: -6.5585,
            z: -9.9410
        },
        barrelBackLeftPosition = {
            x: -22.6895,
            y: -6.7763,
            z: -14.6075
        },
        allEntities = [],
        entityNames = [];

    // Procedural Functions
    function deleteIfExists() {
        var deleteNames = Settings.getValue(DJ_NAME + "_EFFECTS");
        var SEARCH_RADIUS = 100;
        if (deleteNames) {
            deleteNames.forEach(function (name) {
                var found = Entities.findEntitiesByName(name, djTableProps[1].position, SEARCH_RADIUS);
                try {
                    if (found[0]) {
                        Entities.deleteEntity(found[0]);
                    }
                } catch (e) {
                    log(LOG_ERROR, "DELETING ENTITY", e);
                }
            });
        }
    }

    function createGeneratorDebugCubeEntity(name, position, dimensions, color, userData, parentID) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        color = color || makeColor(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Box",
            position: position,
            locked: false,
            script: generatorDebugCubeScript,
            serverScripts: emptyServerScript,
            dimensions: dimensions,
            color: color,
            visible: true,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createSensorBoxEntity(name, position, dimensions, color, userData, parentID) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        color = color || makeColor(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Box",
            position: position,
            locked: false,
            script: sensorBoxClientScript,
            serverScripts: emptyServerScript,
            dimensions: dimensions,
            color: color,
            visible: false,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createDispatchZoneEntity(name, position, dimensions, userData, parentID) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Zone",
            position: position,
            locked: false,
            script: dispatchZoneClientScript,
            serverScripts: dispatchZoneServerScript,
            dimensions: dimensions,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createSensorModelEntity(name, position, dimensions, rotation, url, userData, parentID) {
        name = name || "";
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Model",
            modelURL: url,
            position: position,
            rotation: rotation,
            serverScripts: emptyServerScript,
            locked: false,
            dimensions: dimensions,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createParticleEntity(name, position, userData, parentID) {
        name = name || "";
        userData = userData || {};
        var properties = {
            name: name,
            locked: false,
            position: position,
            serverScripts: endPointParticleServerScript,
            parentID: parentID,
            userData: userData
        };
        var finalParticleProps = Object.assign({}, particleBaseProps, properties);
        var id = Entities.addEntity(finalParticleProps);
        return id;
    }

    function createSoundEntity(name, position, dimensions, userData, parentID) {
        name = name || "";
        userData = userData || {};
        var properties = {
            name: name,
            type: "Zone",
            locked: false,
            position: position,
            dimensions: dimensions,
            serverScripts: endPointSoundServerScript,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    } 

    function createLightEntity(name, position, dimensions, rotation, color, isSpot, userData, parentID) {
        name = name || "";
        userData = userData || {};
        var properties = {
            name: name,
            position: position,
            dimensions: dimensions,
            rotation: rotation,
            color: color,     
            locked: false,
            isSpotlight: isSpot,
            serverScripts: endPointLightServerScript,
            parentID: parentID,
            userData: userData
        };
        var finalLightProps = Object.assign({}, lightBaseProps, properties);
        var id = Entities.addEntity(finalLightProps);
        return id;
    }

    function createGeneratorDebugCubes() {
        var name,
            entityID,
            debugPosition,
            stringified,       
            userData = {},
            HEIGHT = 0.0,
            DISTANCE_BACK = -0.9,
            DEBUG_WIDTH = 0.05,
            DEBUG_HEIGHT = 0.05,
            DEBUG_DEPTH = 0.05;
        
        debugPosition = Vec3.sum(
            djTableProps[1].position, 
            vec(0, HEIGHT, DISTANCE_BACK)
        );

        name = "Set_" + DJ_NAME + "_Debug-Cube";
        userData.grabbableKey = { grabbable: true };   
        userData.performance = { type: GENERATOR };
        stringified = JSON.stringify(userData);
        entityID = createGeneratorDebugCubeEntity(
            name,             
            debugPosition, 
            vec(DEBUG_WIDTH, DEBUG_HEIGHT, DEBUG_DEPTH),
            makeColor(255,70,0),
            stringified,
            dispatchZoneID
        );
        allEntities.push(entityID);
        entityNames.push(name);
    }

    function createEndPointParticles() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                name2,
                entityID,
                entID2,
                particlePosition,
                particlePosition2,
                stringified,
                userData = {},
                HEIGHT = 1;

            userData.performance = {
                type: ENDPOINT
            };

            if (side === LEFT) {
                particlePosition = Vec3.sum(
                    barrelStageLeftPosition, 
                    vec(0, HEIGHT, 0)
                );
                particlePosition2 = Vec3.sum(
                    barrelBackLeftPosition, 
                    vec(0, HEIGHT, 0)
                );
                userData.performance.endPointGroupID = GROUP_LEFT;
            } else {
                particlePosition = Vec3.sum(
                    barrelStageRightPosition, 
                    vec(0, HEIGHT, 0)
                );
                particlePosition2 = Vec3.sum(
                    barrelBackRightPosition, 
                    vec(0, HEIGHT, 0)
                );
                userData.performance.endPointGroupID = GROUP_RIGHT;
            }

            name = "Set_" + DJ_NAME + "_Particles_" + side;
            name2 = "Set_" + DJ_NAME + "_Particles_Back_" + side;
            userData.grabbableKey = { grabbable: false };
            userData.performance.DEBUG = DEBUG;
            stringified = JSON.stringify(userData);
            entityID = createParticleEntity(name, particlePosition, stringified, dispatchZoneID);
            entID2 = createParticleEntity(name2, particlePosition2, stringified, dispatchZoneID);
            allEntities.push(entityID, entID2);
            entityNames.push(name, name2);
        });
    }

    function createEndPointSounds() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                name2,
                entityID,
                entID2,
                soundPosition,
                soundPosition2,
                stringified,
                userData = {},
                ZONE_SIZE = 1,
                HEIGHT = 1;

            userData.performance = {
                type: ENDPOINT,
                shortSoundURL: shortSoundURL,
                longSoundURL: longSoundURL
            };

            if (side === LEFT) {
                soundPosition = Vec3.sum(
                    barrelStageLeftPosition, 
                    vec(0, HEIGHT, 0)
                );
                soundPosition2 = Vec3.sum(
                    barrelBackLeftPosition, 
                    vec(0, HEIGHT, 0)
                );
                userData.performance.endPointGroupID = GROUP_LEFT;
            } else {
                soundPosition = Vec3.sum(
                    barrelStageRightPosition, 
                    vec(0, HEIGHT, 0)
                );
                soundPosition2 = Vec3.sum(
                    barrelBackRightPosition, 
                    vec(0, HEIGHT, 0)
                );
                userData.performance.endPointGroupID = GROUP_RIGHT;
            }

            name = "Set_" + DJ_NAME + "_Sounds_" + side;
            name2 = "Set_" + DJ_NAME + "_Sounds_Back_" + side;
            userData.grabbableKey = { grabbable: false };
            userData.performance.DEBUG = DEBUG;
            stringified = JSON.stringify(userData);
            entityID = createSoundEntity(name, soundPosition, vec(ZONE_SIZE, ZONE_SIZE, ZONE_SIZE), stringified, dispatchZoneID);
            entID2 = createSoundEntity(name2, soundPosition2, vec(ZONE_SIZE, ZONE_SIZE, ZONE_SIZE), stringified, dispatchZoneID);
            allEntities.push(entityID, entID2);
            entityNames.push(name, name2);
        });
    }
    
    function createEndPointLights() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                name2,
                entityID,
                entID2,                
                lightPosition,
                lightPosition2,                
                DIMENSION_SIZE = 30,
                lightDimensions = vec(DIMENSION_SIZE, DIMENSION_SIZE, DIMENSION_SIZE),
                lightRotation = Quat.fromPitchYawRollDegrees(0,0,0),
                color = makeColor(70, 90, 100),
                isSpot = false,
                stringified,
                userData = {},
                HEIGHT = 1,
                DISTANCE_LEFT = 0,
                DISTANCE_BACK = 0,
                DISTANCE_BACK2 = 0;

            userData.performance = {
                type: ENDPOINT
            };

            if (side === LEFT) {
                lightPosition = Vec3.sum(
                    barrelStageLeftPosition, 
                    vec(DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                lightPosition2 = Vec3.sum(
                    barrelBackLeftPosition, 
                    vec(DISTANCE_LEFT, HEIGHT, DISTANCE_BACK2)
                );
                userData.performance.endPointGroupID = GROUP_LEFT;
            } else {
                lightPosition = Vec3.sum(
                    barrelStageRightPosition, 
                    vec(-DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                lightPosition2 = Vec3.sum(
                    barrelBackRightPosition, 
                    vec(-DISTANCE_LEFT, HEIGHT, DISTANCE_BACK2)
                );
                userData.performance.endPointGroupID = GROUP_RIGHT;
            }

            name = "Set_" + DJ_NAME + "_Lights_Stage_" + side;
            name2 = "Set_" + DJ_NAME + "_Lights_Back_" + side;            
            userData.grabbableKey = { grabbable: false };
            userData.performance.DEBUG = DEBUG;
            stringified = JSON.stringify(userData);
            entityID = createLightEntity(
                name, 
                lightPosition, 
                lightDimensions,
                lightRotation,
                color,
                isSpot,
                stringified,
                dispatchZoneID
            );
            entID2 = createLightEntity(
                name2, 
                lightPosition2, 
                lightDimensions,
                lightRotation,
                color,
                isSpot,
                stringified,
                dispatchZoneID
            );
            allEntities.push(entityID, entID2);
            entityNames.push(name, name2);

        });
    }

    function createSensorBoxes() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                entityID,
                boxPosition,
                color,
                stringified,
                userData = {},
                BOX_WIDTH = 0.4,
                BOX_HEIGHT = 0.4,
                BOX_DEPTH = 0.4,
                DISTANCE_LEFT = SENSOR_BOX_DISTANCE_LEFT,
                DISTANCE_HEIGHT = BOX_HEIGHT / 2,
                DISTANCE_BACK = SENSOR_BOX_DISTANCE_BACK,
                NORMAL = 0,
                REVERSE = 1;

            userData.performance = {
                type: SENSOR
            };

            if (side === LEFT) {
                boxPosition = Vec3.sum(
                    djTableProps[1].position, 
                    vec(DISTANCE_LEFT, DISTANCE_HEIGHT, DISTANCE_BACK)
                );
                color = makeColor(20, 200, 0);
                userData.performance.directionArray = [NORMAL, NORMAL, NORMAL];
                userData.performance.endPointGroups = [GROUP_LEFT];
            } else {
                boxPosition = Vec3.sum(
                    djTableProps[1].position,
                    vec(-DISTANCE_LEFT, DISTANCE_HEIGHT, DISTANCE_BACK)
                );
                color = makeColor(200, 20, 0);
                userData.performance.directionArray = [REVERSE, NORMAL, NORMAL];
                userData.performance.endPointGroups = [GROUP_RIGHT];
            }
            userData.performance.DEBUG = DEBUG;
            // userData.performance.generatorAccepts = [];
            userData.performance.generatorAccepts = [LEFT_HAND, RIGHT_HAND];
            if (DEBUG) {
                userData.performance.generatorAccepts.push(DEBUG_CUBE);
            }

            userData.grabbableKey = { grabbable: false };
            stringified = JSON.stringify(userData);
            name = "Set_" + DJ_NAME + "_Pad_" + side;
            entityID = createSensorBoxEntity(
                name,                 
                boxPosition, 
                vec(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH), 
                color, 
                stringified,
                dispatchZoneID
            );
            allEntities.push(entityID);
            entityNames.push(name);

        });
    }

    function createSensorBoxModels() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                entityID,
                modelPosition,
                rotation,
                url,
                stringified,
                userData = {},                
                DISTANCE_LEFT = SENSOR_BOX_DISTANCE_LEFT,
                HEIGHT = 0,
                DISTANCE_BACK = SENSOR_BOX_DISTANCE_BACK,
                MODEL_WIDTH = 0.4,
                MODEL_HEIGHT = 0.05,
                MODEL_DEPTH = 0.4;

            if (side === LEFT) {
                modelPosition = Vec3.sum(
                    djTableProps[1].position, 
                    vec(DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                url = particlePadLeftModel;
            } else {
                modelPosition = Vec3.sum(
                    djTableProps[1].position, 
                    vec(-DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                url = particlePadRightModel;
            }
            
            name = "Set_" + DJ_NAME + "_Pad_Models_" + side;
            rotation = Quat.fromPitchYawRollDegrees(0, 180, 0);
            userData.grabbableKey = { grabbable: false };
            userData.performance = { DEBUG: DEBUG };
            stringified = JSON.stringify(userData);
            entityID = createSensorModelEntity(
                name,                 
                modelPosition,
                vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
                rotation,                
                url,
                stringified,
                dispatchZoneID
            );
            allEntities.push(entityID);
            entityNames.push(name);
        });
    }

    function createDispatchZones() {
        var name,
            entityID,
            zonePosition,
            stringified,       
            userData = {},
            HEIGHT = 0.0,
            DISTANCE_BACK = -0.9,
            ZONE_WIDTH = 2,
            ZONE_HEIGHT = 2,
            ZONE_DEPTH = 1.3;

        zonePosition = Vec3.sum(
            djTableProps[1].position, 
            vec(0, HEIGHT, DISTANCE_BACK)
        );

        name = "Set_" + DJ_NAME + "_Dispatch_Zone";
        userData.grabbableKey = { grabbable: false };
        userData.performance = { 
            DEBUG: DEBUG,
            childNamesUpdated: false
        };
        stringified = JSON.stringify(userData);
        entityID = createDispatchZoneEntity(
            name,             
            zonePosition, 
            vec(ZONE_WIDTH, ZONE_HEIGHT, ZONE_DEPTH), 
            stringified
        );
        allEntities.push(entityID);
        entityNames.push(name);
        dispatchZoneID = entityID;
    }

    function updateDispatchZoneChildNames() {
        log(LOG_ENTER, "updating children");
        var namesToUpdate = entityNames.filter(function(name) {
            return name.indexOf("_Dispatch_Zone") === -1;
        });

        var dispatchZoneUserData = getUserData(dispatchZoneID);
        dispatchZoneUserData.performance.childNames = namesToUpdate;
        dispatchZoneUserData.performance.childNamesUpdated = true;
        updateUserData(dispatchZoneID, dispatchZoneUserData);
    }

    // Main
    deleteIfExists();

    createDispatchZones();

    Script.setTimeout(function() {
        if (DEBUG) {
            createGeneratorDebugCubes();
        }
        createSensorBoxes();
        createSensorBoxModels();
        createEndPointParticles();
        createEndPointLights();
        createEndPointSounds();
        updateDispatchZoneChildNames();

    }, CREATE_TIMEOUT);


    Settings.setValue(DJ_NAME + "_EFFECTS", entityNames);

    // Cleanup
    function scriptEnding() {
        allEntities.forEach(function (entity) {
            Entities.deleteEntity(entity);
        });
    }

    Script.scriptEnding.connect(scriptEnding);
}());
