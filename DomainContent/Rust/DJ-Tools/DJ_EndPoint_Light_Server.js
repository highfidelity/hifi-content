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
    Script.require("../../../Utilities/Polyfills.js")();

    // Helper Functions
    var Util = Script.require("../../../Utilities/Helper.js");

    var clamp = Util.Maths.clamp,
        colorMix = Util.Color.colorMix,
        hslToRgb = Util.Color.hslToRgb,
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
    LOG_CONFIG[LOG_ERROR] = false;
    LOG_CONFIG[LOG_VALUE] = false;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init
    var entityID = null,
        sessionID = null,
        DEBUG = false,
        debugCubeID = null,
        dispatchZoneID = null,
        name = null,
        REVERSE = 1,
        X = 0,
        Y = 1,
        Z = 2,
        self;
    
    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        lightOff = { intensity: 0 },
        lightOn = { intensity: 0 },
        range = {},
        eventProperties = {},
        directionArray = [];

    // Procedural Functions
    function turnOnLight() {
        Entities.editEntity(entityID, lightOn);
    }

    function turnOffLight() {
        Entities.editEntity(entityID, lightOff);
    }

    function editLight() {
        var inMin = 0,
            inMax = 1,
            outIntensityMin = 0,
            outIntensityMax = 100,
            outColorMin = 0,
            outColorMax = 255,
            outFalloffRadiusMin = 0,
            outFalloffRadiusMax = 5,
            colorMixAmount = 0.5,
            tempOut,
            lightDivsor = 3,
            intenstyChange,
            falloffRadiusChange,
            colorChangeRed,
            colorChangeBlue;

        range.x = clamp(inMin, inMax, range.x);
        range.y = clamp(inMin, inMax, range.y);
        range.z = clamp(inMin, inMax, range.z);

        if (directionArray[X] === REVERSE) {
            tempOut = outFalloffRadiusMin;
            outFalloffRadiusMin = outFalloffRadiusMax;
            outFalloffRadiusMax = tempOut;
        }
        
        var hsl = {
            h: range.x,
            s: range.y,
            l: range.z / lightDivsor
        };

        var hslColor = hslToRgb(hsl);

        intenstyChange = lerp(
            inMin, inMax, outIntensityMax, outIntensityMin, range.y
        );
        falloffRadiusChange = lerp(
            inMin, inMax, outFalloffRadiusMin, outFalloffRadiusMax, range.x
        );
        colorChangeRed = lerp(
            inMin, inMax, outColorMin, outColorMax, range.z
        );
        colorChangeBlue = lerp(
            inMin, inMax, outColorMax, outColorMin, range.z
        );
        
        var newColor = {
            red: colorChangeRed,
            blue: colorChangeBlue,
            green: 0
        };
        
        var mixedColor = colorMix(newColor, hslColor, colorMixAmount);

        eventProperties = {
            intensity: intenstyChange,
            falloffRadius: falloffRadiusChange,
            color: mixedColor
        };

        if (DEBUG) {
            Entities.callEntityMethod(
                dispatchZoneID, "storeDebugEndpointInfo", [JSON.stringify(eventProperties), name]
            );
        }
        Entities.editEntity(entityID, eventProperties);
    }

    // Entity Definition

    function DJ_Endpoint_Light_Server() {
        self = this;
    }

    DJ_Endpoint_Light_Server.prototype = {
        remotelyCallable: [
            'turnOn',
            'turnOff',
            'edit',
            'updateDebugCubeID'
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "parentID", "userData"]);
            name = currentProperties.name;
            dispatchZoneID = currentProperties.parentID;
            
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties.performance.DEBUG;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        turnOn: function () {
            log(LOG_ENTER, name + " TURN ON");
            turnOnLight();
        },
        turnOff: function () {
            log(LOG_ENTER, name + " TURN OFF");
            turnOffLight();
        },
        edit: function (id, param) {
            log(LOG_ENTER, name + " EDIT")
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

    return new DJ_Endpoint_Light_Server();

});
