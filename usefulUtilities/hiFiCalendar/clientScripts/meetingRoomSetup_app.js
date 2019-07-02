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
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var roomConfig = false;
    var token;
    var tokenLifetime;
    var tokenStart;
    var expireTime;
    var refreshToken;
    var timezone;
    var timezoneOffset = 7;
    var roomConfigInfo = [];
    var TOKEN_SERVER_ID;


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
            case "OPEN RESOURCE LINK":
                var LINK_URL = Script.resolvePath("./externalQMLInfo.qml");
                var window = Desktop.createWindow(LINK_URL);
                window.close();
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
                console.warning("The authorization token for your Google Calendar could not be refreshed.\n" + 
                "Please open your calendar app and reauthorize to continue displaying calendar schedules.");
                roomConfig = message.roomConfig;
            } else if (message.type === "ERROR") {
                console.error("There was an error, here's what we know:\n" + 
                    message.entityName + "\nError: " + 
                    message.errorMessage + "\nHappened during: " + 
                    message.actionAttempted);
                return;
            } else if (message.type === "REFRESH SUCCESS") {
                console.log("Token server successfully refreshed " + message.count + " times since preload.");
            }
            if (message.roomConfigInfo && message.roomConfigInfo.length > 0) {
                roomConfigInfo = message.roomConfigInfo;
                ui.sendToHtml({
                    type: "AVAILABLE ROOMS",
                    roomConfig: roomConfigInfo
                });
            }
        }
    };


    //  Immediately check with the token server to see if there is a valid configuration.
    function onOpened() {
        Entities.callEntityServerMethod(TOKEN_SERVER_ID, "enteredDomain");
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
        Messages.subscribe(CHANNEL);
        Messages.messageReceived.connect(messageHandler);
        Messages.sendMessage(CHANNEL, JSON.stringify({ type: "APP STARTED" }));
        ui.open();
    }
    startup();


    function scriptEnding() {
        Messages.unsubscribe(CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
    }
})();