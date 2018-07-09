// AddAppZone.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Add this script to a Zone Entity. 
// On entering the zone, runs a script and/or adds an app. 
// On exit, removes the script/app.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){

    var APP_URL = "http://mpassets.highfidelity.com/d3985860-e94a-42d8-aa1f-c498b2cebabd-v1/fingerPaint.js";

    var AddAppZone = function () {

    };
    
    AddAppZone.prototype = {

        enterEntity: function () {
            ScriptDiscoveryService.loadScript(APP_URL);
        },

        leaveEntity: function () {
            ScriptDiscoveryService.stopScript(APP_URL);
        },

        unload: function () {
            ScriptDiscoveryService.stopScript(APP_URL);
        }
    };

    return new AddAppZone ();
});