/* eslint-disable no-magic-numbers */
//
//  statusIndicatorClient.js
//
//  Created by Robin Wilson on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    var DEBUG = 0;

    // #region STATUS OVERLAY

    // Create clickable status overlay on desktop
    // In upper right hand corner of screen
    // Displays Available or Busy and toggles after click
    var desktopOverlay,
        rectangleOverlay,
        // desktop overlayOptions
        OVERLAY_WINDOW_RIGHT_PADDING = 10,
        OVERLAY_FONT_SIZE = 20.0,
        OVERLAY_WIDTH = 200,
        // rectangleOverlay options
        OVERLAY_RECTANGLE_LEFT_PADDING = 10,
        OVERLAY_RECTANGLE_TOP_PADDING = 12,
        OVERLAY_RECTANGLE_WIDTH_HEIGHT = 20,
        AVAILABLE_COLOR = { red: 0, green: 144, blue: 54 },
        NOT_AVAILABLE_COLOR = { red: 255, green: 0, blue: 26 },
        OTHER_COLOR = { red: 255, green: 237, blue: 0 },
        TEXT_OVERLAY_PROPS = {
            width: OVERLAY_RECTANGLE_WIDTH_HEIGHT,
            height: OVERLAY_RECTANGLE_WIDTH_HEIGHT,
            y: OVERLAY_FONT_SIZE + OVERLAY_RECTANGLE_TOP_PADDING,
            color: { red: 255, green: 255, blue: 255 },
            alpha: 1.0,
            visible: true
        },
        RECTANGLE_OVERLAY_PROPS = {
            width: OVERLAY_WIDTH,
            height: OVERLAY_FONT_SIZE * 2.2,
            y: OVERLAY_FONT_SIZE,
            lineHeight: OVERLAY_FONT_SIZE,
            margin: OVERLAY_FONT_SIZE / 2,
            font: { size: OVERLAY_FONT_SIZE },
            backgroundColor: { red: 17, green: 17, blue: 17 },
            alpha: 1.0,
            backgroundAlpha: 0.7,
            visible: true
        };
        
    function drawStatusOverlays() {
        if (DEBUG) {
            print("DRAW STATUS OVERLAYS");
        }
        var windowWidth = Window.innerWidth;

        var desktopOverlayProps = RECTANGLE_OVERLAY_PROPS;
        desktopOverlayProps.x = windowWidth - OVERLAY_WIDTH - OVERLAY_WINDOW_RIGHT_PADDING;
        desktopOverlay = Overlays.addOverlay("text", desktopOverlayProps);

        var rectangleOverlayProps = TEXT_OVERLAY_PROPS;
        rectangleOverlayProps.x = windowWidth - OVERLAY_WIDTH + OVERLAY_RECTANGLE_LEFT_PADDING - OVERLAY_WINDOW_RIGHT_PADDING;
        if (currentStatus === "available") {
            rectangleOverlayProps.color = AVAILABLE_COLOR;
        } else if (currentStatus === "busy") {
            rectangleOverlayProps.color = NOT_AVAILABLE_COLOR;
        } else {
            rectangleOverlayProps.color = OTHER_COLOR;
        }
        rectangleOverlay = Overlays.addOverlay("rectangle", rectangleOverlayProps);
    }


    // Delete clickable status overlay on desktop
    function deleteStatusOverlays() {
        if (DEBUG) {
            print("DELETE STATUS OVERLAYS");
        }
        if (rectangleOverlay) {
            Overlays.deleteOverlay(rectangleOverlay);
            rectangleOverlay = false;
        }
        if (desktopOverlay) {
            Overlays.deleteOverlay(desktopOverlay);
            desktopOverlay = false;
        }
    }

    // #endregion STATUS OVERLAY


    // #region HEARTBEAT

    // Send heartbeat with updates to database
    // When this stops, the database will set status to offline
    var HEARTBEAT_TIMEOUT_MS = 5000,
        heartbeat;
    function startHeartbeatTimer() {
        if (DEBUG) {
            print("START HEARTBEAT TIMER");
        }
        if (heartbeat) {
            Script.clearTimeout(heartbeat);
            heartbeat = false;
        }

        heartbeat = Script.setTimeout(function() {
            heartbeat = false;
            updateStatus();
        }, HEARTBEAT_TIMEOUT_MS);
    }

    // #endregion HEARTBEAT


    // #region SEND/GET STATUS REQUEST

    function sendStatusUpdate() {
        if (DEBUG) {
            print("SEND STATUS UPDATE");
        }
        var queryParamString = "type=heartbeat";
        queryParamString += "&username=" + AccountServices.username;

        var displayNameToSend = MyAvatar.displayName;

        queryParamString += "&displayName=" + displayNameToSend;
        queryParamString += "&status=" + currentStatus;
        var domainID = location.domainID;
        domainID = domainID.substring(1, domainID.length - 1);
        queryParamString += "&organization=" + domainID;

        var uri = REQUEST_URL + "?" + queryParamString;

        if (DEBUG) {
            console.log("sendStatusUpdate: " + uri);
        }

        request({
            uri: uri
        }, function (error, response) {
            startHeartbeatTimer();

            if (error || !response || response.status !== "success") {
                console.error("Error with updateStatus: " + JSON.stringify(response));
                return;
            }
        });
    }

    // Get status from database
    function getStatusUpdate(callback) {
        if (DEBUG) {
            print("GET STATUS UPDATE");
        }
        var queryParamString = "type=getStatus";
        queryParamString += "&username=" + AccountServices.username;

        var uri = REQUEST_URL + "?" + queryParamString;

        if (DEBUG) {
            console.log("getStatusUpdate: " + uri);
        }

        request({
            uri: uri
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.error("Error with getStatus: " + JSON.stringify(response));
            } else if (response.data.userStatus.toLowerCase() !== "offline") {
                currentStatus = response.data.userStatus;
                editStatusOverlays();
            }
            
            callback();
        });
    }


    // Sends status to database
    var request = Script.require('request').request,
        REQUEST_URL = Script.require(Script.resolvePath('./secrets.json?' + Date.now())).REQUEST_URL;
    function updateStatus(forceUpdateOnly) {
        if (DEBUG) {
            print("UPDATE STATUS");
        }
        if (heartbeat) {
            Script.clearTimeout(heartbeat);
            heartbeat = false;
        }

        if (forceUpdateOnly) {
            sendStatusUpdate();
        } else {
            getStatusUpdate(sendStatusUpdate);
        }
    }

    // #endregion SEND/GET STATUS REQUEST

    // #region SIGNALS

    // On mouse press, check if the status overlay on desktop was clicked
    // If yes, change status to the opposite and send status update
    var currentStatus = "available"; // Default is available
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
            if (currentStatus === "available") {
                currentStatus = "busy";
            } else if (currentStatus === "busy") {
                currentStatus = "available";
            } else {
                currentStatus = "busy";
            }
            editStatusOverlaysAndSendUpdate();
        }
    }

    var MAX_STATUS_LENGTH_CHARS = 9;
    function editStatusOverlays() {
        if (DEBUG) {
            print("EDIT STATUS OVERLAYS");
        }
        var edits = {};

        var rectangleColor;
        if (currentStatus === "available") {
            rectangleColor = AVAILABLE_COLOR;
        } else if (currentStatus === "busy") {
            rectangleColor = NOT_AVAILABLE_COLOR;
        } else {
            rectangleColor = OTHER_COLOR;
        }
        edits[rectangleOverlay] = { "color": rectangleColor };

        // For long statuses cut and append "..."
        var statusText = currentStatus;
        if (statusText.length > MAX_STATUS_LENGTH_CHARS) {
            statusText = currentStatus.substring(0, 9) + "...";
        }

        // Allow space for the rectangle color
        edits[desktopOverlay] = { "text": ("     " + statusText) };

        Overlays.editOverlays(edits);
    }

    function editStatusOverlaysAndSendUpdate() {
        if (DEBUG) {
            print("EDIT STATUS OVERLAYS AND SEND UPDATE");
        }
        editStatusOverlays();
        updateStatus(true);
    }

    // When window resizes, redraw overlays
    function onWindowResize() {
        if (DEBUG) {
            print("ON WINDOW RESIZE");
        }
        deleteStatusOverlays();
        drawStatusOverlays();
        editStatusOverlays();
    }

    // When avatar becomes active from being away
    // Set status back to previousStatus
    function onWentActive() {
        if (DEBUG) {
            print("ON WENT ACTIVE");
        }
        currentStatus = previousStatus;
        editStatusOverlaysAndSendUpdate();
    }

    // When avatar goes away, set status to busy
    var previousStatus;
    function onWentAway() {
        if (DEBUG) {
            print("ON WENT AWAY");
        }
        previousStatus = currentStatus;
        currentStatus = "busy";
        editStatusOverlaysAndSendUpdate();
    }

    // Delete overlays when display mode changes to HMD mode
    // Draw overlays when mode is in desktop
    function onDisplayModeChanged(isHMDMode) {
        if (DEBUG) {
            print("ON DISPLAY MODE CHANGED");
        }
        if (isHMDMode) {
            deleteStatusOverlays();
        } else {
            drawStatusOverlays();
        }
    }

    // Domain changed update avatar location
    function onDomainChanged() {
        if (DEBUG) {
            print("ON DOMAIN CHANGED");
        }
        var queryParamString = "type=updateEmployee";
        queryParamString += "&username=" + AccountServices.username;
        queryParamString += "&location=unknown";

        var uri = REQUEST_URL + "?" + queryParamString;

        if (DEBUG) {
            console.log("statusIndicator onDomainChanged: " + uri);
        }

        request({
            uri: uri
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.error("Error with onDomainChanged: " + JSON.stringify(response));
            } else {
                // successfully sent updateLocation
                if (DEBUG) {
                    console.log("Successfully updated location after domain change");
                }
            }
        });
    }

    // #endregion SIGNALS


    // #region APP LIFETIME

    // Creates the app button and sets up signals and hearbeat
    function startup() {
        if (DEBUG) {
            print("START UP");
        }
        if (!HMD.active) {
            drawStatusOverlays();
        }

        Script.scriptEnding.connect(unload);
        Controller.mousePressEvent.connect(onMousePressEvent);
        Window.geometryChanged.connect(onWindowResize);
        MyAvatar.wentAway.connect(onWentAway);
        MyAvatar.wentActive.connect(onWentActive);
        MyAvatar.displayNameChanged.connect(updateStatus);
        HMD.displayModeChanged.connect(onDisplayModeChanged);
        Window.domainChanged.connect(onDomainChanged);

        updateStatus();
    }


    // Cleans up timeouts, signals, and overlays
    function unload() {
        if (DEBUG) {
            print("UNLOAD");
        }
        deleteStatusOverlays();
        Controller.mousePressEvent.disconnect(onMousePressEvent);
        Window.geometryChanged.disconnect(onWindowResize);
        MyAvatar.wentAway.disconnect(onWentAway);
        MyAvatar.wentActive.disconnect(onWentActive);
        MyAvatar.displayNameChanged.disconnect(updateStatus);
        HMD.displayModeChanged.disconnect(onDisplayModeChanged);
        Window.domainChanged.disconnect(onDomainChanged);
        if (heartbeat) {
            Script.clearTimeout(heartbeat);
            heartbeat = false;
        }
    }

    // #endregion APP LIFETIME

    startup();
})();