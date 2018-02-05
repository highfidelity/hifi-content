(function() {
    var _this;
    
    ResetBoard = function() {
        _this = this;
        _this.RESET_STROKE_SEARCH_RADIUS = 5;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
        _this.WHITEBOARD_NAME = "Whiteboard";
        _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
        _this.WHITEBOARD_SEARCH_RADIUS = 2;
        _this.whiteboard = null;
    }

    ResetBoard.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            
        },        
        clearBoard: function() {
            // TODO Hacky
            _this.resetPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            var results = Entities.findEntities(_this.resetPosition, _this.RESET_STROKE_SEARCH_RADIUS);
            _this.findWhiteboard();
            var serverID = _this.whiteboard;
            

            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME && Vec3.distance(_this.resetPosition, props.position) < _this.RESET_STROKE_SEARCH_RADIUS) {
                    //Entities.deleteEntity(stroke);
                    Entities.callEntityServerMethod(serverID, 'erase', [stroke]);
                }
            });
            
            print("Daantje Debug calling server to clear board " + serverID);
            Entities.callEntityServerMethod(serverID, 'clearBoard', []);			
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
            _this.clearBoard();
        },
        startNearTrigger: function(entityID) {      
            _this.clearBoard();
        },


    };

    return new ResetBoard();
});