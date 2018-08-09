// Neuroscape_Diagnostic.js
//
// Created by Milad Nazeri and Liv Erikson on 2018-07-16
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
    Script.require("../../../../Utilities/Polyfills.js")();

    var Helper = Script.require("../../../../Utilities/Helper.js?" + Date.now()),
        vec = Helper.Maths.vec;

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Helper.Debug.LOG_ENTER,
        LOG_UPDATE = Helper.Debug.LOG_UPDATE,
        LOG_ERROR = Helper.Debug.LOG_ERROR,
        LOG_VALUE = Helper.Debug.LOG_VALUE,
        LOG_ARCHIVE = Helper.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Helper.Debug.log(LOG_CONFIG);

    // Init
    // /////////////////////////////////////////////////////////////////////////
    var isAppActive = false,
        isTabletUIOpen = false,
        rustDancing = false,
        overlay = null;
        
    
    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var MESSAGE_CHANNEL = "messages.dance-app",
        UPDATE_UI = "update_ui",
        PREVIEW_DANCE = "preview_dance",
        PREVIEW_DANCE_STOP = "preview_dance_stop",
        STOP_DANCE = "stop_dance",
        TRY_DANCE = "try_dance";

    // Constructor
    // /////////////////////////////////////////////////////////////////////////
    function DanceAnimation(name, url, frames, fps) {
        this.name = name;
        this.url = url;
        this.frames = frames;
        this.fps = fps;
    }

    // Collections
    // /////////////////////////////////////////////////////////////////////////
    var danceUrls = Script.require("./Dance-URLS.js"),
        defaultSettings = {
            ui: {
                currentDance: false
            }
        },
        settings = Object.assign({}, defaultSettings),
        danceObjects = [];

    log(LOG_VALUE, "danceUrls", danceUrls);

    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
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

    function previewDanceAnimation(danceObj) {
        var localOffset = vec(0,0,-2),
            worldOffset = VEC3.multiplyQbyV(MyAvatar.orientation, localOffset),
            modelPosition = VEC3.sum(MyAvatar.position, worldOffset);

        log(LOG_VALUE, "danceObj", danceObj);
        overlay = Overlays.addOverlay("model", {
            url: MyAvatar.skeletonModelURL,
            position: modelPosition,
            animationSettings: {
                url: danceObj.url,
                fps: danceObj.fps,
                loop: true,
                running: true,
                lastFrame: danceObj.frames
            }
        });
    }

    function stopPreviewDanceAnimation(danceObj) {
        Overlays.deleteOverlay(overlay);
    }

    function tryDanceAnimation(danceObj) {
        rustDancing = Settings.getValue("isRustDancing", false);

        MyAvatar.overrideAnimation(danceObj.url, danceObj.fps, true, 0, danceObj.frames);
        Settings.setValue("isRustDancing", true);
        settings.ui.currentDance = true; 
        settings.currentDance = danceObj;
    }

    function stopDanceAnimation() {
        MyAvatar.restoreAnimation();
        Settings.setValue("isRustDancing", false);
        settings.ui.currentDance = false; 
        settings.currentDance = null;
    }

    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
    function onMessageReceived(channel, message, sender, localOnly) {
        if (channel !== MESSAGE_CHANNEL) {
            return;
        }

        var data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            return;
        }

        switch (data.type) {
            case SAVE_JSON:
                doUIUpdate();
                break;
            default:
        }
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

        Messages.subscribe(MESSAGE_CHANNEL);
        Messages.messageReceived.connect(onMessageReceived);
    }

    function doUIUpdate() {
        tablet.emitScriptEvent(JSON.stringify({
            type: UPDATE_UI,
            value: settings
        }));
    }

    function splitDanceUrls() {
        var regex = /(https:\/\/.*\/)([a-zA-Z0-9 ]+) (\d+)(.fbx)/;
        danceUrls.forEach(function(dance) {
            var regMatch = regex.exec(dance);
            danceObjects.push(
                new DanceAnimation(
                    regMatch[2],
                    dance,
                    regMatch[3],
                    30
                )
            );
        });
        settings.danceObjects = danceObjects;
    }
    // Tablet
    // /////////////////////////////////////////////////////////////////////////
    var tablet = null,
        buttonName = "Dance-App",
        tabletButton = null,
        APP_URL = Script.resolvePath('./Tablet/Dance-App_Tablet.html'),
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
            case TRY_DANCE:
                tryDanceAnimation(message.value);
                doUIUpdate();
                break;
            case STOP_DANCE:
                stopDanceAnimation(message.value);
                doUIUpdate();
                break;
            case PREVIEW_DANCE:
                previewDanceAnimation(message.value);
                break;
            case PREVIEW_DANCE_STOP:
                stopPreviewDanceAnimation();
                break;
            case CLOSE_DIALOG_MESSAGE:
                tablet.gotoHomeScreen();
                break;
        }
    }

    // Main
    // /////////////////////////////////////////////////////////////////////////
    splitDanceUrls();
    setup();

    // Cleanup
    // /////////////////////////////////////////////////////////////////////////
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

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(MESSAGE_CHANNEL);
    }

    Script.scriptEnding.connect(scriptEnding);
}());
