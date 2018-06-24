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

    var isTutorialCard1Enabled = false;
    var overlayTutorialCard1On;
    var overlayTutorialCard1Off;

    WhiteboardClient.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            
            var overlayTutorialCard1On = Overlays.addOverlay("image3d", {
                url: Script.resolvePath("tutorial/ClickOverlay.jpg"),
                position: Vec3.sum(
                    Entities.getEntityProperties(_this.entityID, "position").position,
                    Vec3.multiply(
                        Entities.getEntityProperties(_this.entityID, "dimensions").dimensions.x, 
                        Quat.getRight(Entities.getEntityProperties(_this.entityID, "rotation").rotation)
                    )
                ),
                rotation: Entities.getEntityProperties(_this.entityID, "rotation").rotation,
                dimensions: { x:2, y: 2},
                isFacingAvatar: true
            });

            var overlayTutorialCard1Off = Overlays.addOverlay("image3d", {
                url: Script.resolvePath("tutorial/DismissClickOverlay.jpg"),
                position: Vec3.sum(
                    Entities.getEntityProperties(_this.entityID, "position").position,
                    Vec3.multiply(
                        Entities.getEntityProperties(_this.entityID, "dimensions").dimensions.x, 
                        Quat.getRight(Entities.getEntityProperties(_this.entityID, "rotation").rotation)
                    )
                ),
                rotation: Entities.getEntityProperties(_this.entityID, "rotation").rotation,
                dimensions: { x:2, y: 2},
                isFacingAvatar: true,
                visible: false
            });
              

            Overlays.hoverEnterOverlay.connect(function(overlayTutorialCard1On, event) {
               
                if (!isTutorialCard1Enabled) {
                    isTutorialCard1Enabled = true;
                    Overlays.editOverlay(overlayTutorialCard1On, {visible: false});
                    Overlays.editOverlay(overlayTutorialCard1Off, {visible: true});
                }
                
            });

            Overlays.hoverLeaveOverlay.connect(function(overlayTutorialCard1Off, event) {
                
                if (isTutorialCard1Enabled) {
                    isTutorialCard1Enabled = false;
                    Overlays.editOverlay(overlayTutorialCard1On, {visible: true});
                    Overlays.editOverlay(overlayTutorialCard1Off, {visible: false});
                }
            });

            Overlays.mouseReleaseOnOverlay.connect(function(overlayID, event) {
                print("Delete: " + overlayID);
                Overlays.deleteOverlay(overlayTutorialCard1Off);
                Overlays.deleteOverlay(overlayTutorialCard1On);
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
            
        }
    };

    return new WhiteboardClient();
});