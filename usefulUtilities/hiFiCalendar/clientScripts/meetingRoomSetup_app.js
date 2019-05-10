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
    var TOKEN_SERVER_ID = '{18c54d17-95c4-4765-9a19-7a0803bceab8}';
    // var MEETING_ROOM_1 = ['{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}', '{52a01b43-0200-45d1-bd58-aab0e658bdb3}'];
    // var MEETING_ROOM_2 = ['{2cfe3b74-e70c-44f6-bbfc-c74813acf0fd}', '{3ff72a7e-20cd-4c24-8c13-0ca85f9432ba}'];
    // var MEETING_ROOM_3 = ['{784c8c54-b11e-471c-9ba7-96f2bb347e98}', '{4623f8d6-4283-4192-a25c-461c3e0f72cf}'];
    // var MEETING_ROOM_4 = ['{a79ac99b-62f6-4e58-b04c-5735c2337fcf}', '{244aff65-f4c3-4609-92e5-211b9537cbe7}'];
    // var MEETING_ROOM_5 = ['{5d662a66-a250-4f18-ad1f-9cd21cd8380d}', '{235eaa39-d3af-4b8c-8f9c-29b79bb832af}'];
    // var MEETING_ROOM_6 = ['{1a92909e-52f9-4099-932a-4d2d43144791}', '{9bf4542e-24c6-4356-9394-68c025b5a29e}'];
    // var roomScheduleIDs = [
    //     MEETING_ROOM_1,
    //     MEETING_ROOM_2,
    //     MEETING_ROOM_3,
    //     MEETING_ROOM_4,
    //     MEETING_ROOM_5,
    //     MEETING_ROOM_6
    // ];
    var roomConfig = false;
    var token;
    var tokenLifetime;
    var tokenStart;
    var expireTime;
    var clientID;
    var refreshToken;
    var timezone;
    var timezoneOffset = 7;
    var secret;
    var pageReady = false;
    function onWebMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                pageReady = true;
                break;          
            case "SETUP COMPLETE":
                clientID = data.client_id;
                secret = data.secret;
                token = data.access_token;
                refreshToken = data.refresh_token;
                tokenLifetime = data.expireTime;
                tokenStart = data.validSince;
                expireTime = tokenStart + tokenLifetime * MS_TO_SEC;
                timezone = data.timeZoneName;
                timezoneOffset = new Date().getTimezoneOffset() / MIN_PER_HR;
                roomConfig = data.connectionData;
                Settings.setValue("roomConfigured", true);
                Entities.callEntityServerMethod(TOKEN_SERVER_ID, "initializeToken", [
                    token, 
                    refreshToken, 
                    expireTime, 
                    timezone,
                    timezoneOffset, 
                    clientID,
                    secret,
                    roomConfig
                ]);
                break;
        }
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
                    Window.announcement("Access tokens are valid. No action required");
                    roomConfig = message.roomConfig;
                } else if (!message.tokenStatus && !message.roomConfigured) {
                    Window.announcement("You have not set up any room schedules for this domain.");
                }
            } else if (message.type === "ROOM CONFIG" && pageReady) {
                roomConfig = message.roomConfig;
                ui.sendToHtml({
                    type: "ALREADY SET",
                    data: roomConfig
                });
            } else if (message.type === "ERROR") {
                Window.alert("There was an error, here's what we know:\n" + 
                message.entityName + "\nError: " + 
                message.errorMessage + "\nHappened during: " + 
                message.attemptedAction);
            } else if (message.type === "REFRESH SUCCESS") {
                Window.announcement("Token server successfully refreshed " + message.count + " times since preload.");
            }
        }
    };


    // This function keeps the app running even if you change domains.
    var DOMAIN_DELAY = 100;
    function onDomainChange(domain){
        // Do not change app status on domain change
        if (location.hostname === DOMAIN) {
            Script.setTimeout(function(){
                Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain", AccountServices.username);
            }, DOMAIN_DELAY);
        } 
    }

    //  Immediately check with the token server to see if there is a valid configuration.
    function onOpened() {
        if (Settings.getValue("roomConfigured", false)) {
            Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain", AccountServices.username);
        }
    }

    // This function loads appui and connects to the needed signals
    var AppUi = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUi({
            home: "http://127.0.0.1:90/localHTTP/meetingRoom_ui.html",
            buttonName: "CALENDAR", // The name of your app
            graphicsDirectory: Script.resolvePath("../resources/images/"), // Where your button icons are located
            onMessage: onWebMessage,
            onOpened: onOpened
        });       
        Script.scriptEnding.connect(scriptEnding);
        Window.domainChanged.connect(onDomainChange);
        Messages.subscribe(CHANNEL);
        Messages.messageReceived.connect(messageHandler);
        if (Settings.getValue("roomConfigured", false)) {
            Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain", AccountServices.username);
        }
    }
    startup();


    function scriptEnding() {
        Messages.unsubscribe(CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
        Window.domainChanged.disconnect(onDomainChange);
    }
})();    