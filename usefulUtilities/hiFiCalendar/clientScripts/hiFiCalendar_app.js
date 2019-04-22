// hiFiCalendar_app.js
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
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var ATLANTIS_LABEL_ID = "{24b7b274-25a2-4dde-a241-f90da21de4c8}";
    var JAKKU_LABEL_ID = "{c3f87945-e372-4f85-bde2-9d99d3633125}";
    var CAPITOL_LABEL_ID = "{010134dd-8608-4eef-b0a8-8316dcb982d8}";
    var FANTASIA_LABEL_ID = "{3aa8bb2e-b008-4d87-9fff-f0a4fda0c9d2}";
    var OZ_LABEL_ID = "{5e98c3b0-4924-4e01-b400-7298d4ddecff}";
    var NARNIA_LABEL_ID = "{cb0571ff-21f9-4d60-8d43-ebc5e80704a3}";
    var calendarScheduleIDs = [
        ATLANTIS_LABEL_ID,
        JAKKU_LABEL_ID,
        CAPITOL_LABEL_ID,
        FANTASIA_LABEL_ID,
        OZ_LABEL_ID,
        NARNIA_LABEL_ID
    ];

    var request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;
    var authCode;
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
                break;          
            case "AUTHCODE":
                authCode = data.authCode;
                clientID = data.clientID;
                secret = data.secret;
                timezone = data.timezone;
                var options = {};
                options.method = "POST";
                options.body = 'code=' + authCode + 
                    '&client_id=' + clientID + 
                    '&client_secret=' + secret + 
                    '&redirect_uri=http://localhost' + 
                    '&grant_type=authorization_code';
                options.headers = {
                    'Content-Type': "application/x-www-form-urlencoded",
                    'Content-Length': options.body.length
                };
                options.uri = "https://www.googleapis.com/oauth2/v4/token";
                request(options, function(error, response) {
                    if (error) {
                        Window.alert("Error: " + error + " " + JSON.stringify(response) + " Could not refresh token.");
                        return;
                    } else {
                        calendarScheduleIDs.forEach(function(entityID) {
                            sendToken(entityID, response);
                        }); 
                    }
                });
                break;
        }
    }


    // This function sends token information to the server script to keep the calendars up to date.
    function sendToken(entityID, response) {
        if (response) {
            token = response.access_token;
            refreshToken = response.refresh_token;
            tokenLifetime = response.expires_in * MS_TO_SEC;
            expireTime = new Date().valueOf() + tokenLifetime;
        }
        var timezoneOffset = (new Date().getTimezoneOffset()/MIN_PER_HR);
        Entities.callEntityServerMethod(entityID, "refreshToken", [token, expireTime, timezoneOffset, timezone]);
    }


    // This function is the listener for messages on the message mixer related to this app.
    var newMessageArrivalTime;
    var lastMessageArrivalTime = 0;
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
            if (message.type === "REFRESH TOKEN") {
                newMessageArrivalTime = Date.now();
                if (newMessageArrivalTime - lastMessageArrivalTime > (120 * MS_TO_SEC)) {
                    lastMessageArrivalTime = newMessageArrivalTime;
                    tokenCheck(message);
                }
            }
        }
    };


    // This function checks to see if the token needs refreshing based on the token sent in the message
    // If token sent is the same as the stored token, make a request to Google to refresh it.
    function tokenCheck(message) {
        var returnUUID = message.uuid;
        if (message.token === token) {
            var options = {};
            options.method = "POST";
            options.body = 'client_id=' + clientID + 
                '&client_secret=' + secret + 
                '&refresh_token='+ refreshToken + 
                '&grant_type=refresh_token';
            options.headers = {
                'Content-Type': "application/x-www-form-urlencoded",
                'Content-Length': options.body.length
            };
            options.uri = "https://www.googleapis.com/oauth2/v4/token";
            request(options, function(error, response) {
                if (error) {
                    Window.alert("Error: " + error + " " + JSON.stringify(response) + " Could not refresh token.");
                    return;
                } else {
                    calendarScheduleIDs.forEach(function(entityID) {
                        sendToken(entityID, response);
                    }); 
                }
            });
        } else {
            sendToken(returnUUID);
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
        Messages.subscribe(CHANNEL);
        Messages.messageReceived.connect(messageHandler);
    }
    startup();


    function scriptEnding() {
        Messages.unsubscribe(CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
    }
})();    
