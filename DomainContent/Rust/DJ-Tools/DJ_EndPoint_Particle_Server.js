// DJ_EndPoint_Particle_Server.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// EndPoint Particle Server Script

(function () {
    // Init
    var _entityID,
        directionArray,
        NORMAL = 0,
        REVERSE = 1,
        event;


    // Polyfill
    Script.require(Script.resolvePath("./Polyfills.js"))();
    
    // Collections
    var emitOff = { emitRate: 0 },
        emitOn = { emitRate: 1000 };

    // Helper Functions
    function lerp(InputLow, InputHigh, OutputLow, OutputHigh, Input) {
        return ((Input - InputLow) / (InputHigh - InputLow)) * (OutputHigh - OutputLow) + OutputLow;
    }

    function clamp(min, max, num) {
        return Math.min(Math.max(num, min), max);
    }

    // Procedural Functions
    function turnOnFire() {
        Entities.editEntity(_entityID, emitOn);
    }

    
    function turnOffFire() {
        Entities.editEntity(_entityID, emitOff);
    }

    function editParticle(event, directionArray) {
        var inEmitMin = 0,
            inEmitMax = 1,
            inColorMin = 0,
            inColorMax = 1,
            inRadiusStartMin = 0,
            inRadiusStartMax = 1,
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
            colorChangeBlue,
            props;

        event.x = clamp(0,1, event.x);
        event.y = clamp(0,1, event.y);
        event.z = clamp(0,1, event.z);

        if (directionArray[0] === REVERSE) {
            tempOut = outEmitMin;
            outEmitMin = outEmitMax;
            outEmitMax = tempOut;
        }
        
        emitSpeedChange = lerp(inEmitMin,inEmitMax, outEmitMin, outEmitMax, event.x);
        radiusStartChange = lerp(inRadiusStartMin,inRadiusStartMax,outRadiusStartMax,outRadiusStartMin , event.y);
        colorChangeRed = lerp(inColorMin,inColorMax, outColorMin, outColorMax, event.z);
        colorChangeBlue = lerp(inColorMin,inColorMax, outColorMax, outColorMin, event.z);

        props = {
            emitSpeed: emitSpeedChange,
            radiusStart: radiusStartChange,
            colorStart: {
                red: colorChangeRed,
                blue: colorChangeBlue,
                green: 0
            }
        };

        Entities.editEntity(_entityID, props);
    }

    // Entity Definition

    function DJ_Endpoint_Particle_Server() {
    }

    DJ_Endpoint_Particle_Server.prototype = {
        remotelyCallable: [
            'turnOn',
            'turnOff',
            'edit'
        ],
        preload: function (entityID) {
            _entityID = entityID;
        },
        turnOn: function () {
            console.log("Turn on Fire");
            turnOnFire();
        },
        turnOff: function () {
            console.log("Turn off Fire");
            turnOffFire();
        },
        edit: function (id, param) {
            event = JSON.parse(param[0]);
            directionArray = JSON.parse(param[1]);
            editParticle(event, directionArray);
        }
    };

    return new DJ_Endpoint_Particle_Server();

});