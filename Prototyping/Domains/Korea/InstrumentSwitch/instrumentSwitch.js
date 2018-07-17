// instrumentSwitch.js
//
//  Created by Robin Wilson on 7/17/18.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Toggles the korean instruments from from grabbable to ungrabbable with a mouse click
//  or swiping hand above the lantern entity. Lanterns and lights toggle on and off to 
//  indicate which grabbable state the instruments are in.

/* global AccountServices */

(function () {

    var ALLOWED_USERS = ['Firebird25', 'Alan_', 'jyoum', 'tinydancer', 'MissLiviRose'];

    var isAllowedUser = false;

    var INSTRUMENT_NAME = "InstrumentCloneable";
    var LIGHT_NAME = "InstrumentLight";
    var LAMP_NAME = "InstrumentLamp";

    var LAMP_ON_MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/tableLantern.fbx";
    var LAMP_OFF_MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/tableLantern_off.fbx";

    var entityID;
    var isGrabbable = false;
    var SEARCH_RADIUS = 20;
    var timeOutSet = false;

    var checkHandInterval = null;

    function getEntityListByName(name) {
        var properties = Entities.getEntityProperties(entityID, 'position');
        var entityIDs = Entities.findEntitiesByName(name, properties.position, SEARCH_RADIUS);
        return entityIDs;
    }

    function setGrabbable(id, isGrabbable) {
        Entities.editEntity(id, {
            cloneable: isGrabbable,
            userData: JSON.stringify({
                "grabbableKey": {
                    "grabbable": isGrabbable
                }
            })
        });
    }

    function setLampModel(id, isOn) {
        var nextLampModel = isOn ? LAMP_ON_MODEL_URL : LAMP_OFF_MODEL_URL;
        Entities.editEntity(id, {
            modelURL: nextLampModel
        });
    }

    function setLightOn(id, isOn) {
        Entities.editEntity(id, {
            visible: isOn
        });
    }

    function isColliding(vector3) {
        // does not factor in rotation

        var properties = Entities.getEntityProperties(entityID, ['position', 'dimensions']);
        var dimensions = properties.dimensions;
        var position = properties.position;

        var minX = position.x - dimensions.x / 2;
        var maxX = position.x + dimensions.x / 2;
        var minY = position.y + dimensions.y / 2;
        var maxY = position.y + dimensions.y * 1.5;
        var minZ = position.z - dimensions.z / 2;
        var maxZ = position.z + dimensions.z / 2;

        if (vector3.x >= minX && vector3.x <= maxX
            && vector3.y >= minY && vector3.y <= maxY
            && vector3.z >= minZ && vector3.z <= maxZ) {
            return true;
        } else {
            return false;
        }
    }

    function toggleInstrumentGrabbable() {

        if (ALLOWED_USERS.indexOf(AccountServices.username) >= 0) {
            var instrumentList = getEntityListByName(INSTRUMENT_NAME);
            var lampList = getEntityListByName(LAMP_NAME);
            var lightList = getEntityListByName(LIGHT_NAME);

            if (instrumentList.length > 0) {

                var properties = Entities.getEntityProperties(entityID, "modelURL");
                if (properties.modelURL && properties.modelURL === LAMP_ON_MODEL_URL) {
                    isGrabbable = false;
                } else {
                    isGrabbable = true;
                }

            }

            instrumentList.forEach(function (instrumentID) {
                setGrabbable(instrumentID, isGrabbable);
            });

            lampList.forEach(function (lampID) {
                setLampModel(lampID, isGrabbable);
            });

            lightList.forEach(function (lightID) {
                setLightOn(lightID, isGrabbable);
            });

        }
    }


    var InstrumentSwitch = function () {

    };

    InstrumentSwitch.prototype = {

        preload: function (id) {

            entityID = id;

            isAllowedUser = ALLOWED_USERS.indexOf(AccountServices.username) >= 0;

            if (isAllowedUser) {
                checkHandInterval = Script.setInterval(function () {

                    var properties = Entities.getEntityProperties(entityID, 'position');

                    if (Vec3.distance(MyAvatar.position, properties.position) < 5) {
                        var leftHandIndex = MyAvatar.getJointIndex("LeftHandIndex3");
                        var rightHandIndex = MyAvatar.getJointIndex("RightHandIndex3");

                        var leftPosition = MyAvatar.getJointPosition(leftHandIndex);
                        var rightPosition = MyAvatar.getJointPosition(rightHandIndex); 

                        var hasCollision = isColliding(leftPosition) || isColliding(rightPosition);
                        if (hasCollision && !timeOutSet) {
                            toggleInstrumentGrabbable();
                            timeOutSet = true;
                            Script.setTimeout(function() {
                                timeOutSet = false;
                            }, 2000);
                        }
                    }

                }, 50);
            }
        },

        mousePressOnEntity: function (entityID, mouseEvent) {
            toggleInstrumentGrabbable();
        },

        unload: function () {
            if (checkHandInterval) {
                Script.clearInterval(checkHandInterval);
            }
        }

    };

    return new InstrumentSwitch();

});