// meetingRoomSetup_app.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // This function decides how to handle web events from the tablet UI.
    // used by 'ui' in startup()
    var CHANNEL = "HiFi.Google.Calendar";
    var DOMAIN = "hq";
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var TOKEN_SERVER_ID = "";
    var MEETING_ROOM_1 = ['{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}', '{52a01b43-0200-45d1-bd58-aab0e658bdb3}'];
    var MEETING_ROOM_2 = ['{2cfe3b74-e70c-44f6-bbfc-c74813acf0fd}', '{3ff72a7e-20cd-4c24-8c13-0ca85f9432ba}'];
    var MEETING_ROOM_3 = ['{784c8c54-b11e-471c-9ba7-96f2bb347e98}', '{4623f8d6-4283-4192-a25c-461c3e0f72cf}'];
    var MEETING_ROOM_4 = ['{a79ac99b-62f6-4e58-b04c-5735c2337fcf}', '{244aff65-f4c3-4609-92e5-211b9537cbe7}'];
    var MEETING_ROOM_5 = ['{5d662a66-a250-4f18-ad1f-9cd21cd8380d}', '{235eaa39-d3af-4b8c-8f9c-29b79bb832af}'];
    var MEETING_ROOM_6 = ['{1a92909e-52f9-4099-932a-4d2d43144791}', '{9bf4542e-24c6-4356-9394-68c025b5a29e}'];
    var roomScheduleIDs = [
        MEETING_ROOM_1,
        MEETING_ROOM_2,
        MEETING_ROOM_3,
        MEETING_ROOM_4,
        MEETING_ROOM_5,
        MEETING_ROOM_6
    ];
    var request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;
    var roomConfig = false;
    var token;
    var tokenLifetime;
    var expireTime;
    var clientID;
    var refreshToken;
    var timezone;
    var secret;
    var pageReady = false;
    function onWebMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                pageReady = true;
                if (!roomConfig) {
                    roomConfig = [];
                    roomScheduleIDs.forEach(function(room) {
                        var name = Entities.getEntityProperties(room[0], ['name']).name;
                        roomConfig.push({
                            name: name,
                            id: room[0]
                        });
                    });
                    ui.sendToHTML({
                        type:'SEND_ROOMS',
                        value: roomScheduleIDs
                    });
                } else {
                    ui.sendToHTML({
                        type:'AVAILABLE ROOMS',
                        value: roomConfig
                    });
                }
                break;          
            case "SETUP_COMPLETE":
                ui.sendToHTML({
                    type: 'setup',
                    value: "IDK"
                });
                break;
            case "GET_ROOMS":
                if (!roomConfig) {
                    ui.sendToHTML({
                        type:'SEND_ROOMS',
                        value: roomScheduleIDs
                    });
                } else {
                    ui.sendToHTML({
                        type:'SEND_ROOMS',
                        value: roomConfig
                    });
                }
                break;
        }
    }


    // This function sends token information to the server script to keep the calendars up to date.
    function initializeTokenServer(entityID, response) {
        if (response) {
            token = response.access_token;
            refreshToken = response.refresh_token;
            tokenLifetime = response.expires_in * MS_TO_SEC;
            expireTime = new Date().valueOf() + tokenLifetime;
            roomConfig = response.roomConfig;
        }
        var timezoneOffset = (new Date().getTimezoneOffset()/MIN_PER_HR);
        Entities.callEntityServerMethod(entityID, "refreshToken", [token, expireTime, timezoneOffset, timezone, refreshToken, roomConfig]);
    }


    // This function is the listener for messages on the message mixer related to this app.
    var messageHandler = function(channel, message, senderUUID, localOnly) {
        if (channel !== CHANNEL) {
            return;
        } else {
            try {
                message = JSON.parse(message);
            } catch (e) {
                console.log(e, "Could not parse message");
                return;
            }
            if (message.type === "TOKEN EXPIRED") {
                Window.alert("The authorization token for your Google Calendar could not be refreshed.\n" + 
                "Please open your calendar app and reauthorize to continue displaying calendar schedules.");
                roomConfig = message.roomConfig;
            } else if (message.type === "STATUS UPDATE") {
                if (message.tokenStatus) {
                    Window.announcement("Acces tokens are valid. No action required");
                    roomConfig = message.roomConfig;
                } else if (!message.tokenStatus && !message.roomConfig) {
                    Window.announcement("You have not set up any room schedules for this domain.");
                }
            } else if (message.type === "ROOM CONFIG" && pageReady) {
                ui.sendToHTML({
                    type: "ALREADY SET",
                    data: message.roomConfig
                });
            }
        }
    };


    // This function keeps the app running even if you change domains.
    var DOMAIN_DELAY = 100;
    function onDomainChange(){
        // Do not change app status on domain change
        if (location.hostname === DOMAIN) {
            Script.setTimeout(function(){
                Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain", AccountServices.username);
            }, DOMAIN_DELAY);
        }
    }


    // This function loads appui and connects to the needed signals
    var AppUi = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUi({
            home: "http://localhost/hiFiCalendar.html",
            buttonName: "CALENDAR", // The name of your app
            graphicsDirectory: Script.resolvePath("../resources/images/"), // Where your button icons are located
            onMessage: onWebMessage
        });       
        Script.scriptEnding.connect(scriptEnding);
        Window.domainChanged.connect(onDomainChange);
        Messages.subscribe(CHANNEL);
        Messages.messageReceived.connect(messageHandler);
        if (Settings.getValue("roomConfig", false)) {
            Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain", AccountServices.username);
        }
    }
    startup();


    function scriptEnding() {
        if (location.hostname === DOMAIN) {
            Entities.callEntityServerMethod(TOKEN_SERVER_ID, "leftDomain", AccountServices.username);
        }
        Messages.unsubscribe(CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
    }
})();    