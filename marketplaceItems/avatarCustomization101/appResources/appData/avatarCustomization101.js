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
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v22222")),
        BLENDSHAPE_DATA = Script.require(Script.resolvePath("./resources/modules/blendshapes.js?v1")),
        MATERIAL_DATA = Script.require(Script.resolvePath("./resources/modules/materials.js?v1234")),
        AVATAR_URL = Script.resolvePath("./resources/avatar/avatar.fst");

    var DEBUG = true;

    // #region UTILITY FUNCTIONS

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
    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    function rgbToHex(colorObject) {
        var r = colorObject.r;
        var g = colorObject.g;
        var b = colorObject.b;

        var str = "" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
        if (DEBUG) {
            print("RgbToHex" + str);
        }
        return str;
    }

    function arrayToRGB (color) {
        if (Array.isArray(color)) {
            var rgbFormat = {
                r: Math.floor( color[0] * 255 ),
                g: Math.floor( color[1] * 255 ),
                b: Math.floor( color[2] * 255 )
            }

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

    function spawnMirror() {
        // create mirrror parent to avatar
        var position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0.5, z: -MIRROR_DISTANCE_M }));
        mirrorCubeID = Entities.addEntity({
            type: "Box",
            name: "mirror",
            dimensions: {
                "x": 0.6,
                "y": 0.7,
                "z": 0.001
            },
            position: position,
            rotation: MyAvatar.orientation, // Quat.cancelOutRollAndPitch(Quat.lookAt(position, MyAvatar.position, Vec3.UNIT_Y)),
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",
            collisionless: true,
            script: Script.resolvePath("./resources/modules/mirrorClient.js")
        }, "domain");
    }

    function deleteMirror() {
        // Delete mirror entity 
        // set mirrorID to null
        Entities.deleteEntity(mirrorCubeID);
        Entities.deleteEntity(mirrorZoneID);
        mirrorCubeID = null;
        mirrorZoneID = null;
    }

    // #endregion MIRROR FUNCTIONS

    // #region AVATAR FUNCTIONS

    var STRING_BOOKMARK_NAME = CONFIG.STRING_BOOKMARK_NAME;

    function bookmarkAvatar() {
        AvatarBookmarks.addBookmark(STRING_BOOKMARK_NAME);
    }

    function saveAvatarAndChangeToAvi() {
        bookmarkAvatar();
        changeAvatarToAvi();
    }

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

    function changeAvatarToAvi() {
        // Set avatar to Avi.fst
        MyAvatar.useFullAvatarURL(AVATAR_URL);
        MyAvatar.setAttachmentsVariant([]);
        setIsAviEnabledTrue();
    }

    function isAviYourCurrentAvatar() {
        return MyAvatar.skeletonModelURL === AVATAR_URL;
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
        materialProperties,
        STRING_GLASS_MAT = "glass",
        STRING_CHAIN_MAT = "chainmail",
        STRING_DISCO_MAT = "disco",
        STRING_DEFAULT_MAT = "default",
        STRING_RED_MAT = "red",
        STRING_TEXTURE_MAT = "texture",
        MATERIAL_DEFAULT = MATERIAL_DATA.defaults,
        MATERIAL_GLASS = MATERIAL_DATA.glass,
        MATERIAL_CHAINMAIL = MATERIAL_DATA.chainmail,
        MATERIAL_DISCO = MATERIAL_DATA.disco,
        MATERIAL_RED = MATERIAL_DATA.red,
        MATERIAL_TEXTURE = MATERIAL_DATA.texture;

    // Subtype event strings
    var STRING_NAMED_MATERIAL_SELECTED = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_NAMED_MATERIAL_SELECTED,
        STRING_MODEL_TYPE_SELECTED = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_MODEL_TYPE_SELECTED,
        STRING_UPDATE_PROPERTY = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_UPDATE_PROPERTY,
        STRING_UPDATE_ENTITY_PROPERTIES = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_UPDATE_ENTITY_PROPERTIES;

    // componentTypes
    var STRING_COLOR = CONFIG.STRING_COLOR,
        STRING_SLIDER = CONFIG.STRING_SLIDER,
        STRING_MAP_ONLY = CONFIG.STRING_MAP_ONLY;

    var PATH_TO_IMAGES = MATERIAL_DATA.directory;

    // Updates single property
    // propertyName
    // newMaterialData { value: "" map: "" }
    // componentType: STRING_COLOR / STRING_SLIDER / STRING_MAP_ONLY
    // isPBR: boolean
    function updateMaterialProperty(propertyName, newMaterialData, componentType, isPBR) {
        
        var updates = {
            unlit: isPBR ? false: true
        };

        var type = isPBR ? "pbr" : "shadeless";

        

        var value = newMaterialData.value;
        var map = newMaterialData.map;

        var key = propertyName;
        var keyMap = propertyName + "Map";

        // update UI values
        dynamicData[STRING_MATERIAL][type].value = value;
        dynamicData[STRING_MATERIAL][type].map = map; 

        switch (componentType) {
            case STRING_COLOR:
                value = convertColorUIToBackend(value);
                break;
            case STRING_SLIDER:
                // nothing to convert
                break; 
            case STRING_MAP_ONLY:
                value = prepImageUIToBackend(value);
                keyMap = "";
                break;
        }

        if (map && keyMap) {
            updates[keyMap] = prepImageUIToBackend(map);
        }
        updates[key] = value;

        updateMaterial({ materials: updates }, false, isPBR);
    }

    function createOrUpdateMaterialEntity(newMaterialData, isNamed, isPBR) {

        var materialEntityProperties;

        if (!materialID) {
            // create material entity properties
            materialEntityProperties = {
                // static defaults
                type: "Material",
                name: "Avatar101-Material",
                parentID: MyAvatar.sessionUUID,
                materialURL: "materialData",
                priority: 1,
                parentMaterialName: 1,
                materials: { // to be stringified
                    model: "hifi_pbr",
                },

                // dynamic properties 
                description: newMaterialData.description ? newMaterialData.description : "",
                materialMappingScale: newMaterialData.materialMappingScale ? newMaterialData.materialMappingScale : { x: 1, y: 1 },
                materialData: isNamed 
                    ? JSON.stringify({ materialVersion: 1, materials: newMaterialData.materials })
                    : getMaterialDataString(isPBR, newMaterialData.materials)
            };

            materialID = Entities.addEntity(materialEntityProperties, "avatar");

        } else {

            if (isNamed) {

                var updates = {
                    description: newMaterialData.description,
                    materialMappingScale: newMaterialData.materialMappingScale,
                    materialData: JSON.stringify({ materialVersion: 1, materials: newMaterialData.materials })
                };

                Entities.editEntity(materialID, updates);

            } else {

                // get old properties
                materialEntityProperties = Entities.getEntityProperties(materialID, ["materialData"])
                var materialDataString = getMaterialDataString(isPBR, newMaterialData.materials, materialData);

                Entities.editEntity(materialID, { materialData: materialDataString });
            }

            
            // var materialData = materialEntityProperties.materialData;
            // var description = newMaterialData.description ? newMaterialData.description : materialEntityProperties.description;
            // var materialMappingScale = newMaterialData.materialMappingScale ? newMaterialData.materialMappingScale : materialEntityProperties.materialMappingScale;

            // var materialDataString = isNamed 
            // ? JSON.stringify({ materialVersion: 1, materials: newMaterialDataToApply.materials })
            // : getMaterialDataString(isPBR, newMaterialData.materials)
            
            // getMaterialDataString(isPBR, newMaterialData.materials, materialData);

            // var updates = {
            //     description: description,
            //     materialMappingScale: materialMappingScale,
            //     materialData: materialDataString
            // }

            // Entities.editEntity(materialID, updates);
        }
    }

    // get material data string for setting in entity properties
    function getMaterialDataString (isPBR, newMaterialData, oldMaterialDataString) {

        var materialData = {};

        // parse old material data
        if (oldMaterialDataString) {
            try {
                materialData = JSON.parse(oldMaterialDataString).materials;
            } catch (e) {
                console.error(e);
            }
        }

        // set material version
        materialData.materialVersion = 1;
        // loop through all material data
        for(var key in newMaterialData) {
            materialData[key] = newMaterialData[key];

            if (key === "unlit" && !isPBR ) {
                // unlit exists and is false
                // is shadeless
                delete materialData[key];
            }
        }

        return JSON.stringify({ materialVersion: 1, materials: materialData });
    }

    // button is pressed and must loop through all UI elements to update
    // newMaterialData.materials passed in
    function updateMaterialDynamicDataUI(newMaterialDataToApply, isPBR) {

        // set the UI drop-down index to hifi-PBR (index 2) or shadeless (index 1)
        dynamicData[STRING_MATERIAL].selectedTypeIndex = isPBR ? 2 : 1;
        var type = isPBR ? "pbr" : "shadeless";

        // *** FOR NAMED PROPERTIES ONLY ***
        // Update UI with values 
        var dynamicPropertyData = dynamicData[STRING_MATERIAL][type];
        var materialData = newMaterialDataToApply.materials;

        for (var property in dynamicPropertyData) {

            var key = property;
            var mapKey = property + "Map";
            var newValue = materialData[key];
            var newMapValue = materialData[mapKey];

            if ( !newValue && !newMapValue ) {
                // property doesnt exist in new materialData
                continue;
            }

            // handle prepping newValue first
            if (newValue) {
                var isMap = key.indexOf("Map") !== -1;
                var isColor = Array.isArray(newValue);

                newValue = isMap ? prepImageBackendToUI(newValue) : newValue;
                newValue = isColor ? convertColorBackendToUI(newValue) : newValue;

                dynamicPropertyData[key].value = newValue;
                dynamicPropertyData[key].map = isMap ? newValue : null; // in case it's component type is mapOnly
            }

            // component type mapOnly would not get here
            if (newMapValue) {
                // we know it's a map prep it like so
                newMapValue = prepImageBackendToUI(newMapValue);
                dynamicPropertyData[key].map = newMapValue;
            }

        }
    }

    // @args updatesObject name [string]
    function updateMaterial(newMaterialDataToApply, isNamed, isPBR) {

        createOrUpdateMaterialEntity(newMaterialDataToApply, isNamed, isPBR);

        if (isNamed) {
            // is named
            // only clicking a named button will do this
            setMaterialPropertiesToDefaults();
            updateMaterialDynamicDataUI(newMaterialDataToApply, isPBR);

        } 
    }

    function prepImageBackendToUI(file) {
        return file.replace(PATH_TO_IMAGES, "");
    }

    function prepImageUIToBackend(file) {
        return PATH_TO_IMAGES + file;
    }

    function convertColorBackendToUI(arrayColor){
        // array -> rgb -> hex
        var rgb = arrayToRGB(arrayColor);
        var hex = rgbToHex(rgb);
        return hex;
    }

    function convertColorUIToBackend(hexColor){
        // hex -> rgb -> array
        var rgb = hexToRgb(arrayColor);
        return [ 
            rgb.r / 255.0,
            rgb.g / 255.0, 
            rgb.b / 255.0 
        ];

    }

    function setMaterialPropertiesToDefaults () {

        // shadeless
        setDefaults(dynamicData[STRING_MATERIAL].shadeless, defaultMaterialProperties.shadeless);
        // pbr
        setDefaults(dynamicData[STRING_MATERIAL].pbr, defaultMaterialProperties.pbr);

        function setDefaults(dynamicObject, defaultObject) {
            for (var key in defaultObject) {
                var defaultValue = defaultObject[key].value;
                var defaultMap = defaultObject[key].map;
    
                dynamicObject[key].value = defaultValue;
                dynamicObject[key].map = defaultMap;
            }
        }

    }

    // presets
    function applyNamedMaterial(materialName) {

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

    var TRANSITION_TIME_SECONDS = 0.25;
    var STRING_AWE = "awe";
    var STRING_ANGRY = "angry";
    var STRING_DEFAULT = "default";
    var STRING_LAUGH = "laugh";
    var BLENDSHAPES_DEFAULT = BLENDSHAPE_DATA.defaults;
    var BLENDSHAPES_AWE = BLENDSHAPE_DATA.awe;
    var BLENDSHAPES_LAUGH = BLENDSHAPE_DATA.laugh;
    var BLENDSHAPES_ANGRY = BLENDSHAPE_DATA.angry;

    var lastEmotionUsed = BLENDSHAPES_DEFAULT; // values associated with the last emotion lerping
    var isChangingEmotion = false; // transitioning
    var changingEmotionPercentage = 0.0; // with transitioning
    var isBlendshapeIntervalEnabled = false;

    // used to mix between blendshape expressions
    function mixBlendshapesInterval (deltaTime) {
        if (!isChangingEmotion) {
            return;
        }

        var blendshapeDynamicData = dynamicData[STRING_BLENDSHAPES];

        changingEmotionPercentage += deltaTime / TRANSITION_TIME_SECONDS;
        if (changingEmotionPercentage >= 1.0) {
            changingEmotionPercentage = 1.0;
            isChangingEmotion = false;
        }
        for (var blendshape in blendshapeDynamicData.updatedProperties) {
            MyAvatar.setBlendshape(blendshape,
                mixValue(lastEmotionUsed[blendshape], blendshapeDynamicData.updatedProperties[blendshape], changingEmotionPercentage));
        }

        // Helper function
        function mixValue(valueA, valueB, percentage) {
            return valueA + ((valueB - valueA) * percentage);
        }
    
    }

    function startBlendshapeInterval () {

        if (!isBlendshapeIntervalEnabled) {
            isBlendshapeIntervalEnabled = true;
            Script.update.connect(mixBlendshapesInterval);
        }

    }

    function stopBlendshapeInterval () {

        if (isBlendshapeIntervalEnabled) {
            isBlendshapeIntervalEnabled = false;
            Script.update.disconnect(mixBlendshapesInterval);
        }

    }

    function updateBlendshapes(newBlendshapeDataToApply, isName) {

        if (DEBUG) {
            print("New blendshape data", JSON.stringify(newBlendshapeDataToApply));
        }

        var blendshapeDynamicData = dynamicData[STRING_BLENDSHAPES];

        if (!isName) {
            // is not named blendshape, ensure last blendshape is not selected
            blendshapeDynamicData.selected = "";
        }

        lastEmotionUsed = deepCopy(blendshapeDynamicData.updatedProperties);

        // update all blendshapes in dynamic data
        for(var property in newBlendshapeDataToApply) {
            blendshapeDynamicData.updatedProperties[property] = newBlendshapeDataToApply[property];
        }

        changingEmotionPercentage = 0.0;
        isChangingEmotion = true;
    }

    // presets
    function applyNamedBlendshapes(blendshapeName) {
        // switch statement that matches the blendshape name
        //      "smile" -> updateBlendshapes(BLEND_SMILE);
        switch (blendshapeName){
            case STRING_DEFAULT:
                updateBlendshapes(BLENDSHAPES_DEFAULT, true);
                break;
            case STRING_AWE:
                updateBlendshapes(BLENDSHAPES_AWE, true);
                break;
            case STRING_LAUGH:
                updateBlendshapes(BLENDSHAPES_LAUGH, true);
                break;
            case STRING_ANGRY:
                updateBlendshapes(BLENDSHAPES_ANGRY, true);
                break;
        }
        dynamicData[STRING_BLENDSHAPES].selected = blendshapeName;
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
            print("updating flow: ", subtype, JSON.stringify(newFlowDataToApply))
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

    // App variables
    var UPDATE_UI = CONFIG.UPDATE_UI;
    var BUTTON_NAME = CONFIG.BUTTON_NAME;
    var APP_NAME = CONFIG.APP_NAME;

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
        pbr: deepCopy(CONFIG.INITIAL_DYNAMIC_DATA[STRING_MATERIAL].pbr),
    }

    // Tab dynamic variables
    var currentTab;

    function startup() {

        ui = new AppUi({
            buttonName: BUTTON_NAME,
            home: URL,
            onMessage: onMessage,
            // graphicsDirectory: Script.resolvePath("./resources/icons/"),
            onOpened: onOpened,
            onClosed: onClosed
        });

        // check avatar, if avatar is Avi.fst (or fbx) then set APP_AVI_ENABLED state
        // if not Avi avatar, dynamicData.aviEnabled is false
        // loadAnimationsIntoCache();

        Script.scriptEnding.connect(unload);
    }

    function onClosed() {

        deleteMirror();
        // save lastTab that the user was on
        dynamicData.state.activeTabName = currentTab;

        MyAvatar.hasScriptedBlendshapes = false;

    }

    function onOpened() {

        if (DEBUG) {
            print("ACA101 onOpened: isAviEnabled ", isAviYourCurrentAvatar());
            print("ACA101 onOpened: activeTabName is ", dynamicData.state.activeTabName);
        }

        if (isAviYourCurrentAvatar()) {

            setIsAviEnabledTrue();

            // if your last closed tab has extra setup functionality
            // ensure you have the correct view for the current tab
            switchTabs(dynamicData.state.activeTabName);

        } else {
            setIsAviEnabledFalse();
        }

        updateUI();

    }

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
        if(currentTab === STRING_BLENDSHAPES) {
            // enable scripted blendshapes
            MyAvatar.hasScriptedBlendshapes = true;
            startBlendshapeInterval();
        }
        if (previousTab === STRING_BLENDSHAPES && currentTab !== STRING_BLENDSHAPES){
            // disable scripted blendshapes
            MyAvatar.hasScriptedBlendshapes = false;
            stopBlendshapeInterval();
        }

    }

    function unload() {


        deleteMirror();

        // Set blendshapes back to normal
        MyAvatar.hasScriptedBlendshapes = true;
        startBlendshapeInterval();
        applyNamedBlendshapes(BLENDSHAPES_DEFAULT);

        Script.setTimeout(function () {
            MyAvatar.hasScriptedBlendshapes = false;
            stopBlendshapeInterval();
        }, 200);

        if (materialID) {
            Entities.deleteEntity(materialID);
            materialID = null;
        }

    }

    // #endregion APP

    // #region EVENTS

    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE;
    var EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR = CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR;
    var EVENT_RESTORE_SAVED_AVATAR = CONFIG.EVENT_RESTORE_SAVED_AVATAR;
    var EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR = CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR;
    var EVENT_UPDATE_MATERIAL = CONFIG.EVENT_UPDATE_MATERIAL;
    var EVENT_UPDATE_BLENDSHAPE = CONFIG.EVENT_UPDATE_BLENDSHAPE;
    var EVENT_UPDATE_FLOW = CONFIG.EVENT_UPDATE_FLOW;
    var EVENT_UPDATE_ANIMATION = CONFIG.EVENT_UPDATE_ANIMATION;
    var EVENT_CHANGE_TAB = CONFIG.EVENT_CHANGE_TAB;
    var EVENT_UPDATE_AVATAR = CONFIG.EVENT_UPDATE_AVATAR;

    var DEBUG_EVENTS = true;

    // Handles events recieved from the UI
    function onMessage(data) {

        // EventBridge message from HTML script.

        // Check against EVENT_NAME to ensure we're getting the correct messages from the correct app
        if (!data.type || data.type.indexOf(APP_NAME) === -1) {
            if (DEBUG_EVENTS) {
                print("Event type event name index check: ", !data.type, data.type.indexOf(APP_NAME) === -1);
            }
            return;
        }
        data.type = data.type.replace(APP_NAME, "");

        if (DEBUG_EVENTS) {
            print("onMessage: ", data.type);
            print("subtype: ", data.subtype);
        }

        switch (data.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:

                updateUI();
                break;

            case EVENT_UPDATE_AVATAR:

                switch (data.subtype) {
                    case EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR:
                        saveAvatarAndChangeToAvi();
                        break;
                    case EVENT_RESTORE_SAVED_AVATAR:
                        restoreAvatar();
                        break;
                    case EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR:
                        changeAvatarToAvi();
                        break;
                    default:
                        break;
                }

                break;

            case EVENT_CHANGE_TAB:

                switchTabs(data.value);

                break;

            case EVENT_UPDATE_MATERIAL:

                // delegates the method depending on if 
                // event has name property or updates property
                if (DEBUG) {
                    print("MATERIAL EVENT" , data.subtype, " ", data.name);
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

                        updateMaterialProperty(propertyName, newMaterialData, componentType, isPBR)

                        break;
                    case STRING_UPDATE_ENTITY_PROPERTIES:
                        updateMaterial(data.updates, false, true);
                        break;

                }

                updateUI(STRING_MATERIAL);

                break;

            case EVENT_UPDATE_BLENDSHAPE:

                if (data.name) {
                    applyNamedBlendshapes(data.name);
                } else {
                    updateBlendshapes(data.updates);
                }

                updateUI(STRING_BLENDSHAPES);

                break;
            case EVENT_UPDATE_FLOW:

                switch (data.subtype) {
                    case STRING_DEBUG_TOGGLE:
                        print("TOGGLE DEBUG SPHERES ", data.updates)
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
            type: UPDATE_UI,
            subtype: type ? type : "",
            value: type ? dynamicData[type] : dynamicData
        };

        if (DEBUG_EVENTS) {
            print("Update UI", type);
        }

        ui.sendToHtml(messageObject);
    }

    // #endregion EVENTS

    startup();

}());