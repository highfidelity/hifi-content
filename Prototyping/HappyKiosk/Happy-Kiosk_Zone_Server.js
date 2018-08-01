// Happy-Kiosk_Zone_Server.js
//
// Created by Milad Nazeri on 2018-06-19
//
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
// 
// Controls the requests made by the button to make sure only one avatar at a time is using the system.  
// Doesn't currently account for an avatar pressing multiple buttons, altough there is a debounce feature built in. 
// For this iteration using that as a metric to see how many people would use the system like that.
// url to call is stored in userData

(function () {
    // Helper Functions
    var Util = Script.require("./Helper.js?" + Date.now());
    var searchForChildren = Util.Entity.searchForChildren;

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
        name = null,
        DEBUG = false,
        loadedChildren = false,
        isOn = false,
        url = "",
        isAvailableToPress = true,
        currentAvatarUUID = null,
        currentAvatarUserName = null,
        heartbeatCheck = null,
        self;

    // Consts
    var TEXT = "KIOSK_Text",
        AVAILABILTY = "KIOSK_Availability",
        SEARCH_FOR_CHILDREN_TIMEOUT = 5000,
        SEARCH_FOR_CHILDNAME_TIMEOUT = 1000,
        PRESS_DEBOUNCE_TIME = 1500;

    // Collections
    var currentProperties = {},
        userData = {},
        userdataProperties = {},
        childrenIDS = {},
        childrenProps = {},
        childNames = [
            "KIOSK_Button_1",
            "KIOSK_Button_2",
            "KIOSK_Button_3",
            "KIOSK_Button_4",
            "KIOSK_Text",
            "KIOSK_Availability"
        ];

    // Entity Definition
    function HappyKiosk_Zone_Server() {
        self = this;
    }

    HappyKiosk_Zone_Server.prototype = {
        remotelyCallable: [
            "requestTurnOff",
            "requestPress",
            "sendInput",
            "turnOff",
            "turnOn"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID);
            name = currentProperties.name;

            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties;
                url = userdataProperties.url;
            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
            this.findChildren();
        },
        childSearchCallBack: function (children, foundAllEntities, names) {
            loadedChildren = true;
            Object.keys(children).forEach(function (name) {
                childrenIDS[name] = children[name];
                childrenProps[name] = Entities.getEntityProperties(children[name]);
            });
        },
        childNameTimeOutFunction: function () {
            var childNamesToSearch = Array.prototype.slice.call(childNames);
            childNames.forEach(function (name) {
                childrenIDS[name] = null;
            });
            searchForChildren(entityID, childNamesToSearch, self.childSearchCallBack, SEARCH_FOR_CHILDREN_TIMEOUT, true);
        },
        encodeURLParams: function (params) {
            var paramPairs = [];
            for (var key in params) {
                paramPairs.push(key + "=" + params[key]);
            }
            return paramPairs.join("&");
        },
        findChildren: function () {
            Script.setTimeout(self.childNameTimeOutFunction, SEARCH_FOR_CHILDNAME_TIMEOUT);
        },
        requestPress: function (id, param) {
            log(LOG_ENTER, name + " requestPress");

            var avatarUUID = param[0];
            var buttonName = param[1];

            if (avatarUUID !== currentAvatarUUID) {
                return;
            }

            if (isAvailableToPress) {
                Entities.callEntityMethod(childrenIDS[buttonName], "pressButton", [currentAvatarUUID]);
                isAvailableToPress = false;
                Script.setTimeout(function() {
                    isAvailableToPress = true;
                    Entities.callEntityMethod(childrenIDS[TEXT], "makeVisible", [JSON.stringify(childrenProps[buttonName].position)]);
                }, PRESS_DEBOUNCE_TIME);
            }
        },
        requestTurnOff: function (id, param) {
            log(LOG_ENTER, name + " requestTurnOff");

            var avatarUUID = param[0];

            if (avatarUUID !== currentAvatarUUID) {
                return;
            }

            this.turnOff();
        },
        sendInput: function (id, param) {
            log(LOG_ENTER, name + " sendInput");

            var event = param[0];
            var date = param[1];
            var rating = Number(param[2]);

            var paramString = this.encodeURLParams({
                userName: currentAvatarUserName,
                date: date,
                event: event,
                rating: rating
            });
        
            var request = new XMLHttpRequest();
            request.open('GET', url + "?" + paramString);
            request.timeout = 10000;
            request.send();
        },
        turnOff: function () {
            log(LOG_ENTER, name + " turnOff");

            isOn = false;
            Entities.callEntityMethod(childrenIDS[AVAILABILTY], "makeAvailable");
            currentAvatarUUID = false;
            currentAvatarUserName = null;
        },
        turnOn: function (id, param) {
            log(LOG_ENTER, name + " turnOn");

            var avatarID = param[0];
            var avatarUserName = param[1];
            if (isOn) {
                return;
            }
            currentAvatarUUID = avatarID;
            currentAvatarUserName = avatarUserName;
            Entities.callEntityMethod(childrenIDS[AVAILABILTY], "makeUnAvailable");
            isOn = true;

        },
        unload: function () {
            if (heartbeatCheck) {
                Script.clearInterval(heartbeatCheck);
            }
            this.turnOff();
        }
    };

    return new HappyKiosk_Zone_Server();
});
