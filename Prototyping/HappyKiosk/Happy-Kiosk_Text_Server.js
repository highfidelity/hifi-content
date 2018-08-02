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
    var entityID,
        name;

    // Const
    var VISIBLE_TIME = 2000;

    // Collections
    var currentProperties = {};
    
    // Entity Definition
    function HappyKiosk_Text_Server() {
        self = this;
    }

    HappyKiosk_Text_Server.prototype = {
        remotelyCallable: [
            "makeVisible"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;
        },
        makeVisible: function(id, param) {
            log(LOG_ENTER, name + " makeVisible");
            var props = {
                visible: true
            };

            Entities.editEntity(entityID, props);

            Script.setTimeout(function() {
                var props = {
                    visible: false
                };
    
                Entities.editEntity(entityID, props);
            }, VISIBLE_TIME);
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Text_Server();
});
