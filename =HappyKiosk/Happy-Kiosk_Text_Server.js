// Happy-Kiosk_Text_Server.js
// 
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Temporary file that will be replaced with a model, but will probably use the same interface

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("./Helper.js?" + Date.now());

    var vec = Util.Maths.vec;

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
        DISTANCE_ABOVE = 0.5,
        VISIBLE_TIME = 2000;

        // Collections
    var currentProperties = {},
        position = {},
        userData = {},
        userdataProperties = {};

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
            kioskZoneID = currentProperties.parentID;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        makeVisible: function(id, param) {
            log(LOG_ENTER, name + " makeVisible");
            var position = param[0];

            try {
                position = JSON.parse(position);
            } catch (e) {
                log(LOG_ERROR, "CANT PARSE POSITION");
            }
            var sumPosition = Vec3.sum(
                position,
                vec(0, DISTANCE_ABOVE, 0)
            );
            var props = {
                position: sumPosition,
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
