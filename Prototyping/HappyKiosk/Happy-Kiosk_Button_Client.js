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
// Handles physics interactions for buttons.  Routed through the Zone.

/* global Pointers */

(function () {

    // Helper Functions
    var Util = Script.require("../../Utilities/Helper.js?" + Date.now());

    var getNameProps = Util.Entity.getNameProps,
        getUserData = Util.Entity.getUserData,
        updateUserData = Util.Entity.updateUserData,
        makeColor = Util.Color.makeColor,
        vec = Util.Maths.vec;

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
    var 
        entityID,
        name,
        kioskZoneID,
        userName,
        self,
        currentHand = 0,
        event = 0,
        rating = 1;

    // Const
    var BASE_NAME = "Happy-Kiosk_",
        BUTTON_PRESS_OFFSET = 0.05,
        DOWN_TIME_MS = 2000;

        // Collections
    var currentProperties = {},
        position = {},
        userData = {},
        userdataProperties = {};

    // Entity Definition
    function Happy_Kiosk_Button() {
        self = this;
    }

    Happy_Kiosk_Button.prototype = {
        remotelyCallable: [
            "makeHaptic"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;
            position = currentProperties.position;
            kioskZoneID = currentProperties.parentID;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                event = userdataProperties.event;
                rating = userdataProperties.rating;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
        },
        makeHaptic: function(id, param) {
            log(LOG_ENTER, "makeHaptic");
            log(LOG_VALUE, "currentHand", currentHand);

            var HAPTIC_STRENGTH = 1;
            var HAPTIC_DURATION = 20;
            Controller.triggerHapticPulse(HAPTIC_STRENGTH, HAPTIC_DURATION, currentHand);
        },
        mousePressOnEntity: function(entityID, mouseEvent) {
            log(LOG_ENTER, "MOUSE PRESS ON ENTITY");
            if (!mouseEvent.button === "Primary") {
                return;
            }
            Entities.callEntityServerMethod(kioskZoneID, "requestPress", [MyAvatar.sessionUUID, name]);
        },
        stopNearTrigger: function(entityID, mouseEvent) {
            log(LOG_ENTER, "stopNearTrigger");
            if (Pointers.isLeftHand(mouseEvent.id)) {
                currentHand = 0;
            } else if (Pointers.isRightHand(mouseEvent.id)) {
                currentHand = 1;
            }
            Entities.callEntityServerMethod(entityID, "updateCurrentHand", [String(currentHand)]);
            Entities.callEntityServerMethod(kioskZoneID, "requestPress", [MyAvatar.sessionUUID]);
        },
        unload: function () {
        }
    };

    return new Happy_Kiosk_Button();
});
