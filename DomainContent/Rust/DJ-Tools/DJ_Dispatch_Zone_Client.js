// DJ_Dispatch_Zone_Client.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// Manages physics interactions to log when avatars are in the zone to start update timers

(function () {
    // Polyfill
    Script.require("./Polyfills.js?" + Date.now())();

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?");

    var checkIfInNonAligned = Util.Maths.checkIfInNonAligned,
        largestAxisVec = Util.Maths.largestAxisVec,
        makeMinMax = Util.Maths.makeMinMax,
        makeOriginMinMax = Util.Maths.makeOriginMinMax;

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = false;
    LOG_CONFIG[LOG_UPDATE] = false;
    LOG_CONFIG[LOG_ERROR] = false;
    LOG_CONFIG[LOG_VALUE] = false;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        debugCubeID = null,
        heartBeatTimer = null,
        name = null,
        avatarInsideCheckTimer = null,
        avatarCheckStep = 0,
        HEARTBEAT_INTERVAL = 1000,
        AVATARCHECK_DURATION = 4000,
        AVATARCHECK_INTERVAL = 500,
        WAIT_TO_TURN_ON_TIME = 2500,
        MAX_CHECKS = Math.ceil(AVATARCHECK_DURATION / AVATARCHECK_INTERVAL),
        GENERATOR = "generator",       
        SENSOR = "sensor",
        ENDPOINT = "endPoint",
        DEBUG = false,
        self;

    // Collections
    var currentProperties = {},
        dimensions = {},
        position = {},
        rotation = {},
        minMax = {},
        originMinMax = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    function DJ_Dispatch_Zone_Client() {
        self = this;
    }

    DJ_Dispatch_Zone_Client.prototype = {
        remotelyCallable: [
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "position", "rotation", "dimensions", "userData"]);
            name = currentProperties.name;
            position = currentProperties.position;
            rotation = currentProperties.rotation;
            dimensions = currentProperties.dimensions;
            minMax = makeMinMax(dimensions, position);
            originMinMax = makeOriginMinMax(dimensions);

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties.performance.DEBUG;
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
            Entities.callEntityServerMethod(entityID, "turnOn", [MyAvatar.sessionUUID]);
            self.startHeartBeats();
        },
        leaveEntity: function () {
            Entities.callEntityServerMethod(entityID, "requestTurnOff");
        },
        startHeartBeats: function () {
            if (checkIfInNonAligned(MyAvatar.position, position, rotation, originMinMax)) {            
                Entities.callEntityServerMethod(entityID, "receiveHeartBeat", [MyAvatar.sessionUUID]);
                Script.setTimeout(self.startHeartBeats, HEARTBEAT_INTERVAL);
            }
        },
        unload: function () {
            if (avatarInsideCheckTimer) {
                Script.clearInterval(avatarInsideCheckTimer);
            }
        }
    };

    return new DJ_Dispatch_Zone_Client();
});
