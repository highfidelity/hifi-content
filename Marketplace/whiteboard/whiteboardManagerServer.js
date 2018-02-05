(function() {
	Script.include('utils.js');
    
    var _this;
    
    var strokes = [];
    var strokesInProgress = [];
    var linePointsInProgress = [];
    var normalsInProgress = [];
    var strokeBasePositionInProgress = [];
    var MAX_POINTS_PER_STROKE = 40;
    
	var MARKER_TEXTURE_URL = Script.resolvePath("markerStroke.png");
	//var strokeForwardOffset = 0.0001;
	var strokeForwardOffset = 0.01;
	var STROKE_WIDTH_RANGE = {
                min: 0.002,
                max: 0.01
            };

    var Whiteboard = function() {
        _this = this;
    };

    Whiteboard.prototype = {
        remotelyCallable: ['paint', 'resetMarkerStroke', 'erase', 'clearBoard', 'serverAddEntity', 'serverEditEntity', 'serverSetEntityData'],
        preload: function(entityID){
            print("Daantje Debug on Preload " + entityID);
            _this.entityID = entityID;
            _this.MIN_DISTANCE_BETWEEN_POINTS = 0.002;
            _this.MAX_DISTANCE_BETWEEN_POINTS = 0.1;
            _this.strokes = [];
            _this.STROKE_NAME = "hifi_polyline_markerStroke";
            _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
            _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
        },
        /**
         * Remotely callable startMarkerLine function
         * @param entityID current entity ID
         * @param param parameters [position, markerColor, creatorMarker, parentID]
         */
        paint: function(entityID, params) {
            print("Daantje Debug paint @ " + JSON.stringify(params[0]));
            var properties = null;
            //TODO find stroke
            var currentIndex = -1;
            for(var i = 0; i < strokesInProgress.length; i++){
                if (getEntityUserData(strokesInProgress[i]).creatorMarker == params[2]) {
                    currentIndex = i;
                    break;
                }
            }
            
            // we haven't found the polyline
            if (currentIndex == -1) {
                // build new polyline
				print("Daantje Debug start new stroke");
				_this.startMarkerStroke(params);
                currentIndex = 0;
				return;
            }
            
            // add new points
            var linePoints = linePointsInProgress[currentIndex];
            var normals = normalsInProgress[currentIndex];
            var strokeWidths = [];
            var strokeBasePosition = strokeBasePositionInProgress[currentIndex];
            var basePosition = utils.parseJSON(params[0]);
            var whiteboardNormal = Entities.getEntityProperties(_this.entityID , "rotation").rotation;
            whiteboardNormal = Vec3.multiply(-1, Quat.getFront(whiteboardNormal));

            var whiteboardPosition = Entities.getEntityProperties(_this.entityID , "position").position;
			print("Daantje Debug -- normal " + JSON.stringify(whiteboardNormal));
            print("Daantje Debug -- position " + JSON.stringify(whiteboardPosition));
			
            // Plane equation
            // ax + by + cz + d = 0
            var d = -1 * (whiteboardNormal.x * whiteboardPosition.x + 
                whiteboardNormal.y * whiteboardPosition.y +
                whiteboardNormal.z * whiteboardPosition.z 
            );
			var c = Vec3.dot(whiteboardNormal, whiteboardPosition);
			
			print("Daantje Debug -- d " + d);
            
            //add new points to lines and normals
            var localPoint = basePosition;
			//var localPoint = Vec3.subtract(basePosition, strokeBasePosition);
			
			var distLocal = Vec3.dot(whiteboardNormal, localPoint) - c;
            
			print("Daantje Debug -- dist " + distLocal);
            
            //Projecting local point onto the whiteboard plane
            //localPoint = Vec3.sum(localPoint, Vec3.multiply(-1 * dist, whiteboardNormal));
			localPoint = Vec3.subtract(localPoint, Vec3.multiply(distLocal, whiteboardNormal));
			localPoint = Vec3.subtract(localPoint, strokeBasePosition);
			localPoint = Vec3.sum(localPoint, Vec3.multiply(whiteboardNormal, strokeForwardOffset));
            
			print("Daantje Debug -- Drawing here " + JSON.stringify(localPoint));

            if (linePoints.length > 0) {
                var distance = Vec3.distance(localPoint, linePoints[linePoints.length - 1]);
                if (distance < _this.MIN_DISTANCE_BETWEEN_POINTS) {
                    return;
                }
            }
            linePoints.push(localPoint);
            normals.push(whiteboardNormal);

            var strokeWidths = [];
            var i;
            for (i = 0; i < linePoints.length; i++) {
                // Create a temp array of stroke widths for calligraphy effect - start and end should be less wide
                var pointsFromCenter = Math.abs(linePoints.length / 2 - i);
                var pointWidth = map(pointsFromCenter, 0, linePoints.length / 2, STROKE_WIDTH_RANGE.max, STROKE_WIDTH_RANGE.min);
                strokeWidths.push(pointWidth);
            }
            
            //edit entity
            Entities.editEntity(strokesInProgress[currentIndex], {
                linePoints: linePoints,
                normals: normals,
                strokeWidths: strokeWidths
            });
            linePointsInProgress[currentIndex] = linePoints;
            normalsInProgress[currentIndex] = normals;
            

            // if reached max number finish line
            if (linePoints.length > MAX_POINTS_PER_STROKE) {
                strokes.push(strokesInProgress[currentIndex]);
                strokesInProgress.splice(currentIndex, 1);
                linePointsInProgress.splice(currentIndex, 1);
                normalsInProgress.splice(currentIndex, 1);
                strokeBasePositionInProgress.splice(currentIndex, 1);
            }
        },
        startMarkerStroke: function(params) {
            print("Daantje Debug startMarkerStroke " + JSON.stringify(params));
            var newStroke = Entities.addEntity({
				type: "PolyLine",
                name: _this.STROKE_NAME,
                dimensions: {
                    x: 10,
                    y: 10,
                    z: 10
                },
                position: utils.parseJSON(params[0]),
                color: utils.parseJSON(params[1]),
                textures: MARKER_TEXTURE_URL,
                lifetime: 5000,
                userData: JSON.stringify({
                    creatorMarker: params[2],
					parentBoard: params[3]
                })
            });
            
			
            linePointsInProgress.push([]);
            normalsInProgress.push([]);
            strokesInProgress.push(newStroke);
            strokeBasePositionInProgress.push(utils.parseJSON(params[0]));
			_this.paint(_this.entityID, params);
		},
        resetMarkerStroke: function(entityID, params) {
            print("Daantje Debug resetMarkerStroke");


            var currentIndex = -1;
            for(var i = 0; i < strokesInProgress.length; i++){
                if (getEntityUserData(strokesInProgress[i]).creatorMarker == params[0]) {
                    currentIndex = i;
                    break;
                }
            }
            
            // we haven't found the polyline
            if (currentIndex == -1) {
                return;
            }
			
            strokes.push(strokesInProgress[currentIndex]);
            strokesInProgress.splice(currentIndex, 1);
            linePointsInProgress.splice(currentIndex, 1);
            normalsInProgress.splice(currentIndex, 1);
            strokeBasePositionInProgress.splice(currentIndex, 1);
        },
        // params [strokeID]
        erase: function(entityID, params) {
            print("Daantje Debug erase");
            // TODO clean arrays
            Entities.deleteEntity(params[0]);
        },
		clearBoard: function(entityID, params) {
            print("Daantje Debug clear board");
        },
        // params [entityID, properties]
        serverAddEntity: function(entityID, params) {
            print("Daantje Debug serverAddEntity");
            Entities.addEntity(params[0], utils.parseJSON(params[1]));
        },
        // params [entityID, properties]
        serverEditEntity: function(entityID, params) {
            print("Daantje Debug serverEditEntity");
            Entities.editEntity(params[0], utils.parseJSON(params[1]));
        },
        // params [property, entityID, message]
        // setEntityCustomData("markerColor", _this.entityID, JSON.parse(message))
        serverSetEntityData: function(entityID, params) {
            print("Daantje Debug serverSetEntityData");
            //setEntityCustomData(params[0], params[1], utils.parseJSON(params[2]));
            setEntityUserData(params[0], utils.parseJSON(params[1]));
        },
        unload: function() {
            print("Daantje Debug on Unload");
        }
    };
    return new Whiteboard();

    
});