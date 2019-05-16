// meetingRoomSetup_app.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var CHANNEL = "HiFi.Google.Calendar";
    var DOMAIN = "hq";
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var TOKEN_SERVER_ID = '{de23b09f-0e49-4250-8de9-394453bb8565}';
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
    var roomConfigInfo = [
        {
            name: "ATLANTIS",
            id: "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}"
        },
        {
            name: "FANTASIA",
            id: "{a79ac99b-62f6-4e58-b04c-5735c2337fcf}"
        },
        {
            name: "CAPITOL",
            id: "{784c8c54-b11e-471c-9ba7-96f2bb347e98}"
        },
        {
            name: "JAKKU",
            id: "{2cfe3b74-e70c-44f6-bbfc-c74813acf0fd}"
        },
        {
            name: "NARNIA",
            id: "{1a92909e-52f9-4099-932a-4d2d43144791}"
        },
        {
            name: "OZ",
            id: "{5d662a66-a250-4f18-ad1f-9cd21cd8380d}"
        }
    ];
    function onWebMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                pageReady = true;
                ui.sendToHtml({
                    type: "AVAILABLE ROOMS",
                    roomConfig: roomConfigInfo
                });
                break;          
            case "SETUP COMPLETE":
                console.log("\n\n\n\n\n\n\nINCOMING DATA:" + JSON.stringify(data, null, 4));
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
                // ### This is probably initializeRooms
                console.log("\n\n\n\n\n CALLING INITIALIZE ROOM");
                Entities.callEntityServerMethod(TOKEN_SERVER_ID, "initializeRooms", [
                    token, 
                    refreshToken, 
                    expireTime, 
                    timezone,
                    timezoneOffset, 
                    clientID,
                    secret,
                    JSON.stringify(roomConfig)
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
                console.log("The authorization token for your Google Calendar could not be refreshed.\n" + 
                "Please open your calendar app and reauthorize to continue displaying calendar schedules.")
                // Window.alert("The authorization token for your Google Calendar could not be refreshed.\n" + 
                // "Please open your calendar app and reauthorize to continue displaying calendar schedules.");
                roomConfig = message.roomConfig;
            } else if (message.type === "STATUS UPDATE") {
                if (message.tokenStatus) {
                    console.log("Access tokens are valid. No action required");
                    // Window.announcement("Access tokens are valid. No action required");
                    roomConfig = message.roomConfig;
                    // # so then what happens if there isn't a token status but there is a roomConfigured?
                } else if (!message.tokenStatus && !message.roomConfigured) {
                    console.log("You have not set up any room schedules for this domain.");
                    // Window.announcement("You have not set up any room schedules for this domain.");
                }
                // THIS IS ALL FUCKED OFF, NOT SURE WHAT THIS OR THE LAST ONE IS - AVAILABLE ROOMS / ALREADY SET
            // } else if (message.type === "ROOM CONFIG" && pageReady) {
            } else if (message.type === "ROOM CONFIG") {

                console.log("=-=WATCH OUT TO SEE IF THIS IS ROOM CONFIG:=-=")
                // roomConfig = message.roomConfig;
                // console.log("roomConfig", JSON.stringify(roomConfig));
                // console.log("typeof roomConfig", typeof roomConfig);
                // ui.sendToHtml({
                //     type: "AVAILABLE ROOMS",
                //     roomConfig: roomConfig
                // });
            } else if (message.type === "ERROR") {
                return;
                console.log("there was an error" +
                // Window.alert("There was an error, here's what we know:\n" + 
                message.entityName + "\nError: " + 
                message.errorMessage + "\nHappened during: " + 
                message.attemptedAction);
            } else if (message.type === "REFRESH SUCCESS") {
                console.log("Token server successfully refreshed " + message.count + " times since preload.");
                // Window.announcement("Token server successfully refreshed " + message.count + " times since preload.");
            }
        }
    };


    // This function keeps the app running even if you change domains.
    var DOMAIN_DELAY = 100;
    function onDomainChange(domain){
        // Do not change app status on domain change
        // # What is this doing exactly?  Is this in case the server reset for you? 
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
            home: "http://127.0.0.1:80/localHTTP/meetingRoom_ui.html",
            // home: "http://127.0.0.1:80/localHTTP/meetingRoom_ui.html",
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