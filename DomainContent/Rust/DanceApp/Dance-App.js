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
        overlay = null,
        animationSTateHandler = null;
        
    
    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var MESSAGE_CHANNEL = "messages.dance-app",
        UPDATE_UI = "update_ui",
        PREVIEW_DANCE = "preview_dance",
        PREVIEW_DANCE_STOP = "preview_dance_stop",
        STOP_DANCE = "stop_dance",
        START_DANCING = "start_dancing",
        TRY_DANCE = "try_dance",
        ADD_DANCE = "add_dance",
        REMOVE_DANCE = "remove_dance",
        CLEAR_ALL_DANCES = "clear_all_dances",
        UPDATE_DANCE_ARRAY = "update_dance_array",
        CURRENT_DANCE = "current_dance",
        DEFAULT_DURATION = "1500",
        DEFAULT_START_FRAME = 0;

    // Constructor
    // /////////////////////////////////////////////////////////////////////////
    function DanceAnimation(name, url, frames, fps) {
        this.name = name;
        this.url = url;
        this.startFrame = DEFAULT_START_FRAME;
        this.endFrame = frames;
        this.fps = fps;
    }

    function DanceListEntry(name, url, startFrame, endFrame, duration, fps) {
        this.name = name;
        this.url = url;
        this.startFrame = startFrame;
        this.endFrame = endFrame;
        this.duration = duration;
        this.fps = fps;
    }

    // Collections
    // /////////////////////////////////////////////////////////////////////////
    var danceUrls = Script.require("./Dance-URLS.js?"+ Date.now()),
        defaultSettings = {
            shouldBeRunning: true,
            danceArray: [],
            currentIndex: 0,
            ui: {
                currentDance: false,
                danceArray: false
            }
        },
        settings = Object.assign({}, defaultSettings),
        danceObjects = [];

    log(LOG_ARCHIVE, "danceUrls", danceUrls);

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

    function addDanceAnimation(danceObj) {
        settings.danceArray.push(
            new DanceListEntry(
                danceObj.name,
                danceObj.url,
                danceObj.startFrame,
                danceObj.endFrame,
                DEFAULT_DURATION,
                danceObj.fps
            )
        );
        settings.ui.danceArray = true;
    }

    function removeDanceAnimations(danceObj) {
        settings.danceArray = [];
        settings.ui.danceArray = false;
    }

    function removeDanceAnimation(index) {
        settings.danceArray.splice(index,1);
        if (settings.danceArray.length === 0) {
            stopDanceAnimation();
            settings.ui.danceArray = false;
        }
    }

    function playDanceArray(){
        settings.shouldBeRunning = true;
        settings.currentIndex = 0;
        playNextDance(settings.currentIndex);
    }

    function playNextDance(index) {
        log(LOG_VALUE, "INDEX", index);
        log(LOG_VALUE, "settings.danceArray", settings.danceArray);
        if ( index >= settings.danceArray.length) {
            index = 0;
        }
        var danceArrayObject = settings.danceArray[index];
        settings.currentIndex++;
        settings.currentIndex = 
            settings.currentIndex >= settings.danceArray.length
                ? 0
                : settings.currentIndex;

        tryDanceAnimation(danceArrayObject);
        Script.setTimeout(function(){
            if (settings.shouldBeRunning) {
                playNextDance(settings.currentIndex);
            }
        }, danceArrayObject.duration);
    }

    function tryDanceAnimation(danceObj) {
        rustDancing = Settings.getValue("isRustDancing", false);
        MyAvatar.overrideAnimation(danceObj.url, danceObj.fps, true, danceObj.startFrame, danceObj.endFrame);
        Settings.setValue("isRustDancing", true);
        settings.ui.currentDance = true; 
        settings.currentDance = danceObj;
        doUIUpdate({slice: CURRENT_DANCE});
    }

    function stopDanceAnimation() {
        MyAvatar.restoreAnimation();
        Settings.setValue("isRustDancing", false);
        settings.ui.currentDance = false; 
        settings.currentDance = null;
        settings.shouldBeRunning = false;
    }

    function updateDanceArray(danceArray) {
        settings.danceArray = danceArray;
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

    function doUIUpdate(update) {
        tablet.emitScriptEvent(JSON.stringify({
            type: UPDATE_UI,
            value: settings,
            update: update || {}
        }));
    }

    function splitDanceUrls() {
        var regex = /(https:\/\/.*\/)([a-zA-Z0-9 ]+) (\d+)(.fbx)/;
        danceUrls.sort(function(a,b) { 
            if (a < b) return -1;
            else if (a > b) return 1;
            return 0; 
        }).forEach(function(dance) {
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
            case ADD_DANCE:
                addDanceAnimation(message.value);
                doUIUpdate();
                break;
            case REMOVE_DANCE:
                removeDanceAnimation(message.value);
                doUIUpdate();
                break;
            case START_DANCING:
                playDanceArray();
                doUIUpdate();
                break;
            case TRY_DANCE:
                tryDanceAnimation(message.value);
                break;
            case UPDATE_DANCE_ARRAY:
                updateDanceArray(message.value);
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
    animationSTateHandler = MyAvatar.addAnimationStateHandler(function (props) {
        var keys = Object.keys(props).filter(function(prop){
            return prop.indexOf("anim") > -1;
        });
        if (keys.length > 0) {
            keys.forEach(function(key) {
                log(LOG_VALUE, key, props[key]);
            });
        }
        return {};
    }, null);

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
        MyAvatar.removeAnimationStateHandler(animationSTateHandler); 
    }

    Script.scriptEnding.connect(scriptEnding);
}());
