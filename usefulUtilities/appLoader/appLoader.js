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
                if (userData.appURLs) {
                    if (Array.isArray(userData.appURLs)) {

                        (userData.appURLs).forEach(function (appURL) {
                            if (appList.indexOf(appURL) === -1) {
                                appList.push(appURL);
                            }
                        });
                        
                        var currentlyRunningScripts = ScriptDiscoveryService.getRunning();
                        appList.forEach(function (url) {
                            if (currentlyRunningScripts.indexOf(url) === -1) {
                                ScriptDiscoveryService.loadScript(url);
                                addedAppList.push(url);
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
