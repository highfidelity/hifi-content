// Happy-Kiosk_Button_Client.js
// 
// Further Edited by Milad Nazeri on 07/31-2018 from Zombie-Gate Button
// Edited by Rebecca Stankus on 03/07/2018
// from button1.js by Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Handles physics interactions for buttons.  Routed through the Zone.

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?");

    // Log Setup
    var LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE, 
        LOG_CONFIG = {
            "Log_Enter": false,
            "Log_Update": false,
            "Log_Error": false,
            "Log_Value": false,
            "LOG_ARCHIVE": false
        },
        log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        name,
        kioskZoneID;

        // Collections
    var currentProperties = {};

    // Entity Definition
    function Happy_Kiosk_Button() {
    }

    Happy_Kiosk_Button.prototype = {
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "parentID"]);
            name = currentProperties.name;
            kioskZoneID = currentProperties.parentID;
        },
        mousePressOnEntity: function(entityID, mouseEvent) {
            log(LOG_ENTER, "MOUSE PRESS ON ENTITY");
            if (!mouseEvent.isLeftButton) {
                return;
            }
            log(LOG_ENTER, "kioskZoneID", kioskZoneID);
            Entities.callEntityServerMethod(kioskZoneID, "requestPress", [MyAvatar.sessionUUID, name]);
        },
        stopNearTrigger: function(entityID, mouseEvent) {
            log(LOG_ENTER, "stopNearTrigger");
            Entities.callEntityServerMethod(kioskZoneID, "requestPress", [MyAvatar.sessionUUID, name]);
        },
        unload: function () {
        }
    };

    return new Happy_Kiosk_Button();
});
