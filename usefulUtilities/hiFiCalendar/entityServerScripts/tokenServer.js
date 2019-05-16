//  tokenServer(hiFiCalendarTokenServer.js)
//
//  Created by Mark Brosche on 4/18/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    console.log("\n\n\n in token server3");
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var SEC_PER_MIN = 60;
    var CHANNEL = "HiFi.Google.Calendar";
    // # Do these need to be updated?  What is a label ID?  
    var ROOMSCHEDULE_ATLANTIS_HQ = "{4b6f47fe-646f-4b2c-9a7b-c74f3c47a105}";
    var ROOMSCHEDULE_ATLANTIS_MR = "{52a01b43-0200-45d1-bd58-aab0e658bdb3}";
    var ROOMSCHEDULE_CAPITOL_HQ = "{784c8c54-b11e-471c-9ba7-96f2bb347e98}";
    var ROOMSCHEDULE_CAPITOL_MR = "{4623f8d6-4283-4192-a25c-461c3e0f72cf}";
    var ROOMSCHEDULE_JAKU_HQ = "{2cfe3b74-e70c-44f6-bbfc-c74813acf0fd}";
    var ROOMSCHEDULE_JAKU_MR = "{3ff72a7e-20cd-4c24-8c13-0ca85f9432ba}";
    var ROOMSCHEDULE_FANTASIA_HQ = "{a79ac99b-62f6-4e58-b04c-5735c2337fcf}";
    var ROOMSCHEDULE_FANTASIA_MR = "{244aff65-f4c3-4609-92e5-211b9537cbe7}";
    var ROOMSCHEDULE_NARNIA_HQ = "{1a92909e-52f9-4099-932a-4d2d43144791}";
    var ROOMSCHEDULE_NARNIA_MR = "{9bf4542e-24c6-4356-9394-68c025b5a29e}";
    var ROOMSCHEDULE_OZ_HQ = "{5d662a66-a250-4f18-ad1f-9cd21cd8380d}";
    var ROOMSCHEDULE_OZ_MR = "{235eaa39-d3af-4b8c-8f9c-29b79bb832af}";
    
    var calendarScheduleIDs = [
        ROOMSCHEDULE_ATLANTIS_HQ,
        ROOMSCHEDULE_ATLANTIS_MR,
        ROOMSCHEDULE_CAPITOL_HQ,
        ROOMSCHEDULE_CAPITOL_MR,
        ROOMSCHEDULE_JAKU_HQ,
        ROOMSCHEDULE_JAKU_MR,
        ROOMSCHEDULE_FANTASIA_HQ,
        ROOMSCHEDULE_FANTASIA_MR,
        ROOMSCHEDULE_OZ_HQ,
        ROOMSCHEDULE_OZ_MR,
        ROOMSCHEDULE_NARNIA_HQ,
        ROOMSCHEDULE_NARNIA_MR
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
        // # need to change this to be dynamic trusted user
        that.trustedUser = "miladn";
        that.tokenStatus = false;
        that.refreshCount = 0;
        that.roomConfigured = false;

        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name']);
        that.request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;

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
    };


    this.enteredDomain = function(id, params) {
        if (that.entityID === id) {
            if ((new Date().valueOf() + that.userData.timezoneOffset * MS_TO_SEC * MIN_PER_HR * MIN_PER_HR) < that.userData.expireTime) {
                console.log("TOKEN SERVER SENDING STATUS UPDATE");
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "STATUS UPDATE",
                    tokenStatus: true,
                    roomConfigured: true,
                    roomConfig: that.roomConfig
                }));
            } else if (!that.roomConfigured) {
                console.log("TOKEN SERVER SENDING STATUS UPDATE- ROOM NOT CONFIGURED");
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "STATUS UPDATE",
                    tokenStatus: false,
                    roomConfigured: false,
                    roomConfig: that.roomConfig
                }));
            } else if (!that.tokenStatus) {
                console.log("TOKEN SERVER SENDING TOKEN EXPIRED");
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "TOKEN EXPIRED",
                    roomConfig: that.roomConfig
                }));
            } else {
                console.log("TOKEN SERVER SENDING ROOM CONFIG");
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "ROOM CONFIG",
                    roomConfig: that.roomConfig
                }));
            }

        }
    };

    this.initializeRooms = function(id, params) {
        console.log("IN INITIALIZE ROOM FROM TOKEN SERVER", id);
        if (that.entityID === id) {
            console.log("params for room", JSON.stringify(params));
            var userData = {};
            that.token = userData.token = params[0];
            that.refreshToken = userData.refreshToken = params[1];
            that.expireTime = userData.expireTime = params[2]; 
            that.timezone = userData.timezone = params[3];
            that.timezoneOffset = userData.timezoneOffset = params[4]; 
            that.clientID = userData.clientID = params[5];
            that.secret = userData.secret = params[6];
            that.roomConfig = userData.roomConfig = JSON.parse(params[7]);

            that.userData = userData;
            Entities.editEntity(that.entityID, {
                userData: JSON.stringify(userData)
            });
            calendarScheduleIDs.forEach(function(entity) {
                var address;
                var calendarName;
                userData.roomConfig.forEach(function(room) {
                    console.log("room", JSON.stringify(room));
                    console.log("IDZ:", room.uuid, entity);
                    if (room.uuid === entity) {
                        console.log("FOUND A MATCH")
                        address = room.address;
                        calendarName = room.name;
                        console.log("calendarName is ", calendarName);
                        console.log("calendar address is ", address);

                    }
                    Entities.callEntityMethod(entity, "refreshToken", [
                        that.token, 
                        that.expireTime, 
                        that.timezoneOffset, 
                        that.timezone,
                        address,
                        calendarName
                    ]);
                });

            });
        }
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
                        type: "ERROR",
                        entityName: that.entityProperties.name,
                        errorMessage: error,
                        actionAttempted: "Refreshing Oauth Token with Google"
                    }));
                    that.tokenStatus = false;
                    return;
                } else {
                    that.expireTime = new Date().valueOf() + response.expires_in * MS_TO_SEC + that.userData.timezoneOffset * MS_TO_SEC * MIN_PER_HR * MIN_PER_HR;
                    that.token = response.access_token;
                    that.refreshCount++;
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "REFRESH SUCCESS",
                        entityName: that.entityProperties.name,
                        count: that.refreshCount
                    }));
                    calendarScheduleIDs.forEach(function(entity) {
                        Entities.callEntityMethod(entity, "refreshToken", [
                            that.token, 
                            that.expireTime
                        ]);
                    }); 
                }
            });
        } else {
            Entities.callEntityMethod(params[1], "refreshToken", [
                that.token,
                that.expireTime
            ]);
        }
    };


    this.unload = function() {

    };
});