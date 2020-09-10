/*
    scriptLoader.js

    Created by Kalila L. on 10 Sep 2020
    Copyright 2020 Vircadia and contributors.
    
    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
    
    This script allows you to specify an array of scripts to load when a user joins the domain
    or when the user clicks on the entity that this script is attached to.
*/

(function () {
    "use strict";
    this.entityID = null;
    var _this = this;

    var overlayWebWindow;

    // User Data Functionality

    var defaultUserData = {
        "useConfirmDialog": true,
        "confirmDialogMessage": "Would you like to load this domain's scripts?",
        "requireClickOnEntity": true,
        "scripts": [],
        "options": {
            "isUserLoaded": false,
            "reload": false,
            "quitWhenFinished": false
        }
    }

    function getEntityUserData() {
        return Entities.getEntityProperties(_this.entityID, ["userData"]).userData;
    }

    function setDefaultUserData() {
        Entities.editEntity(_this.entityID, {
            userData: JSON.stringify(defaultUserData)
        });
    }

    function getAndParseUserData() {
        var userData = getEntityUserData();

        try {
            userData = Object(JSON.parse(userData)); 
        } catch (e) {
            userData = defaultUserData;
            setDefaultUserData();
        }

        return userData;
    }
    
    // Main App Functionality
    
    function loadScripts(userData) {
        for (var i = 0; i < userData.scripts.length; i++) {
            // https://apidocs.vircadia.dev/ScriptDiscoveryService.html#.loadScript
            ScriptDiscoveryService.loadScript(
                userData.scripts[i], 
                userData.options.isUserLoaded, 
                false, 
                false,
                userData.options.reload,
                userData.options.quitWhenFinished
            );
        }
    }

    function onMousePressOnEntity(pressedEntityID, event) {
        if (_this.entityID === pressedEntityID) {
            var userData = getAndParseUserData();

            if (userData.requireClickOnEntity) {
                if (userData.useConfirmDialog) {
                    if (Window.confirm(userData.confirmDialogMessage)) {
                        loadScripts(userData);
                    }
                } else {
                    loadScripts(userData);
                }
            }
        }
    }


    // Standard preload and unload, initialize the entity script here.

    this.preload = function (ourID) {
        this.entityID = ourID;
        var userData = getAndParseUserData();

        if (!userData.requireClickOnEntity) {
            if (userData.useConfirmDialog) {
                if (Window.confirm(userData.confirmDialogMessage)) {
                    loadScripts(userData);
                }
            } else {
                loadScripts(userData);
            }
        }
        
        Entities.mousePressOnEntity.connect(onMousePressOnEntity);
    };

    this.unload = function (entityID) {
        Entities.mousePressOnEntity.disconnect(onMousePressOnEntity);
    };

});
