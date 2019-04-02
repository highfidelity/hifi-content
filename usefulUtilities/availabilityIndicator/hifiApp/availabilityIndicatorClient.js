(function () {

    var isAvailable = true;

    var request = Script.require('request').request;
    var REQUEST_URL = Script.require(Script.resolvePath('./secrets.json')).REQUEST_URL;

    var DEBUG = true;

    // #region AVAILABILITY OVERLAY

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
    function drawAvailabilityOverlays() {
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

    function deleteAvailabilityOverlays() {
        if (rectangleOverlay) {
            Overlays.deleteOverlay(rectangleOverlay);
        }
        if (desktopOverlay) {
            Overlays.deleteOverlay(desktopOverlay);
        }
    }

    // #endregion AVAILABILITY OVERLAY


    // #region HEARTBEAT

    var HEARTBEAT_INTERVAL_MS = 5000,
        heartbeatInterval;
    function setupHeartbeat() {
        if (!heartbeatInterval) {
            heartbeatInterval = Script.setInterval(function() {
                sendAvailabilityUpdate();
            }, HEARTBEAT_INTERVAL_MS);
        }
    }

    // #endregion HEARTBEAT


    // #region SEND AVAILABILITY REQUEST

    function sendAvailabilityUpdate() {
        var queryParamString = "type=heartbeat";
        queryParamString += "&username=" + AccountServices.username;
        queryParamString += "&displayName=" + MyAvatar.displayName;
        queryParamString += "&status=";
        queryParamString += isAvailable ? "available" : "busy";

        if (DEBUG) {
            console.log("sendAvailabilityUpdate: " + REQUEST_URL + queryParamString);
        }

        request({
            uri: REQUEST_URL + "?" + queryParamString
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.error("Error with sendAvailabilityUpdate: " + JSON.stringify(response));
                return;
            }
        });
    }

    // #endregion SEND AVAILABILITY REQUEST


    // #region SIGNALS

    function onMousePressEvent(event) {
        if (DEBUG) {
            console.log("MOUSE press event" + event.isLeftButton);
        }
        // is primary button
        var overlayID = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });
        if (event.isLeftButton && overlayID && (overlayID === rectangleOverlay || overlayID === desktopOverlay)) {
            console.log("MY OVERLAY HAS BEEN CLICKED");
            isAvailable = !isAvailable;
            var edits = {};
            edits[rectangleOverlay] = { color: isAvailable ? AVAILABLE_COLOR : NOT_AVAILABLE_COLOR }
            edits[desktopOverlay] = { text: isAvailable ? OVERLAY_AVAILABLE_TEXT : OVERLAY_NOT_AVAILABLE_TEXT }
            Overlays.editOverlays(edits);

            sendAvailabilityUpdate();
        }
    }

    function onWindowResize() {
        deleteAvailabilityOverlays();
        drawAvailabilityOverlays();
    }

    function onWentActive() {
        isAvailable = previousStatus;
        onWindowResize();
        sendAvailabilityUpdate();
    }

    var previousStatus;
    function onWentAway() {
        previousStatus = isAvailable;
        isAvailable = false;
        onWindowResize();
        sendAvailabilityUpdate();
    }

    // #endregion SIGNALS


    // #region APP LIFETIME

    function startup() {
        drawAvailabilityOverlays();

        Script.scriptEnding.connect(unload);
        Controller.mousePressEvent.connect(onMousePressEvent);
        Window.geometryChanged.connect(onWindowResize);
        MyAvatar.wentAway.connect(onWentAway);
        MyAvatar.wentActive.connect(onWentActive);
        MyAvatar.displayNameChanged.connect(sendAvailabilityUpdate);

        setupHeartbeat();
    }

    function unload() {
        deleteAvailabilityOverlays();
        Controller.mousePressEvent.disconnect(onMousePressEvent);
        Window.geometryChanged.disconnect(onWindowResize);
        MyAvatar.wentAway.disconnect(onWentAway);
        MyAvatar.wentActive.disconnect(onWentActive);
        if (heartbeatInterval) {
            Script.clearInterval(heartbeatInterval);
            heartbeatInterval = null;
        }
    }

    // #endregion APP LIFETIME

    startup();
})();