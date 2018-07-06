// DJ_Sensor_Template_Client.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {
    // Polyfill
    Script.require("./Polyfills.js?" + Date.now())();

    // Helper Functions
    var Util = Script.require("./Helper.js?" + Date.now());

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = false;
    LOG_CONFIG[LOG_UPDATE] = false;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = false;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        DEBUG = false,
        NORMAL = 0,
        REVERSE = 1,
        self;

    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {};
    
    // Constructor Functions
    // Procedural Functions
    // Entity Definition
    function DJ_Sensor_Template_Client() {
        self = this;
    }

    DJ_Sensor_Template_Client.prototype = {
        remotelyCallable: [
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties.performance.DEBUG;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        }
    };

    function onScriptEnding() {
        // Script.update.disconnect(onUpdate);

    }

    Script.scriptEnding.connect(onScriptEnding);

    return new DJ_Sensor_Template_Client();
});
