// Happy-Kiosk_Button_Server.js
// 
// Further Edited by Milad Nazeri on 07/31-2018 from Zombie-Gate Button
// Edited by Rebecca Stankus on 03/07/2018
// from button1.js by Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// Controls visual actions of the button presses.  Is routed through the zone kiosk.

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
        position,
        kioskZoneID,
        self,
        onTexture,
        offTexture,
        rating = 1;

    // Const
    var BUTTON_PRESS_OFFSET = 0.04,
        DOWN_TIME_MS = 2000;

        // Collections
    var currentProperties = {},
        position = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    function HappyKiosk_Button() {
        self = this;
    }

    HappyKiosk_Button.prototype = {
        remotelyCallable: [
            "pressButton"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "position", "parentID", "userData"]);
            name = currentProperties.name;
            position = currentProperties.position;
            kioskZoneID = currentProperties.parentID;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                rating = userdataProperties.kiosk.rating;
                onTexture = userdataProperties.kiosk.onTexture;
                offTexture = userdataProperties.kiosk.offTexture;

                var textureData = {};
                textureData["button" + rating + "-off"] = offTexture;
                
                Entities.editEntity(entityID, {
                    textures: JSON.stringify(textureData)
                });
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        lowerButton: function() {
            log(LOG_ENTER, name + " lowerButton");

            var textureData = {};
            textureData["button" + rating + "-off"] = onTexture;

            position.y -= BUTTON_PRESS_OFFSET;
            Entities.editEntity(entityID, {
                position: position,
                textures: JSON.stringify(textureData)
            });
            position.y += BUTTON_PRESS_OFFSET;
        },
        pressButton: function(id, param) {
            log(LOG_ENTER, name + " pressButton");
            position = Entities.getEntityProperties(entityID, ["position"]).position;

            Entities.callEntityMethod(kioskZoneID, "sendInput", [new Date(), rating]);

            self.lowerButton();
            Script.setTimeout(function() {
                self.raiseButton();
            }, DOWN_TIME_MS);
            return;
        },
        raiseButton: function() {
            log(LOG_ENTER, name + " raiseButton");
            var textureData = {};
            textureData["button" + rating + "-off"] = offTexture;

            Entities.editEntity(entityID, {
                position: position,
                textures: JSON.stringify(textureData)
            });
        },
        unload: function () {
        }
    };

    return new HappyKiosk_Button();
});
