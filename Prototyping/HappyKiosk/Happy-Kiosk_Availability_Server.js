// Happy-Kiosk_Availability_Server.js
// 
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Temporary file to show if the kiosk is available to be used.  Will use a similar interface.  Currently not being used but keeping in case needed for future iterations.

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?");

    // Log Setup
    var LOG_CONFIG = {},
        LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE;

    LOG_CONFIG[LOG_ENTER] = false;
    LOG_CONFIG[LOG_UPDATE] = false;
    LOG_CONFIG[LOG_ERROR] = false;
    LOG_CONFIG[LOG_VALUE] = false;
    LOG_CONFIG[LOG_ARCHIVE] = false;
    var log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID;

    // Const
    var AVAILABLE_TEXT = "Available to rate",
        UNAVAILABLE_TEXT = "Occupied";

        // Collections
    var currentProperties = {};

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
