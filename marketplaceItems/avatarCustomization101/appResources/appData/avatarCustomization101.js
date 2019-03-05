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

(function() {

    // Include flow to access GlobalDebugger available in flow.js
    Script.include(Script.resolvePath("./resources/modules/flow.js"));

    // Modules
    var AppUi = Script.require("appUi"),
        URL = Script.resolvePath("./resources/avatarCustomization101_ui.html"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js")),
        BLENDSHAPE_DATA = Script.require(Script.resolvePath("./resources/modules/blendshapes.js")),
        MATERIAL_DATA = Script.require(Script.resolvePath("./resources/modules/materials.js")),
        AVATAR_URL = Script.resolvePath("./resources/avatar/avatar.fst");

    // Static strings
    var STRING_MATERIAL = CONFIG.STRING_MATERIAL,
        STRING_BLENDSHAPES = CONFIG.STRING_BLENDSHAPES,
        STRING_FLOW = CONFIG.STRING_FLOW,
        STRING_INFO = CONFIG.STRING_INFO,
        STRING_STATE = CONFIG.STRING_STATE;

    var DEBUG = false;

    // #region UTILITY

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


    // Convert color format rgb to hex
    var BITS_16 = 16;
    var SHIFT_LEFT_24 = 24;
    var SHIFT_LEFT_16 = 16;
    var SHIFT_LEFT_8 = 8;
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


    // Convert color format array to rgb
    var RGB_255 = 255.0;
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

    // #endregion UTILITY


    // #region MIRROR

    var MIRROR_DISTANCE_Z_M = 0.5,
        MIRROR_DISTANCE_Y_M = 0.8,
        LIFETIME_MS = 10000,
        mirrorCubeID;
    // Creates mirror
    function spawnMirror() {
        // Remove old mirror
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
            if (name === "Avatar 101 Mirror") {
                Entities.deleteEntity(avatarEntity.id);
            }
        });

        // Create new mirror
        var position = Vec3.sum(
            MyAvatar.position, 
            Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: MIRROR_DISTANCE_Y_M, z: -MIRROR_DISTANCE_Z_M })
        );
        mirrorCubeID = Entities.addEntity({
            type: "Box",
            name: "Avatar 101 Mirror",
            dimensions: {
                "x": 0.6,
                "y": 0.7,
                "z": 0.001
            },
            lifetime: LIFETIME_MS,
            position: position,
            rotation: MyAvatar.orientation,
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",
            collisionless: true,
            script: Script.resolvePath("./resources/modules/mirrorClient.js?v9")
        }, "avatar");
    }


    // Delete mirror entity
    function deleteMirror() {
        // Delete mirror entity if it exists
        if (mirrorCubeID) {
            Entities.deleteEntity(mirrorCubeID);
            mirrorCubeID = null;
        }
    }

    // #endregion MIRROR


    // #region AVATAR

    // Save and change the avatar to Avi
    function saveAvatarAndChangeToAvi() {
        AvatarBookmarks.addBookmark(CONFIG.STRING_BOOKMARK_NAME);
        changeAvatarToAvi();
    }


    // Load saved avatar if saved, if not send user an alert
    function restoreAvatar() {
        var bookmarksObject = AvatarBookmarks.getBookmarks();

        if (bookmarksObject[CONFIG.STRING_BOOKMARK_NAME]) {
            AvatarBookmarks.loadBookmark(CONFIG.STRING_BOOKMARK_NAME);
            AvatarBookmarks.removeBookmark(CONFIG.STRING_BOOKMARK_NAME);
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
        dynamicData.state.isAviEnabled = true;
    }

    // Contains all steps to set the app state to isAviEnabled = false
    function setIsAviEnabledFalse() {
        dynamicData.state.isAviEnabled = false;
        dynamicData.state.activeTabName = STRING_INFO;
        deleteJacketMaterial();
        removeBlendshapes();
        deleteMirror();

        updateUI(STRING_STATE);
    }

    // #endregion AVATAR


    // #region MATERIAL

    // This takes the format of the UI defined in config.js and converts it into 
    // the argument format update material expects
    // propertyName
    // newMaterialData { value: "" map: "" }
    // componentType: STRING_COLOR / STRING_SLIDER / STRING_MAP_ONLY
    // isPBR: boolean
    function updateMaterialProperty(propertyName, newMaterialData, componentType, isPBR) {
        var propertyMap = propertyName + "Map";

        if (DEBUG) {
            print("Update Material Property key: ", propertyName, " value: ", newMaterialData.value);
            print("Update Material Property key: ", propertyMap, " map: ", newMaterialData.map);
            print("Update Material Property isPBR: ", isPBR);
        }
        
        // update UI values
        var type = isPBR ? "pbr" : "shadeless";

        // prep data for changing material entity in updateMaterial()
        var updates = {
            unlit: !isPBR
        };

        if (newMaterialData.value !== undefined) { // null is a valid entry
            var value = newMaterialData.value;
            if (componentType === CONFIG.STRING_COLOR) {
                value = convertHexToArrayColor(newMaterialData.value);
            } else if (componentType === CONFIG.STRING_MAP_ONLY) {
                value = addFileDirectory(newMaterialData.value);
            }
            // slider value does not need to be changed

            updates[propertyName] = value;
            dynamicData[STRING_MATERIAL][type][propertyName].value = newMaterialData.value;
        }

        if (newMaterialData.map !== undefined && componentType !== CONFIG.STRING_MAP_ONLY) { // null is a valid entry
            updates[propertyMap] = addFileDirectory(newMaterialData.map);
            dynamicData[STRING_MATERIAL][type][propertyName].map = newMaterialData.map;
        }

        updateMaterial({ materials: updates }, false, isPBR);
    }


    // Convert hex color to array color
    function convertHexToArrayColor(hexColor){
        if (hexColor) {
            // hex -> rgb -> array
            var rgb = hexToRgb(hexColor);
            return [ 
                rgb.r / RGB_255,
                rgb.g / RGB_255, 
                rgb.b / RGB_255 
            ];
        }
    }


    // Add file directory to file name
    function addFileDirectory(file) {
        if (file && file.indexOf("no.jpg") !== -1) { // the "nothing selected" texture
            return null;
        } 
        return MATERIAL_DATA.directory + file;
    }


    // prioritize a properties over b properties
    function mergeObjectProperties(a, b) {
        for (var key in b) {
            if (b[key] === null && a[key]) {
                // remove any values in a if new b value is null
                delete a[key];
            } else {
                a[key] = b[key];
            }
        }
        return a;
    }

    // Array color to hex color
    function convertArrayToHexColor(arrayColor){
        // array -> rgb -> hex
        var rgb = arrayToRGB(arrayColor);
        var hex = rgbToHex(rgb);
        return hex;
    }


    // button is pressed and must loop through all UI elements to update
    // newMaterialData.materials passed in
    // for Named buttons only
    var PBR_INDEX = 2;
    var SHADELESS_INDEX = 1;
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
                var uiValue = value.replace(MATERIAL_DATA.directory, ""); // remove path url

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
                    ? convertArrayToHexColor(value) // is color
                    : value;
            }
        }
    }


    // Update material or create a new material
    var materialID;
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

            var oldMaterialProperties = 
                Entities.getEntityProperties(materialID, ["materialData", "materialMappingScale", "description"]);
            oldMaterialDataString = oldMaterialProperties.materialData;
            description = oldMaterialProperties.description;
            materialMappingScale = oldMaterialProperties.materialMappingScale;

            try {
                // get old materials values and properties to carry over to new
                oldMaterials = JSON.parse(oldMaterialDataString).materials;
            } catch (e) {
                console.error("Issues parsing oldMaterialDataString " + e);
                return;
            }

            // merge new materials and old material properties together
            newMaterials = mergeObjectProperties(oldMaterials, newMaterials);

            if (newMaterials["unlit"] && !isPBR) {
                // unlit exists and is false
                // is shadeless
                delete newMaterials["unlit"];
            }
        }

        // Create new material 
        if (!materialID) {

            // Delete old material entity
            // In case materialID reference was lost but material still exists on Avi
            MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
                var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
                if (name === "Avatar101-Material") {
                    Entities.deleteEntity(avatarEntity.id);
                }
            });

            newMaterials.model = "hifi_pbr"; 

            materialEntityProperties = {
                type: "Material",
                name: "Avatar101-Material",
                parentID: MyAvatar.sessionUUID,
                materialURL: "materialData", // utilize material data to define properties
                priority: 1, // multiple materials can be parented, highest priority is rendered
                parentMaterialName: 2, // avatar submesh
                description: description, // description of the material
                materialMappingScale: materialMappingScale, // scale of the material
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
            case CONFIG.STRING_DEFAULT:
                setMaterialPropertiesToDefaults();
                dynamicData[STRING_MATERIAL].selectedTypeIndex = 0; // "Select one"
                deleteJacketMaterial();
                break;
            case CONFIG.STRING_GLASS:
                // updateMaterial materialName, isNamed, isPBR
                updateMaterial(MATERIAL_DATA.glass, true, true);
                break;
            case CONFIG.STRING_CHAINMAIL:
                updateMaterial(MATERIAL_DATA.chainmail, true, true);
                break;
            case CONFIG.STRING_DISCO:
                updateMaterial(MATERIAL_DATA.disco, true, true);
                break;
            case CONFIG.STRING_RED:
                updateMaterial(MATERIAL_DATA.red, true, false);
                break;
            case CONFIG.STRING_TEXTURE:
                updateMaterial(MATERIAL_DATA.texture, true, false);
                break;
        }
    }


    // Delete material
    function deleteJacketMaterial() {
        if (materialID) {
            Entities.deleteEntity(materialID);
            materialID = null;
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


    // Set Blendshapes back to default
    var BLENDSHAPE_RESET_MS = 50;
    function removeBlendshapes() {
        MyAvatar.hasScriptedBlendshapes = true;
        applyNamedBlendshapes("default");
        Script.setTimeout(function () {
            MyAvatar.hasScriptedBlendshapes = false;
            // updateUI(STRING_BLENDSHAPES);
        }, BLENDSHAPE_RESET_MS);
    }

    // #endregion BLENDSHAPES


    // #region FLOW

    // Called when user navigates to flow tab
    function addRemoveFlowDebugSpheres(isEnabled, setShowDebugSpheres) {
        // draw debug circles on the joints
        var flowSettings = GlobalDebugger.getDisplayData();

        // the state of flow is the opposite of what we want
        if (flowSettings.debug !== isEnabled) {
            GlobalDebugger.toggleDebugShapes();

            // set the setting if setShowDebugSpheres is true
            if (setShowDebugSpheres) {
                dynamicData[STRING_FLOW].showDebug = isEnabled;
            }
        }
    }

    // Add collisions or remove collisions using the toggleCollisions flow function
    function addRemoveCollisions(isEnabled) {
        // draw debug circles on the joints
        var flowSettings = GlobalDebugger.getDisplayData();

        // the state of flow is the opposite of what we want
        if (flowSettings.collisions !== isEnabled) {
            GlobalDebugger.toggleCollisions();
            dynamicData[STRING_FLOW].enableCollisions = isEnabled;
        }
    }


    // Update flow options
    function updateFlow(newFlowDataToApply, subtype) {
        if (DEBUG) {
            print("updating flow: ", subtype, JSON.stringify(newFlowDataToApply));
        }
        // propertyName is the key and value is the new property value
        // for example newFlowDataToApply = { stiffness: 0.5 }
        for (var propertyName in newFlowDataToApply) {
            var newValue = newFlowDataToApply[propertyName];

            if (subtype === CONFIG.FLOW_EVENTS_SUBTYPE.STRING_HAIR) {
                GlobalDebugger.setJointDataValue("leaf", propertyName, newValue);
                dynamicData[STRING_FLOW].hairFlowOptions[propertyName] = newValue;

            } else if (subtype === CONFIG.FLOW_EVENTS_SUBTYPE.STRING_JOINTS) {
                GlobalDebugger.setCollisionDataValue("HeadTop_End", propertyName, newValue);
                dynamicData[STRING_FLOW].jointFlowOptions[propertyName] = newValue;
            }
        }
    }

    // #endregion FLOW


    // #region APP

    // Create menu button and connect all callbacks to signals on startup
    var ui;
    var dynamicData; // UI data
    var defaultMaterialProperties; // set default UI values to be parsed when setDefaults() is called for materials
    function startup() {
        // Set initial UI data for our app and Vue
        // App data will be populated after updateUI is called in onMessage EVENT_BRIDGE_OPEN_MESSAGE 
        dynamicData = deepCopy(CONFIG.INITIAL_DYNAMIC_DATA);
        defaultMaterialProperties = {
            shadeless: deepCopy(CONFIG.INITIAL_DYNAMIC_DATA[STRING_MATERIAL].shadeless),
            pbr: deepCopy(CONFIG.INITIAL_DYNAMIC_DATA[STRING_MATERIAL].pbr)
        };
        
        // Create the tablet app
        ui = new AppUi({
            buttonName: CONFIG.BUTTON_NAME,
            home: URL,
            onMessage: onMessage, // UI event listener  
            // Icons are located in graphicsDirectory
            // AppUI is looking for icons named with the BUTTON_NAME "avatar-101" 
            // For example: avatar-101-a.svg for active button icon, avatar-101-i.svg for inactive button icon
            graphicsDirectory: Script.resolvePath("./resources/icons/"), 
            onOpened: onOpened,
            onClosed: onClosed
        });

        // Connect unload function to the script ending
        Script.scriptEnding.connect(unload);
        // Connect function callback to model url changed signal
        MyAvatar.skeletonModelURLChanged.connect(onAvatarModelURLChanged);
    }


    // Checks the current avatar model and sees if the avatar url is Avi
    function onAvatarModelURLChanged() {
        if (MyAvatar.skeletonModelURL === AVATAR_URL) {
            dynamicData.state.isAviEnabled = true;
            // if your last closed tab has extra setup functionality
            // ensure you have the correct view for the current tab
            switchTabs(dynamicData.state.activeTabName);
        } else {
            setIsAviEnabledFalse();
        }
        updateUI(STRING_STATE);
    }


    // Called each time app is closed
    function onClosed() {
        // save lastTab that the user was on
        dynamicData.state.activeTabName = currentTab;
        MyAvatar.hasScriptedBlendshapes = false;
        addRemoveFlowDebugSpheres(false);
        deleteMirror();
    }


    // Called each time app is opened
    function onOpened() {
        if (DEBUG) {
            print("ACA101 onOpened: isAviEnabled ", MyAvatar.skeletonModelURL === AVATAR_URL);
            print("ACA101 onOpened: activeTabName is ", dynamicData.state.activeTabName);
        }
        // Checks avatar model url
        onAvatarModelURLChanged();
        spawnMirror();

        updateUI(STRING_STATE);
    }


    // Functionality for each time a tab is switched
    var currentTab;
    function switchTabs(tabName) {
        var previousTab = currentTab;
        currentTab = tabName;

        // Flow tab conditionals
        if (currentTab === STRING_FLOW && dynamicData[STRING_FLOW].showDebug){
            // enable debug spheres
            addRemoveFlowDebugSpheres(true);
        } else if (previousTab === STRING_FLOW && currentTab !== STRING_FLOW){
            // disable debug spheres
            addRemoveFlowDebugSpheres(false);
        }

        // Blendshape tab conditionals
        if (currentTab === STRING_BLENDSHAPES) {
            // enable scripted blendshapes
            MyAvatar.hasScriptedBlendshapes = true;
        } else if (previousTab === STRING_BLENDSHAPES && currentTab !== STRING_BLENDSHAPES){
            // disable scripted blendshapes
            MyAvatar.hasScriptedBlendshapes = false;
        }

        updateUI(STRING_STATE);
    }


    // Unload functions
    function unload() {
        onClosed();
        // Set blendshapes back to normal
        removeBlendshapes();
        deleteJacketMaterial();
        // Disconnect function callback from signal when model url changes
        MyAvatar.skeletonModelURLChanged.disconnect(onAvatarModelURLChanged);
    }

    // #endregion APP


    // #region EVENTS

    // Handles events recieved from the UI
    function onMessage(data) {
        // EventBridge message from HTML script.
        // Check against EVENT_NAME to ensure we're getting the correct messages from the correct app
        if (!data.type || data.type.indexOf(CONFIG.APP_NAME) === -1) {
            if (DEBUG) {
                print("Event type event name index check: ", !data.type, data.type.indexOf(CONFIG.APP_NAME) === -1);
            }
            return;
        }
        data.type = data.type.replace(CONFIG.APP_NAME, "");

        if (DEBUG) {
            print("onMessage: ", data.type);
            print("subtype: ", data.subtype);
        }

        switch (data.type) {
            case CONFIG.EVENT_BRIDGE_OPEN_MESSAGE:
                onOpened();
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
                updateUI(STRING_STATE);
                break;
            case CONFIG.EVENT_CHANGE_TAB:
                switchTabs(data.value);
                updateUI(STRING_STATE);
                break;
            case CONFIG.EVENT_UPDATE_MATERIAL:
                // delegates the method depending on if 
                // event has name property or updates property
                if (DEBUG) {
                    print("MATERIAL EVENT" , data.subtype, " ", data.name, " ", data.updates);
                }
                switch (data.subtype) {
                    case CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_MODEL_TYPE_SELECTED:
                        applyNamedMaterial(CONFIG.STRING_DEFAULT);
                        dynamicData[STRING_MATERIAL].selectedTypeIndex = data.updates;
                        break;
                    case CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_NAMED_MATERIAL_SELECTED: 
                        applyNamedMaterial(data.name);
                        break;
                    case CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_UPDATE_PROPERTY:

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
                    case CONFIG.FLOW_EVENTS_SUBTYPE.STRING_DEBUG_TOGGLE:
                        if (DEBUG) {
                            print("TOGGLE DEBUG SPHERES ", data.updates);
                        }
                        addRemoveFlowDebugSpheres(data.updates, true);
                        break;
                    case CONFIG.FLOW_EVENTS_SUBTYPE.STRING_COLLISIONS_TOGGLE:
                        addRemoveCollisions(data.updates);
                        break;
                    case CONFIG.FLOW_EVENTS_SUBTYPE.STRING_HAIR: 
                        updateFlow(data.updates, CONFIG.FLOW_EVENTS_SUBTYPE.STRING_HAIR);
                        break;
                    case CONFIG.FLOW_EVENTS_SUBTYPE.STRING_JOINTS: 
                        updateFlow(data.updates, CONFIG.FLOW_EVENTS_SUBTYPE.STRING_JOINTS);
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


    // Send information to update the UI
    function updateUI(type) {
        var messageObject = {
            type: CONFIG.UPDATE_UI,
            subtype: type ? type : "",
            value: type ? dynamicData[type] : dynamicData
        };
        if (DEBUG) {
            print("Update UI", type);
        }
        ui.sendToHtml(messageObject);
    }

    // #endregion EVENTS


    // Initialize the app
    startup();
})();