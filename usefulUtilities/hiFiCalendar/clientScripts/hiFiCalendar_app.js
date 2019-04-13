// hiFiCalendar_app.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
/*
Here's what I'd expect here:
1. The very first time your HTML UI is open, OR whenever you need to manually kickoff the token process,
    you'll get here (the HTML UI's JS will send the "TOKEN" message to the app JS). Included in that message data is:
        - The token itself
        - The expiration time of the token, and the time until that token will expire
    You will need this client script to keep track of the tokens it has sent during the session.
2. Send that data to each of the calendar label entities. You could store the data in userData, OR you could store the
    data in the RAM of the ESS (which would be safer, but slightly more error-prone - your call)
3. Tell each calendar label entity to immediately refresh the calendar data (you can do that with Entities.callEntityServerMethod()
    after defining some remotelyCallable method on the server script). When this call is received, the server
    script will also cancel any "auto-refresh-calendar-events" timer that's currently active.
4. Also tell each calendar label entity to kick off a timer that will expire N seconds before the OAuth token expires. When
    that timer expires, the server script will send a message (over the messages mixer, probably) to all clients able
    to accept that method, which will hopefully only be you. The message data will contain the OAuth token that the server script
    is currently using.
5. When your client script receives this message, it will check to see if it's already tried to refresh that token (see the last
    sentence in (1)). If it hasn't, it should use the request module to submit a POST request to `https://www.googleapis.com/oauth2/v4/token`
    to renew that token. Once the response from Google is received, it'll send a message to the calendars that requested that THAT
    specific token be refreshed. (So, this script will have to keep track of the old version and refreshed version of each token).
6.  When this call is received, the server script will immediately refresh calendar data.
    It'll also cancel any "auto-refresh-calendar-events" timer that's currently active.
*/
(function() {
    // This function decides how to handle web events from the tablet UI.
    // used by 'ui' in startup()
    var CHANNEL = "HiFi.Google.Calendar";
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var ATLANTIS_LABEL_ID = "{24b7b274-25a2-4dde-a241-f90da21de4c8}";
    var JAKKU_LABEL_ID = "{990c5409-dedf-438f-b0f8-7eb0d6740b60}";
    var CAPITOL_LABEL_ID = "{ea7a6b67-332e-4d8c-ba88-b5e96ff17cfc}";
    var FANTASIA_LABEL_ID = "{1cad2f9e-26d5-4ac3-b8d1-ebc4cc6e68df}";
    var OZ_LABEL_ID = "{1d064179-f32d-49bd-a6f4-77a1a18c46e0}";
    var NARNIA_LABEL_ID = "{8a568c27-519f-48d2-b361-9a08468cdc17}";
    var calendarScheduleIDs = [
        ATLANTIS_LABEL_ID
    ];

    var request = Script.require('request').request;
    var authCode;
    var token;
    var tokenLifetime;
    var expireTime;
    var clientID;
    var refreshToken;
    var timezone;
    var secret;
    function onWebMessage(data) {
        // EventBridge message from HTML script.
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                break;          
            case "AUTHCODE":
                console.log(JSON.stringify(data));
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
                console.log(JSON.stringify(options));
                request(options, function(error, response) {
                    if (error) {
                        console.log("FAILED REQUEST:   ", error, JSON.stringify(response));
                        return;
                    } else {
                        console.log("SUCCESS!!!!: ", error, JSON.stringify(response));
                        token = response.access_token;
                        refreshToken = response.refresh_token;
                        tokenLifetime = response.expires_in;
                        expireTime = new Date().valueOf() + tokenLifetime * MS_TO_SEC;

                        calendarScheduleIDs.forEach(function(entityID) {
                            sendToken(entityID, {
                                'token': token,
                                'expires_at': expireTime,
                                'timezone': timezone
                            });
                        }); 
                    }
                });
                break;
        }
    }

    function sendToken(entityID, data) {
        console.log("SENDING TOKEN");
        var userData = Entities.getEntityProperties(entityID, ['userData']).userData;
        if (userData) {
            try {
                userData = JSON.parse(userData);
            } catch (e) {
                console.log(e, "Could not parse userData");
                return;
            }
            userData.token = data.token;
            userData.expireTime = data.expires_at;
            userData.timezoneOffset = (new Date().getTimezoneOffset()/MIN_PER_HR),
            userData.timezoneName = data.timezone;
        } else {
            console.log("No userData found");
            userData = {
                token: data.token,
                expireTime: data.expires_at,
                timezoneOffset: (new Date().getTimezoneOffset()/MIN_PER_HR),
                timezoneName: data.timezone
            };
        }
        console.log("SENDING USER DATA: ", JSON.stringify(userData), " TO ", entityID);
        Entities.editEntity(entityID, {
            userData: JSON.stringify(userData)
        });
        Entities.callEntityServerMethod(entityID, "refreshToken");
    }


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
                    tokenCheck(message);
                }
            }
        }
    };

    function tokenCheck(message) {
        var returnUUID = message.uuid;
        if (message.token === token) {
            console.log("SENDING HTTP REQUEST");
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
                    console.log("FAILED REFRESH REQUEST:   ", error, JSON.stringify(response));
                    return;
                } else {
                    console.log("REFRESH SUCCESS!!!!   ", error, JSON.stringify(response));
                    token = response.acces_token;
                    expireTime = response.expires_at;
                    calendarScheduleIDs.forEach(function(entityID) {
                        sendToken(entityID, {
                            'token': token,
                            'expires_at': expireTime,
                            'timezone': timezone
                        });
                    }); 
                }
            });
        } else {
            console.log("SENDING CURRENT TOKEN");
            sendToken(returnUUID, {
                'token': token,
                'expires_at': expireTime,
                'timezone': timezone
            });
        }
    }


    // This function loads appui and connects to the needed signals
    var AppUi = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUi({
            home: "http://localhost/test.html?v6",
            buttonName: "GCAL", // The name of your app
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
