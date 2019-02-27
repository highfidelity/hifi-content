//
//  scriptPauser.js
//
//  Created by Zach Fox on 2019-02-26
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    // The names of scripts to pause.
    // Populated from userData.
    // The script names in the `fuzzyMatch` array can be partial script names.
    // That makes using fuzzy matching MORE DANGEROUS!
    // The script names in the `exactMatch` array must match the script to be paused exactly.
    var scriptsToStopFuzzyMatch = [];
    var scriptsToStopExactMatch = [];
    // This is a list of apps that this entity script explicitly stopped.
    // The scripts in this list will be restarted once this entity script is unloaded.
    var pausedAppList = [];


    // This function will put up a text banner notification informing the user that one
    // of their scripts has been temporarily paused.
    function notifyStoppedScript(scriptName) {
        var text = "You are not allowed to run '" + scriptName +
            "' in this place, so that script has been stopped. Go to a different place and it will restart.";
        Window.displayAnnouncement(text);
    }
    

    // When this interval expires, Script Pauser will check for blacklisted scripts and pause them.
    var scriptPauserInterval = false;
    var PAUSE_SCRIPTS_INTERVAL_MS = 10000;
    function pauseScripts() {
        var properties = Entities.getEntityProperties(_this.entityID, ["userData"]);
        var userData;
        scriptsToStopFuzzyMatch = [];
        scriptsToStopExactMatch = [];

        try {
            userData = JSON.parse(properties.userData);
        } catch (e) {
            console.error("Error parsing userData: ", e);
            return;
        }

        if (userData) {
            if (userData.fuzzyScriptNames) {
                if (Array.isArray(userData.fuzzyScriptNames)) {
                    (userData.fuzzyScriptNames).forEach(function(scriptName) {
                        if (scriptsToStopFuzzyMatch.indexOf(scriptName) === -1) {
                            scriptsToStopFuzzyMatch.push(scriptName);
                        }
                    });
                }
            }

            if (userData.exactScriptNames) {
                if (Array.isArray(userData.exactScriptNames)) {
                    (userData.exactScriptNames).forEach(function(scriptName) {
                        if (scriptsToStopExactMatch.indexOf(scriptName) === -1) {
                            scriptsToStopExactMatch.push(scriptName);
                        }
                    });
                }
            }
        }
                    
        var currentlyRunningScripts = ScriptDiscoveryService.getRunning();

        for (var i = 0; i < currentlyRunningScripts.length; i++) {
            var currentScriptObject = currentlyRunningScripts[i];

            for (var j = 0; j < scriptsToStopFuzzyMatch.length; j++) {
                var currentFuzzyScriptName = scriptsToStopFuzzyMatch[j].toLowerCase();

                if (((currentScriptObject.name).toLowerCase()).indexOf(currentFuzzyScriptName) > -1) {
                    ScriptDiscoveryService.stopScript(currentScriptObject.url);
                    notifyStoppedScript(currentScriptObject.name);

                    if (pausedAppList.indexOf(currentScriptObject.url) === -1) {
                        pausedAppList.push(currentScriptObject.url);
                    }
                }
            }

            for (var k = 0; k < scriptsToStopExactMatch.length; k++) {
                var currentExactScriptName = scriptsToStopExactMatch[k];

                if (currentScriptObject.name === currentExactScriptName) {
                    ScriptDiscoveryService.stopScript(currentScriptObject.url);
                    notifyStoppedScript(currentScriptObject.name);

                    if (pausedAppList.indexOf(currentScriptObject.url) === -1) {
                        pausedAppList.push(currentScriptObject.url);
                    }
                }
            }
        }
    }

    
    var _this;
    var ScriptPauser = function() {
        _this = this;
    };


    ScriptPauser.prototype = {
        preload: function (id) {
            _this.entityID = id;

            scriptPauserInterval = Script.setInterval(pauseScripts, PAUSE_SCRIPTS_INTERVAL_MS);
            pauseScripts();     
        },


        unload: function() {
            if (scriptPauserInterval) {
                Script.clearInterval(scriptPauserInterval);
                scriptPauserInterval = false;
            }

            pausedAppList.forEach(function(url) {
                ScriptDiscoveryService.loadScript(url);
            });
        }
    };


    return new ScriptPauser();
});
