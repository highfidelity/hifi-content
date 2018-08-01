// Happy-Kiosk_Zone_Server.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Takes care of the physics interactions for turning off and on the kiosk.

/* global AccountServices */

(function () {
    // Helper Functions
    var Util = Script.require("./Helper.js?" + Date.now());
    var checkIfInNonAligned = Util.Maths.checkIfInNonAligned,
        largestAxisVec = Util.Maths.largestAxisVec,
        makeOriginMinMax = Util.Maths.makeOriginMinMax;

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        name = null,
        avatarInsideCheckTimer = null,
        DEBUG = null,
        avatarCheckStep = 0,
        self;

    // CONSTS
    var AVATARCHECK_DURATION = 4000,
        AVATARCHECK_INTERVAL = 500,
        WAIT_TO_TURN_ON_TIME = 2500,
        MAX_CHECKS = Math.ceil(AVATARCHECK_DURATION / AVATARCHECK_INTERVAL);

    // Collections
    var currentProperties = {},
        dimensions = {},
        position = {},
        rotation = {},
        originMinMax = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    function HappyKiosk_Zone_Client() {
        self = this;
    }

    HappyKiosk_Zone_Client.prototype = {
        remotelyCallable: [
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;

            position = currentProperties.position;
            rotation = currentProperties.rotation;
            dimensions = currentProperties.dimensions;

            originMinMax = makeOriginMinMax(dimensions);
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }

            avatarInsideCheckTimer = Script.setInterval(this.avatarInRange, AVATARCHECK_INTERVAL);
        },
        avatarInRange: function () {
            avatarCheckStep++;
            var largestDimension = largestAxisVec(dimensions);
            var avatarsInRange = AvatarList.getAvatarsInRange(position, largestDimension).filter(function(id) {
                return id === MyAvatar.sessionUUID;
            });

            if (avatarsInRange.length > 0) {
                if (checkIfInNonAligned(MyAvatar.position, position, rotation, originMinMax)) {
                    Script.setTimeout(self.enterEntity,WAIT_TO_TURN_ON_TIME);
                    Script.clearInterval(avatarInsideCheckTimer);
                    avatarInsideCheckTimer = null;
                    avatarCheckStep = 0;
                    return;
                }
            }

            if (avatarCheckStep >= MAX_CHECKS) {
                Script.clearInterval(avatarInsideCheckTimer);
                avatarInsideCheckTimer = null;
                avatarCheckStep = 0;
                return;
            }
        },
        enterEntity: function () {
            log(LOG_ENTER, name + " enterEntity");

            Entities.callEntityServerMethod(entityID, "turnOn", [MyAvatar.sessionUUID, AccountServices.username]);
        },
        leaveEntity: function () {
            log(LOG_ENTER, name + " leaveEntity");

            Entities.callEntityServerMethod(entityID, "requestTurnOff", [MyAvatar.sessionUUID]);
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Zone_Client();
});
