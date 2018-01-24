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
            // TODO Hacky
            _this.resetPosition = Entities.getEntityProperties(_this.entityID, "position").position;
            var results = Entities.findEntities(_this.resetPosition, _this.RESET_STROKE_SEARCH_RADIUS);
            
            var serverID = Entities.getEntityProperties(_this.entityID, "parentID").parentID;
            serverID =  Entities.getEntityProperties(serverID, "parentID").parentID;

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
        clickReleaseOnEntity: function() {
            _this.clearBoard();
        },
        startNearTrigger: function(entityID) {      
            _this.clearBoard();
        },


    };

    return new ResetBoard();
});