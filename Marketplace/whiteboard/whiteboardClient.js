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

    var overlayTutorialCard1On;
    var overlayTutorialCard1Off;

    var MARKER_TUTORIAL_OFFSET = {x: -0.8, y: 0.15, z: -0.15};
    var MARKER_ARROW_TUTORIAL_OFFSET = {x: -0.52, y: 0.15, z: -0.15};

    var MARKER_TUTORIAL_DIMENSIONS = {x: 1.5, y: 1.5};
    var MARKER_ARROW_TUTORIAL_DIMENSIONS = {x: 0.5, y: 0.5};

    var TUTORIAL_OVERLAY_RADIUS = 5.0;

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

            overlayTutorialCard1On = Overlays.addOverlay("image3d", {
                url: Script.resolvePath("tutorial/Whiteboard-desktopmode-instructions-markers.png"),
                position: markerOverlayPosition,
                rotation: whiteboardRotation,
                dimensions: MARKER_TUTORIAL_DIMENSIONS,
                name: "Tutorial Marker Desktop",
                isFacingAvatar: false
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

            overlayTutorialCard1Off = Overlays.addOverlay("image3d", {
                url: Script.resolvePath("tutorial/Whiteboard-instructions-arrow.png"),
                position: markerArrowOverlayPosition,
                rotation: whiteboardRotation,
                dimensions: MARKER_ARROW_TUTORIAL_DIMENSIONS,
                name: "Tutorial Marker Desktop Arrow",
                isFacingAvatar: false,
                visible: true
            });
        },        
        clearBoard: function() {
                      
        },
        findWhiteboard: function() {
            var results = Entities.findEntities(
                Entities.getEntityProperties(_this.entityID, "position").position,
                _this.WHITEBOARD_SEARCH_RADIUS
            );
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName === _this.WHITEBOARD_NAME) {
                    _this.whiteboard = entity;
                    return;
                }
            });
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            
        },
        startNearTrigger: function(entityID) {      
            
        },
        startFarTrigger: function(entityID) {      
            
        },
        unload: function() {
            Overlays.deleteOverlay(overlayTutorialCard1Off);
            Overlays.deleteOverlay(overlayTutorialCard1On);
        }
    };

    return new WhiteboardClient();
});