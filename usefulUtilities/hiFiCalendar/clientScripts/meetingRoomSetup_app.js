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
    var ROOM_1_SCHEDULE_ID = "{24b7b274-25a2-4dde-a241-f90da21de4c8}";
    var ROOM_2_SCHEDULE_ID = "{c3f87945-e372-4f85-bde2-9d99d3633125}";
    var ROOM_3_SCHEDULE_ID = "{010134dd-8608-4eef-b0a8-8316dcb982d8}";
    var ROOM_4_SCHEDULE_ID = "{3aa8bb2e-b008-4d87-9fff-f0a4fda0c9d2}";
    var ROOM_5_SCHEDULE_ID = "{5e98c3b0-4924-4e01-b400-7298d4ddecff}";
    var ROOM_6_SCHEDULE_ID = "{cb0571ff-21f9-4d60-8d43-ebc5e80704a3}";
    var roomScheduleIDs = [
        ROOM_1_SCHEDULE_ID,
        ROOM_2_SCHEDULE_ID,
        ROOM_3_SCHEDULE_ID,
        ROOM_4_SCHEDULE_ID,
        ROOM_5_SCHEDULE_ID,
        ROOM_6_SCHEDULE_ID
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
    function onWebMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
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
        if (Settings.getValue("calendar/roomsConfigured", false)) {
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