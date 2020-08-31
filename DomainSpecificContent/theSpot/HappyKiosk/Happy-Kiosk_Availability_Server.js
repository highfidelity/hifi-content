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
    var LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE, 
        LOG_CONFIG = {
            LOG_ENTER: false,
            LOG_UPDATE: false,
            LOG_ERROR: false,
            LOG_VALUE: false,
            LOG_ARCHIVE: false
        },
        log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID;

    // Const
    var AVAILABLE_TEXT = "Available to rate",
        UNAVAILABLE_TEXT = "Occupied";

    // Entity Definition
    function HappyKiosk_Availability_Server() {
    }

    HappyKiosk_Availability_Server.prototype = {
        remotelyCallable: [
            "makeVisible",
            "makeUnAvailable"
        ],
        preload: function (id) {
            entityID = id;
        },
        makeAvailable: function(id, param) {
            var properties = {
                text: AVAILABLE_TEXT
            };

            Entities.editEntity(entityID, properties);
        },
        makeUnAvailable: function(id, param) {
            var properties = {
                text: UNAVAILABLE_TEXT
            };

            Entities.editEntity(entityID, properties);
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Availability_Server();
});
