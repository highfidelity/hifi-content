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

    var MARKER_TUTORIAL_OFFSET = {x: -0.75, y: 0.15, z: -0.15};
    var MARKER_ARROW_TUTORIAL_OFFSET = {x: -0.53, y: 0.15, z: -0.8};

    var MARKER_TUTORIAL_DIMENSIONS = {x: 1.5, y: 1.5};
    var MARKER_ARROW_TUTORIAL_DIMENSIONS = {x: 0.5, y: 0.5};

    var TUTORIAL_OVERLAY_RADIUS = 5.0;

    var MARKER_TUTORIAL_DESKTOP_URL = "tutorial/Whiteboard-desktopmode-instructions-markers.png";
    var MARKER_TUTORIAL_HMD_URL = "tutorial/Whiteboard-VRmode-instructions-markers.png";
   
    var ARROW_TUTORIAL_URL = "tutorial/Whiteboard-instructions-arrow.png";

    var HMD_ROTATION_OFFSET = 45.0;
    var HMD_FORWARD_OFFSET = -1.0;

    WhiteboardClient.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            Script.setTimeout(function () {
                _this.setUp();
            }, 1500);
        },
        setUp: function() {
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

            var panelRotationLeft = Quat.multiply(
                whiteboardRotation, 
                Quat.fromPitchYawRollDegrees(0.0, HMD_ROTATION_OFFSET, 0.0)
            );
           
            overlayTutorialMarker = Overlays.addOverlay("image3d", {
                url: Script.resolvePath(HMD.active ? MARKER_TUTORIAL_HMD_URL : MARKER_TUTORIAL_DESKTOP_URL),
                position: markerOverlayPositionHMD,
                rotation: panelRotationLeft,
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

            HMD.displayModeChanged.connect(_this.onHmdChanged);
        },
        onHmdChanged: function(isHMDActive) {
            // change marker instructions overlay
            Overlays.editOverlay(overlayTutorialMarker, {
                url: Script.resolvePath(isHMDActive ? MARKER_TUTORIAL_HMD_URL : MARKER_TUTORIAL_DESKTOP_URL)
            });
            
        },
        unload: function() {
            Overlays.deleteOverlay(overlayTutorialMarkerArrow);
            Overlays.deleteOverlay(overlayTutorialMarker);
            HMD.displayModeChanged.disconnect(_this.onHmdChanged);
        }
    };

    return new WhiteboardClient();
});