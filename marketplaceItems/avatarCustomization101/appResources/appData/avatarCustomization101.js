(function () {

    // Modules
    var AppUi = Script.require("appUi"),
        URL = Script.resolvePath("./resources/avatarCustomization101_ui.html?v1234455"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v123456")),
        AVATAR_FILE = "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/marketplaceItems/avatarCustomization101/mannequinHairTest8.fst"; 
        // Script.resolvePath("./resources/avatar/mannequinHairTest8.fst");

    var AVATAR_URL = "http://mpassets.highfidelity.com/3df00699-86ca-4f6a-944e-170c090b2d6a-v1/Max_Final.fst";

    var DEBUG = true;

    // #region MIRROR FUNCTIONS

    var MIRROR_DISTANCE_M = 0.5;
    var MIRROR_DISTANCE_BLENDSHAPES_M = 0.3; // mirror is closer when looking at your face

    var mirrorID;

    function spawnMirror() {
        // create mirrror parent to avatar
        // set to default distance

        // if tab is blendshapes setMirrorDistanceToBlendshapes()
    }

    function setMirrorDistanceToDefault() {
        // edit mirror properties to set mirror distance to MIRROR_DISTANCE_M

    }

    function setMirrorDistanceToBlendshapes() {
        // edit mirror properties to set mirror distance to MIRROR_DISTANCE_BLENDSHAPES_M
    }

    function deleteMirror() {
        // Delete mirror entity 
        // set mirrorID to null
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
        setIsAviEnabledTrue();
    }

    function isAviYourCurrentAvatar() {
        return MyAvatar.skeletonModelURL === AVATAR_URL;
    }

    // Contains all steps to set the app state to isAviEnabled = true
    function setIsAviEnabledTrue() {
        dataStore.isAviEnabled = true;
        spawnMirror();

        updateUI();
    } 

    // Contains all steps to set the app state to isAviEnabled = false
    function setIsAviEnabledFalse() {
        dataStore.isAviEnabled = false;
        dataStore.activeTabName = STRING_INFO;

        updateUI();
    }

    // #endregion AVATAR FUNCTIONS


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
        STRING_INFO = CONFIG.STRING_INFO;

    // UI variables
    var ui;
    var dataStore = CONFIG.INITIAL_DATASTORE_SETTINGS;

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
        // if not Avi avatar, dataStore.aviEnabled is false
        // loadAnimationsIntoCache();

        Script.scriptEnding.connect(unload);
    }

    function onClosed() {

        
        // deleteMirror
        // save lastTab that the user was on
        dataStore.activeTabName = currentTab;

    }

    function onOpened() {

        if (DEBUG) {
            print("ACA101 onOpened: isAviEnabled ", isAviYourCurrentAvatar());
            print("ACA101 onOpened: activeTabName is ", dataStore.activeTabName);
        }

        if (isAviYourCurrentAvatar()) {

            setIsAviEnabledTrue();
            spawnMirror();

            // if your last closed tab has extra setup functionality
            // ensure you have the correct view for the current tab
            switchTabs(dataStore.activeTabName);

        } else {
            setIsAviEnabledFalse();

            // updateLayout
        }

        updateUI();

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

        // deleteMirror()
        // deleteFlowDebugSpheres();
        // removeAvi as avatar and restore old avatar
        //      if no old avatar in Settings setAvatar to Woody?

    }

    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE;
    var EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR = CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR;
    var EVENT_RESTORE_SAVED_AVATAR = CONFIG.EVENT_RESTORE_SAVED_AVATAR;
    var EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR = CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR;
    var EVENT_UPDATE_MATERIAL = CONFIG.EVENT_UPDATE_MATERIAL;
    var EVENT_UPDATE_BLENDSHAPE = CONFIG.EVENT_UPDATE_BLENDSHAPE;
    var EVENT_UPDATE_FLOW = CONFIG.EVENT_UPDATE_FLOW;
    var EVENT_UPDATE_ANIMATION = CONFIG.EVENT_UPDATE_ANIMATION;
    var EVENT_CHANGE_TAB = CONFIG.EVENT_CHANGE_TAB;

    // Handles events recieved from the UI
    function onMessage(data) {

        // EventBridge message from HTML script.

        // Check against EVENT_NAME to ensure we're getting the correct messages from the correct app
        if (!data.type || data.type.indexOf(APP_NAME) === -1) {
            if (DEBUG) {
                print("Event type event name index check: ", !data.type, data.type.indexOf(APP_NAME) === -1);
            }
            return;
        }
        data.type = data.type.replace(APP_NAME, "");

        switch (data.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                if (DEBUG) {
                    print("onMessage: ", EVENT_BRIDGE_OPEN_MESSAGE);
                }

                print("ROBIN CHECK4");

                updateUI();

                break;
            case EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR:
                if (DEBUG) {
                    print("onMessage: ", EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR);
                }

                saveAvatarAndChangeToAvi();

                break;
            case EVENT_CHANGE_TAB:
                if (DEBUG) {
                    print("onMessage: ", EVENT_CHANGE_TAB);
                }

                switchTabs(data.value);

                break;
            case EVENT_RESTORE_SAVED_AVATAR:
                if (DEBUG) {
                    print("onMessage: ", EVENT_RESTORE_SAVED_AVATAR);
                }

                restoreAvatar();

                break;
            case EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR:
                if (DEBUG) {
                    print("onMessage: ", EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR);
                }

                changeAvatarToAvi();

                break;
            case EVENT_UPDATE_MATERIAL:
                if (DEBUG) {
                    print("onMessage: ", EVENT_UPDATE_MATERIAL);
                }

                // if data.name 
                //     applyNamedMaterial(data.name)
                // else 
                //     updateMaterial(data.updates)

                break;
            case EVENT_UPDATE_BLENDSHAPE:
                if (DEBUG) {
                    print("onMessage: ", EVENT_UPDATE_BLENDSHAPE);
                }

                // if data.name 
                //     applyNamedBlendshape(data.name)
                // else 
                //     updateMaterial(data.updates)

                break;
            case EVENT_UPDATE_FLOW:
                if (DEBUG) {
                    print("onMessage: ", EVENT_UPDATE_FLOW);
                }

                // updateFlow(data.updates);

                break;
            case EVENT_UPDATE_ANIMATION:
                if (DEBUG) {
                    print("onMessage: ", EVENT_UPDATE_ANIMATION);
                }

                // updateAnimation(data.name);

                break;

            default:
                break;
        }

    }

    function updateUI() {

        print("Robin updating UI");
        console.log("ROBIN CHECKS3 in updateui: " + EVENT_BRIDGE_OPEN_MESSAGE);
        
        var messageObject = {
            type: UPDATE_UI,
            value: dataStore
        };

        ui.sendToHtml(messageObject);
    }

    // #endregion APP

    startup();

}());