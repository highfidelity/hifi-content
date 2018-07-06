// DJ_EndPoint_Light_Server.js
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
    var clamp = Util.Maths.clamp,
        lerp = Util.Maths.lerp;

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
        sessionID,
        DEBUG = false,
        debugCubeID = null,
        NORMAL = 0,
        REVERSE = 1,
        X = 0,
        Y = 1,
        Z = 2,
        self;
    
    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        range = {}, 
        eventProperties = {},
        off = { property: 0 },
        on = { property: 0 },
        directionArray = [];
    
    // Procedural Functions
    function turnOnLight() {
        Entities.editEntity(entityID, off);
    }

    function turnOffLight() {
        Entities.editEntity(entityID, on);
    }

    function editLight() {
        var inMin = 0,
            inMax = 1,
            outMin = 0,
            outMax = 1,
            valueChange,
            tempOut;

        range.x = clamp(inMin,inMax, range.x);
        range.y = clamp(inMin,inMax, range.y);
        range.z = clamp(inMin,inMax, range.z);

        if (directionArray[X] === REVERSE) {
            tempOut = outMin;
            outMin = outMax;
            outMax = tempOut;
        }

        valueChange = lerp(inMin, inMax, outMin ,outMax, range.y);
        
        eventProperties = {
            valueChange: valueChange
        };

        if (DEBUG) {
            Entities.callEntityClientMethod(
                sessionID, debugCubeID, "storeDebugInfo", [JSON.stringify(eventProperties), currentProperties.name]
            );
        }
        Entities.editEntity(entityID, eventProperties);
    }

    // Entity Definition

    function DJ_Endpoint_Template_Server() {
        self = this;
    }

    DJ_Endpoint_Template_Server.prototype = {
        remotelyCallable: [
            'turnOn',
            'turnOff',
            'edit',
            'updateDebugCubeID'
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
        },
        turnOn: function () {
            turnOnLight();
        },
        turnOff: function () {
            turnOffLight();
        },
        edit: function (id, param) {
            range = JSON.parse(param[0]);
            directionArray = JSON.parse(param[1]);
            sessionID = param[2];
            editLight();
        },
        updateDebugCubeID: function(id, param) {
            var newDebugCubeID = param[0];
            debugCubeID = newDebugCubeID;
        }
    };

    return new DJ_Endpoint_Template_Server();

});
