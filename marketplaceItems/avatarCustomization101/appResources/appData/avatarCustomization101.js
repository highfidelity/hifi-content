(function () {

    // Modules
    var AppUi = Script.require("appUi"),
        URL = Script.resolvePath("./resources/avatarCustomization101_ui.html?v1"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v1"));


    var DEBUG = false;

    // #region APP

    // App variables
    var UPDATE_UI = CONFIG.UPDATE_UI;
    var BUTTON_NAME = CONFIG.BUTTON_NAME;

    // UI variables
    var ui;
    var dataStore = {

    };

    // Tab dynamic variables
    var lastTab;
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

    function enableAvi() {
        saveAvatarAndChangeToAvi();
        spawnMirror();
    }

    function onClosed() {

        // deleteMirror
        // save lastTab that the user was on
        // lastTab = currentTab;

    }

    function onOpened() {

        if (isAviYourCurrentAvatar()) {
            // Avi enabled = true
            // go to lastTabOpen
            // currentTab = lastTab
            // lastTab = null;
            spawnMirror();
        } else {
            // Avi enabled = false;
            // currentTab = info;

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

        // currentTab = tabName;
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
        if (!data.type || data.type.indexOf(EVENT_NAME) === -1) {
            if (DEBUG) {
                print("Event type event name index check: ", !data.type, data.type.indexOf(EVENT_NAME) === -1);
            }
            return;
        }
        data.type = data.type.replace(EVENT_NAME, "");

        if (DEBUG) {
            print("Event type replace name:", "'", data.type, "' & '", VOTE_AVATAR, "'");
            print("Event type replace name: ", data.type === VOTE_AVATAR);
        }

        switch (data.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                if (DEBUG) {
                    print("onMessage: ", EVENT_BRIDGE_OPEN_MESSAGE);
                }

                // updateUi();

                break;
            case EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR:
                if (DEBUG) {
                    print("onMessage: ", EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR);
                }

                // saveAvatarAndChangeToAvi();

                break;
            case EVENT_CHANGE_TAB:
                if (DEBUG) {
                    print("onMessage: ", EVENT_CHANGE_TAB);
                }

                // switchTabs(data.tabName);

                break;
            case EVENT_RESTORE_SAVED_AVATAR:
                if (DEBUG) {
                    print("onMessage: ", EVENT_RESTORE_SAVED_AVATAR);
                }

                // changeAvatarToSaved();

                break;
            case EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR:
                if (DEBUG) {
                    print("onMessage: ", EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR);
                }

                // changeAvatarToAvi();

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

        var messageObject = {
            type: UPDATE_UI,
            value: dataStore
        };

        ui.sendToHtml(messageObject);
    }

    // #endregion APP

    startup();

}());