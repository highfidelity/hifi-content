// DJ_EndPoint_Particle_Server.js
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

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
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
        emitOff = { emitRate: 0 },
        emitOn = { emitRate: 1000 },
        range = {},
        eventProperties = {},
        directionArray = [];

    // Procedural Functions
    function turnOnFire() {
        Entities.editEntity(entityID, emitOn);
    }
    
    function turnOffFire() {
        Entities.editEntity(entityID, emitOff);
    }

    function editParticle() {
        var inMin = 0,
            inMax = 1,
            outEmitMin = 0,
            outEmitMax = 10,
            outColorMin = 0,
            outColorMax = 255,
            outRadiusStartMin = 0,
            outRadiusStartMax = 1.25,
            tempOut,
            emitSpeedChange,
            radiusStartChange,
            colorChangeRed,
            colorChangeBlue;

        range.x = clamp(inMin, inMax, range.x);
        range.y = clamp(inMin, inMax, range.y);
        range.z = clamp(inMin, inMax, range.z);

        if (directionArray[X] === REVERSE) {
            tempOut = outEmitMin;
            outEmitMin = outEmitMax;
            outEmitMax = tempOut;
        }
        
        emitSpeedChange = lerp(
            inMin, inMax, outEmitMin, outEmitMax, range.x
        );
        radiusStartChange = lerp(
            inMin, inMax, outRadiusStartMax, outRadiusStartMin, range.y
        );
        colorChangeRed = lerp(
            inMin, inMax, outColorMin, outColorMax, range.z
        );
        colorChangeBlue = lerp(
            inMin, inMax, outColorMax, outColorMin, range.z
        
        );

        eventProperties = {
            emitSpeed: emitSpeedChange,
            radiusStart: radiusStartChange,
            color: {
                red: colorChangeRed,
                blue: colorChangeBlue,
                green: 0
            },
            colorStart: {
                red: colorChangeRed,
                blue: colorChangeBlue,
                green: 0
            },
            colorFinish: {
                red: 180,
                blue: 255,
                green: 0
            }
        };
        
        if (DEBUG) { 
            Entities.callEntityMethod(
                dispatchZoneID, "storeDebugEndpointInfo", [JSON.stringify(eventProperties), name]
            );
        }
        Entities.editEntity(entityID, eventProperties);
    }

    // Entity Definition

    function DJ_Endpoint_Particle_Server() {
        self = this;
    }

    DJ_Endpoint_Particle_Server.prototype = {
        remotelyCallable: [
            'turnOn',
            'turnOff',
            'edit',
            'updateDebugCubeID'
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
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
            turnOnFire();
        },
        turnOff: function () {
            turnOffFire();
        },
        edit: function (id, param) {
            range = JSON.parse(param[0]);
            directionArray = JSON.parse(param[1]);
            sessionID = param[2];
            editParticle();
        },
        updateDebugCubeID: function(id, param) {
            var newDebugCubeID = param[0];
            debugCubeID = newDebugCubeID;
        }
    };

    return new DJ_Endpoint_Particle_Server();

});
