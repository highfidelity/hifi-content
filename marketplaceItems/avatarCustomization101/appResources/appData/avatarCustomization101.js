//
//  avatarCustomization101.js
//
//  Blueprint App to teach users how to use materials, blendshapes, and flow for their avatars.
// 
//  Created by Robin Wilson and Mark Brosche 2/20/2019
//  Avatar created by Jimi Youm 2/20/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global GlobalDebugger */

(function () {
    // Modules
    Script.include(Script.resolvePath("./resources/modules/flow.js?v12"));

    var AppUi = Script.require("appUi"),
        URL = Script.resolvePath("./resources/avatarCustomization101_ui.html?v12344555"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v22222222111")),
        BLENDSHAPE_DATA = Script.require(Script.resolvePath("./resources/modules/blendshapes.js?v1")),
        MATERIAL_DATA = Script.require(Script.resolvePath("./resources/modules/materials.js?v1234")),
        AVATAR_URL = Script.resolvePath("./resources/avatar/avatar.fst");

    var DEBUG = false;

    // #region UTILITY FUNCTIONS

    // Deep copy object utility
    function deepCopy(objectToCopy) {

        var newObject;

        try {
            newObject = JSON.parse(JSON.stringify(objectToCopy));
        } catch (e) {
            console.error("Error with deepCopy utility method" + e);
        }

        return newObject;
    }


    // Color functions found https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
    // Convert color format hex to rgb
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    var BITS_16 = 16;
    var SHIFT_LEFT_24 = 24;
    var SHIFT_LEFT_16 = 16;
    var SHIFT_LEFT_8 = 8;
    // Convert color format rgb to hex
    function rgbToHex(colorObject) {
        var r = colorObject.r;
        var g = colorObject.g;
        var b = colorObject.b;

        var str = "" + ((1 << SHIFT_LEFT_24) + (r << SHIFT_LEFT_16) + (g << SHIFT_LEFT_8) + b).toString(BITS_16).slice(1);
        if (DEBUG) {
            print("RgbToHex" + str);
        }
        return str;
    }


    var RGB_255 = 255.0;
    // Convert color format array to rgb
    function arrayToRGB(color) {

        if (Array.isArray(color)) {
            var rgbFormat = {
                r: Math.floor( color[0] * RGB_255 ),
                g: Math.floor( color[1] * RGB_255 ),
                b: Math.floor( color[2] * RGB_255 )
            };

            if (DEBUG) {
                print("arrayToRGB" + JSON.stringify(rgbFormat));
            }

            return rgbFormat;
        } else {
            return color;
        }
    }
    // #endregion UTILITY FUNCTIONS

    // #region MIRROR FUNCTIONS

    var MIRROR_DISTANCE_M = 0.5;
    var mirrorCubeID;
    var mirrorZoneID;
    // Creates mirror
    function spawnMirror() {

        var position = Vec3.sum(
            MyAvatar.position, 
            Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0.5, z: -MIRROR_DISTANCE_M })
        );
        mirrorCubeID = Entities.addEntity({
            type: "Box",
            name: "mirror",
            dimensions: {
                "x": 0.6,
                "y": 0.7,
                "z": 0.001
            },
            position: position,
            rotation: MyAvatar.orientation,
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",
            collisionless: true,
            script: Script.resolvePath("./resources/modules/mirrorClient.js")
        }, "avatar");

    }

    // Delete mirror entity
    function deleteMirror() {
        // Delete mirror entity if it exists
        if (mirrorCubeID) {
            Entities.deleteEntity(mirrorCubeID);
            mirrorCubeID = null;
        }

        if (mirrorZoneID) {
            Entities.deleteEntity(mirrorZoneID);
            mirrorZoneID = null;
        }

    }

    // #endregion MIRROR FUNCTIONS

    // #region AVATAR FUNCTIONS

    var STRING_BOOKMARK_NAME = CONFIG.STRING_BOOKMARK_NAME;
    // Bookmark avatar with wearables
    function bookmarkAvatar() {
        AvatarBookmarks.addBookmark(STRING_BOOKMARK_NAME);
    }

    // Save and change the avatar to Avi
    function saveAvatarAndChangeToAvi() {
        bookmarkAvatar();
        changeAvatarToAvi();
    }

    // Load saved avatar if saved, if not send user an alert
    function restoreAvatar() {
        var bookmarksObject = AvatarBookmarks.getBookmarks();

        if (bookmarksObject[STRING_BOOKMARK_NAME]) {
            AvatarBookmarks.loadBookmark(STRING_BOOKMARK_NAME);
            AvatarBookmarks.removeBookmark(STRING_BOOKMARK_NAME);
            setIsAviEnabledFalse();
        } else {
            Window.alert("No bookmark was saved in the avatar app.");
        }

    }

    // Switch avatar to Avi
    // Update state to avi to enabled
    function changeAvatarToAvi() {
        // Set avatar to Avi.fst
        MyAvatar.useFullAvatarURL(AVATAR_URL);
        MyAvatar.setAttachmentsVariant([]);
        setIsAviEnabledTrue();
    }

    // Contains all steps to set the app state to isAviEnabled = true
    function setIsAviEnabledTrue() {
        dynamicData.state.isAviEnabled = true;
        spawnMirror();
        updateUI(STRING_STATE);
    }

    // Contains all steps to set the app state to isAviEnabled = false
    function setIsAviEnabledFalse() {
        dynamicData.state.isAviEnabled = false;
        dynamicData.state.activeTabName = STRING_INFO;

        updateUI(STRING_STATE);
    }

    // #endregion AVATAR FUNCTIONS

    // #region MATERIAL

    var materialID,
        STRING_GLASS_MAT = "glass",
        STRING_CHAIN_MAT = "chainmail",
        STRING_DISCO_MAT = "disco",
        STRING_DEFAULT_MAT = "default",
        STRING_RED_MAT = "red",
        STRING_TEXTURE_MAT = "texture",
        MATERIAL_GLASS = MATERIAL_DATA.glass,
        MATERIAL_CHAINMAIL = MATERIAL_DATA.chainmail,
        MATERIAL_DISCO = MATERIAL_DATA.disco,
        MATERIAL_RED = MATERIAL_DATA.red,
        MATERIAL_TEXTURE = MATERIAL_DATA.texture;

    // Subtype event strings
    var STRING_NAMED_MATERIAL_SELECTED = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_NAMED_MATERIAL_SELECTED,
        STRING_MODEL_TYPE_SELECTED = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_MODEL_TYPE_SELECTED,
        STRING_UPDATE_PROPERTY = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_UPDATE_PROPERTY;

    // componentTypes
    var STRING_COLOR = CONFIG.STRING_COLOR,
        STRING_MAP_ONLY = CONFIG.STRING_MAP_ONLY;

    var PATH_TO_IMAGES = MATERIAL_DATA.directory;

    // propertyName
    // newMaterialData { value: "" map: "" }
    // componentType: STRING_COLOR / STRING_SLIDER / STRING_MAP_ONLY
    // isPBR: boolean
    function updateMaterialProperty(propertyName, newMaterialData, componentType, isPBR) {

        var value = newMaterialData.value;
        var map = newMaterialData.map;
        
        var property = propertyName;
        var propertyMap = property + "Map";

        if (DEBUG) {
            print("Update Material Property key: ", property, " value: ", value);
            print("Update Material Property key: ", propertyMap, " map: ", map);
        }
        
        // update UI values
        var type = isPBR ? "pbr" : "shadeless";

        // prep data for changing material entity in updateMaterial()
        var updates = {
            unlit: isPBR ? false: true
        };

        if (value !== undefined) {
            value = componentType === STRING_COLOR ? convertColorUIToBackend(value) : value;
            value = componentType === STRING_MAP_ONLY ? convertImageUIToBackend(value) : value;
            // slider value does not need to be changed

            updates[property] = value;
            dynamicData[STRING_MATERIAL][type][property].value = value;
        }

        if (map !== undefined && componentType !== STRING_MAP_ONLY) {
            updates[propertyMap] = convertImageUIToBackend(map);
            dynamicData[STRING_MATERIAL][type][property].map = map;
        }

        updateMaterial({ materials: updates }, false, isPBR);
    }

    function convertColorUIToBackend(hexColor){
        // hex -> rgb -> array
        var rgb = hexToRgb(hexColor);
        return [ 
            rgb.r / RGB_255,
            rgb.g / RGB_255, 
            rgb.b / RGB_255 
        ];
    }

    function convertImageUIToBackend(file) {
        if (file && file.indexOf("no.jpg") !== -1) {
            print("I AM HERE");
            return null;
        } 
        return PATH_TO_IMAGES + file;
    }


    // prioritize a properties over b properties
    function mergeObjectProperties(a, b) {

        for (var key in b) {
            a[key] = b[key];
        }
        return a;
    }

    function convertColorBackendToUI(arrayColor){
        // array -> rgb -> hex
        var rgb = arrayToRGB(arrayColor);
        var hex = rgbToHex(rgb);
        return hex;
    }


    var PBR_INDEX = 2;
    var SHADELESS_INDEX = 1;
    // button is pressed and must loop through all UI elements to update
    // newMaterialData.materials passed in
    // for Named buttons only
    function updateMaterialDynamicDataUI(newMaterialDataToApply, isPBR) {

        // set the UI drop-down index to hifi-PBR (index 2) or shadeless (index 1)
        dynamicData[STRING_MATERIAL].selectedTypeIndex = isPBR ? PBR_INDEX : SHADELESS_INDEX;
        var type = isPBR ? "pbr" : "shadeless";

        // Update UI with values 
        var dynamicPropertyData = dynamicData[STRING_MATERIAL][type];
        var newMaterials = newMaterialDataToApply.materials;

        // Loop through all newMaterialProperties
        for (var property in newMaterials) {

            var key = property;
            var value = newMaterials[key];

            if (DEBUG) {
                print("Key is :", key, " dynamic property data is :", JSON.stringify(dynamicPropertyData));
            }
            
            if (key === "model" || key === "unlit") {
                // property doesnt exist in ui properties
                continue;
            }

            if (key.indexOf("Map") !== -1) {
                // is a Map
                var uiValue = value.replace(PATH_TO_IMAGES, ""); // remove path url

                if (dynamicPropertyData[key]) {
                    // is Map Only
                    dynamicPropertyData[key].value = uiValue;
                    dynamicPropertyData[key].map = uiValue;
                } else {
                    // is slider or color component type
                    var uiProperty = key.replace("Map", "");
                    dynamicPropertyData[uiProperty].map = uiValue;
                }

            } else {
                // is Color or Slider value
                dynamicPropertyData[key].value = Array.isArray(value) 
                    ? convertColorBackendToUI(value) // is color
                    : value;
            }

        }

    }


    // Update material or create a new material
    function updateMaterial(newMaterialData, isNamed, isPBR) {

        var materialEntityProperties;

        // these properties change
        var description = newMaterialData.description 
            ? newMaterialData.description
            : ""; // default value

        var materialMappingScale = newMaterialData.materialMappingScale 
            ? newMaterialData.materialMappingScale 
            : { x: 1, y: 1 }; // default value

        var newMaterials = newMaterialData.materials;

        // If material already exists and isNamed === false
        // Merge old material properties and new material properties
        if (materialID && !isNamed) {

            var oldMaterialDataString;
            var oldMaterials = {};

            oldMaterialDataString = Entities.getEntityProperties(materialID, ["materialData"]).materialData;
            try {
                // get old materials values and properties to carry over to new
                oldMaterials = JSON.parse(oldMaterialDataString).materials;
            } catch (e) {
                console.error("Issues parsing oldMaterialDataString" + e);
            }

            // merge new materials and old material properties together
            newMaterials = mergeObjectProperties(oldMaterials, newMaterials);

            print("ROBIN IS THIS " + JSON.stringify(newMaterials));

            if (newMaterials["unlit"] && !isPBR) {
                // unlit exists and is false
                // is shadeless
                delete newMaterials["unlit"];
            }

        }

        // Create new material 
        if (!materialID) {

            newMaterials.model = "hifi_pbr"; 

            materialEntityProperties = {
                type: "Material",
                name: "Avatar101-Material",
                parentID: MyAvatar.sessionUUID,
                materialURL: "materialData",
                priority: 1,
                parentMaterialName: 1,
                description: description,
                materialMappingScale: materialMappingScale,
                materialData: JSON.stringify({
                    materialVersion: 1, 
                    materials: newMaterials 
                })
            };

            materialID = Entities.addEntity(materialEntityProperties, "avatar");

        } else {

            // Update old material
            var updates = {
                description: description,
                materialMappingScale: materialMappingScale,
                materialData: JSON.stringify({
                    materialVersion: 1, 
                    materials: newMaterials 
                })
            };

            Entities.editEntity(materialID, updates);
        }

        if (isNamed) {
            // is Named
            // Update the ui with new properties
            setMaterialPropertiesToDefaults();
            updateMaterialDynamicDataUI(newMaterialData, isPBR);
        } 
    }


    // For both shadeless properties in dynamic data
    // Set back to default values
    function setMaterialPropertiesToDefaults() {
        // shadeless
        setDefaults(dynamicData[STRING_MATERIAL].shadeless, defaultMaterialProperties.shadeless);
        // pbr
        setDefaults(dynamicData[STRING_MATERIAL].pbr, defaultMaterialProperties.pbr);
    }


    // Take the dynamic data object and use the default object 
    // to set values to default value
    function setDefaults(dynamicObject, defaultObject) {
        for (var key in defaultObject) {
            var defaultValue = defaultObject[key].value;
            var defaultMap = defaultObject[key].map;

            dynamicObject[key].value = defaultValue;
            dynamicObject[key].map = defaultMap;
        }
    }


    // Apply the named material to material entity
    function applyNamedMaterial(materialName) {

        // Set the selected material in UI
        dynamicData[STRING_MATERIAL].selectedMaterial = materialName;

        switch (materialName){
            case STRING_DEFAULT_MAT:
                setMaterialPropertiesToDefaults();
                dynamicData[STRING_MATERIAL].selectedTypeIndex = 0; // "Select one"
                if (materialID) {
                    Entities.deleteEntity(materialID);
                    materialID = null;
                }
                break;
            case STRING_GLASS_MAT:
                // updateMaterial materialName, isNamed, isPBR
                updateMaterial(MATERIAL_GLASS, true, true);
                break;
            case STRING_CHAIN_MAT:
                updateMaterial(MATERIAL_CHAINMAIL, true, true);
                break;
            case STRING_DISCO_MAT:
                updateMaterial(MATERIAL_DISCO, true, true);
                break;
            case STRING_RED_MAT:
                updateMaterial(MATERIAL_RED, true, false);
                break;
            case STRING_TEXTURE_MAT:
                updateMaterial(MATERIAL_TEXTURE, true, false);
                break;
        }
    }

    // #endregion MATERIAL

    // #region BLENDSHAPES

    // Take newBlendshapeData and update selected blendshape, properties, and the avatar blendshapes
    function updateBlendshapes(newBlendshapeData, isName) {
        if (DEBUG) {
            print("New blendshape data", JSON.stringify(newBlendshapeData));
        }

        if (!isName) {
            // is not named blendshape, ensure last blendshape is not selected
            dynamicData[STRING_BLENDSHAPES].selected = "";
        }

        // update all dynamic data blendshapes
        for (var property in newBlendshapeData) {
            // set it in dynamic data for ui
            dynamicData[STRING_BLENDSHAPES].updatedProperties[property] = newBlendshapeData[property]; 

            // set it on the avatar
            MyAvatar.setBlendshape(property, newBlendshapeData[property]);
        }

    }

    // Apply the named blendshape to avatar
    function applyNamedBlendshapes(blendshapeName) {

        // Set the selected blendshape data in UI
        dynamicData[STRING_BLENDSHAPES].selected = blendshapeName;

        switch (blendshapeName){
            case "default":
                updateBlendshapes(BLENDSHAPE_DATA.defaults, true);
                break;
            case "awe":
                updateBlendshapes(BLENDSHAPE_DATA.awe, true);
                break;
            case "laugh":
                updateBlendshapes(BLENDSHAPE_DATA.laugh, true);
                break;
            case "angry":
                updateBlendshapes(BLENDSHAPE_DATA.angry, true);
                break;
        }
    }

    // #endregion BLENDSHAPES

    // #region FLOW

    // Subtype event strings
    var STRING_DEBUG_TOGGLE = CONFIG.FLOW_EVENTS_SUBTYPE.STRING_DEBUG_TOGGLE,
        STRING_COLLISIONS_TOGGLE = CONFIG.FLOW_EVENTS_SUBTYPE.STRING_COLLISIONS_TOGGLE,
        STRING_HAIR = CONFIG.FLOW_EVENTS_SUBTYPE.STRING_HAIR,
        STRING_JOINTS = CONFIG.FLOW_EVENTS_SUBTYPE.STRING_JOINTS;

    // Called when user navigates to flow tab
    function addRemoveFlowDebugSpheres(isEnabled) {
        // draw debug circles on the joints
        var flowSettings = GlobalDebugger.getDisplayData();

        // the state of flow is the opposite of what we want
        if (flowSettings.debug !== isEnabled) {
            GlobalDebugger.toggleDebugShapes();
            dynamicData[STRING_FLOW].showDebug = isEnabled;
        }

    }

    function addRemoveCollisions(isEnabled) {
        // draw debug circles on the joints
        var flowSettings = GlobalDebugger.getDisplayData();

        // the state of flow is the opposite of what we want
        if (flowSettings.collisions !== isEnabled) {
            GlobalDebugger.toggleCollisions();
            dynamicData[STRING_FLOW].enableCollisions = isEnabled;
        }

    }

    function updateFlow(newFlowDataToApply, subtype) {

        if (DEBUG) {
            print("updating flow: ", subtype, JSON.stringify(newFlowDataToApply));
        }

        // propertyName is the key and value is the new propety value
        // for example newFlowDataToApply = { stiffness: 0.5 }
        for (var propertyName in newFlowDataToApply) {

            var newValue = newFlowDataToApply[propertyName];

            if (subtype === STRING_HAIR) {
                GlobalDebugger.setJointDataValue("leaf", propertyName, newValue);
                dynamicData[STRING_FLOW].hairFlowOptions[propertyName] = newValue;

            } else if (subtype === STRING_JOINTS) {
                GlobalDebugger.setCollisionDataValue("HeadTop_End", propertyName, newValue);
                dynamicData[STRING_FLOW].jointFlowOptions[propertyName] = newValue;
            }

        }

    }

    // #endregion FLOW

    // #region APP

    // Static strings
    var STRING_MATERIAL = CONFIG.STRING_MATERIAL,
        STRING_BLENDSHAPES = CONFIG.STRING_BLENDSHAPES,
        STRING_FLOW = CONFIG.STRING_FLOW,
        STRING_INFO = CONFIG.STRING_INFO,
        STRING_STATE = CONFIG.STRING_STATE;

    // UI variables
    var ui;
    var dynamicData = deepCopy(CONFIG.INITIAL_DYNAMIC_DATA);
    // set default UI values to be parsed when set to defaults
    var defaultMaterialProperties = {
        shadeless: deepCopy(CONFIG.INITIAL_DYNAMIC_DATA[STRING_MATERIAL].shadeless),
        pbr: deepCopy(CONFIG.INITIAL_DYNAMIC_DATA[STRING_MATERIAL].pbr)
    };

    // Tab dynamic variables
    var currentTab;

    // Create menu button
    function startup() {

        ui = new AppUi({
            buttonName: CONFIG.BUTTON_NAME,
            home: URL,
            onMessage: onMessage,
            // graphicsDirectory: Script.resolvePath("./resources/icons/"),
            onOpened: onOpened,
            onClosed: onClosed
        });

        Script.scriptEnding.connect(unload);
    }


    // Called each time app is closed
    function onClosed() {

        deleteMirror();
        // save lastTab that the user was on
        dynamicData.state.activeTabName = currentTab;
        MyAvatar.hasScriptedBlendshapes = false;

    }


    // Called each time app is opened
    function onOpened() {

        if (DEBUG) {
            print("ACA101 onOpened: isAviEnabled ", MyAvatar.skeletonModelURL === AVATAR_URL);
            print("ACA101 onOpened: activeTabName is ", dynamicData.state.activeTabName);
        }

        if (MyAvatar.skeletonModelURL === AVATAR_URL) {

            setIsAviEnabledTrue();

            // if your last closed tab has extra setup functionality
            // ensure you have the correct view for the current tab
            switchTabs(dynamicData.state.activeTabName);

        } else {
            setIsAviEnabledFalse();
        }

        updateUI();

    }

    // Functionality for each time a tab is switched
    function switchTabs(tabName) {
        
        var previousTab = currentTab;
        currentTab = tabName;

        // Flow tab conditionals
        if (currentTab === STRING_FLOW && dynamicData[STRING_FLOW].showDebug){
            // enable debug spheres
            addRemoveFlowDebugSpheres(true);
        }
        if (previousTab === STRING_FLOW && currentTab !== STRING_FLOW){
            // disable debug spheres
            addRemoveFlowDebugSpheres(false);
        }

        // Blendshape tab conditionals
        if (currentTab === STRING_BLENDSHAPES) {
            // enable scripted blendshapes
            MyAvatar.hasScriptedBlendshapes = true;
        }
        if (previousTab === STRING_BLENDSHAPES && currentTab !== STRING_BLENDSHAPES){
            // disable scripted blendshapes
            MyAvatar.hasScriptedBlendshapes = false;
        }

    }

    function unload() {
        deleteMirror();

        // Set blendshapes back to normal
        MyAvatar.hasScriptedBlendshapes = true;
        applyNamedBlendshapes(BLENDSHAPE_DATA.defaults);
        MyAvatar.hasScriptedBlendshapes = false;

        if (materialID) {
            Entities.deleteEntity(materialID);
            materialID = null;
        }
    }

    // #endregion APP

    // #region EVENTS
    var DEBUG_EVENTS = true;

    // Handles events recieved from the UI
    function onMessage(data) {

        // EventBridge message from HTML script.

        // Check against EVENT_NAME to ensure we're getting the correct messages from the correct app
        if (!data.type || data.type.indexOf(CONFIG.APP_NAME) === -1) {
            if (DEBUG_EVENTS) {
                print("Event type event name index check: ", !data.type, data.type.indexOf(CONFIG.APP_NAME) === -1);
            }
            return;
        }
        data.type = data.type.replace(CONFIG.APP_NAME, "");

        if (DEBUG_EVENTS) {
            print("onMessage: ", data.type);
            print("subtype: ", data.subtype);
        }

        switch (data.type) {
            case CONFIG.EVENT_BRIDGE_OPEN_MESSAGE:
                updateUI();
                break;
            case CONFIG.EVENT_UPDATE_AVATAR:

                switch (data.subtype) {
                    case CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR:
                        saveAvatarAndChangeToAvi();
                        break;
                    case CONFIG.EVENT_RESTORE_SAVED_AVATAR:
                        restoreAvatar();
                        break;
                    case CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR:
                        changeAvatarToAvi();
                        break;
                    default:
                        break;
                }
                break;
            case CONFIG.EVENT_CHANGE_TAB:
                switchTabs(data.value);
                break;
            case CONFIG.EVENT_UPDATE_MATERIAL:
                // delegates the method depending on if 
                // event has name property or updates property
                if (DEBUG) {
                    print("MATERIAL EVENT" , data.subtype, " ", data.name, " ", data.updates);
                }
                switch (data.subtype) {
                    case STRING_MODEL_TYPE_SELECTED:
                        applyNamedMaterial(STRING_DEFAULT_MAT);
                        dynamicData[STRING_MATERIAL].selectedTypeIndex = data.updates;
                        break;
                    case STRING_NAMED_MATERIAL_SELECTED: 
                        applyNamedMaterial(data.name);
                        break;
                    case STRING_UPDATE_PROPERTY:

                        var propertyName = data.updates.propertyName;
                        var newMaterialData = data.updates.newMaterialData;
                        var componentType = data.updates.componentType;
                        var isPBR = data.updates.isPBR;

                        console.log("update Property" + propertyName + JSON.stringify(newMaterialData));
                        updateMaterialProperty(propertyName, newMaterialData, componentType, isPBR);
                        break;
                }
                updateUI(STRING_MATERIAL);
                break;

            case CONFIG.EVENT_UPDATE_BLENDSHAPE:
                if (data.name) {
                    applyNamedBlendshapes(data.name);
                } else {
                    updateBlendshapes(data.updates);
                }
                updateUI(STRING_BLENDSHAPES);
                break;
            case CONFIG.EVENT_UPDATE_FLOW:
                switch (data.subtype) {
                    case STRING_DEBUG_TOGGLE:
                        if (DEBUG) {
                            print("TOGGLE DEBUG SPHERES ", data.updates);
                        }
                        addRemoveFlowDebugSpheres(data.updates);
                        break;
                    case STRING_COLLISIONS_TOGGLE:
                        addRemoveCollisions(data.updates);
                        break;
                    case STRING_HAIR: 
                        updateFlow(data.updates, STRING_HAIR);
                        break;
                    case STRING_JOINTS: 
                        updateFlow(data.updates, STRING_JOINTS);
                        break;
                    default: 
                        console.error("Flow recieved no matching subtype");
                        break;
                }
                updateUI(STRING_FLOW);
                break;
            default:
                break;
        }

    }

    function updateUI(type) {
        var messageObject = {
            type: CONFIG.UPDATE_UI,
            subtype: type ? type : "",
            value: type ? dynamicData[type] : dynamicData
        };
        if (DEBUG_EVENTS) {
            print("Update UI", type);
        }
        ui.sendToHtml(messageObject);
    }

    // #endregion EVENTS

    // Initialize the app
    startup();

}());