// Happy-Kiosk_Text_Server.js
// 
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Makes the thank you visible

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
        name;

    // Const
    var VISIBLE_TIME = 2000;

    // Collections
    var currentProperties = {};

    // Entity Definition
    function HappyKiosk_Text_Server() {
    }

    HappyKiosk_Text_Server.prototype = {
        remotelyCallable: [
            "makeVisible"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name"]);
            name = currentProperties.name;
        },
        makeVisible: function(id, param) {
            log(LOG_ENTER, name + " makeVisible");
            var properties = {
                visible: true
            };

            Entities.editEntity(entityID, properties);

            Script.setTimeout(function() {
                var properties = {
                    visible: false
                };
    
                Entities.editEntity(entityID, properties);
            }, VISIBLE_TIME);
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Text_Server();
});
