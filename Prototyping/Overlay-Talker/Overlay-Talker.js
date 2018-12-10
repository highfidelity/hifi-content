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

    var SHOW_TEXT_DURATION = 8000,
        BUFFER = 1000,
        hideTime = null; // ms
    
    // Tablet
    var BUTTON_NAME = "OVR-TALK",
        APP_URL = Script.resolvePath('./Tablet/OverlayTalker-Tablet.html?123'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";

    // Init
    var ui = null,
        username = AccountServices.username,
        currentText = "",
        currentLines = 0,
        lastText = "",
        currentLength = 0,
        UPDATE_UI = BUTTON_NAME + "_update_ui",
        connection = new WebSocket('ws://tan-cheetah.glitch.me/');

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
        // connection.send(JSON.stringify({ type: REMOVE_USER, username: username })); 
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

            // IMPROVEMENT could push the new MyMessage on the end of the message list
            var latestMessage = json.data.slice(-1)[0];

            
            var isAuthor = latestMessage.author === username;
            var onToList = latestMessage.to.length === 0 || latestMessage.to.indexOf(username) !== -1;
            
            console.log("ROBIN 5", isAuthor, onToList);

            if (isAuthor || onToList) {
                var myMessages = getMyMessages(json.data);
                settings.history = myMessages;

                // handle incoming message
                hide();
                show();
            }
        }
        
        doUIUpdate();
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

    function setup() {

        ui = new AppUi({
            buttonName: BUTTON_NAME,
            home: APP_URL,
            onMessage: onTabletWebEventReceived,
            graphicsDirectory: Script.resolvePath("./Tablet/icons/")
            // onOpened: onOpened
        });

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
            maxLineLength = 0,
            lastLine = "";

        console.log("ROBIN 2 ", JSON.stringify(settings.history));
        
        settings.history.forEach(function (item, index) {

            // if ((settings.history.length - 1) === index) {
            //     lastLine = item.author + " :: " + item.text;
            // } else {
            if ((settings.history.length - 1) === index) { 
                currentLine = "\n" + item.author + " :: " + item.text + "\n";
                lines += 1;
            } else {
                currentLine = item.author + " :: " + item.text + "\n";
            }
            maxLineLength = maxLineLength > currentLine.length ? maxLineLength : currentLine.length;
            text += currentLine;
            lines++;
        });
        // });
        currentText = text;
        currentLength = maxLineLength;
        currentLines = lines;
        lastText = lastLine;
    }

    // Main
    setup();
    show();

    // Cleanup
    function scriptEnding() {
        console.log("### in script ending");
        hide();

        // connection is closing
        console.log("on close");
        connection.send(JSON.stringify({ type: REMOVE_USER, username: username })); 

        connection.close();

    }

    var hmdOverlay,
        desktopOverlay,
        lastTextOverlay;

    function show() {

        resetHideTime();

        console.log("CALLING SHOW");
        getText();

        // Create both overlays in case user switches desktop/HMD mode.
        var screenSize = Controller.getViewportDimensions(),
            recordingText = "test", // Unicode circle \u25cf doesn't render in HMD.
            CAMERA_JOINT_INDEX = -7,
            DESKTOP_FONT_SIZE = 20.0,
            HMD_FONT_SIZE = 0.10; // m

        console.log("RECORDING TEXT", recordingText);
        if (HMD.active) {

            var chatLength = currentLength / 2 * HMD_FONT_SIZE;
            var chatHeight = (HMD_FONT_SIZE) * currentLines + HMD_FONT_SIZE;
            var localPosition = { x: -0.2, y: 1.0, z: -2.5 };

            // 3D overlay attached to avatar.
            hmdOverlay = Overlays.addOverlay("text3d", {
                text: currentText,
                dimensions: {
                    x: chatLength, // (20) * HMD_FONT_SIZE, 
                    y: chatHeight // (HMD_FONT_SIZE) * 5 
                },
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: CAMERA_JOINT_INDEX,
                localPosition: localPosition,
                color: { red: 255, green: 0, blue: 0 },
                alpha: 1.0,
                lineHeight: HMD_FONT_SIZE,
                backgroundAlpha: 0.4,
                ignoreRayIntersection: true,
                isFacingAvatar: true,
                drawInFront: true,
                visible: true
            });

            // lastTextOverlay = Overlays.addOverlay("text3d", {
            //     text: lastText,
            //     dimensions: {
            //         x: chatLength, 
            //         y: HMD_FONT_SIZE
            //     },
            //     parentID: MyAvatar.sessionUUID,
            //     parentJointIndex: CAMERA_JOINT_INDEX,
            //     localPosition: { x: -0.2, y: 1.0 - chatHeight / 2, z: -2.5 },
            //     color: { red: 255, green: 100, blue: 100 },
            //     alpha: 1.0,
            //     lineHeight: HMD_FONT_SIZE,
            //     backgroundAlpha: 0.4,
            //     ignoreRayIntersection: true,
            //     isFacingAvatar: true,
            //     drawInFront: true,
            //     visible: true
            // });

        } else {
            // 2D overlay on desktop.

            var chatWidth = currentLength / 2 * DESKTOP_FONT_SIZE;
            var rightPadding = 10; // 10px

            desktopOverlay = Overlays.addOverlay("text", {
                text: currentText,
                width: chatWidth,
                height: (DESKTOP_FONT_SIZE) * (currentLines + 1.5),
                x: screenSize.x - chatWidth - rightPadding,
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

        if (lastTextOverlay) {
            Overlays.deleteOverlay(lastTextOverlay);
        }
    }

})();