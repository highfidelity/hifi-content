// Kayla-Camera.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Helper for live events to capture camera positions

(function() {
    // Polyfills
    Script.require(Script.resolvePath('./Polyfills.js'));

    // Init
    var isAppActive = false,
        isTabletUIOpen = false,
        invisibleAvatarURL = "http://hifi-content.s3.amazonaws.com/ozan/dev/avatars/invisible_avatar/invisible_avatar.fst",
        cameraAvatarURL = "https://hifi-content.s3.amazonaws.com/jimi/avatar/camera/fst/camera.fst",
        SETTINGS_STRING = "io.kayla.camera.settings",
        LOAD_JSON = "loadJSON",
        UPDATE_CONFIG_NAME = "updateConfigName",
        ENABLE_CUSTOM_LISTENER = "enableCustomListener",
        DISABLE_CUSTOM_LISTENER = "disableCustomListener",
        UPDATE_CUSTOM_LISTENER = "updateCustomListener",
        ADD_CAMERA_POSITION = "addCameraPosition",
        EDIT_CAMERA_POSITION_KEY = "editCameraPositionKey",
        REMOVE_CAMERA_POSITION = "removeCameraPosition",
        EDIT_CAMERA_POSITION_NAME = "editCameraPositionName",
        CHANGE_AVATAR_TO_CAMERA = "changeAvatarToCamera",
        CHANGE_AVATAR_TO_INVISIBLE = "changeAvatarToInvisible",
        TOGGLE_AVATAR_COLLISIONS = "toggleAvatarCollisions",
        UPDATE_UI = "update_ui";

    // Collections
    var defaultSettings = {
        configName: "Rename config",
        mapping: {},
        listener: {
            isCustomListening: false,
            customPosition: {
                x: 0,
                y: 0,
                z: 0
            },
            customOrientation: {
                x: 0,
                y: 0,
                z: 0,
                w: 0
            }
        }
    };
    var settings;
    var oldSettings = Settings.getValue(SETTINGS_STRING);
    console.log("oldSettings", JSON.stringify(oldSettings));
    if (oldSettings === "") {
        settings = defaultSettings;
        Settings.setValue(SETTINGS_STRING, settings);
    } else {
        settings = oldSettings;
    }
    
    // Helper Functions
    function setAppActive(active) {
        // Start/stop application activity.
        if (active) {
            console.log("Start app");
            // TODO: Start app activity.
        } else {
            console.log("Stop app");
            // TODO: Stop app activity.
        }
        isAppActive = active;
    }

    function getPose() {
        return [MyAvatar.position, MyAvatar.headOrientation];
    }

    // Constructor Functions
    function Mapping(name, key, position, orientation) {
        this.name = name;
        this.key = key;
        this.position = position;
        this.orientation = orientation;
    }

    // Procedural Functions
    function loadJSON(newSettings) {
        settings = newSettings;
    }

    function updateConfigName(name) {
        settings.configName = name;
    }

    function enableCustomListener() {
        settings.listener.isCustomListening = true;
        MyAvatar.audioListenerMode = MyAvatar.audioListenerModeCustom;
    }

    function disableCustomListener() {
        settings.listener.isCustomListening = false;
        MyAvatar.audioListenerMode = MyAvatar.audioListenerModeHead;
    }

    function updateCustomListener() {
        var pose = getPose();
        var listeningPosition = pose[0];
        var listeningOrientation = pose[1];
        MyAvatar.customListenPosition = listeningPosition;
        MyAvatar.customListenOrientation = listeningOrientation;
        settings.listener.customPosition = listeningPosition;
        settings.listener.customOrientation = listeningOrientation;
    }

    function addCameraPosition(name, key) {
        var pose = getPose();
        var mapping = new Mapping(name, key, pose[0], pose[1]);
        settings.mapping[key] = mapping;
    }

    function editCameraPositionKey(key, newKey) {
        var temp = settings.mapping[key];
        delete settings.mapping[key];
        settings.mapping[newKey] = temp;
        settings.mapping[newKey].key = newKey;
    }

    function removeCameraPosition(key) {
        if (settings.mapping[key]) {
            delete settings.mapping[key];
        }
    }

    function editCameraPositionName(key, name) {
        settings.mapping[key].name = name;
    }

    function changeAvatarToCamera() {
        MyAvatar.skeletonModelURL = cameraAvatarURL;
    }

    function changeAvatarToInvisible() {
        MyAvatar.skeletonModelURL = invisibleAvatarURL;
    }

    function toggleAvatarCollisions() {
        MyAvatar.collisionsEnabled = !MyAvatar.collisionsEnabled;
    }

    function keyPressHandler(event) {
        if (settings.mapping[event.text]) {
            var position = settings.mapping[event.text].position;
            var orientation = settings.mapping[event.text].orientation;
            var string = "/" +
                        position.x + "," +
                        position.y + "," +
                        position.z + "/" +
                        orientation.x + "," +
                        orientation.y + "," +
                        orientation.z + "," +
                        orientation.w;
            MyAvatar.headOrientation = orientation;
            MyAvatar.position = position;
            // location.handleLookupString(string);
        }
    }
    
    function updateSettings() {
        Settings.setValue(SETTINGS_STRING, settings);
    }

    function setup() {
        tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
        tabletButton = tablet.addButton({
            text: buttonName,
            icon: "icons/tablet-icons/raise-hand-i.svg",
            activeIcon: "icons/tablet-icons/raise-hand-a.svg",
            isActive: isAppActive
        });
        if (tabletButton) {
            tabletButton.clicked.connect(onTabletButtonClicked);
        } else {
            console.error("ERROR: Tablet button not created! App not started.");
            tablet = null;
            return;
        }
        tablet.gotoHomeScreen();
        tablet.screenChanged.connect(onTabletScreenChanged);

        Controller.keyPressEvent.connect(keyPressHandler);
    }

    function doUIUpdate() {
        console.log("SETTINGs", JSON.stringify(settings));
        tablet.emitScriptEvent(JSON.stringify({
            type: UPDATE_UI,
            value: settings
        }));
    }
    
    // Tablet
    var tablet = null,
        buttonName = "Kayla-Camera",
        tabletButton = null,
        APP_URL = Script.resolvePath('./Tablet/Kayla-Camera-Tablet.html'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        SET_ACTIVE_MESSAGE = "setActive",
        CLOSE_DIALOG_MESSAGE = "closeDialog";


    function onTabletButtonClicked() {
        // Application tablet/toolbar button clicked.
        if (isTabletUIOpen) {
            tablet.gotoHomeScreen();
        } else {
            // Initial button active state is communicated via URL parameter so that active state is set immediately without 
            // waiting for the event bridge to be established.
            tablet.gotoWebScreen(APP_URL + "?active=" + isAppActive);
        }
    }

    function onTabletScreenChanged(type, url) {
        // Tablet screen changed / desktop dialog changed.
        var wasTabletUIOpen = isTabletUIOpen;

        isTabletUIOpen = url.substring(0, APP_URL.length) === APP_URL; // Ignore URL parameter.
        if (isTabletUIOpen === wasTabletUIOpen) {
            return;
        }

        if (isTabletUIOpen) {
            tablet.webEventReceived.connect(onTabletWebEventReceived);
        } else {
            // setUIUpdating(false);
            tablet.webEventReceived.disconnect(onTabletWebEventReceived);
        }
    }

    function onTabletWebEventReceived(data) {
        // EventBridge message from HTML script.
        var message;
        try {
            message = JSON.parse(data);
        } catch (e) {
            return;
        }

        switch (message.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                doUIUpdate();
                break;
            case SET_ACTIVE_MESSAGE:
                if (isAppActive !== message.value) {
                    tabletButton.editProperties({
                        isActive: message.value
                    });
                    setAppActive(message.value);
                }
                tablet.gotoHomeScreen(); // Automatically close app.
                break;
            case LOAD_JSON:
                var settings = message.value;
                loadJSON(settings);
                updateSettings();
                doUIUpdate();
                break;
            case UPDATE_CONFIG_NAME:
                var name = message.value;
                updateConfigName(name);
                updateSettings();
                doUIUpdate();
                break;
            case ENABLE_CUSTOM_LISTENER:
                enableCustomListener();
                updateSettings();
                doUIUpdate();
                break;
            case DISABLE_CUSTOM_LISTENER:
                disableCustomListener();
                updateSettings();
                doUIUpdate();
                break;
            case UPDATE_CUSTOM_LISTENER:
                updateCustomListener();
                updateSettings();
                doUIUpdate();
                break;
            case ADD_CAMERA_POSITION:
                var name = message.value.name;
                var key = message.value.key;
                addCameraPosition(name, key);
                updateSettings();
                doUIUpdate();
                break;
            case EDIT_CAMERA_POSITION_KEY:
                var key = message.value.key;
                var newKey = message.value.newKey;
                editCameraPositionKey(key, newKey);
                updateSettings();
                doUIUpdate();
                break;
            case REMOVE_CAMERA_POSITION:
                var key = message.value;
                removeCameraPosition(key);
                updateSettings();
                doUIUpdate();
                break;
            case EDIT_CAMERA_POSITION_NAME:
                var name = message.value.name;
                var key = message.value.key;
                editCameraPositionName(key, name);
                updateSettings();
                doUIUpdate();
                break;
            case CHANGE_AVATAR_TO_CAMERA:
                changeAvatarToCamera();
                break;
            case CHANGE_AVATAR_TO_INVISIBLE:
                changeAvatarToInvisible();
                break;
            case TOGGLE_AVATAR_COLLISIONS:
                toggleAvatarCollisions();
                break;
            case CLOSE_DIALOG_MESSAGE:
                tablet.gotoHomeScreen();
                break;
        }
    }

    // Main
    setup();

    // Cleanup
    function scriptEnding() {
        console.log("### in script ending");
        if (isAppActive) {
            setAppActive(false);
        }
        if (isTabletUIOpen) {
            tablet.webEventReceived.disconnect(onTabletWebEventReceived);
        }
        if (tabletButton) {
            tabletButton.clicked.disconnect(onTabletButtonClicked);
            tablet.removeButton(tabletButton);
            tabletButton = null;
        }
        tablet = null;
        Controller.keyPressEvent.disconnect(keyPressHandler);
    }

    Script.scriptEnding.connect(scriptEnding);
}());
