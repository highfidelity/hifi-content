(function() {

    Script.include("/~/system/libraries/utils.js");
    Script.include("/~/system/libraries/Xform.js");
    Script.include("/~/system/libraries/controllers.js");


    var MARKER_SCRIPT_URL = Script.resolvePath('markerEntityScript.js');
    var ERASER_SCRIPT_URL = Script.resolvePath('eraserEntityScript.js');
    // For re-downloading already cached entity scripts
    var SCRIPT_UPDATE_DATE = 1484867653634;

    var CLIENT_ONLY = true;

    var RIGHT_HAND = 1;
    var LEFT_HAND = 0;
    var HAND_COUNT = 2;

    var ZERO_VEC = {
        x: 0,
        y: 0,
        z: 0
    };

    var ONE_VEC = {
        x: 1,
        y: 1,
        z: 1
    };

    var DEBUG = true;

    // Only fetch property once per 5 sec
    var PROPERTIES_FETCH_FREQUENCY = 0.2;
    var REQUEST_PROPERTIES = ['position', 'rotation', 'dimensions', 'registrationPoint'];

    var FORCE_FOLLOW_IK = DEBUG;

    // TODO: put these in userdata
    var HIGHLIGHT_SCALE = 1.1;
    var GRAB_RANGE_SCALE = {x: 1.8, y: 1.8, z: 1.2};

    var MIN_TRIGGER_FORCE = 0.5; // 50%

    var HAPTIC_TEXTURE_STRENGTH = 0.3; // was 0.1
    var HAPTIC_TEXTURE_DURATION = 3.0;

    var _this = null;

    var handToController = function(hand) {
        return (hand === RIGHT_HAND) ? Controller.Standard.RightHand : Controller.Standard.LeftHand;
    };

    var distanceBetweenPointAndBoundingBox = function(point, position, rotation, dimensions, registrationPoint) {
        var entityXform = new Xform(rotation, position);
        var localPoint = entityXform.inv().xformPoint(point);
        var minOffset = Vec3.multiplyVbyV(registrationPoint, dimensions);
        var maxOffset = Vec3.multiplyVbyV(Vec3.subtract(ONE_VEC, registrationPoint), dimensions);
        var localMin = Vec3.subtract(entityXform.trans, minOffset);
        var localMax = Vec3.sum(entityXform.trans, maxOffset);

        var v = {x: localPoint.x, y: localPoint.y, z: localPoint.z};
        v.x = Math.max(v.x, localMin.x);
        v.x = Math.min(v.x, localMax.x);
        v.y = Math.max(v.y, localMin.y);
        v.y = Math.min(v.y, localMax.y);
        v.z = Math.max(v.z, localMin.z);
        v.z = Math.min(v.z, localMax.z);

        return Vec3.distance(v, localPoint);
    }

    var distanceBetweenPointAndEntityBoundingBox = function(point, entityProps) {
        var entityXform = new Xform(entityProps.rotation, entityProps.position);
        var localPoint = entityXform.inv().xformPoint(point);
        var minOffset = Vec3.multiplyVbyV(entityProps.registrationPoint, entityProps.dimensions);
        var maxOffset = Vec3.multiplyVbyV(Vec3.subtract(ONE_VEC, entityProps.registrationPoint), entityProps.dimensions);
        var localMin = Vec3.subtract(entityXform.trans, minOffset);
        var localMax = Vec3.sum(entityXform.trans, maxOffset);

        var v = {x: localPoint.x, y: localPoint.y, z: localPoint.z};
        v.x = Math.max(v.x, localMin.x);
        v.x = Math.min(v.x, localMax.x);
        v.y = Math.max(v.y, localMin.y);
        v.y = Math.min(v.y, localMax.y);
        v.z = Math.max(v.z, localMin.z);
        v.z = Math.min(v.z, localMax.z);

        return Vec3.distance(v, localPoint);
    }
 
    function HandyAttacher() {
        _this = this;
        _this.overlay = null;
        _this.entityID = null;
        _this.mappingName = null;
        _this.mapping = null;
        _this.ignoreDistance = 0.2;
        _this.triggerPress = [0.0, 0.0]; // both hands
        _this.wasHandPreviouslyInBound = [false, false]; // both hands ..
        _this.wasTriggeredWhileInBound = [false, false]; // both hands ...
    }

    HandyAttacher.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.overlayVisible = false;
            _this.overlay = Overlays.addOverlay('model', {
                parentID: _this.entityID,
                localPosition: {x: 0.0, y: 0.0, z: 0.0},
                localRotation: {x: 0.0, y: 0.0, z: 0.0, w: 1.0},
                dimensions: Vec3.multiply(Entities.getEntityProperties(_this.entityID, 'dimensions').dimensions, HIGHLIGHT_SCALE),
                url: Entities.getEntityProperties(_this.entityID, 'modelURL').modelURL,
                visible: _this.overlayVisible
            });
            _this.mappingName = 'io.highfidelity.attacherEntity_' + entityID;
            _this.mapping = Controller.newMapping(_this.mappingName);
            _this.mapping.from([Controller.Standard.LT]).peek().to(function(value) {
                _this.triggerPress[LEFT_HAND] = value;
            });
            _this.mapping.from([Controller.Standard.RT]).peek().to(function(value) {
                _this.triggerPress[RIGHT_HAND] = value;
            });
            var updateProperties = function() {
                _this.properties = Entities.getEntityProperties(_this.entityID, REQUEST_PROPERTIES);
                _this.ignoreDistance = Math.max(_this.properties.dimensions.x, _this.properties.dimensions.y, _this.properties.dimensions.z) * GRAB_RANGE_SCALE;
            };
            _this.propertiesUpdateTimer = Script.setInterval(updateProperties, 1000 / PROPERTIES_FETCH_FREQUENCY);
            updateProperties();
            
            Controller.enableMapping(_this.mappingName);
            //Controller.mouseReleaseEvent.connect(_this.mouseReleaseEvent);
            Script.update.connect(_this.update);
        },
        unload: function() {
            // important to disconnect the update first, to prevent it from not disconnecting
            Script.update.disconnect(_this.update);
            Script.clearInterval(_this.propertiesUpdateTimer);
            Overlays.deleteOverlay(_this.overlay);
            Controller.disableMapping(_this.mappingName);
            //Controller.mouseReleaseEvent.disconnect(_this.mouseReleaseEvent);
        },
        update: function(deltaTime) {
            var shouldShow = false;
            for (var hand = 0; hand < HAND_COUNT; hand++) {
                var worldHandPosition = getControllerWorldLocation(handToController(hand), true).position;
                if (Vec3.distance(_this.properties.position, worldHandPosition) > _this.ignoreDistance) {
                    //print(Vec3.distance(_this.properties.position, worldHandPosition) + '>' + _this.ignoreDistance)
                    continue;
                }
                var outerDistance = distanceBetweenPointAndBoundingBox(worldHandPosition, _this.properties.position,
                    _this.properties.rotation, Vec3.multiplyVbyV(_this.properties.dimensions, GRAB_RANGE_SCALE), _this.properties.registrationPoint);

                // if hand near bound (scale bound x1.5)
                if (outerDistance === 0) {
                    shouldShow = true;
                //}

                // if hand in bound
                //var innerDistance = distanceBetweenPointAndEntityBoundingBox(worldHandPosition, properties);
                //print("innerDistance = " + innerDistance);
                //if (innerDistance === 0) {
                    if (!_this.wasHandPreviouslyInBound[hand]) {
                        Controller.triggerHapticPulse(HAPTIC_TEXTURE_STRENGTH, HAPTIC_TEXTURE_DURATION, hand);
                    }
                    _this.wasHandPreviouslyInBound[hand] = true;
                    if (!_this.wasTriggeredWhileInBound[hand] && _this.triggerPress[hand] >= MIN_TRIGGER_FORCE) {
                        _this.wasTriggeredWhileInBound[hand] = true;
                        Controller.triggerShortHapticPulse(1.0, hand);
                        _this.attachEntity(_this.entityID, hand === LEFT_HAND ? 'left' : 'right');
                    }

                } else {
                    // reset while out of bounds
                    _this.wasHandPreviouslyInBound[hand] = false;
                    _this.wasTriggeredWhileInBound[hand] = false;
                }

            }
            if (shouldShow !== _this.overlayVisible) {
                Overlays.editOverlay(_this.overlay, {visible: shouldShow});
                _this.overlayVisible = shouldShow;
            }
        },
        createMarker: function(modelURL, markerColor) {
            print ('cm modelURL = ' + modelURL)
            var markerProperties = {
                type: "Model",
                modelURL: modelURL,
                shapeType: "box",
                name: "hifi_model_marker",
                dimensions: {
                    x: 0.027,
                    y: 0.027,
                    z: 0.164
                },
                lifetime: 86400,
                script: MARKER_SCRIPT_URL,
                scriptTimestamp: SCRIPT_UPDATE_DATE,
				//parentID: Entities.getEntityProperties(_this.entityID, "parentID").parentID,
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: FORCE_FOLLOW_IK
                    },
                    markerColor: markerColor,
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
            };
            return Entities.addEntity(markerProperties);
        },
        createEraser: function(modelURL) {

            var eraserProps = {
                type: "Model",
                name: "hifi_model_whiteboardEraser",
                modelURL: modelURL,
                script: ERASER_SCRIPT_URL,
                scriptTimestamp: SCRIPT_UPDATE_DATE,
                shapeType: "box",
				parentID: Entities.getEntityProperties(_this.entityID, "parentID").parentID,
                lifetime: 86400,
                dimensions: {
                    x: 0.0858,
                    y: 0.0393,
                    z: 0.2083
                },
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: FORCE_FOLLOW_IK
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
            };
            return Entities.addEntity(eraserProps);
        },
        attachEntity: function(entityID, attachHand) {
            var properties = Entities.getEntityProperties(entityID, ['userData', 'modelURL']);
            var userData = JSON.parse(properties.userData);

            var newEntity;
            if (userData.type === 'marker') {
                newEntity = _this.createMarker(properties.modelURL, userData.markerColor);
            } else if (userData.type === 'eraser') {
                newEntity = _this.createEraser(properties.modelURL);
            } else {
                return;
            }
            //Script.setTimeout(function() {
            Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({hand: attachHand, entityID: newEntity}));
            //}, 1000);
        },

        // DESKTOP MOUSE COMPATIBILITY
        
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.isLeftButton) {
                return;
            }
            var properties = Entities.getEntityProperties(entityID, ['userData', 'modelURL']);
            properties.rotation = Entities.getEntityProperties(Entities.getEntityProperties(_this.entityID, "parentID").parentID, "rotation").rotation;
            properties.position = Entities.getEntityProperties(_this.entityID, "position").position;

            var userData = JSON.parse(properties.userData);
            if (Entities.getEntityProperties(entityID, "name").name === "hifi_model_whiteboardEraser") {
                print("Daantje Debug + test 2  mouseReleaseEvent create eraser " + JSON.stringify(mouseEvent));
                var eraser = _this.createEraser(properties.modelURL);
                Entities.editEntity(eraser, {
                    position: properties.position
                });
            } else {
                print("Daantje Debug + test 2  mouseReleaseEvent create marker " + JSON.stringify(mouseEvent));

                var marker = _this.createMarker(properties.modelURL, userData.markerColor);
                Entities.editEntity(marker, {
                    position: properties.position,
                    rotation: properties.rotation
                });
            }
            
        }
        

        /*,
        startNearTrigger: function(entityID, args) {
            print(' on startNearTrigger!!');
            _this.attachEntity(entityID, args[0]);
        }*/
    };

    return new HandyAttacher();
});
