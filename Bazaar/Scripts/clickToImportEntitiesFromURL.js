/*
    clickToImportEntitiesFromURL.js

    Created by Kalila L. on 5 Sep 2020
    Copyright 2020 Vircadia and contributors.
    
    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
    
    This script will import entities when the entity it is attached to is pressed.
*/

(function () {
    "use strict";
    this.entityID = null;
    var _this = this;
    
    var defaultUserData = {
        "useConfirmDialog": false,
        "confirmDialogMessage": "Are you sure you want to open this link?",
        "options": {
            "url": null,
            "entityHostType": "avatar"
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
    
    function importAndPasteEntities() {
        var userData = getAndParseUserData();
    
        if (Clipboard.importEntities(userData.options.url)) {
            Clipboard.pasteEntities(MyAvatar.orientation, userData.options.entityHostType);
        }
    }
    
    function onMousePressOnEntity(pressedEntityID, event) {
        if (_this.entityID === pressedEntityID) {
            var userData = getAndParseUserData();

            if (userData.useConfirmDialog === true) {
                if (Window.confirm(userData.confirmDialogMessage)) {
                    importAndPasteEntities();
                }
            } else {
                importAndPasteEntities();
            }
        }
    }
    
    // Standard preload and unload, initialize the entity script here.

    this.preload = function (ourID) {
        this.entityID = ourID;
        getAndParseUserData();

        Entities.mousePressOnEntity.connect(onMousePressOnEntity);
    };

    this.unload = function (entityID) {
        Entities.mousePressOnEntity.disconnect(onMousePressOnEntity);
    };

});
