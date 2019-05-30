//  meetingRoomSetup_app.js
//
//  Created by Mark Brosche on 4-2-2019
//  Handed off to Milad Nazeri on 5-15-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var CONFIG = Script.require("../calendarConfig.json?" + Date.now());
    var CHANNEL = "HiFi.Google.Calendar";
    var DOMAIN = "hq";
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var TOKEN_SERVER_ID = CONFIG.TOKEN_SERVER_ID;
    var roomConfig = false;
    var token;
    var tokenLifetime;
    var tokenStart;
    var expireTime;
    var refreshToken;
    var timezone;
    var timezoneOffset = 7;
    var roomConfigInfo = [];

    // Handle messages from the tablet
    function onWebMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                ui.sendToHtml({
                    type: "AVAILABLE ROOMS",
                    roomConfig: roomConfigInfo
                });
                break;          
            case "GET AVAILABLE ROOMS":
                ui.sendToHtml({
                    type: "AVAILABLE ROOMS",
                    roomConfig: roomConfigInfo
                });
                break;
            case "SETUP COMPLETE":
                token = data.access_token;
                refreshToken = data.refresh_token;
                tokenLifetime = data.expireTime;
                tokenStart = data.validSince;
                expireTime = tokenStart + tokenLifetime * MS_TO_SEC;
                timezone = data.timeZoneName;
                // Gets the correct timezone offset for events current / in the future, which is why the -1 is needed.
                timezoneOffset = (new Date().getTimezoneOffset() / MIN_PER_HR) * -1; 
                roomConfig = data.connectionData;
                Settings.setValue("roomConfigured", true);
                Entities.callEntityServerMethod(TOKEN_SERVER_ID, "initializeRooms", [
                    token, 
                    refreshToken, 
                    expireTime, 
                    timezone,
                    timezoneOffset, 
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

            if (message.TOKEN_SERVER_ID) {
                TOKEN_SERVER_ID = message.TOKEN_SERVER_ID;
            }

            if (message.type === "TOKEN EXPIRED") {
                Window.alert("The authorization token for your Google Calendar could not be refreshed.\n" + 
                "Please open your calendar app and reauthorize to continue displaying calendar schedules.");
                roomConfig = message.roomConfig;
                roomConfigInfo = message.roomConfigInfo;
            } else if (message.type === "STATUS UPDATE") {
                if (message.tokenStatus) {
                    Window.announcement("Access tokens are valid. No action required");
                    roomConfig = message.roomConfig;
                    roomConfigInfo = message.roomConfigInfo;
                } else if (!message.tokenStatus && !message.roomConfigured) {
                    roomConfigInfo = message.roomConfigInfo;
                    Window.announcement("You have not set up any room schedules for this domain.");
                }
            } else if (message.type === "ERROR") {
                // Commenting this out for right now because this was initially flooding the interface during testing
                // Will bring back after battle testing for QA
                
                // Window.alert("There was an error, here's what we know:\n" + 
                // message.entityName + "\nError: " + 
                // message.errorMessage + "\nHappened during: " + 
                // message.attemptedAction);
                return;
            } else if (message.type === "REFRESH SUCCESS") {
                roomConfigInfo = message.roomConfigInfo;
                Window.announcement("Token server successfully refreshed " + message.count + " times since preload.");
            }
        }
    };


    // This function keeps the app running even if you change domains.
    var DOMAIN_DELAY = 100;
    function onDomainChange(domain){
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
            home: CONFIG.REDIRECT_URI,
            buttonName: "CALENDAR", // The name of your app
            graphicsDirectory: Script.resolvePath("../resources/images/"), // Where your button icons are located
            onMessage: onWebMessage,
            onOpened: onOpened
        });       
        Script.scriptEnding.connect(scriptEnding);
        Window.domainChanged.connect(onDomainChange);
        Messages.subscribe(CHANNEL);
        Messages.messageReceived.connect(messageHandler);
        Messages.sendMessage(CHANNEL, JSON.stringify({ type: "APP STARTED" }));
    }
    startup();


    function scriptEnding() {
        Messages.unsubscribe(CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
        Window.domainChanged.disconnect(onDomainChange);
    }
})();