//
//  statusIndicatorClient.js
//
//  Created by Robin Wilson on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    var DEBUG = false;

    // #region STATUS OVERLAY

    // Create clickable status overlay on desktop
    // In upper right hand corner of screen
    // Displays Available or Busy and toggles after click
    var desktopOverlay,
        rectangleOverlay,
        // desktop overlayOptions
        OVERLAY_AVAILABLE_TEXT = "     Available",
        OVERLAY_NOT_AVAILABLE_TEXT = "     Busy",
        OVERLAY_WINDOW_RIGHT_PADDING = 10,
        OVERLAY_WIDTH = 10,
        OVERLAY_FONT_SIZE = 20.0,
        OVERLAY_WIDTH = 200,
        // rectangleOverlay options
        OVERLAY_RECTANGLE_LEFT_PADDING = 10,
        OVERLAY_RECTANGLE_TOP_PADDING = 12,
        OVERLAY_RECTANGLE_WIDTH_HEIGHT = 20,
        AVAILABLE_COLOR = { red: 0, green: 144, blue: 54 },
        NOT_AVAILABLE_COLOR = { red: 255, green: 0, blue: 26 };
    function drawStatusOverlays() {
        var windowWidth = Window.innerWidth;

        desktopOverlay = Overlays.addOverlay("text", {
            text: isAvailable ? OVERLAY_AVAILABLE_TEXT : OVERLAY_NOT_AVAILABLE_TEXT,
            width: OVERLAY_WIDTH,
            height: OVERLAY_FONT_SIZE * 2.2,
            x: windowWidth - OVERLAY_WIDTH - OVERLAY_WINDOW_RIGHT_PADDING,
            y: OVERLAY_FONT_SIZE,
            lineHeight: OVERLAY_FONT_SIZE,
            margin: OVERLAY_FONT_SIZE / 2,
            font: { size: OVERLAY_FONT_SIZE },
            color: { red: 255, green: 255, blue: 255 },
            backgroundColor: { red: 17, green: 17, blue: 17 },
            alpha: 1.0,
            backgroundAlpha: 0.7,
            visible: true
        });

        rectangleOverlay = Overlays.addOverlay("rectangle", {
            width: OVERLAY_RECTANGLE_WIDTH_HEIGHT,
            height: OVERLAY_RECTANGLE_WIDTH_HEIGHT,
            x: windowWidth - OVERLAY_WIDTH + OVERLAY_RECTANGLE_LEFT_PADDING - OVERLAY_WINDOW_RIGHT_PADDING,
            y: OVERLAY_FONT_SIZE + OVERLAY_RECTANGLE_TOP_PADDING,
            color: isAvailable ? AVAILABLE_COLOR : NOT_AVAILABLE_COLOR,
            alpha: 1.0,
            visible: true
        });
    }


    // Delete clickable status overlay on desktop
    function deleteStatusOverlays() {
        if (rectangleOverlay) {
            Overlays.deleteOverlay(rectangleOverlay);
            rectangleOverlay = null;
        }
        if (desktopOverlay) {
            Overlays.deleteOverlay(desktopOverlay);
            desktopOverlay = null;
        }
    }

    // #endregion STATUS OVERLAY


    // #region HEARTBEAT

    // Send heartbeat with updates to database
    // When this stops, the database will set status to Offline
    var HEARTBEAT_TIMEOUT_MS = 5000,
        heartbeat;
    function setupHeartbeat() {
        if (heartbeat) {
            Script.clearTimeout(heartbeat);
            heartbeat = false;
        }

        heartbeat = Script.setTimeout(function() {
            sendStatusUpdate(true);
        }, HEARTBEAT_TIMEOUT_MS);
    }

    // #endregion HEARTBEAT


    // #region SEND STATUS REQUEST

    // Sends status to database
    var request = Script.require('request').request,
        REQUEST_URL = Script.require(Script.resolvePath('./secrets.json')).REQUEST_URL;
    function sendStatusUpdate(isHeartbeat) {
        var queryParamString = "type=heartbeat";
        queryParamString += "&username=" + AccountServices.username;
        queryParamString += "&displayName=" + MyAvatar.displayName;
        queryParamString += "&status=";
        queryParamString += isAvailable ? "available" : "busy";

        if (DEBUG) {
            console.log("sendStatusUpdate: " + REQUEST_URL + queryParamString);
        }

        request({
            uri: REQUEST_URL + "?" + queryParamString
        }, function (error, response) {
            setupHeartbeat();

            if (error || !response || response.status !== "success") {
                console.error("Error with sendStatusUpdate: " + JSON.stringify(response));
                return;
            }
        });
    }

    // #endregion SEND STATUS REQUEST


    // #region SIGNALS

    // On mouse press, check if the status overlay on desktop was clicked
    // If yes, change status to the opposite and send status update
    var isAvailable = true; // Default is available
    function onMousePressEvent(event) {
        if (DEBUG) {
            console.log("onMousePressEvent isLeftButton: " + event.isLeftButton);
        }
        // is primary button
        var overlayID = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });
        if (event.isLeftButton && overlayID && (overlayID === rectangleOverlay || overlayID === desktopOverlay)) {
            if (DEBUG) {
                console.log("onMousePressEvent status overlay has been clicked");
            }
            isAvailable = !isAvailable;
            editStatusOverlaysAndSendUpdate();
        }
    }

    function editStatusOverlaysAndSendUpdate() {
        var edits = {};
        edits[rectangleOverlay] = { color: isAvailable ? AVAILABLE_COLOR : NOT_AVAILABLE_COLOR }
        edits[desktopOverlay] = { text: isAvailable ? OVERLAY_AVAILABLE_TEXT : OVERLAY_NOT_AVAILABLE_TEXT }
        Overlays.editOverlays(edits);

        sendStatusUpdate();
    }


    // When window resizes, redraw overlays
    function onWindowResize() {
        deleteStatusOverlays();
        drawStatusOverlays();
    }

    
    // When avatar becomes active from being away
    // Set status back to previousStatus
    function onWentActive() {
        isAvailable = previousStatus;
        editStatusOverlaysAndSendUpdate();
    }


    // When avatar goes away, set status to busy
    var previousStatus;
    function onWentAway() {
        previousStatus = isAvailable;
        isAvailable = false;
        editStatusOverlaysAndSendUpdate();
    }

    // #endregion SIGNALS


    // #region APP LIFETIME

    // Creates the app button and sets up signals and hearbeat
    function startup() {
        drawStatusOverlays();

        Script.scriptEnding.connect(unload);
        Controller.mousePressEvent.connect(onMousePressEvent);
        Window.geometryChanged.connect(onWindowResize);
        MyAvatar.wentAway.connect(onWentAway);
        MyAvatar.wentActive.connect(onWentActive);
        MyAvatar.displayNameChanged.connect(sendStatusUpdate);

        sendStatusUpdate();
    }


    // Cleans up timeouts, signals, and overlays
    function unload() {
        deleteStatusOverlays();
        Controller.mousePressEvent.disconnect(onMousePressEvent);
        Window.geometryChanged.disconnect(onWindowResize);
        MyAvatar.wentAway.disconnect(onWentAway);
        MyAvatar.wentActive.disconnect(onWentActive);
        MyAvatar.displayNameChanged.disconnect(sendStatusUpdate);
        if (heartbeat) {
            Script.clearTimeout(heartbeat);
            heartbeat = null;
        }
    }

    // #endregion APP LIFETIME

    startup();
})();