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
    var AppUi = Script.require('appUi');

    var SHOW_TEXT_DURATION = 5000,
        BUFFER = 1000,
        hideTime = null; // ms
    
    // Tablet
    var BUTTON_NAME = "Overlay-Talker",
        APP_URL = Script.resolvePath('./Tablet/OverlayTalker-Tablet.html?123'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";

    // Init
    var ui = null,
        username = AccountServices.username,
        currentText = "",
        currentLines = 0,
        currentLength = 0,
        MESSAGE_CHANNEL = "messages.overlay-talker",
        UPDATE_UI = BUTTON_NAME + "_update_ui",
        connection = new WebSocket('ws://tan-cheetah.glitch.me/', "robinTest");

    // MESSAGE TYPES
    var NEW_USER = "newUser",
        REMOVE_USER = "removeUser",
        UPDATE_CONNECTED_USERNAMES = "updateConnectedUsernames";
        
    // Websocket

    connection.onopen = function () {
        // connection is opened and ready to use
        console.log("on open");
        connection.send(JSON.stringify({ type: NEW_USER, username: username })); 
    };

    connection.onclose = function () {
        // connection is closing
        console.log("on close");
        connection.send(JSON.stringify({ type: REMOVE_USER, username: username })); 
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };


    connection.onmessage = function (message) {
        console.log("got message", message);
        console.log("ROBIN 1", JSON.stringify(message));

        try {
            var json = JSON.parse(message.data);
        } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
        }

        if (json.type === UPDATE_CONNECTED_USERNAMES) {
            console.log('Robin Update Connected Usernames: ', JSON.stringify(message.data));
            settings.connectedUsernames = json.data;
        } else {
            settings.history = getMyMessages(json.data);

            // handle incoming message
            hide();
            show();
        }

    };

    // filter history messages to get my messages
    function getMyMessages(list) {

        var myMessages = list.filter(function (message) {
            var isAuthor = message.author === username;

            // empty to list sends to everyone
            // else find my username on to list
            var onToList = message.to.length === 0 || message.to.indexOf(username) !== -1;

            return isAuthor || onToList;
        });

        return myMessages.slice(-10);
    }

    // Collections
    var defaultSettings = {
            username: username,
            history: [{ message: "test3" }, { message: "test4" }],
            connectedUsernames: []
        },
        settings = {};

    settings = Object.assign({}, defaultSettings);

    // Helper Functions

    // Constructor Functions

    // Procedural Functions

    function onTalkerMessageReceived(channel, message, sender, localOnly) {

        print("ROBIN 1 onTalkerMessageReceived: ", JSON.stringify(message));

        if (channel !== MESSAGE_CHANNEL) {
            return;
        }

        var data;
        try {
            data = JSON.parse(message);
            print("ROBIN 1 message was: ", JSON.stringify(data));
        } catch (e) {
            return;
        }

        switch (data.type) {
            default:
        }
    }

    function setup() {

        ui = new AppUi({
            buttonName: BUTTON_NAME,
            home: APP_URL,
            onMessage: onTabletWebEventReceived
            // graphicsDirectory: Script.resolvePath("./icons/"),
            // onOpened: onOpened
        });

        Messages.subscribe(MESSAGE_CHANNEL);
        Messages.messageReceived.connect(onTalkerMessageReceived);

        Script.scriptEnding.connect(scriptEnding);
        HMD.displayModeChanged.connect(function(isHMDMode){
            hide();
            show();
        });
    }

    function doUIUpdate() {
        var messageObject = {
            type: UPDATE_UI,
            value: settings
        };
        ui.sendToHtml(messageObject);
    }

    // ROBIN onMessage
    function onTabletWebEventReceived(data) {

        // EventBridge message from HTML script.
        var message = data;

        switch (message.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                doUIUpdate();
                break;
        }
    }

    function getText() {
        var text = "",
            currentLine = "",
            lines = 0,
            maxLineLength = 0;

        console.log("ROBIN 2 ", JSON.stringify(settings.history));
        
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
        hide();

        Messages.messageReceived.disconnect(onTalkerMessageReceived);
        Messages.unsubscribe(MESSAGE_CHANNEL);

    }

    var hmdOverlay,
        desktopOverlay;

    function show() {

        resetHideTime();

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

        Script.setTimeout(function () {
            checkHideTime();
        }, SHOW_TEXT_DURATION + BUFFER);

        function resetHideTime() {
            hideTime = Date.now() + SHOW_TEXT_DURATION;
        }
    
        function checkHideTime() {
            if (hideTime < Date.now()) {
                hide();
            }
        }

    }

    function hide() {

        if (desktopOverlay) {
            Overlays.deleteOverlay(desktopOverlay);
        }

        if (hmdOverlay) {
            Overlays.deleteOverlay(hmdOverlay);
        }
    }

})();