(function() {
    var _this;
    
    ResetBoard = function() {
        _this = this;
        _this.RESET_STROKE_SEARCH_RADIUS = 5;
        _this.STROKE_NAME = "hifi_polyline_markerStroke";
    }

    ResetBoard.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
        },        
        clearBoard: function() {
            _this.resetPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            var results = Entities.findEntities(_this.resetPosition, _this.RESET_STROKE_SEARCH_RADIUS);

            results.forEach(function(stroke) {
                var props = Entities.getEntityProperties(stroke, ["position", "name"]);
                if (props.name === _this.STROKE_NAME && Vec3.distance(_this.resetPosition, props.position) < _this.RESET_STROKE_SEARCH_RADIUS) {
                    Entities.deleteEntity(stroke);
                }
            });     
        },
        clickReleaseOnEntity: function() {
            _this.clearBoard();
        },
        startNearTrigger: function(entityID) {      
            _this.clearBoard();
        },


    };

    return new ResetBoard();
});