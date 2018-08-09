// Avatar-Dancer_Zone_Client.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
    Script.require("../../../../Utilities/Polyfills.js")();

    var Helper = Script.require("../../../../Utilities/Helper.js?" + Date.now());

    // Log Setup
    // /////////////////////////////////////////////////////////////////////////
    var LOG_CONFIG = {},
        LOG_ENTER = Helper.Debug.LOG_ENTER,
        LOG_UPDATE = Helper.Debug.LOG_UPDATE,
        LOG_ERROR = Helper.Debug.LOG_ERROR,
        LOG_VALUE = Helper.Debug.LOG_VALUE,
        LOG_ARCHIVE = Helper.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Helper.Debug.log(LOG_CONFIG);

    // Init
    // /////////////////////////////////////////////////////////////////////////
    var entityID,
        name,
        self;

    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var HEARTBEAT_INTERVAL = 1000,
        TABLET_SCRIPT = Script.resolvePath("./Dance-App.js");

    // Collections
    // /////////////////////////////////////////////////////////////////////////
    var currentProperties = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    // /////////////////////////////////////////////////////////////////////////
    function AvatarDance_Zone_Client() {
        self = this;
    }

    AvatarDance_Zone_Client.prototype = {
        // Begin Entity Methods
        remotelyCallable: [
            "receiveHeartBeat",
            "requestTurnOff",
            "turnOn"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "userData"]);
            name = currentProperties.name;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        enterEntity: function () {
            ScriptDiscoveryService.loadScript(TABLET_SCRIPT);
        },
        leaveEntity: function () {
            ScriptDiscoveryService.stopScript(TABLET_SCRIPT);
        },
        unload: function () {
        }
        // Begin Utility Methods
    };

    return new AvatarDance_Zone_Client();
});
