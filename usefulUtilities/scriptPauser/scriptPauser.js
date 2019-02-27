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

    var ScriptPauser = function() {};

    ScriptPauser.prototype = {
        preload: function (id) {
            var properties = Entities.getEntityProperties(id, ["userData"]);
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
                        (userData.fuzzyScriptNames).forEach(function (scriptName) {
                            if (scriptsToStopFuzzyMatch.indexOf(scriptName) === -1) {
                                scriptsToStopFuzzyMatch.push(scriptName);
                            }
                        });
                    }
                }

                if (userData.exactScriptNames) {
                    if (Array.isArray(userData.exactScriptNames)) {
                        (userData.exactScriptNames).forEach(function (scriptName) {
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

                        if (pausedAppList.indexOf(currentScriptObject.url) === -1) {
                            pausedAppList.push(currentScriptObject.url);
                        }
                    }
                }

                for (var k = 0; k < scriptsToStopExactMatch.length; k++) {
                    var currentExactScriptName = scriptsToStopExactMatch[k];

                    if (currentScriptObject.name === currentExactScriptName) {
                        ScriptDiscoveryService.stopScript(currentScriptObject.url);

                        if (pausedAppList.indexOf(currentScriptObject.url) === -1) {
                            pausedAppList.push(currentScriptObject.url);
                        }
                    }
                }
            }
        },

        unload: function() {
            pausedAppList.forEach(function(url) {
                ScriptDiscoveryService.loadScript(url);
            });
        }
    };

    return new ScriptPauser();
});
