(function () {
    // Init
    var PHLASH_TABLE_NAME = "Set_Phlash_Tables",
        baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Hifi/Scripts/DJ-Tools/",
        particlePadLeftModel = "https://hifi-content.s3.amazonaws.com/alan/dev/particle-pad-1.fbx",
        particlePadRightModel = "https://hifi-content.s3.amazonaws.com/alan/dev/particle-pad-2.fbx",
        particleScriptServer = baseURL + 'DJ_EndPoint_Particle_Server.js',
        lightScriptServer = baseURL + 'DJ_EndPoint_Light_Server.js',        
        zoneScript = baseURL + 'DJ_Input_Zone_Client.js',
        DEBUG = true,
        LEFT = "Left",
        RIGHT = "Right",
        GROUP_LEFT = "Group_Left",
        GROUP_RIGHT = "Group_Right",
        DEBUG_CUBE = "debugCube",      
        INPUT = "input",
        ENDPOINT = "endPoint";

    // Polyfill
    Script.require(Script.resolvePath("./Polyfills.js"))();

    // Colections
    var phlashProps = gProps(PHLASH_TABLE_NAME),
        allEnts = [],
        particleBaseProps = {
            "type": "ParticleEffect",
            "isEmitting": true,
            "lifespan": "2.0299999713897705",
            "maxParticles": "6717",
            "textures": "http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
            "emitRate": "0",
            "emitSpeed": "1.47",
            "emitDimensions": {
                "x": "0.5",
                "y": "0.5",
                "z": "0.5"
            },
            "emitOrientation": {
                "x": "-90.01",
                "y": "0",
                "z": "0"
            },
            "emitterShouldTrail": true,
            "particleRadius": "0",
            "radiusSpread": "4",
            "radiusStart": "0.5799999833106995",
            "radiusFinish": "0",
            "color": {
                "red": "255",
                "blue": "255",
                "green": "255"
            },
            "colorSpread": {
                "red": "0",
                "blue": "0",
                "green": "0"
            },
            "colorStart": {
                "red": "255",
                "blue": "33",
                "green": "33"
            },
            "colorFinish": {
                "red": "239",
                "blue": "255",
                "green": "13"
            },
            "emitAcceleration": {
                "x": "0.01",
                "y": "0.01",
                "z": "0.01"
            },
            "accelerationSpread": {
                "x": "1",
                "y": "1",
                "z": "1"
            },
            "alpha": "0.6000000238418579",
            "alphaSpread": "0",
            "alphaStart": "0.09000000357627869",
            "alphaFinish": "0",
            "polarStart": "0",
            "polarFinish": "1.02974",
            "azimuthStart": "-180.00000500895632",
            "azimuthFinish": "180.00000500895632"
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
            exponent: 1,
            cutoff: 10,
            collisionless: true
        },
        barrelStageLeftPosition = {
            x: -26.4579,
            y: 4989.7456,
            z: -23.3428
        },
        barrelStageRightPosition = {
            x: -38.6957,
            y: 4989.5752,
            z: -23.3843
        },
        entityNames = [
            "Set_Phlash_Pad_Models_Left",
            "Set_Phlash_Pad_Models_Right",
            "Set_Phlash_Pad_Left",
            "Set_Phlash_Pad_Right",
            "Set_Phlash_Pad_Zone",
            "Set_Phlash_Particles_Left",
            "Set_Phlash_Particles_Right",
            "Set_Phlash_Debug-Cube",
            "Set_Phlash_Lights_Stage_Left",
            "Set_Phlash_Lights_Stage_Right",
            "Set_Phlash_Lights_Back_Left",
            "Set_Phlash_Lights_Back_Right"           
        ];

    // Helper Functions
    function col(r, g, b) {
        var obj = {};
        obj.red = r;
        obj.green = g;
        obj.blue = b;
        return obj;
    }

    function vec(x, y, z) {
        var obj = {};
        obj.x = x;
        obj.y = y;
        obj.z = z;
        return obj;
    }

    function gProps(name) {
        var ents = Entities.findEntitiesByName(name, MyAvatar.position, 20)[0];
        if (ents.length > 0) {
            return [ents, Entities.getEntityProperties(ents)];
        }
    }

    function makeDebugCube(name, pos, dim, color, userData) {
        name = name || 1;
        dim = dim || vec(1, 1, 1);
        color = color || col(1, 1, 1);
        userData = userData || {};
        var props = {
            name: name,
            type: "Box",
            position: pos,
            locked: false,
            dimensions: dim,
            color: color,
            visible: true,
            collisionless: true,
            userData: userData
        };
        var id = Entities.addEntity(props);
        return id;
    }

    function makeBox(name, pos, dim, color, userData) {
        name = name || 1;
        dim = dim || vec(1, 1, 1);
        color = color || col(1, 1, 1);
        userData = userData || {};
        var props = {
            name: name,
            type: "Box",
            position: pos,
            locked: false,
            dimensions: dim,
            color: color,
            visible: false,
            collisionless: true,
            userData: userData
        };
        var id = Entities.addEntity(props);
        return id;
    }

    function makeZone(name, pos, dim, userData) {
        name = name || 1;
        dim = dim || vec(1, 1, 1);
        userData = userData || {};
        var props = {
            name: name,
            type: "Zone",
            position: pos,
            locked: false,
            script: zoneScript + "?v=" + Date.now(),
            dimensions: dim,
            collisionless: true,
            userData: userData
        };
        var id = Entities.addEntity(props);
        return id;
    }

    function makeModel(name, pos, dim, rot, url, userData) {
        name = name || "";
        dim = dim || vec(1, 1, 1);
        userData = userData || {};
        var props = {
            name: name,
            type: "Model",
            modelURL: url,
            position: pos,
            rotation: rot,
            locked: false,
            dimensions: dim,
            collisionless: true,
            userData: userData
        };
        var id = Entities.addEntity(props);
        return id;
    }

    function makeParticle(name, pos, userData) {
        name = name || "";
        userData = userData || {};
        var props = {
            name: name,
            locked: false,
            position: pos,
            serverScripts: particleScriptServer + "?v=" + Date.now(),
            userData: userData
        };
        var finalParticleProps = Object.assign({}, particleBaseProps, props);
        var id = Entities.addEntity(finalParticleProps);
        return id;
    } 

    function makeLight(name, pos, dim, rot, color, isSpot, userData) {
        name = name || "";
        userData = userData || {};
        var props = {
            name: name,
            position: pos,
            dimensions: dim,
            rotation: rot,
            color: color,     
            locked: false,
            isSpotlight: isSpot,
            serverScripts: lightScriptServer + "?v=" + Date.now(),
            userData: userData
        };
        var finalLightProps = Object.assign({}, lightBaseProps, props);
        var id = Entities.addEntity(finalLightProps);
        return id;
    }

    // Procedural Functions
    function deleteIfExists() {
        entityNames.forEach(function (names) {
            var found = Entities.findEntitiesByName(names, phlashProps[1].position, 20);
            if (found.length === 1) {
                Entities.deleteEntity(found[0]);
            }
        });
    }

    function createDebugCube() {
        var name,
            entID,
            debugPos,
            stringified,       
            userData = {},
            HEIGHT = 0.0,
            DISTANCE_BACK = -0.9,
            DEBUG_WIDTH = 0.05,
            DEBUG_HEIGHT = 0.05,
            DEBUG_DEPTH = 0.05;
        
        debugPos = Vec3.sum(
            phlashProps[1].position, 
            vec(0, HEIGHT, DISTANCE_BACK)
        );

        name = "Set_Phlash_Debug-Cube";
        userData.grabbableKey = { grabbable: true };   
        userData.performance = { type: DEBUG_CUBE };     
        stringified = JSON.stringify(userData);
        entID = makeDebugCube(
            name,             
            debugPos, 
            vec(DEBUG_WIDTH, DEBUG_HEIGHT, DEBUG_DEPTH),
            col(255,70,0),
            stringified
        );
        allEnts.push(entID);
    }

    function createDJEndpointParticles() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                entID,
                partPos,
                stringified,
                userData = {},
                HEIGHT = 1;

            userData.performance = {
                type: ENDPOINT
            };

            if (side === LEFT) {
                partPos = Vec3.sum(
                    barrelStageLeftPosition, 
                    vec(0, HEIGHT, 0)
                );
                userData.performance.endPointGroupID = GROUP_LEFT;
            } else {
                partPos = Vec3.sum(
                    barrelStageRightPosition, 
                    vec(0, HEIGHT, 0)
                );
                userData.performance.endPointGroupID = GROUP_RIGHT;
            }

            name = "Set_Phlash_Particles_" + side;
            userData.grabbableKey = { grabbable: false };
            stringified = JSON.stringify(userData);
            console.log("particle uderdata:", stringified);
            
            entID = makeParticle(name, partPos, stringified);
            allEnts.push(entID);
        });
    }
    
    function createDJEndpointLights() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                name2,
                entID,
                entID2,                
                lightPos,
                lightPos2,                
                DIM_SIZE = 10,
                lightDim = vec(DIM_SIZE,DIM_SIZE,DIM_SIZE),
                lightRot = Quat.fromPitchYawRollDegrees(0,0,0),
                color = col(70, 90, 100),
                isSpot = false,
                stringified,
                userData = {},
                HEIGHT = -1,
                DISTANCE_LEFT = 1,
                DISTANCE_BACK = 0,
                DISTANCE_BACK2 = 10;

            userData.performance = {
                type: ENDPOINT
            };

            if (side === LEFT) {
                lightPos = Vec3.sum(
                    phlashProps[1].position, 
                    vec(DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                lightPos2 = Vec3.sum(
                    phlashProps[1].position, 
                    vec(DISTANCE_LEFT, HEIGHT, DISTANCE_BACK2)
                );
                userData.performance.endPointGroupID = GROUP_LEFT;
            } else {
                lightPos = Vec3.sum(
                    phlashProps[1].position, 
                    vec(-DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                lightPos2 = Vec3.sum(
                    phlashProps[1].position, 
                    vec(-DISTANCE_LEFT, HEIGHT, DISTANCE_BACK2)
                );
                userData.performance.endPointGroupID = GROUP_RIGHT;
            }

            name = "Set_Phlash_Lights_Stage_" + side;
            name2 = "Set_Phlash_Lights_Back_" + side;            
            userData.grabbableKey = { grabbable: false };
            stringified = JSON.stringify(userData);
            entID = makeLight(
                name, 
                lightPos, 
                lightDim,
                lightRot,
                color,
                isSpot,
                stringified
            );
            entID2 = makeLight(
                name2, 
                lightPos2, 
                lightDim,
                lightRot,
                color,
                isSpot,
                stringified
            );
            allEnts.push(entID, entID2);
        });
    }

    function createDJInputPadSensors() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                entID,
                boxPos,
                color,
                stringified,
                userData = {},
                BOX_WIDTH = 0.4,
                BOX_HEIGHT = 0.4,
                BOX_DEPTH = 0.4,
                DISTANCE_LEFT = 0.52,
                DISTANCE_HEIGHT = BOX_HEIGHT / 2,
                DISTANCE_BACK = -0.70,
                NORMAL = 0,
                REVERSE = 1;

            userData.performance = {
                type: INPUT
            };

            if (side === LEFT) {
                boxPos = Vec3.sum(
                    phlashProps[1].position, 
                    vec(DISTANCE_LEFT, DISTANCE_HEIGHT, DISTANCE_BACK)
                );
                color = col(20, 200, 0);
                userData.performance.directionArray = [NORMAL, NORMAL, NORMAL];
                userData.performance.endPointGroups = [GROUP_LEFT];
            } else {
                boxPos = Vec3.sum(
                    phlashProps[1].position,
                    vec(-DISTANCE_LEFT, DISTANCE_HEIGHT, DISTANCE_BACK)
                );
                color = col(200, 20, 0);
                userData.performance.directionArray = [REVERSE, NORMAL, NORMAL];
                userData.performance.endPointGroups = [GROUP_RIGHT];
            }

            userData.grabbableKey = { grabbable: false };
            stringified = JSON.stringify(userData);
            name = "Set_Phlash_Pad_" + side;
            entID = makeBox(
                name,                 
                boxPos, 
                vec(BOX_WIDTH, BOX_HEIGHT, BOX_DEPTH), 
                color, 
                stringified
            );
            allEnts.push(entID);
        });
    }

    function createDJInputPadModels() {
        [LEFT, RIGHT].forEach(function (side) {
            var name,
                entID,
                modelPos,
                rotation,
                url,
                stringified,
                userData = {},                
                DISTANCE_LEFT = 0.52,
                HEIGHT = 0,
                DISTANCE_BACK = -0.70,
                MODEL_WIDTH = 0.4,
                MODEL_HEIGHT = 0.05,
                MODEL_DEPTH = 0.4;

            if (side === LEFT) {
                modelPos = Vec3.sum(
                    phlashProps[1].position, 
                    vec(DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                url = particlePadLeftModel;
            } else {
                modelPos = Vec3.sum(
                    phlashProps[1].position, 
                    vec(-DISTANCE_LEFT, HEIGHT, DISTANCE_BACK)
                );
                url = particlePadRightModel;
            }
            
            name = "Set_Phlash_Pad_Models_" + side;
            rotation = Quat.fromPitchYawRollDegrees(0, 180, 0);
            userData.grabbableKey = { grabbable: false };
            stringified = JSON.stringify(userData);
            entID = makeModel(
                name,                 
                modelPos,
                vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
                rotation,                
                url,
                stringified
            );
            allEnts.push(entID);
        });
    }

    function createDJInputZone() {
        var name,
            entID,
            zonePos,
            stringified,       
            userData = {},
            HEIGHT = 0.0,
            DISTANCE_BACK = -0.9,
            ZONE_WIDTH = 2,
            ZONE_HEIGHT = 2,
            ZONE_DEPTH = 1.3;

        zonePos = Vec3.sum(
            phlashProps[1].position, 
            vec(0, HEIGHT, DISTANCE_BACK)
        );

        name = "Set_Phlash_Pad_Zone";
        userData.grabbableKey = { grabbable: false };        
        stringified = JSON.stringify(userData);
        entID = makeZone(
            name,             
            zonePos, 
            vec(ZONE_WIDTH, ZONE_HEIGHT, ZONE_DEPTH), 
            stringified
        );
        allEnts.push(entID);
    }

    // Main
    deleteIfExists();
    if (DEBUG) {
        createDebugCube();
    }
    createDJInputZone();
    createDJInputPadSensors();
    createDJInputPadModels();
    createDJEndpointParticles();
    createDJEndpointLights();

    // Cleanup
    function scriptEnding() {
        console.log("### in script ending");
        allEnts.forEach(function (ent) {
            Entities.deleteEntity(ent);
        });
    }

    Script.scriptEnding.connect(scriptEnding);
}());