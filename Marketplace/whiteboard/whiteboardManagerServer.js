(function() {
	Script.include('utils.js');
    Script.include('whiteboardEntities.js');
    TEMPLATES = WHITEBOARD_ENTITIES.Entities;

    // Spawn an entity from a template.
    //
    // The overrides can be used to override or add properties in the template. For instance,
    // it's common to override the `position` property so that you can set the position
    // of the entity to be spawned.
    //
    // @param {string} templateName The name of the template to spawn
    // @param {object} overrides An object containing properties that will override
    //                           any properties set in the template.
    function spawnTemplate(templateName, overrides) {
        var template = getTemplate(templateName);
        if (template === null) {
            print("ERROR, unknown template name:", templateName);
            return null;
        }
        print("Spawning: ", templateName);
        var properties = mergeObjects(template, overrides);
        return Entities.addEntity(properties);
    }

    function spawnTemplates(templateName, overrides) {
        var templates = getTemplates(templateName);
        if (template.length === 0) {
            print("ERROR, unknown template name:", templateName);
            return [];
        }

        var spawnedEntities = [];
        for (var i = 0; i < templates.length; ++i) {
            print("Spawning: ", templateName);
            var properties = mergeObjects(templates[i], overrides);
            spawnedEntities.push(Entities.addEntity(properties));
        }
        return spawnedEntities;
    }

    // TEMPLATES contains a dictionary of different named entity templates. An entity
    // template is just a list of properties.
    //
    // @param name Name of the template to get
    // @return {object} The matching template, or null if not found
    function getTemplate(name) {
        for (var i = 0; i < TEMPLATES.length; ++i) {
            if (TEMPLATES[i].name === name) {
                return TEMPLATES[i];
            }
        }
        return null;
    }
    function getTemplates(name) {
        var templates = [];
        for (var i = 0; i < TEMPLATES.length; ++i) {
            if (TEMPLATES[i].name === name) {
                templates.push(TEMPLATES[i]);
            }
        }
        return templates;
    }

    // Cleanup Whiteboard template data
    for (var i = 0; i < TEMPLATES.length; ++i) {
        var template = TEMPLATES[i];

        // Fixup model url
        if (template.type === "Model") {
            var urlParts = template.modelURL.split("/");
            var filename = urlParts[urlParts.length - 1];
            var newURL = Script.resolvePath("models/" + filename);
            print("Updated url", template.modelURL, "to", newURL);
            template.modelURL = newURL;
        }
    }

    const BLUE_MARKER_NAME = "hifi_model_marker_blue";
    const GREEN_MARKER_NAME = "hifi_model_marker_green";
    const BLACK_MARKER_NAME = "hifi_model_marker_black";
    const RED_MARKER_NAME = "hifi_model_marker_red";
    const PINK_MARKER_NAME = "hifi_model_marker_pink";
    const YELLOW_MARKER_NAME = "hifi_model_marker_yellow";
    const ERASER_NAME = "hifi_model_whiteboardEraser";

    const BLUE_MARKER_COLOR = {red:0, green:13, blue: 255};
    const GREEN_MARKER_COLOR = {red:0, green:190, blue: 90};
    const BLACK_MARKER_COLOR = {red:0, green:0, blue: 0};
    const RED_MARKER_COLOR = {red:255, green:0, blue: 0};
    const PINK_MARKER_COLOR = {red:242, green:0, blue: 255};
    const YELLOW_MARKER_COLOR = {red:255, green:195, blue: 0};

    var blueMarkerID = null;
    var greenMarkerID = null;
    var blackMarkerID = null;
    var redMarkerID = null;
    var pinkMarkerID = null;
    var yellowMarkerID = null;
    var eraserID = null;
    /////
    
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
                max: 0.005
            };

    var Whiteboard = function() {
        _this = this;
    };

    Whiteboard.prototype = {
        remotelyCallable: ['paint', 
            'resetMarkerStroke', 
            'erase', 
            'clearBoard', 
            'serverAddEntity', 
            'serverEditEntity', 
            'serverSetEntityData', 
            'spawnMarker', 
            'spawnEraser'
        ],
        preload: function(entityID){
            print("Daantje Debug on Preload " + entityID);
            _this.entityID = entityID;
            _this.MIN_DISTANCE_BETWEEN_POINTS = 0.002;
            _this.MAX_DISTANCE_BETWEEN_POINTS = 0.1;
            _this.strokes = [];
            _this.STROKE_NAME = "hifi_polyline_markerStroke";
            _this.WHITEBOARD_SURFACE_NAME = "Whiteboard - Drawing Surface";
            _this.MARKER_COLOR_NAME = "hifi-whiteboardPaint";
            _this.spawnOriginalMarkersAndErasers();
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
            print("Daantje Debug Clear Board here");
            _this.resetMarkersAndErasers(_this.entityID, [_this.entityID]);
            _this.spawnOriginalMarkersAndErasers();
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
        resetMarkersAndErasers: function(entityID, params) {
            // delete all markers and erasers
            
            var results = Entities.findEntities(
                Entities.getEntityProperties(_this.entityID, "position").position, 
                15
            );
            print("Daantje Debug Clear Board here delete markers and erasers " + results.length);
            results.forEach(function(entity) {
                var entityName = Entities.getEntityProperties(entity, "name").name;
                if (entityName == ERASER_NAME
                    || entityName == BLUE_MARKER_NAME
                    || entityName == GREEN_MARKER_NAME
                    || entityName == BLACK_MARKER_NAME
                    || entityName == RED_MARKER_NAME
                    || entityName == PINK_MARKER_NAME
                    || entityName == YELLOW_MARKER_NAME) {
                    print("Daantje Debug + + + reset entity " + entity);
                    Entities.deleteEntity(entity);
                }
            });
        },
        spawnOriginalMarkersAndErasers: function() {
           // spawn original markers and erasers
            blueMarkerID = _this.spawnMarkerWithColor(BLUE_MARKER_NAME, BLUE_MARKER_COLOR);
            var newProperties = {
                parentID: '{00000000-0000-0000-0000-000000000000}'
            };
            Entities.editEntity(blueMarkerID, newProperties);
            
            greenMarkerID = _this.spawnMarkerWithColor(GREEN_MARKER_NAME, GREEN_MARKER_COLOR);
            Entities.editEntity(greenMarkerID, newProperties);

            blackMarkerID = _this.spawnMarkerWithColor(BLACK_MARKER_NAME, BLACK_MARKER_COLOR);
            Entities.editEntity(blackMarkerID, newProperties);

            redMarkerID = _this.spawnMarkerWithColor(RED_MARKER_NAME, RED_MARKER_COLOR);
            Entities.editEntity(redMarkerID, newProperties);

            pinkMarkerID = _this.spawnMarkerWithColor(PINK_MARKER_NAME, PINK_MARKER_COLOR);
            Entities.editEntity(pinkMarkerID, newProperties);

            yellowMarkerID = _this.spawnMarkerWithColor(YELLOW_MARKER_NAME, YELLOW_MARKER_COLOR);
            Entities.editEntity(yellowMarkerID, newProperties);
            
            eraserID = null;
            _this.spawnEraser(_this.entityID, [_this.entityID]);
        },
        spawnMarker: function(entityID, params) {
            
            var markerName = utils.parseJSON(params[1]);
            var color = utils.parseJSON(params[2]);

            print("Daantje Debug spawnBlueMarker marker name " + params[0]);
            print("Daantje Debug spawnBlueMarker color " + JSON.stringify(color));

            if ( markerName == "hifi_model_marker_blue" && 
                (blueMarkerID == null || params[0] == blueMarkerID)) {
                print("Daantje Debug spawnBlueMarker 2");
                
                blueMarkerID = _this.spawnMarkerWithColor(markerName, color);

                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}'
                };
                Entities.editEntity(blueMarkerID, newProperties);
            } else if ( markerName == "hifi_model_marker_green" && 
                (greenMarkerID == null || params[0] == greenMarkerID)) {
                print("Daantje Debug spawnGreenMarker 2");
                
                greenMarkerID = _this.spawnMarkerWithColor(markerName, color);

                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}'
                };
                Entities.editEntity(greenMarkerID, newProperties);
            } else if ( markerName == "hifi_model_marker_black" && 
                (blackMarkerID == null || params[0] == blackMarkerID)) {
                print("Daantje Debug spawnBlackMarker 2");
                
                blackMarkerID = _this.spawnMarkerWithColor(markerName, color);

                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}'
                };
                Entities.editEntity(blackMarkerID, newProperties);
            } else if ( markerName == "hifi_model_marker_red" && 
                (redMarkerID == null || params[0] == redMarkerID)) {
                print("Daantje Debug spawnRedMarker 2");
                
                redMarkerID = _this.spawnMarkerWithColor(markerName, color);

                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}'
                };
                Entities.editEntity(redMarkerID, newProperties);
            } else if ( markerName == "hifi_model_marker_pink" && 
                (pinkMarkerID == null || params[0] == pinkMarkerID)) {
                print("Daantje Debug spawnPinkMarker 2");
                
                pinkMarkerID = _this.spawnMarkerWithColor(markerName, color);

                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}'
                };
                Entities.editEntity(pinkMarkerID, newProperties);
            } else if ( markerName == "hifi_model_marker_yellow" && 
                (yellowMarkerID == null || params[0] == yellowMarkerID)) {
                print("Daantje Debug spawnYellowMarker 2");
                
                yellowMarkerID = _this.spawnMarkerWithColor(markerName, color);

                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}'
                };
                Entities.editEntity(yellowMarkerID, newProperties);
            }
        },
        // entityID
        spawnEraser: function(entityID, params) {
            if (eraserID == null || params[0] == eraserID) {
                spawnTemplate("hifi_model_whiteboardEraser", {
                    parentID: _this.entityID,
                    rotation: Quat.multiply(
                        Entities.getEntityProperties(_this.entityID, "rotation").rotation,
                        Quat.fromPitchYawRollDegrees(-90, 0, 0)
                    ),
                    script: Script.resolvePath("eraserEntityScript.js"),
                    userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: true,
                            ignoreIK: true
                        },
                        equipHotspots: [{
                            position: {
                                x: 0,
                                y: 0,
                                z: 0
                            },
                            radius: 0.15,
                            joints: {
                                RightHand: [{
                                    x: 0.020,
                                    y: 0.120,
                                    z: 0.049
                                }, {
                                    x: 0.1004,
                                    y: 0.6424,
                                    z: 0.717,
                                    w: 0.250
                                }],
                                LeftHand: [{
                                    x: -0.005,
                                    y: 0.1101,
                                    z: 0.053
                                }, {
                                    x: 0.723,
                                    y: 0.289,
                                    z: 0.142,
                                    w: 0.610
                                }]
                            }
                        }]
                    })
                });
                newProperties = {
                    parentID: '{00000000-0000-0000-0000-000000000000}',
                    //rotation: Entities.getEntityProperties(_this.entityID, "rotation").rotation
                    //Quat.multiply(Entities.getEntityProperties(eraserID, "rotation").rotation, 
                        
                    
                };
                Entities.editEntity(eraserID, newProperties);
            }
        },
        spawnMarkerWithColor: function(markerName, color) {
            return spawnTemplate(markerName, {
                parentID: _this.entityID,
                //position: rootPosition, 
                //rotation: MyAvatar.orientation,
                script: Script.resolvePath("markerEntityScript.js"),
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: true
                    },
                    markerColor: color,
                    //mainMarker: true,
                    equipHotspots: [{
                        position: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        radius: 0.15,
                        joints: {
                            RightHand: [{
                                x: 0.001,
                                y: 0.139,
                                z: 0.050
                            },
                            {
                                x: -0.0432,
                                y: 0.7337,
                                z: 0.6693,
                                w: -0.1085
                            }],
                            LeftHand: [{
                                x: 0.007,
                                y: 0.151,
                                z: 0.061
                            },
                            {
                                x: 0.6313,
                                y: 0.4172,
                                z: 0.5253,
                                w: -0.3892
                            }]
                        }
                    }]
                })
            });

        },
        unload: function() {
            print("Daantje Debug on Unload");
            _this.resetMarkersAndErasers(_this.entityID, [_this.entityID]);
        }
    };
    return new Whiteboard();

    
});