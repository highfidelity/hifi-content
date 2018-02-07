(function() {

    var MARKER_SCRIPT_URL = Script.resolvePath('markerEntityScript.js');
    var ERASER_SCRIPT_URL = Script.resolvePath('eraserEntityScript.js');
    // For re-downloading already cached entity scripts
    var SCRIPT_UPDATE_DATE = 1484867653633;

    var CLIENT_ONLY = true;

    var DEBUG = true;

    var FORCE_FOLLOW_IK = DEBUG;

    var _this = null;
 
    function HandyAttacher() {
        _this = this;
    }

    HandyAttacher.prototype = {
         createMarker: function(modelURL, markerColor) {
            print ('cm modelURL = ' + modelURL)
            var markerProperties = {
                type: "Model",
                modelURL: modelURL,
                //rotation: _this.markerRotation,
                shapeType: "box",
                name: "hifi_model_marker",
                //position: markerPosition,
                dimensions: {
                    x: 0.027,
                    y: 0.027,
                    z: 0.164
                },
                lifetime: 86400,
                script: MARKER_SCRIPT_URL,
                scriptTimestamp: SCRIPT_UPDATE_DATE,
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: FORCE_FOLLOW_IK
                    },
                    //originalPosition: markerPosition,
                    //originalRotation: _this.markerRotation,
                    markerColor: markerColor,
                    equipHotspots: [{
                        position: {
                            x: 0,
                            y: 0,
                            z: 0
                        },
                        radius: 0.5,
                        joints: {
                            RightHand: [{
                                x: 0.001,
                                y: 0.139,
                                z: 0.050
                            }, {
                                x: -0.73,
                                y: -0.043,
                                z: -0.108,
                                w: -0.666
                            }],
                            LeftHand: [{
                                x: 0.007,
                                y: 0.151,
                                z: 0.061
                            }, {
                                x: -0.417,
                                y: 0.631,
                                z: -0.389,
                                w: -0.525
                            }]
                        }
                    }]
                })
            }

            return Entities.addEntity(markerProperties, CLIENT_ONLY);
        },
        createEraser: function() {
            _this.setup();
            var ERASER_MODEL_URL = "http://hifi-content.s3.amazonaws.com/caitlyn/production/whiteboard/eraser-2.fbx";

            //var eraserPosition = Vec3.sum(_this.spawnPosition, Vec3.multiply(Quat.getFront(_this.orientation), -0.1));
            //eraserPosition = Vec3.sum(eraserPosition, Vec3.multiply(-0.5, Quat.getRight(_this.orientation)));
            //var eraserRotation = _this.markerRotation;

            var eraserProps = {
                type: "Model",
                name: "hifi_model_whiteboardEraser",
                modelURL: ERASER_MODEL_URL,
                //position: eraserPosition,
                script: ERASER_SCRIPT_URL,
                scriptTimestamp: SCRIPT_UPDATE_DATE,
                shapeType: "box",
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
                        radius: 0.25,
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
            }
            return Entities.addEntity(eraserProps, CLIENT_ONLY);
        },
        attachEntity: function(entityID, attachHand) {
            var properties = Entities.getEntityProperties(entityID, ['userData', 'modelURL']);
            var userData = JSON.parse(properties.userData);

            var newEntity;
            if (userData.type === 'marker') {
                newEntity = _this.createMarker(properties.modelURL, userData.markerColor);
            } else if (userData.type === 'eraser') {
                newEntity = _this.createEraser();
            } else {
                return;
            }

            /**

             JSON.stringify({
                grabbableKey: {
                    wantsTrigger: true
                },
                equipHotspots: [{
                    position: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    radius: 0.25,
                    modelURL: 'http://hifi-content.s3.amazonaws.com/alan/dev/equip-Fresnel-3.fbx',
                    modelScale: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                }]
            });

            markerColor: markerColor,
                    wearable: {
                        joints: {
                            RightHand: [{
                                x: 0.001,
                                y: 0.139,
                                z: 0.050
                            }, {
                                x: -0.73,
                                y: -0.043,
                                z: -0.108,
                                w: -0.666
                            }],
                            LeftHand: [{
                                x: 0.007,
                                y: 0.151,
                                z: 0.061
                            }, {
                                x: -0.417,
                                y: 0.631,
                                z: -0.389,
                                w: -0.525
                            }]
                        }
                    }
            **/
            /*var attachmentEntity = Entities.addEntity({
                dimensions: {
                    x: 0.62574273347854614,
                    y: 0.62574273347854614,
                    z: 0.62574273347854614
                },
                dynamic: 0,
                name: 'voxel paint palette',
                rotation: {
                    w: 0.89465177059173584,
                    x: 0.022446036338806152,
                    y: 0.43398189544677734,
                    z: -0.10347139835357666
                },
                script: Script.resolvePath('voxel-paint-palette.js') + '?t=' + Date.now(),
                shapeType: 'none',
                collisionless: true,
                type: 'Sphere',
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: false
                    },
                    equipHotspots: [{
                        position: {
                            x: 0.20037400722503662,
                            y: 0.1712799370288849,
                            z: 0.17256569862365723
                        },
                        radius: 0.25,
                        joints: {
                            RightHand: [
                                {
                                    x: 0.06535067409276962,
                                    y: 0.08814819157123566,
                                    z: 0.19130933284759521
                                },
                                {
                                    x: 0.47678816318511963,
                                    y: 0.46527519822120667,
                                    z: -0.5204160213470459,
                                    w: 0.5342028141021729
                                }
                            ],
                            LeftHand: [
                                {
                                    x: -0.03563585877418518,
                                    y: 0.11518450081348419,
                                    z: 0.19681024551391602
                                },
                                {
                                    x: 0.3940891623497009,
                                    y: -0.3781183063983917,
                                    z: 0.4759393334388733,
                                    w: 0.6893547773361206
                                }
                            ]
                        },
                        modelURL: 'http://hifi-content.s3.amazonaws.com/alan/dev/equip-Fresnel-3.fbx',
                        modelScale: {
                            x: 1,
                            y: 1,
                            z: 1
                        }
                    }
                ]}),
                visible: false
            });
            Entities.addEntity({
                dimensions: {
                    x: 0.62574279308319092,
                    y: 0.023471139371395111,
                    z: 0.52269172668457031
                },
                dynamic: 0,
                collisionless: true,
                parentID: attachmentEntity,
                modelURL: attachHand === 'left' ? PALETTE_MODEL_LEFT_HAND : PALETTE_MODEL_RIGHT_HAND,
                name: 'voxel paint palette model',
                rotation: {
                    w: 0.89465177059173584,
                    x: 0.022446036338806152,
                    y: 0.43398189544677734,
                    z: -0.10347139835357666
                },
                shapeType: 'none',
                type: 'Model'
            });*/
            Script.setTimeout(function() {
                Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({hand: attachHand, entityID: newEntity}));
            }, 1000);
        },
        startNearTrigger: function(entityID, args) {
            print(' on startNearTrigger!!');
            _this.attachEntity(entityID, args[0]);
        }
    };

    return new HandyAttacher();
});
