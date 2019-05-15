//
//  appLoader.js
//
//  Created by Zach Fox on 2019-02-14
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    // An array of script URLs in string form to always load/unload
    var HARDCODED_APP_LIST = [];
    // The variable list of apps to load/unload.
    // Populated from userData and from HARDCODED_APP_LIST.
    var appList = [];
    // This is a list of apps that this script explicitly added.
    // We should never unload apps that the user had loaded before loading this script.
    var addedAppList = [];
    // An array of usernames for whom the App Loader should not load the apps in `appList`
    var usernameWhitelist = [];

    var AppLoader = function() {};

    AppLoader.prototype = {
        preload: function (id) {
            // Ensure that `appList` contains all App URLs from HARDCODED_APP_LIST
            HARDCODED_APP_LIST.forEach(function (appURL) {
                appList.push(appURL);
            });

            var properties = Entities.getEntityProperties(id, ["userData"]);
            var userData;

            try {
                userData = JSON.parse(properties.userData);
            } catch (e) {
                console.error("Error parsing userData: ", e);
            }

            if (userData) {
                if (userData.usernameWhitelist) {
                    if (Array.isArray(userData.usernameWhitelist)) {
                        (userData.usernameWhitelist).forEach(function (newUsername) {
                            if (usernameWhitelist.indexOf(newUsername) === -1) {
                                usernameWhitelist.push(newUsername);
                            }
                        });
                    }
                }

                // Don't bother with what's next (i.e. loading any apps) if we're whitelisted.
                if (usernameWhitelist.indexOf(AccountServices.username) > -1) {
                    return;
                }

                if (userData.appURLs) {
                    if (Array.isArray(userData.appURLs)) {
                        (userData.appURLs).forEach(function (newAppUrl) {
                            if (appList.indexOf(newAppUrl) === -1) {
                                appList.push(newAppUrl);

                                var currentlyRunningScripts = ScriptDiscoveryService.getRunning();
                                var loadNewAppUrl = true;
                                for (var i = 0; i < currentlyRunningScripts.length; i++) {
                                    if (currentlyRunningScripts[i].url === newAppUrl) {
                                        loadNewAppUrl = false;
                                        break;
                                    }
                                }

                                if (loadNewAppUrl) {
                                    ScriptDiscoveryService.loadScript(newAppUrl);
                                    addedAppList.push(newAppUrl);
                                }
                            }
                        });
                    }
                } 
            }
        },

        
        unload: function() {
            addedAppList.forEach(function(url) {
                ScriptDiscoveryService.stopScript(url);
            });
        }
    };

    return new AppLoader();
});
