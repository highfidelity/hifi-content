(function() {
    var _this;
    
    var WhiteboardClient = function() {
        _this = this;
        _this.RESET_STROKE_SEARCH_RADIUS = 5;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.WHITEBOARD_SEARCH_RADIUS = 2;
        _this.whiteboard = null;
    };

    var overlayTutorialMarker;
    var overlayTutorialMarkerArrow;

    var overlayTutorialEraserArrow;
    var overlayTutorialEraser;

    var MARKER_TUTORIAL_OFFSET = {x: -0.75, y: 0.15, z: -0.15};
    var MARKER_ARROW_TUTORIAL_OFFSET = {x: -0.53, y: 0.15, z: -0.8};

    var MARKER_TUTORIAL_DIMENSIONS = {x: 1.5, y: 1.5};
    var MARKER_ARROW_TUTORIAL_DIMENSIONS = {x: 0.5, y: 0.5};

    var ERASER_TUTORIAL_DIMENSIONS = {x: 0.4, y: 0.4};

    var TUTORIAL_OVERLAY_RADIUS = 5.0;

    var MARKER_TUTORIAL_DESKTOP_URL = "tutorial/Whiteboard-desktopmode-instructions-markers.png";
    var MARKER_TUTORIAL_HMD_URL = "tutorial/Whiteboard-VRmode-instructions-markers.png";
    var ERASER_TUTORIAL_DESKTOP_URL = "tutorial/Whiteboard-desktopmode-instructions-eraser.png";
    var ERASER_TUTORIAL_HMD_URL = "tutorial/Whiteboard-VRmode-instructions-eraser.png";
    var ARROW_TUTORIAL_URL = "tutorial/Whiteboard-instructions-arrow.png";
    var ARROW_TUTORIAL_ALT_URL = "tutorial/Whiteboard-instructions-arrow - alt.png";

    var HMD_ROTATION_OFFSET = 45.0;
    var HMD_FORWARD_OFFSET = -1.0;

    var markerTutorialPositionDesktop;
    var markerTutorialPositionHMD;

    var eraserTutorialPositionDesktop;
    var eraserTutorialPositionHMD;

    var arrowLeftPositionDesktop;
    var arrowLeftPositionHMD;

    var arrowRightPositionDesktop;
    var arrowRightPositionHMD;

    WhiteboardClient.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            var whiteboardPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            var whiteboardDimensions = Entities.getEntityProperties(_this.entityID, "dimensions").dimensions;
            var whiteboardRotation = Entities.getEntityProperties(_this.entityID, "rotation").rotation;
            var whiteboardRight = Quat.getRight(whiteboardRotation);
            var whiteboardFront = Quat.getFront(whiteboardRotation);
            var whiteboardUp = Quat.getUp(whiteboardRotation);


            var ov = Overlays.findOverlays(whiteboardPosition, TUTORIAL_OVERLAY_RADIUS);
            ov.forEach(function(overlay) {
                Overlays.deleteOverlay(overlay);
            });
    
            var markerOverlayPosition = Vec3.sum(
                whiteboardPosition,
                Vec3.multiply(
                    whiteboardDimensions.x * MARKER_TUTORIAL_OFFSET.x, 
                    whiteboardRight
                )
            );
            markerOverlayPosition = Vec3.sum(
                markerOverlayPosition, 
                Vec3.multiply(
                    whiteboardDimensions.y * MARKER_TUTORIAL_OFFSET.y, 
                    whiteboardUp
                )
            );
            markerOverlayPosition = Vec3.sum(
                markerOverlayPosition, 
                Vec3.multiply(
                    whiteboardDimensions.z * MARKER_TUTORIAL_OFFSET.z, 
                    whiteboardFront
                )
            );

            var markerOverlayPositionHMD = Vec3.sum(
                markerOverlayPosition, 
                Vec3.multiply(
                    HMD_FORWARD_OFFSET, 
                    whiteboardFront
                )
            );

            var panelRotationLeft = Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(0.0, HMD_ROTATION_OFFSET, 0.0));
            var panelRotationRight = Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(0.0, -HMD_ROTATION_OFFSET, 0.0));
            overlayTutorialMarker = Overlays.addOverlay("image3d", {
                url: Script.resolvePath(HMD.active ? MARKER_TUTORIAL_HMD_URL : MARKER_TUTORIAL_DESKTOP_URL),
                position: markerOverlayPositionHMD,
                rotation: panelRotationLeft,
                dimensions: MARKER_TUTORIAL_DIMENSIONS,
                name: "Tutorial Marker Desktop",
                isFacingAvatar: false,
                alpha: 0.9
            });
            var overlayTutorialEraserPosition = Vec3.sum(
                markerOverlayPosition, 
                Vec3.multiply(
                    -2*whiteboardDimensions.x * MARKER_TUTORIAL_OFFSET.x, 
                    whiteboardRight
                )
            );
            overlayTutorialEraserPosition = Vec3.sum(
                overlayTutorialEraserPosition, 
                Vec3.multiply(
                    -1.4*whiteboardDimensions.y * MARKER_TUTORIAL_OFFSET.y, 
                    whiteboardUp
                )
            );
            var overlayTutorialEraserPositionHMD = Vec3.sum(
                overlayTutorialEraserPosition, 
                Vec3.multiply(
                    HMD_FORWARD_OFFSET, 
                    whiteboardFront
                )
            );

            markerTutorialPositionDesktop = markerOverlayPosition;
            markerTutorialPositionHMD = markerOverlayPositionHMD;
            eraserTutorialPositionDesktop = overlayTutorialEraserPosition;
            eraserTutorialPositionHMD = overlayTutorialEraserPositionHMD;
        
            overlayTutorialEraser = Overlays.addOverlay("image3d", {
                url: Script.resolvePath(HMD.active ? ERASER_TUTORIAL_HMD_URL : ERASER_TUTORIAL_DESKTOP_URL),
                position: overlayTutorialEraserPositionHMD,
                rotation: panelRotationRight,
                dimensions: MARKER_TUTORIAL_DIMENSIONS,
                name: "Tutorial Marker Desktop",
                isFacingAvatar: false,
                alpha: 0.9
            });

            var markerArrowOverlayPosition = Vec3.sum(
                whiteboardPosition,
                Vec3.multiply(
                    whiteboardDimensions.x * MARKER_ARROW_TUTORIAL_OFFSET.x, 
                    whiteboardRight
                )
            );
            markerArrowOverlayPosition = Vec3.sum(
                markerArrowOverlayPosition, 
                Vec3.multiply(
                    whiteboardDimensions.y * MARKER_ARROW_TUTORIAL_OFFSET.y, 
                    whiteboardUp
                )
            );
            markerArrowOverlayPosition = Vec3.sum(
                markerArrowOverlayPosition,
                Vec3.multiply(
                    whiteboardDimensions.z * MARKER_ARROW_TUTORIAL_OFFSET.z, 
                    whiteboardFront
                )
            );

            overlayTutorialMarkerArrow = Overlays.addOverlay("image3d", {
                url: Script.resolvePath(ARROW_TUTORIAL_URL),
                position: markerArrowOverlayPosition,
                rotation: panelRotationLeft,
                dimensions: MARKER_ARROW_TUTORIAL_DIMENSIONS,
                name: "Tutorial Marker Desktop Arrow",
                isFacingAvatar: false,
                visible: true,
                alpha: 0.9
            });
            var eraserArrowOverlayPosition = Vec3.sum(
                whiteboardPosition,
                Vec3.multiply(
                    -1.0 * whiteboardDimensions.x * MARKER_ARROW_TUTORIAL_OFFSET.x, 
                    whiteboardRight
                )
            );
            eraserArrowOverlayPosition = Vec3.sum(
                eraserArrowOverlayPosition,
                Vec3.multiply(
                    -0.65 * whiteboardDimensions.y * MARKER_ARROW_TUTORIAL_OFFSET.y, 
                    whiteboardUp
                )
            );
            eraserArrowOverlayPosition = Vec3.sum(
                eraserArrowOverlayPosition,
                Vec3.multiply(
                    whiteboardDimensions.z * MARKER_ARROW_TUTORIAL_OFFSET.z, 
                    whiteboardFront
                )
            );
            overlayTutorialEraserArrow = Overlays.addOverlay("image3d", {
                url: Script.resolvePath(ARROW_TUTORIAL_ALT_URL),
                position: eraserArrowOverlayPosition,
                rotation: panelRotationRight,
                dimensions: ERASER_TUTORIAL_DIMENSIONS,
                name: "Tutorial Marker Desktop Arrow",
                isFacingAvatar: false,
                visible: true,
                alpha: 0.9
            });

            HMD.displayModeChanged.connect(_this.onHmdChanged);
        },
        onHmdChanged: function(isHMDActive) {
            var whiteboardRotation = Entities.getEntityProperties(_this.entityID, "rotation").rotation;
            var panelRotationLeft = Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(0.0, HMD_ROTATION_OFFSET, 0.0));
            var panelRotationRight = Quat.multiply(whiteboardRotation, Quat.fromPitchYawRollDegrees(0.0, -HMD_ROTATION_OFFSET, 0.0));
            // change marker instructions overlay
            Overlays.editOverlay(overlayTutorialMarker, {
                url: Script.resolvePath(isHMDActive ? MARKER_TUTORIAL_HMD_URL : MARKER_TUTORIAL_DESKTOP_URL)
            });

            // change eraser instructions overlay
            Overlays.editOverlay(overlayTutorialEraser, {
                url: Script.resolvePath(isHMDActive ? ERASER_TUTORIAL_HMD_URL : ERASER_TUTORIAL_DESKTOP_URL)
            });
                      
        },        
        clearBoard: function() {
                      
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            
        },
        startNearTrigger: function(entityID) {      
            
        },
        startFarTrigger: function(entityID) {      
            
        },
        unload: function() {
            Overlays.deleteOverlay(overlayTutorialMarkerArrow);
            Overlays.deleteOverlay(overlayTutorialMarker);
            Overlays.deleteOverlay(overlayTutorialEraserArrow);
            Overlays.deleteOverlay(overlayTutorialEraser);
            HMD.displayModeChanged.disconnect(_this.onHmdChanged);
        }
    };

    return new WhiteboardClient();
});