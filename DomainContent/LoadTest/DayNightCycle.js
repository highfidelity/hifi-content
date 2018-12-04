//
//  DayNightCycle.js
//
//  Uses server time to rotate skybox and set key lighting attributes to mimic a day/night cycle on a skybox zone
// 
//  created by Liv Erickson on 11/26/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function(){
    
    var UPDATE_SPEED = 1000;
    var SECONDS_MINUTES = 60; 
    var CYCLES = 6;

    var AMBIENT_LIGHT_BASES = [0, 0.66, 1.33, 2, 1.33, 0.66];
    var KEYLIGHT_COLORS = [
        {red: 255, green: 91, blue: 14}, 
        {red: 255, green: 128, blue: 28}, 
        {red: 255, green: 128, blue: 28},
        {red: 255, green: 91, blue: 14},
        {red: 255, green: 54, blue: 0},
        {red: 255, green: 54, blue: 0}
    ];

    var BASE_ROTATION_VALUES = [0, 60, 120, 180, 240, 300];

    var LIGHT_STEP = 0.66;
    var NEGATIVE = -1;
    var NOON = 3;
    
    var _entityID;
    var _interval;

    var _baseRotationInDegrees;

    function negate(number) {
        return NEGATIVE * number;
    }
    
    function checkTimeAndRotate() {
        var time = new Date();
        var hours = time.getHours();
        var minutes = time.getMinutes();
        var seconds = time.getSeconds();

        var activeCycle = hours % CYCLES;
        
        var newRollInDegrees = BASE_ROTATION_VALUES[activeCycle] + minutes + (seconds / SECONDS_MINUTES);
        var newRotation = Quat.fromVec3Degrees({x: _baseRotationInDegrees.x, y: _baseRotationInDegrees.y, z: newRollInDegrees});

        var ambientLightBase = AMBIENT_LIGHT_BASES[activeCycle];
        var lightIntensity;
        if (activeCycle < NOON) {
            lightIntensity = ambientLightBase + (LIGHT_STEP / SECONDS_MINUTES)*minutes; 
        } else {
            lightIntensity = ambientLightBase + negate(LIGHT_STEP / SECONDS_MINUTES)*minutes;
        }
        Entities.editEntity(_entityID, {rotation : newRotation, keyLight : {intensity : lightIntensity, color : KEYLIGHT_COLORS[activeCycle]}});
    }

    this.preload = function(entityID) {
        _entityID = entityID;
        _baseRotationInDegrees = Quat.safeEulerAngles(Entities.getEntityProperties(_entityID, 'rotation').rotation);
        _interval = Script.setInterval(checkTimeAndRotate, UPDATE_SPEED);
    };

    this.unload = function() {
        if (_interval) {
            Script.clearInterval(_interval);
        }
    };
});
