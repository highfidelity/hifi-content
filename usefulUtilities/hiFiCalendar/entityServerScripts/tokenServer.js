//  hiFiCalendarTokenServer.js
//
//  Created by Mark Brosche on 4/18/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var SEC_PER_MIN = 60;
    var CHANNEL = "HiFi.Google.Calendar";
    var ATLANTIS_LABEL_ID = "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}";
    var JAKKU_LABEL_ID = "{2cfe3b74-e70c-44f6-bbfc-c74813acf0fd}";
    var CAPITOL_LABEL_ID = "{784c8c54-b11e-471c-9ba7-96f2bb347e98}";
    var FANTASIA_LABEL_ID = "{a79ac99b-62f6-4e58-b04c-5735c2337fcf}";
    var OZ_LABEL_ID = "{5d662a66-a250-4f18-ad1f-9cd21cd8380d}";
    var NARNIA_LABEL_ID = "{1a92909e-52f9-4099-932a-4d2d43144791}";
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
        "initializeRooms",
        "enteredDomain",
        "tokenCheck"
    ];

    
    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;
        that.trustedUser = "markb";
        that.tokenStatus = false;
        that.refreshCount = 0;
        that.roomConfigured = false;

        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name']);
        if (that.entityProperties.userData.length !== 0) {
            try {
                that.userData = JSON.parse(that.entityProperties.userData);
                if (that.userData.roomConfigured) {
                    that.roomConfigured = that.userData.roomConfigured;
                }
                if ((new Date().valueOf() + that.userData.timezoneOffset * MS_TO_SEC * SEC_PER_MIN * MIN_PER_HR) > that.userData.expireTime) {
                    that.tokenCheck(that.entityID, [that.token]);
                }
            } catch (e) {
                console.log(e, "Could not parse userData");
                return;
            }
        } else {
            console.log("Please enter appropriate userData to enable functionality of this server script.");
            return;
        }        
        that.request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;
    };


    this.enteredDomain = function(id, params) {
        if (that.entityID === id && params[0] === that.trustedUser) {
            if ((new Date().valueOf() + that.userData.timezoneOffset * MS_TO_SEC * MIN_PER_HR * MIN_PER_HR) < that.userData.expireTime) {
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "STATUS UPDATE",
                    tokenStatus: true,
                    roomConfigured: true,
                    roomConfig: that.roomConfig
                }));
            } else if (!that.roomConfigured) {
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "STATUS UPDATE",
                    tokenStatus: false,
                    roomConfigured: false,
                    roomConfig: that.roomConfig
                }));
            } else if (!that.tokenStatus) {
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "TOKEN EXPIRED",
                    roomConfig: that.roomConfig
                }));
            }
            Messages.sendMessage(CHANNEL, JSON.stringify({
                type: "ROOM DATA",
                message: that.roomConfig
            }));
        }
    };


    this.initializeRooms = function(id, params) {
        if (that.entityID === id) {
            var userData = {};
            userData.token = params[0];
            userData.refreshToken = params[1];
            userData.expireTime = params[2]; 
            userData.timezone = params[3];
            userData.timezoneOffset = params[4]; 
            userData.clientID = params[5];
            userData.secret = params[6];
            userData.roomConfig = params[7];
            that.userData = userData;
            Entities.editEntity(that.entityID, {
                userData: JSON.stringify(userData)
            });
        }
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
        Entities.callEntityMethod(entityID, "refreshToken", [that.token, that.expireTime, timezoneOffset, that.timezone]);
    };


    // This function checks to see if the token needs refreshing based on the token sent in the message
    // If token sent is the same as the stored token, make a request to Google to refresh it.
    this.tokenCheck = function(id, params) {
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
                    that.tokenStatus = false;
                    return;
                } else {
                    calendarScheduleIDs.forEach(function(entityID) {
                        that.sendToken(entityID, response);
                    }); 
                }
            });
        } else {
            that.sendToken(params[1]);
        }
    };


    this.unload = function() {

    };
});