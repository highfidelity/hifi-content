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
    var Util = Script.require("../../Utilities/Helper.js?");
    
    var searchForChildren = Util.Entity.searchForChildren;

    // Log Setup
    var LOG_ENTER = Util.Debug.LOG_ENTER,
        LOG_UPDATE = Util.Debug.LOG_UPDATE,
        LOG_ERROR = Util.Debug.LOG_ERROR,
        LOG_VALUE = Util.Debug.LOG_VALUE,
        LOG_ARCHIVE = Util.Debug.LOG_ARCHIVE, 
        LOG_CONFIG = {
            "Log_Enter": true,
            "Log_Update": true,
            "Log_Error": true,
            "Log_Value": true,
            "LOG_ARCHIVE": false
        },
        log = Util.Debug.log(LOG_CONFIG);

    // Init 
    var entityID,
        name = null,
        DEBUG = false,
        loadedChildren = false,
        isOn = false,
        lastHeartBeat = null,
        url = "",
        event = "",
        isAvailableToPress = true,
        currentAvatarUUID = null,
        currentAvatarUserName = null,
        heartbeatCheck = null,
        soundURL = Script.resolvePath("./bell.wav"),
        sound = null,
        soundInjector = null,
        self;

    // Consts
    var TEXT = "HappyKiosk_Text",
        AVAILABILTY = "KIOSK_Availability",
        SEARCH_FOR_CHILDREN_TIMEOUT = 5000,
        SEARCH_FOR_CHILDNAME_TIMEOUT = 1000,
        HEARTBEAT_TIMEOUT = 2000,
        HEARTBEAT_CHECK_INTERVAL = 2500,
        PRESS_DEBOUNCE_TIME = 3000,
        CHIME_VOLUME = 0.75;

    // Collections
    var currentProperties = {},
        userData = {},
        position = {},
        userdataProperties = {},
        childrenIDS = {},
        childrenProperties = {},
        childNames = [
            "HappyKiosk_Button_1",
            "HappyKiosk_Button_2",
            "HappyKiosk_Button_3",
            "HappyKiosk_Button_4",
            "HappyKiosk_Text"
        ];

    // Entity Definition
    function HappyKiosk_Zone_Server() {
        self = this;
    }

    HappyKiosk_Zone_Server.prototype = {
        remotelyCallable: [
            "receiveHeartBeat",
            "requestTurnOff",
            "requestPress",
            "sendInput",
            "turnOff",
            "turnOn"
        ],
        preload: function (id) {
            entityID = id;
            currentProperties = Entities.getEntityProperties(entityID, ["name", "userData"]);
            name = currentProperties.name;

            sound = SoundCache.getSound(soundURL);
            userData = currentProperties.userData;
            try {
                userdataProperties = JSON.parse(userData);
                DEBUG = userdataProperties;
                url = userdataProperties.kiosk.url;
                event = userdataProperties.kiosk.event;

            } catch (e) {
                log(LOG_ERROR, "ERROR READING USERDATA", e);
            }
            this.findChildren();
        },
        childSearchCallBack: function (children, foundAllEntities, names) {
            loadedChildren = true;
            Object.keys(children).forEach(function (name) {
                childrenIDS[name] = children[name];
                childrenProperties[name] = Entities.getEntityProperties(children[name]);
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
        receiveHeartBeat: function (id, param) {
            lastHeartBeat = Date.now();
            Script.setTimeout(function() {
                if (Date.now() - lastHeartBeat > HEARTBEAT_TIMEOUT) {
                    self.turnOff();
                }
            }, HEARTBEAT_CHECK_INTERVAL);
        },
        requestPress: function (id, param) {
            log(LOG_ENTER, name + " requestPress");

            var avatarUUID = param[0];
            var buttonName = param[1];

            if (avatarUUID !== currentAvatarUUID) {
                log(LOG_VALUE, name + "avatarUUID and currentAvatarUUID Not equal", [avatarUUID, currentAvatarUUID]);
                return;
            }

            log(LOG_ENTER, "Checking if is available to press");
            if (isAvailableToPress) {
                log(LOG_ENTER, "IT IS available to press");
                soundInjector = Audio.playSound(sound, {
                    position: position,
                    volume: CHIME_VOLUME
                });
                Entities.callEntityMethod(childrenIDS[buttonName], "pressButton", [currentAvatarUUID]);
                isAvailableToPress = false;
                Entities.callEntityMethod(childrenIDS[TEXT], "makeVisible");
                Script.setTimeout(function() {
                    isAvailableToPress = true;
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

            var date = param[0];
            var rating = Number(param[1]);

            var paramString = this.encodeURLParams({
                userName: currentAvatarUserName,
                date: date,
                event: event,
                rating: rating,
                UUID: currentAvatarUUID
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
