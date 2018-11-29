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

(function () {

    // Polyfills
    Script.require(Script.resolvePath('./Polyfills.js'));

    // Init
    var isAppActive = false,
        isTabletUIOpen = false,
        invisibleAvatarURL = "http://hifi-content.s3.amazonaws.com/ozan/dev/avatars/invisible_avatar/invisible_avatar.fst",
        cameraAvatarURL = "https://hifi-content.s3.amazonaws.com/jimi/avatar/camera/fst/camera.fst",
        SETTINGS_STRING = "io.kayla.camera.settings",
        LOAD_JSON = "loadJSON",
        AUDIO_LISTENER_MODE_HEAD = 0,
        AUDIO_LISTENER_MODE_CAMERA = 1,
        AUDIO_LISTENER_MODE_CUSTOM = 2,
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
        EDIT_DEFAULT = "editDefault",
        EDIT_BRAKE = "editBrake",
        UPDATE_UI = "update_ui",
        SET_LISTENER_POSITION_KEY = "t",
        SET_LISTENER_TOGGLE_KEY = "y"
    ;

    // Collections
    var defaultSettings = {
        configName: "Rename config",
        mapping: {},
        listener: {
            isCustomListening: false,
            currentMode: getCurrentListener(),
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

    // GRACEFUL CAMERA
    // CLEAN UP WHEN WE CAN

    var DEFAULT = "default";
    var BRAKE = "brake";
    var currentSetting = DEFAULT;

    settings.DEFAULT_PARAMETERS = {
        // Coefficient to use for linear drag.  Higher numbers will cause motion to
        // slow down more quickly.
        DRAG_COEFFICIENT: 60.0,
        MAX_SPEED: 10.0,
        ACCELERATION: 10.0,

        MOUSE_YAW_SCALE: -0.125,
        MOUSE_PITCH_SCALE: -0.125,
        MOUSE_SENSITIVITY: 0.5,

        // Damping frequency, adjust to change mouse look behavior
        W: 2.2
    };

    settings.BRAKE_PARAMETERS = {
        DRAG_COEFFICIENT: 4.9,
        MAX_SPEED: settings.DEFAULT_PARAMETERS.MAX_SPEED,
        ACCELERATION: 0,

        W: 1.0,
        MOUSE_YAW_SCALE: -0.125,
        MOUSE_PITCH_SCALE: -0.125,
        MOUSE_SENSITIVITY: 0.5
    };

    var DRIVE_AVATAR_ENABLED = true;
    var UPDATE_RATE = 90;
    var USE_INTERVAL = true;

    settings.movementParameters = settings.DEFAULT_PARAMETERS;
    currentSetting = DEFAULT;


    // Movement keys
    var KEY_BRAKE = "Q";
    var KEY_FORWARD = "W";
    var KEY_BACKWARD = "S";
    var KEY_LEFT = "A";
    var KEY_RIGHT = "D";
    var KEY_UP = "Space";
    var KEY_DOWN = "C";
    var KEY_TOGGLE = "M";
    // var KEY_MOUSE_VISIBLE = "N";


    var KEYS;
    if (DRIVE_AVATAR_ENABLED) {
        KEYS = [KEY_BRAKE, KEY_FORWARD, KEY_BACKWARD, KEY_LEFT, KEY_RIGHT, KEY_UP, KEY_DOWN];
    } else {
        KEYS = [];
    }

    // Global Variables
    var keys = {};
    var velocity = { x: 0, y: 0, z: 0 };
    var velocityVertical = 0;
    var enabled = false;
    var mouseVisible = true;

    var lastX = Reticle.getPosition().x;
    var lastY = Reticle.getPosition().y;
    var yawFromMouse = 0;
    var pitchFromMouse = 0;

    var yawSpeed = 0;
    var pitchSpeed = 0;


    function update(dt) {
        if (enabled && Window.hasFocus()) {
            var x = Reticle.getPosition().x;
            var y = Reticle.getPosition().y;

            var dx = x - lastX;
            var dy = y - lastY;

            yawFromMouse += (dx * settings.movementParameters.MOUSE_YAW_SCALE * settings.movementParameters.MOUSE_SENSITIVITY);
            pitchFromMouse += (dy * settings.movementParameters.MOUSE_PITCH_SCALE * settings.movementParameters.MOUSE_SENSITIVITY);
            pitchFromMouse = Math.max(-180, Math.min(180, pitchFromMouse));

            resetCursorPosition();
        }

        // Here we use a linear damping model - http://en.wikipedia.org/wiki/Damping#Linear_damping
        // Because we are using a critically damped model (no oscillation), ζ = 1 and
        // so we derive the formula: acceleration = -(2 * w0 * v) - (w0^2 * x)
        var W = settings.movementParameters.W;
        yawAccel = (W * W * yawFromMouse) - (2 * W * yawSpeed);
        pitchAccel = (W * W * pitchFromMouse) - (2 * W * pitchSpeed);

        yawSpeed += yawAccel * dt;
        var yawMove = yawSpeed * dt;
        var newOrientation = Quat.multiply(MyAvatar.orientation, Quat.fromVec3Degrees({ x: 0, y: yawMove, z: 0 }));
        MyAvatar.orientation = newOrientation;
        yawFromMouse -= yawMove;

        pitchSpeed += pitchAccel * dt;
        var pitchMove = pitchSpeed * dt;
        var newPitch = MyAvatar.headPitch + pitchMove;
        MyAvatar.headPitch = newPitch;
        pitchFromMouse -= pitchMove;


        if (DRIVE_AVATAR_ENABLED) {
            var targetVelocity = { x: 0, y: 0, z: 0 };
            var targetVelocityVertical = 0;
            var acceleration = settings.movementParameters.ACCELERATION;

            if (keys[KEY_FORWARD]) {
                targetVelocity.z -= acceleration * dt;
            }
            if (keys[KEY_LEFT]) {
                targetVelocity.x -= acceleration * dt;
            }
            if (keys[KEY_BACKWARD]) {
                targetVelocity.z += acceleration * dt;
            }
            if (keys[KEY_RIGHT]) {
                targetVelocity.x += acceleration * dt;
            }
            if (keys[KEY_UP]) {
                targetVelocityVertical += acceleration * dt;
            }
            if (keys[KEY_DOWN]) {
                targetVelocityVertical -= acceleration * dt;
            }

            // If force isn't being applied in a direction, add drag;
            var drag = Math.max(settings.movementParameters.DRAG_COEFFICIENT * dt, 1.0);
            if (targetVelocity.x == 0) {
                targetVelocity.x = -velocity.x * drag;
            }
            if (targetVelocity.z == 0) {
                targetVelocity.z = -velocity.z * drag;
            }
            velocity = Vec3.sum(velocity, targetVelocity);

            var maxSpeed = settings.movementParameters.MAX_SPEED;
            velocity.x = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.x));
            velocity.z = Math.max(-maxSpeed, Math.min(maxSpeed, velocity.z));
            var v = Vec3.multiplyQbyV(MyAvatar.headOrientation, velocity);

            if (targetVelocityVertical == 0) {
                targetVelocityVertical -= (velocityVertical * settings.movementParameters.DRAG_COEFFICIENT * dt);
            }
            velocityVertical += targetVelocityVertical;
            velocityVertical = Math.max(-maxSpeed, Math.min(maxSpeed, velocityVertical));
            v.y += velocityVertical;

            MyAvatar.motorVelocity = v;
        }
    }

    function vecToString(vec) {
        return vec.x + ", " + vec.y + ", " + vec.z;
    }

    function resetCursorPosition() {
        var newX = Math.floor(Window.x + Window.innerWidth / 2);
        var newY = Math.floor(Window.y + Window.innerHeight / 2);
        Reticle.setPosition({ x: newX, y: newY });
        lastX = newX;
        lastY = newY;
    }

    function toggleEnabled() {
        if (enabled) {
            disable();
        } else {
            enable();
        }
    }

    function toggleMouseVisible() {
        print("IN MOUSE VISIBLE");
        if (mouseVisible) {
            Reticle.setVisible(false);
            mouseVisible = false;
        } else {
            Reticle.setVisible(true);
            mouseVisible = true;
        }
    }

    var timerID = null;
    function enable() {
        if (!enabled && Window.hasFocus()) {
            enabled = true;

            resetCursorPosition();

            // Reset movement variables
            yawFromMouse = 0;
            pitchFromMouse = 0;
            yawSpeed = 0;
            pitchSpeed = 0;
            velocityVertical = 0;
            velocity = { x: 0, y: 0, z: 0 };

            MyAvatar.motorReferenceFrame = 'world';
            MyAvatar.motorVelocity = { x: 0, y: 0, z: 0 };
            MyAvatar.motorTimescale = 1;

            Controller.enableMapping(MAPPING_KEYS_NAME);

            Reticle.setVisible(false);
            if (USE_INTERVAL) {
                var lastTime = Date.now();
                timerID = Script.setInterval(function () {
                    var now = Date.now();
                    var dt = now - lastTime;
                    lastTime = now;
                    update(dt / 1000);
                }, (1.0 / UPDATE_RATE) * 1000);
            } else {
                Script.update.connect(update);
            }
        }
    }

    function disable() {
        if (enabled) {
            enabled = false;
            Reticle.setVisible(true);

            MyAvatar.motorVelocity = { x: 0, y: 0, z: 0 };

            Controller.disableMapping(MAPPING_KEYS_NAME);

            if (USE_INTERVAL) {
                Script.clearInterval(timerID);
                timerID = null;
            } else {
                Script.update.disconnect(update);
            }
        }
    }

    var MAPPING_ENABLE_NAME = 'io.highfidelity.gracefulControls.toggle';
    var MAPPING_KEYS_NAME = 'io.highfidelity.gracefulControls.keys';
    var MAPPING_MOUSE_VISIBLE_NAME = 'io.highfidelity.gracefulControls.visibleMouse';
    var keyControllerMapping = Controller.newMapping(MAPPING_KEYS_NAME);
    var enableControllerMapping = Controller.newMapping(MAPPING_ENABLE_NAME);
    // var makeMouseVisibleMapping = Controller.newMapping(MAPPING_MOUSE_VISIBLE_NAME);

    function onKeyPress(key, value) {
        print(key, value);
        keys[key] = value > 0;

        if (value > 0) {
            if (key == KEY_TOGGLE) {
                toggleEnabled();
            } 
            // else if (key == KEY_MOUSE_VISIBLE) {
            //     toggleMouseVisible();
            // } 
            else if (key == KEY_BRAKE) {
                settings.movementParameters = settings.BRAKE_PARAMETERS;
                currentSetting = BRAKE;
            }
        } else {
            if (key == KEY_BRAKE) {
                settings.movementParameters = settings.DEFAULT_PARAMETERS;
                currentSetting = DEFAULT;
            }
        }
    }

    for (var i = 0; i < KEYS.length; ++i) {
        var key = KEYS[i];
        var hw = Controller.Hardware.Keyboard[key];
        if (hw) {
            keyControllerMapping.from(hw).to(function (key) {
                return function (value) {
                    onKeyPress(key, value);
                };
            }(key));
        } else {
            print("Unknown key: ", key);
        }
    }

    enableControllerMapping.from(Controller.Hardware.Keyboard[KEY_TOGGLE]).to(function (value) {
        onKeyPress(KEY_TOGGLE, value);
    });

    // makeMouseVisibleMapping.from(Controller.Hardware.Keyboard[KEY_MOUSE_VISIBLE]).to(function (value) {
    //     onKeyPress(KEY_MOUSE_VISIBLE, value);
    // });

    Controller.enableMapping(MAPPING_ENABLE_NAME);
    Controller.enableMapping(MAPPING_MOUSE_VISIBLE_NAME);


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

    function getCurrentListener() {
        var currentListenerMode = MyAvatar.audioListenerMode;
        var returnedModeString = "";
        switch (currentListenerMode) {
            case AUDIO_LISTENER_MODE_HEAD:
                returnedModeString = "Head";
                break;
            case AUDIO_LISTENER_MODE_CAMERA:
                returnedModeString = "Camera";
                break;
            case AUDIO_LISTENER_MODE_CUSTOM:
                returnedModeString = "Custom";
                break;
            default:
        }
        return returnedModeString;
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
            MyAvatar.headOrientation = orientation;
            MyAvatar.position = position;
        }
        if (event.text === SET_LISTENER_POSITION_KEY){
            updateCustomListener();
            updateSettings();
            doUIUpdate();
        }
        if (event.text === SET_LISTENER_TOGGLE_KEY){
            if (settings.listener.isCustomListening) {
                disableCustomListener();
                updateSettings();
                doUIUpdate();
            } else {
                enableCustomListener();
                updateSettings();
                doUIUpdate();
            }
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

    function editDefault(newDefault) {
        settings.DEFAULT_PARAMETERS = newDefault;
        if (currentSetting === DEFAULT) {
            settings.movementParameters = settings.DEFAULT_PARAMETERS;
        }
        doUIUpdate();
    }

    function editBrake(newBrake) {
        settings.BRAKE_PARAMETERS = newBrake;
        if (currentSetting === BRAKE) {
            settings.movementParameters = settings.BRAKE_PARAMETERS;
        }
        doUIUpdate();
    }

    function doUIUpdate() {
        console.log("SETTINGs", JSON.stringify(settings));
        settings.listener.currentMode = getCurrentListener();
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
            case EDIT_DEFAULT:
                editDefault(message.value);
                break;
            case EDIT_BRAKE:
                editBrake(message.value);
                break;
            case CLOSE_DIALOG_MESSAGE:
                tablet.gotoHomeScreen();
                break;
        }
    }

    // Main
    setup();

    // Cleanup
    function cameraScriptEnding() {
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
        disable();
        Reticle.setVisible(true);
        Controller.disableMapping(MAPPING_ENABLE_NAME);
        Controller.disableMapping(MAPPING_KEYS_NAME);
        Controller.disableMapping(MAPPING_MOUSE_VISIBLE_NAME);
        tablet = null;
        Controller.keyPressEvent.disconnect(keyPressHandler);
    }

    Script.scriptEnding.connect(cameraScriptEnding);
}());
