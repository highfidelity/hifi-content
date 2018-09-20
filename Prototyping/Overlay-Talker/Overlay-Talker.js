
// Overlay-Talker.js
//
// Created by Milad Nazeri
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global AccountServices  */
(function () {
         
    Script.require("./Polyfills.js")();
      
    // Init
    var isAppActive = false,
        isTabletUIOpen = false,
        currentText = "",
        currentLines = 0,
        currentLength = 0,
        MESSAGE_CHANNEL = "messages.overlay-talker",
        UPDATE_UI = "update_ui",
        connection = new WebSocket('ws://tan-cheetah.glitch.me/');

    connection.onopen = function () {
        console.log("on open");
        // connection is opened and ready to use
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        console.log("got message");
        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }
        settings.history = json.data;
        hide();
        show();
        // handle incoming message
    };

    // Collections
    var defaultSettings = {
            username: AccountServices.username,
            history: [{ message: "test3" }, { message: "test4" }]
        },
        settings = {};

    settings = Object.assign({}, defaultSettings);


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

    // Constructor Functions

    // Procedural Functions

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

    // Tablet
    var tablet = null,
        buttonName = "Overlay-Talker",
        tabletButton = null,
        APP_URL = Script.resolvePath('./Tablet/OverlayTalker-Tablet.html'),
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
            case CLOSE_DIALOG_MESSAGE:
                tablet.gotoHomeScreen();
                break;
        }
    }

    function getText() {
        var text = "",
            currentLine = "",
            lines = 0,
            maxLineLength = 0;
        
        settings.history.forEach(function (item) {
            currentLine = item.author + " :: " + item.text + "\n";
            maxLineLength = maxLineLength > currentLine.length ? maxLineLength : currentLine.length;
            text += currentLine;
            lines++;
        });
        currentText = text;
        currentLength = maxLineLength;
        currentLines = lines;
    }

    // Main
    setup();

    show();

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

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(MESSAGE_CHANNEL);

        hide();
    }

    Script.scriptEnding.connect(scriptEnding);
    HMD.displayModeChanged.connect(function(isHMDMode){
        hide();
        show();
    });

    var hmdOverlay,
        desktopOverlay;

    function show() {
        console.log("CALLING SHOW");
        getText();

        // Create both overlays in case user switches desktop/HMD mode.
        var screenSize = Controller.getViewportDimensions(),
            recordingText = "test", // Unicode circle \u25cf doesn't render in HMD.
            CAMERA_JOINT_INDEX = -7,
            DESKTOP_FONT_SIZE = 20.0,
            HMD_FONT_SIZE = 0.20;

        console.log("RECORDING TEXT", recordingText);
        if (HMD.active) {
            // 3D overlay attached to avatar.
            hmdOverlay = Overlays.addOverlay("text3d", {
                // text: recordingText,
                // dimensions: { x: 3 * HMD_FONT_SIZE, y: HMD_FONT_SIZE },
                // parentID: MyAvatar.sessionUUID,
                // parentJointIndex: CAMERA_JOINT_INDEX,
                // localPosition: { x: 0.95, y: 0.95, z: -2.0 },
                // color: { red: 255, green: 0, blue: 0 },
                // alpha: 0.9,
                // lineHeight: HMD_FONT_SIZE,
                // backgroundAlpha: 0,
                // ignoreRayIntersection: true,
                // isFacingAvatar: true,
                // drawInFront: true,
                // visible: true
                text: currentText,
                dimensions: { x: (20) * HMD_FONT_SIZE, y: (HMD_FONT_SIZE) * 5 },
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: CAMERA_JOINT_INDEX,
                localPosition: { x: 0.95, y: 0.85, z: -3.0 },
                color: { red: 255, green: 0, blue: 0 },
                alpha: 1.0,
                lineHeight: HMD_FONT_SIZE,
                backgroundAlpha: 0.0,
                ignoreRayIntersection: true,
                isFacingAvatar: true,
                drawInFront: true,
                visible: true
            });
            // } else {
            //     // 2D overlay on desktop.
            //     desktopOverlay = Overlays.addOverlay("text", {
            //         text: "test",
            //         width: recordingText.length * DESKTOP_FONT_SIZE,
            //         height: DESKTOP_FONT_SIZE,
            //         x: screenSize.x - recordingText.length * DESKTOP_FONT_SIZE / 4,
            //         y: DESKTOP_FONT_SIZE,
            //         margin: 4,
            //         font: { size: DESKTOP_FONT_SIZE / 2 },
            //         color: { red: 255, green: 8, blue: 8 },
            //         backgroundColor: { red: 0, green: 8, blue: 8 },
            //         backgroundAlpha: 1.0,
            //         alpha: 1.0,
            //         visible: true
            //     });
            // }
        } else {
            // 2D overlay on desktop.
            desktopOverlay = Overlays.addOverlay("text", {
                text: currentText,
                width: (currentLength + 10) * DESKTOP_FONT_SIZE,
                height: (DESKTOP_FONT_SIZE + 10 ) * (currentLines),
                x: screenSize.x - (currentLength + 8) * DESKTOP_FONT_SIZE / 2,
                y: DESKTOP_FONT_SIZE,
                lineHeight: DESKTOP_FONT_SIZE,
                margin: DESKTOP_FONT_SIZE / 2,
                font: { size: DESKTOP_FONT_SIZE },
                color: { red: 255, green: 8, blue: 8 },
                alpha: 1.0,
                backgroundAlpha: 1.0,
                visible: true
            });
        }
    }

    function hide() {
        console.log("CALLING HIDE");

        if (desktopOverlay) {
            Overlays.deleteOverlay(desktopOverlay);
        }
        if (hmdOverlay) {
            Overlays.deleteOverlay(hmdOverlay);
        }
    }

})();

/*
(may do this through sockets)
var request = new XMLHttpRequest();
request.onreadystatechange = function () {
    if (request.readyState === request.DONE && request.status === 200) {
        var response = JSON.parse(request.responseText);
        cb(response);
    }
};

request.open("GET", URL + "?" + paramString)
request.timeout = 10000;
request.send();
*/