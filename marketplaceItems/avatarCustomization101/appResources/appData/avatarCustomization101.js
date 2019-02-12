/* global GlobalDebugger */

(function () {


    // Modules
    Script.include(Script.resolvePath("https://hifi-content.s3.amazonaws.com/luis/flowFiles/flow.js"));

    var AppUi = Script.require("appUi"),
        URL = Script.resolvePath("./resources/avatarCustomization101_ui.html?v12344555"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v1234567")),
        BLENDSHAPE_DATA = Script.require(Script.resolvePath("./resources/modules/blendshapes.js")),
        MATERIAL_DATA = Script.require(Script.resolvePath("./resources/presetData/materials.js")),
        AVATAR_FILE = "https://hifi-content.s3.amazonaws.com/jimi/avatar/CustomAvatar101/avatar.fst";
    // Script.resolvePath("./resources/avatar/mannequinHairTest8.fst");

    var AVATAR_URL = "https://hifi-content.s3.amazonaws.com/jimi/avatar/CustomAvatar101/avatar.fst";

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

    // #endregion UTILITY FUNCTIONS

    // #region MIRROR FUNCTIONS

    var MIRROR_DISTANCE_M = 0.5;
    var MIRROR_DISTANCE_BLENDSHAPES_M = 0.3; // mirror is closer when looking at your face

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

    function setMirrorDistanceToDefault() {
        // edit mirror properties to set mirror distance to MIRROR_DISTANCE_M
        var position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0.5, z: -MIRROR_DISTANCE_M }));
        Entities.editEntity(mirrorCubeID, {
            position: position
        });
    }

    function setMirrorDistanceToBlendshapes() {
        // edit mirror properties to set mirror distance to MIRROR_DISTANCE_BLENDSHAPES_M
        var position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, { x: 0, y: 0.5, z: -MIRROR_DISTANCE_BLENDSHAPES_M }));
        Entities.editEntity(mirrorCubeID, {
            position: position
        });
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

        // getAvatarInfo
        // Save Avatar information via Settings
        //      !idea if there's already avatar information in the Settings (and different than curr)
        //      should we have a prompt that asks if they want to overwrite this avatar info
        // Change Avatar to Avi ()
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

    var materialID;
    var materialProperties;

    var MATERIAL_PRESETS = CONFIG.MATERIAL_PRESETS;

    // @args updatesObject name [string]
    function updateMaterial(newMaterialDataToApply) {
        // edit entity with newMaterialDataToApply

        // Applies to all materials
        var materialProperties = {
            avatarID: MyAvatar.sessionUUID,
            type: "material"
            // etc. double check
        };

        // exists
        if (materialID) {
            print("Material exists, Entities.editEntity time to update!");
        } else {
            // needs to be created
            print("Material must be created! Entities.addEntity");
        }
    }

    // presets
    function applyNamedMaterial(materialName) {
        var properties = MATERIAL_PRESETS[materialName];

        updateMaterial(properties);
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

    function mixValue(valueA, valueB, percentage) {
        return valueA + ((valueB - valueA) * percentage);
    }

    var lastEmotionUsed = BLENDSHAPES_DEFAULT;
    var emotion = BLENDSHAPES_DEFAULT;
    var isChangingEmotion = false;
    var changingEmotionPercentage = 0.0;

    Script.update.connect(function(deltaTime) {
        if (!isChangingEmotion) {
            return;
        }
        changingEmotionPercentage += deltaTime / TRANSITION_TIME_SECONDS;
        if (changingEmotionPercentage >= 1.0) {
            changingEmotionPercentage = 1.0;
            isChangingEmotion = false;
            if (emotion === BLENDSHAPES_DEFAULT) {
                MyAvatar.hasScriptedBlendshapes = false;
            }
        }
        for (var blendshape in emotion) {
            MyAvatar.setBlendshape(blendshape,
                mixValue(lastEmotionUsed[blendshape], emotion[blendshape], changingEmotionPercentage));
        }
    });

    function updateBlendshapes(newBlendshapeDataToApply) {
        // try {
        //     console.log(newBlendshapeDataToApply);
        //     var data = JSON.parse(newBlendshapeDataToApply);

        // } catch (e) {
        //     console.log(e, "error");
        //     return;
        // }
        if (emotion !== lastEmotionUsed) {
            lastEmotionUsed = emotion;
        }
        if (newBlendshapeDataToApply !== lastEmotionUsed) {
            changingEmotionPercentage = 0.0;
            emotion = newBlendshapeDataToApply;
            isChangingEmotion = true;
            MyAvatar.hasScriptedBlendshapes = true;
        }
    }


    // presets
    function applyNamedBlendshapes(materialName) {
        // switch statement that matches the blendshape name
        //      "smile" -> updateBlendshapes(BLEND_SMILE);
        switch (materialName){
            case STRING_DEFAULT:
                updateBlendshapes(BLENDSHAPES_DEFAULT);
                break;
            case STRING_AWE:
                updateBlendshapes(BLENDSHAPES_AWE);
                break;
            case STRING_LAUGH:
                updateBlendshapes(BLENDSHAPES_LAUGH);
                break;
            case STRING_ANGRY:
                updateBlendshapes(BLENDSHAPES_ANGRY);
                break;
        }
    }

    // #endregion BLENDSHAPES

    // #region FLOW

    // Called when user navigates to flow tab
    function addRemoveFlowDebugSpheres(isEnable) {
        // draw debug circles on the joints
        // get function from flow app
        // get function from flow app
        var flowSettings = GlobalDebugger.getDisplayData();

        // the state of flow is the opposite of what we want
        if (flowSettings.collisions !== isEnable) {
            GlobalDebugger.toggleDebugShapes();
        }
    }

    function deleteFlowDebugSpheres() {
        // if debug spheres exist
        // delete
        // get function from flow app
        var flowSettings = GlobalDebugger.getDisplayData();

        if (flowSettings.collisions) {
            GlobalDebugger.toggleDebugShapes();
        }
    }

    function updateFlow(newFlowDataToApply) {
        // check update interval from flow app

        // case MSG_JOINT_INPUT_DATA: {
        //     GlobalDebugger.setJointDataValue(message.group, message.name, message.value);
        //     break;
        // }
        // case MSG_COLLISION_INPUT_DATA: {
        //     GlobalDebugger.setCollisionDataValue(message.group, message.name, message.value);
        //     break;
        // }
    }

    // #endregion FLOW

    // #region ANIMATION

    var ANIMATION_1_DATA = {
        startframe: null,
        endframe: null,
        duration: null
    };
    var STRING_DEFAULT_WALK = "defaultWalk"; // todo check on string

    function loadAnimationsIntoCache() {
        // loop through all animations and add them to the AnimationCache
    }

    function updateAnimation(animationName) {
        // update default walk to animation
    }

    // #endregion

    // #region APP

    // App variables
    var UPDATE_UI = CONFIG.UPDATE_UI;
    var BUTTON_NAME = CONFIG.BUTTON_NAME;
    var APP_NAME = CONFIG.APP_NAME;

    // Static strings
    var STRING_MATERIAL = CONFIG.STRING_MATERIAL,
        STRING_BLENDSHAPES = CONFIG.STRING_BLENDSHAPES,
        STRING_ANIMATION = CONFIG.STRING_ANIMATION,
        STRING_FLOW = CONFIG.STRING_FLOW,
        STRING_INFO = CONFIG.STRING_INFO,
        STRING_STATE = CONFIG.STRING_STATE;

    // UI variables
    var ui;
    var dynamicData = deepCopy(CONFIG.INITIAL_DYNAMIC_DATA);

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

            // updateLayout
        }
    }

    function switchTabs(tabName) {

        // if tabName === STRING_BLENDSHAPES
        //      setMirrorDistanceToBlendshapes();
        // if currentTab === STRING_BLENDSHAPES && tabName !== STRING_BLENDSHAPES
        //      setMirrorDistanceToDefault();

        // if tabName === STRING_FLOW
        //      createFlowDebugSpheres();
        // if currentTab === STRING_FLOW && tabName !== STRING_FLOW
        //      deleteFlowDebugSpheres();

        currentTab = tabName;

    }

    function unload() {

        deleteMirror();

        // deleteFlowDebugSpheres();
        // removeAvi as avatar and restore old avatar
        //      if no old avatar in Settings setAvatar to Woody?

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
                if (data.name) {
                    applyNamedMaterial(data.name);
                } else {
                    updateMaterial(data.updates);
                }

                break;

            case EVENT_UPDATE_BLENDSHAPE:

                if (data.name) {
                    applyNamedBlendshapes(data.name);
                } else {
                    updateBlendshapes(data.updates);
                }

                break;
            case EVENT_UPDATE_FLOW:

                if (data.subtype === "hair") {
                    print("FLOW: updating hair flow");
                    // updateHairFlow();
                } else if (data.subtype === "joints") {
                    print("FLOW: updating joints flow");
                    // updateJointsFlow();
                }

                break;
            case EVENT_UPDATE_ANIMATION:

                // updateAnimation(data.name);

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