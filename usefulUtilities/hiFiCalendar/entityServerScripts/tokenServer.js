//  hiFiCalendarTokenServer.js
//
//  Created by Mark Brosche on 4/18/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var INTERVAL_FREQUENCY_MS = 60000;
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var EXPIRY_BUFFER_MS = 300000;
    var HOURS_PER_DAY = 24;
    var CHANNEL = "HiFi.Google.Calendar";
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
    var that;

    this.remotelyCallable = [
        "refreshToken"
    ];

    
    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name']);
        var userData;
        if (that.entityProperties.userData.length !== 0) {
            try {
                userData = JSON.parse(that.entityProperties.userData);
            } catch (e) {
                console.log(e, "Could not parse userData");
                return;
            }
        } else {
            console.log("Please enter appropriate userData to enable functionality of this server script.");
            return;
        }        
        that.request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;
        Entities.callEntityMethod(that.roomClockID, "refreshTimezone", [that.timezoneName, that.timezoneOffset]);
    };


    this.sendToken = function(entityID, response) {
        if (response) {
            that.token = response.access_token;
            that.refreshToken = response.refresh_token;
            that.tokenLifetime = response.expires_in * MS_TO_SEC;
            var UTCdate = new Date();
            var date = UTCdate.setHours(UTCdate.getHours() - that.timezoneOffset);
            that.expireTime = date + that.tokenLifetime;
        }
        var timezoneOffset = (new Date().getTimezoneOffset()/MIN_PER_HR);
        Entities.callEntityServerMethod(entityID, "refreshToken", [that.token, that.expireTime, timezoneOffset, that.timezone]);
    };


    // This function checks to see if the token needs refreshing based on the token sent in the message
    // If token sent is the same as the stored token, make a request to Google to refresh it.
    this.tokenCheck = function(id, params) {
        var returnUUID = params[1];
        if (params[0] === that.token) {
            var options = {};
            options.method = "POST";
            options.body = 'client_id=' + that.clientID + 
                '&client_secret=' + that.secret + 
                '&refresh_token='+ that.refreshToken + 
                '&grant_type=refresh_token';
            options.headers = {
                'Content-Type': "application/x-www-form-urlencoded",
                'Content-Length': options.body.length
            };
            options.uri = "https://www.googleapis.com/oauth2/v4/token";
            that.request(options, function(error, response) {
                if (error) {
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "CALENDAR ERROR",
                        message: "Error: " + error + " " + JSON.stringify(response) + " Could not refresh token."
                    }));
                    return;
                } else {
                    that.calendarScheduleIDs.forEach(function(entityID) {
                        that.sendToken(entityID, response);
                    }); 
                }
            });
        } else {
            that.sendToken(returnUUID);
        }
    };


    this.unload = function() {
        if (that.interval) {
            Script.clearInterval(that.interval);
            that.interval = false;
        }
    };
});