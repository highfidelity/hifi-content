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
        debounce = Util.Functional.debounce,
        lerp = Util.Maths.lerp;

    var debounceCheck = debounce();

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
        sessionID,
        shortSoundURL,
        longSoundURL,
        shortSoundObject,
        longSoundObject,
        shortInjector,
        longInjector,
        DEBUG = false,
        debugCubeID = null,
        canEdit = false,
        name = null,
        CAN_EDIT_TIMEOUT = 500,
        TURNOFF_AFTER_CHECK = 15000,
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
        directionArray = [];
    
    // Procedural Functions
    function turnOnSound() {
        shortInjector = Audio.playSound(shortSoundObject, {
            position: currentProperties.position,
            volume: 0.7,
            loop: false
        });
        longInjector = Audio.playSound(longSoundObject, {
            position: currentProperties.position,
            volume: 0.2,
            loop: true
        });
    }

    function turnOffSound() {
        shortInjector.stop();
        longInjector.stop();
    }

    function editLongSound() {
        var inMin = 0,
            inMax = 1,
            outVolumeMin = 0,
            outVolumeMax = 1,
            volumeChange,
            tempOut;

        range.x = clamp(inMin,inMax, range.x);
        range.y = clamp(inMin,inMax, range.y);
        range.z = clamp(inMin,inMax, range.z);

        volumeChange = lerp(inMin, inMax, outVolumeMax, outVolumeMin, range.y);
        
        eventProperties = {
            volume: volumeChange
        };

        if (DEBUG) {
            Entities.callEntityClientMethod(
                sessionID, debugCubeID, "storeDebugEndpointInfo", [JSON.stringify(eventProperties), name]
            );
        }
        // longInjector.setOptions({
        //     volume: eventProperties.volume
        // });
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
            name = currentProperties.name;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                shortSoundURL = userdataProperties.performance.shortSoundURL;
                longSoundURL = userdataProperties.performance.longSoundURL;
                shortSoundObject = SoundCache.getSound(shortSoundURL);
                longSoundObject = SoundCache.getSound(longSoundURL);
                DEBUG = userdataProperties.performance.DEBUG;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        turnOn: function () {
            turnOnSound();
            Script.setTimeout(function() {
                canEdit = true;
            }, CAN_EDIT_TIMEOUT);
            Script.setTimeout(function() {
                turnOffSound();
            }, TURNOFF_AFTER_CHECK);
        },
        turnOff: function () {
            canEdit = false;
            turnOffSound();
        },
        edit: function (id, param) {
            range = JSON.parse(param[0]);
            directionArray = JSON.parse(param[1]);
            sessionID = param[2];
            if (!canEdit) {
                return;
            }
            editLongSound();
        },
        updateDebugCubeID: function(id, param) {
            var newDebugCubeID = param[0];
            debugCubeID = newDebugCubeID;
        }
    };

    return new DJ_Endpoint_Template_Server();

});
