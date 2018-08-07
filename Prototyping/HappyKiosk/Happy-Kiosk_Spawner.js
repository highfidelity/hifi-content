// Happy-Kiosk_Spawner.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// Currently custom made for Rust content set (relies on Phlash's tables for layout)

(function () {
    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?");

    var cacheBuster = Util.Scripts.cacheBuster,
        findSurfaceBelowPosition = Util.Maths.findSurfaceBelowPosition,
        getNameProps = Util.Entity.getNameProps,
        getUserData = Util.Entity.getUserData,
        inFrontOf = Util.Avatar.inFrontOf,
        makeColor = Util.Color.makeColor,
        updateUserData = Util.Entity.updateUserData,
        vec = Util.Maths.vec;

    // Log Setup
    var LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE, 
        LOG_CONFIG = {
            "Log_Enter": true,
            "Log_Update": true,
            "Log_Error": true,
            "Log_Value": true,
            "LOG_ARCHIVE": false
        },
        log = Util.Debug.log(LOG_CONFIG);  
    
    // Init
    var BASE_NAME = "HappyKiosk_",
        baseURL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Scripts/hifi-content/Prototyping/HappyKiosk/",
        debug = true,
        kioskZoneScriptServer = cacheBuster(debug, baseURL, "Happy-Kiosk_Zone_Server.js"),
        kioskZoneScriptClient = cacheBuster(debug, baseURL, "Happy-Kiosk_Zone_Client.js"),
        kioskTextScriptServer = cacheBuster(debug, baseURL, "Happy-Kiosk_Text_Server.js"),
        kioskButtonScriptClient = cacheBuster(debug, baseURL, "Happy-Kiosk_Button_Client.js"),
        kioskButtonScriptServer = cacheBuster(debug, baseURL, "Happy-Kiosk_Button_Server.js"),
        kioskEmptyScriptServer = cacheBuster(debug, baseURL, "Happy-Kiosk_Empty_Server.js"),
        kioskBaseModel = baseURL + "Models/NPS-Machine-base.fbx",
        kioskButtonModel = baseURL + "Models/NPS-button-1.fbx",
        kioskFeetModel = baseURL + "Models/footprint-standpoint.fbx",
        button1OnTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button1-on.jpg",
        button1OffTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button1-off.jpg",
        button2OnTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button2-on.jpg",
        button2OffTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button2-off.jpg",
        button3OnTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button3-on.jpg",
        button3OffTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button3-off.jpg",
        button4OnTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button4-on.jpg",
        button4OffTexture = baseURL + "Models/NPS-button-1.fbx/NPS-button-1.fbm/button4-off.jpg",
        feetPosition = findSurfaceBelowPosition(MyAvatar.position),
        kioskZoneID = null;
    
    // Const
    var SEARCH_RADIUS = 10,
        CREATE_TIMEOUT = 1000;
        
    // Collections
    var allEnts = [],
        entityNames = [];

    // Procedural
    function deleteIfExists() {
        var deleteNames = Settings.getValue(BASE_NAME);
        var SEARCH_RADIUS = 10;
        if (deleteNames) {
            deleteNames.forEach(function (name) {
                var found = Entities.findEntitiesByName(name, MyAvatar.position, SEARCH_RADIUS);
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

    function updateDispatchZoneChildNames() {
        log(LOG_ENTER, "updating children");
        var namesToUpdate = entityNames.filter(function(name) {
            return name.indexOf("Zone") === -1;
        });

        var dispatchZoneUserData = getUserData(kioskZoneID);
        dispatchZoneUserData.kiosk.childNames = namesToUpdate;
        dispatchZoneUserData.kiosk.childNamesUpdated = true;
        updateUserData(kioskZoneID, dispatchZoneUserData);
    }

    function createHappyKioskZone(){
        var name,
            entityID,
            zonePosition,
            stringified,       
            userData = {},
            HEIGHT = -0.5,
            DISTANCE_BACK = 0,
            ZONE_WIDTH = 1.0,
            ZONE_HEIGHT = 2.5,
            ZONE_DEPTH = 1.7;

        var localOffset = {x: 0.0, y: HEIGHT, z: -1.05};
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        zonePosition = Vec3.sum(MyAvatar.position, worldOffset);

        name = BASE_NAME + "Zone";
        userData.grabbableKey = { grabbable: false };
        userData.kiosk = { 
            DEBUG: debug,
            childNamesUpdated: false,
            event: "test",
            url: "https://script.google.com/macros/s/AKfycbyWC4btUmE3LD6_dV2Nfkoc6C9FPKtRwtQRr23dNAMcX2ur-f0u/exec"
        };
        stringified = JSON.stringify(userData);
        entityID = createHappyKioskZoneEntity(
            name,             
            zonePosition,
            MyAvatar.orientation, 
            vec(ZONE_WIDTH, ZONE_HEIGHT, ZONE_DEPTH), 
            stringified
        );
        allEnts.push(entityID);
        entityNames.push(name);
        kioskZoneID = entityID;
    }

    function createHappyKioskZoneEntity(name, position, rotation, dimensions, userData) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Box",
            position: position,
            rotation: rotation,
            locked: false,
            script: kioskZoneScriptClient,
            serverScripts: kioskZoneScriptServer,
            dimensions: dimensions,
            collisionless: true,
            visible: false,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createBaseModel() {
        var name,
            entID,
            modelPosition,
            url,
            stringified,
            userData = {},                
            DISTANCE_LEFT = 0.52,
            HEIGHT = 0.25,
            DISTANCE_BACK = -0.70,
            MODEL_WIDTH = 1.8413,
            MODEL_HEIGHT = 0.7934,
            MODEL_DEPTH = 0.8705;

        var localOffset = {x: 0.0, y: HEIGHT, z: -1.5};
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        modelPosition = Vec3.sum(MyAvatar.position, worldOffset);

        url = kioskBaseModel;
        
        name = BASE_NAME + "Base_Model";
        userData.grabbableKey = { grabbable: false };
        userData.kiosk = { DEBUG: debug };
        stringified = JSON.stringify(userData);
        entID = createBaseModelEntity(
            name,                 
            modelPosition,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
            MyAvatar.orientation,                
            url,
            stringified,
            kioskZoneID
        );
        allEnts.push(entID);
        entityNames.push(name);
    }

    function createBaseModelEntity(name, position, dimensions, rotation, url, userData, parentID) {
        log(LOG_ENTER, "in crate base model entity");

        name = name || "";
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Model",
            modelURL: url,
            shapeType: "simple-compound",
            position: position,
            rotation: rotation,
            serverScripts: kioskEmptyScriptServer,
            locked: false,
            dimensions: dimensions,
            collisionless: false,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }
    
    function createBaseShape() {
        var name,
            entID,
            basePosition,
            stringified,
            userData = {},                
            DISTANCE_LEFT = 0.52,
            HEIGHT = -0.5,
            DISTANCE_BACK = -1.5,
            MODEL_WIDTH = 0.2394,
            MODEL_HEIGHT = 1.0097,
            MODEL_DEPTH = 0.6113;

        var localOffset = {x: 0.0, y: HEIGHT, z: DISTANCE_BACK};
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        basePosition = Vec3.sum(MyAvatar.position, worldOffset);

        var localRotation = Quat.fromPitchYawRollDegrees(0,90,0);
        var finalRotation = Quat.multiply(MyAvatar.orientation, localRotation);

        name = BASE_NAME + "Base_Shape";
        userData.grabbableKey = { grabbable: false };
        userData.kiosk = { DEBUG: debug };
        stringified = JSON.stringify(userData);
        entID = createBaseShapeEntity(
            name,                 
            basePosition,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
            finalRotation,                
            makeColor(227, 225, 225),
            stringified,
            kioskZoneID
        );
        allEnts.push(entID);
        entityNames.push(name);
    }

    function createBaseShapeEntity(name, position, dimensions, rotation, color, userData, parentID) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        color = color || makeColor(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Shape",
            shape: "Cylinder",
            position: position,
            locked: false,
            dimensions: dimensions,
            rotation: rotation,
            color: color,
            visible: true,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createButtonModels() {
        ["1", "2", "3", "4"].forEach(function(rating, index){
            var name,
                entID,
                modelPosition,
                url,
                stringified,
                userData = {},
                localOffset = {},                
                DISTANCE_LEFT = -0.48,
                HEIGHT = 0.035,
                DISTANCE_BACK = -1.45,
                DISTANCE_BETWEEN = 0.05,
                MODEL_WIDTH = 0.2019,
                MODEL_HEIGHT = 0.1501,
                MODEL_DEPTH = 0.2019;

            url = kioskButtonModel; 
            userData.kiosk = { 
                DEBUG: debug
            };
            switch (rating) {
                case "1":
                    localOffset = {x: DISTANCE_LEFT, y: HEIGHT, z: DISTANCE_BACK};
                    userData.kiosk.rating = 1;
                    userData.kiosk.onTexture = button1OnTexture;
                    userData.kiosk.offTexture = button1OffTexture;
                    break;
                case "2":
                    localOffset = {x: DISTANCE_LEFT + ((MODEL_WIDTH + DISTANCE_BETWEEN) * index), y: HEIGHT, z: DISTANCE_BACK};
                    userData.kiosk.rating = 2;
                    userData.kiosk.onTexture = button2OnTexture;
                    userData.kiosk.offTexture = button2OffTexture;
                    break;
                case "3":
                    localOffset = {x: DISTANCE_LEFT + ((MODEL_WIDTH + DISTANCE_BETWEEN) * index + 0.02), y: HEIGHT, z: DISTANCE_BACK};
                    userData.kiosk.rating = 3;
                    userData.kiosk.onTexture = button3OnTexture;
                    userData.kiosk.offTexture = button3OffTexture;
                    break;
                case "4":
                    localOffset = {x: DISTANCE_LEFT + ((MODEL_WIDTH + DISTANCE_BETWEEN ) * index + 0.02), y: HEIGHT, z: DISTANCE_BACK};
                    userData.kiosk.rating = 4;
                    userData.kiosk.onTexture = button4OnTexture;
                    userData.kiosk.offTexture = button4OffTexture;
                    break;
                default:
            }
            
            var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
            modelPosition = Vec3.sum(MyAvatar.position, worldOffset);
            
            name = BASE_NAME + "Button_" + rating;
            userData.grabbableKey = { grabbable: false, wantsTrigger: true };

            stringified = JSON.stringify(userData);
            entID = createButtonModelEntities(
                name,                 
                modelPosition,
                vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
                MyAvatar.orientation,                
                url,
                stringified,
                kioskZoneID
            );
            allEnts.push(entID);
            entityNames.push(name);
        });
    }

    function createButtonModelEntities(name, position, dimensions, rotation, url, userData, parentID) {
        name = name || "";
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Model",
            modelURL: url,
            shapeType: "simple-compound",
            position: position,
            rotation: rotation,
            script: kioskButtonScriptClient,
            serverScripts: kioskButtonScriptServer,
            locked: false,
            dimensions: dimensions,
            collisionless: false,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }
    
    function createFeetModel() {
        var name,
            entID,
            modelPosition,
            url,
            stringified,
            userData = {},                
            DISTANCE_LEFT = 0.52,
            HEIGHT = 0.01,
            DISTANCE_BACK = -0.75,
            MODEL_WIDTH = 0.9852,
            MODEL_HEIGHT = 0.0010,
            MODEL_DEPTH = 0.98525;

        var localOffset = {x: 0.0, y: HEIGHT, z: DISTANCE_BACK};
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        var floorPosition = vec(MyAvatar.position.x, feetPosition.y, MyAvatar.position.z);
        modelPosition = Vec3.sum(floorPosition, worldOffset);

        var localRotation = Quat.fromPitchYawRollDegrees(0,0,0);
        var finalRotation = Quat.multiply(MyAvatar.orientation, localRotation);

        url = kioskFeetModel;
        
        name = BASE_NAME + "Feet";
        userData.grabbableKey = { grabbable: false };
        userData.kiosk = { DEBUG: debug };
        stringified = JSON.stringify(userData);
        entID = createFeetModelEntity(
            name,                 
            modelPosition,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
            finalRotation,                
            url,
            stringified,
            kioskZoneID
        );
        allEnts.push(entID);
        entityNames.push(name);
    }

    function createFeetModelEntity(name, position, dimensions, rotation, url, userData, parentID) {
        name = name || "";
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Model",
            modelURL: url,
            shapeType: "simple-compound",
            position: position,
            rotation: rotation,
            script: kioskButtonScriptClient,
            serverScripts: kioskButtonScriptServer,
            locked: false,
            dimensions: dimensions,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createBaseShape() {
        var name,
            entID,
            basePosition,
            stringified,
            userData = {},                
            DISTANCE_LEFT = 0.52,
            HEIGHT = -0.5,
            DISTANCE_BACK = -1.5,
            MODEL_WIDTH = 0.2394,
            MODEL_HEIGHT = 1.0097,
            MODEL_DEPTH = 0.6113;

        var localOffset = {x: 0.0, y: HEIGHT, z: DISTANCE_BACK};
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        basePosition = Vec3.sum(MyAvatar.position, worldOffset);

        var localRotation = Quat.fromPitchYawRollDegrees(0,90,0);
        var finalRotation = Quat.multiply(MyAvatar.orientation, localRotation);

        name = BASE_NAME + "Base_Shape";
        userData.grabbableKey = { grabbable: false };
        userData.kiosk = { DEBUG: debug };
        stringified = JSON.stringify(userData);
        entID = createBaseShapeEntity(
            name,                 
            basePosition,
            vec(MODEL_WIDTH, MODEL_HEIGHT, MODEL_DEPTH), 
            finalRotation,                
            makeColor(227, 225, 225),
            stringified,
            kioskZoneID
        );
        allEnts.push(entID);
        entityNames.push(name);
    }

    function createBaseShapeEntity(name, position, dimensions, rotation, color, userData, parentID) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        color = color || makeColor(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Shape",
            shape: "Cylinder",
            position: position,
            locked: false,
            dimensions: dimensions,
            rotation: rotation,
            color: color,
            visible: true,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    function createTextBox() {
        var name,
            entID,
            basePosition,
            stringified,
            userData = {},                
            DISTANCE_LEFT = -0.06,
            HEIGHT = 0.05,
            DISTANCE_BACK = -1.2,
            TEXT_WIDTH = 0.3873,
            TEXT_HEIGHT = 0.1257,
            TEXT_DEPTH = 0.0100;

        var localOffset = {x: DISTANCE_LEFT, y: HEIGHT, z: DISTANCE_BACK};
        var worldOffset = Vec3.multiplyQbyV(MyAvatar.orientation, localOffset);
        basePosition = Vec3.sum(MyAvatar.position, worldOffset);

        var localRotation = Quat.fromPitchYawRollDegrees(-90,0,0);
        var finalRotation = Quat.multiply(MyAvatar.orientation, localRotation);

        name = BASE_NAME + "Text";
        userData.grabbableKey = { grabbable: false };
        userData.kiosk = { DEBUG: debug };
        stringified = JSON.stringify(userData);
        entID = createTextBoxEntity(
            name,                 
            basePosition,
            vec(TEXT_WIDTH, TEXT_HEIGHT, TEXT_DEPTH), 
            finalRotation,                
            makeColor(0, 0, 0),
            makeColor(209, 208, 203),
            stringified,
            kioskZoneID
        );
        allEnts.push(entID);
        entityNames.push(name);
    }

    function createTextBoxEntity(name, position, dimensions, rotation, textColor, backgroundColor, userData, parentID) {
        name = name || 1;
        dimensions = dimensions || vec(1, 1, 1);
        userData = userData || {};
        var properties = {
            name: name,
            type: "Text",
            text: "THANKS!",
            lineHeight: 0.0850,
            position: position,
            locked: false,
            dimensions: dimensions,
            serverScripts: kioskTextScriptServer,
            rotation: rotation,
            textColor: textColor,
            backgroundColor: backgroundColor,
            visible: false,
            collisionless: true,
            parentID: parentID,
            userData: userData
        };
        var id = Entities.addEntity(properties);
        return id;
    }

    // Main
    deleteIfExists();

    createHappyKioskZone();

    Script.setTimeout(function() {
        createBaseModel();
        createBaseShape();
        createButtonModels();
        createFeetModel();
        createTextBox();
        updateDispatchZoneChildNames();
    }, CREATE_TIMEOUT);

    log(LOG_VALUE, "allEnts", allEnts);

    Settings.setValue(BASE_NAME, entityNames);

    // Cleanup
    function scriptEnding() {
        if (debug) {
            allEnts.forEach(function (ent) {
                Entities.deleteEntity(ent);
            });
        }
    }

    Script.scriptEnding.connect(scriptEnding);
})();