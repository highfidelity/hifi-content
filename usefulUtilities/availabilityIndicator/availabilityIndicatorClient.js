(function() {

    var isAvailable = true;

    // #region AVAILABILITY OVERLAY

    var desktopOverlay,
        rectangleOverlay,
        // desktop overlayOptions
        OVERLAY_AVAILABLE_TEXT = "     Available",
        OVERLAY_NOT_AVAILABLE_TEXT = "     Unavailable",
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
    function drawAvalabilityOverlays() {
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
            text: currentText,
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

    
    function onMousePressEvent(event) {
        // is primary button
        var overlayID = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });
        if (event.isPrimaryButton && overlayID && (overlayID === rectangleOverlay || overlayID === desktopOverlay)) {
            console.log("MY OVERLAY HAS BEEN CLICKED");
            isAvailable = !isAvailable;
            var edits = {};
            edits[rectangleOverlay] = { color: isAvailable ? AVAILABLE_COLOR : NOT_AVAILABLE_COLOR }
            edits[desktopOverlay] = { text: isAvailable ? OVERLAY_AVAILABLE_TEXT : OVERLAY_NOT_AVAILABLE_TEXT }
            Overlays.editOverlays(edits);

            // TODO send request to server to change availability
        }
    }

    function onWindowResize() {
        deleteAvailabilityOverlays();
        drawAvalabilityOverlays();
    }

    // #endregion AVAILABILITY OVERLAY

    // #region LIFETIME

    function startup() {
        drawAvalabilityOverlays();

        Script.scriptEnding.connect(unload);
        Controller.mousePressEvent.connect(onMousePressEvent);
        Window.geometryChanged.connect(onWindowResize);
    }
    
    function unload() {
        deleteAvailabilityOverlays();
        Controller.mousePressEvent.disconnect(onMousePressEvent);
        Window.geometryChanged.disconnect(onWindowResize);
    }

    // #endregion LIFETIME


    //  Audio.mutedChanged.connect(onMuteStateChanged);
    //
    //  2. Create a new function to produce a text string, do not include new line returns.
    //  example:
    //  function onMuteStateChanged() {
    //     var muteState,
    //         muteString;
    //
    //     muteState = Audio.muted ? "muted" : "unmuted";
    //     muteString = "Microphone is now " + muteState;
    //     createNotification(muteString, NotificationType.MUTE_TOGGLE);
    //  }

    startup();
})();