// Happy-Kiosk_Availability_Server.js
// 
// Further Edited by Milad Nazeri on 07/31-2018 from Zombie-Gate Button
// Edited by Rebecca Stankus on 03/07/2018
// from button1.js by Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Temporary file to show if the kiosk is available to be used.  Will use a similar interface.

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?" + Date.now());

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = true;
    LOG_CONFIG[LOG_UPDATE] = true;
    LOG_CONFIG[LOG_ERROR] = true;
    LOG_CONFIG[LOG_VALUE] = true;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        name,
        kioskZoneID,
        isVisible = false;

    // Const
    var BASE_NAME = "Happy-Kiosk_",
        AVAILABLE_TEXT = "Available to rate",
        UNAVAILABLE_TEXT = "Occupied",
        DISTANCE_ABOVE = 0.5,
        VISIBLE_TIME = 2000;

        // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    function HappyKiosk_Availability_Server() {
        self = this;
    }

    HappyKiosk_Availability_Server.prototype = {
        remotelyCallable: [
            "makeVisible",
            "makeUnAvailable"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;
            kioskZoneID = currentProperties.parentID;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        makeAvailable: function(id, param) {
            var props = {
                text: AVAILABLE_TEXT
            };

            Entities.editEntity(entityID, props);
        },
        makeUnAvailable: function(id, param) {
            var props = {
                text: UNAVAILABLE_TEXT
            };

            Entities.editEntity(entityID, props);
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Availability_Server();
});
