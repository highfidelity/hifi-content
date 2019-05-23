//  tokenServer.js
//
//  Created by Mark Brosche on 4/18/2019
//  Handed off to Milad Nazeri on 5-15-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var CONFIG = Script.require("../calendarConfig.json?" + Date.now());
    var MS_TO_SEC = 1000;
    var MIN_PER_HR = 60;
    var SEC_PER_MIN = 60;
    var CHANNEL = "HiFi.Google.Calendar";

    var calendarScheduleIDs = [];
    for (var room in CONFIG.ROOMS) {
        calendarScheduleIDs.push(CONFIG.ROOMS[room].MAIN.roomScheduleID);
    }

    var that;

    this.remotelyCallable = [
        "initializeRooms",
        "enteredDomain",
        "tokenCheck"
    ];


    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;

        that.request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;

        that.tokenStatus = false;
        that.refreshCount = 0;
        that.roomConfigured = false;

        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name', 'privateUserData']);

        if (that.entityProperties.userData.length !== 0) {
            try {
                that.userData = JSON.parse(that.entityProperties.userData);
                that.privateUserData = that.entityProperties.privateUserData;
                if (that.privateUserData.length > 0) {
                    that.privateUserData = JSON.parse(that.entityProperties.privateUserData);
                    that.token = that.privateUserData.token;
                    that.refreshToken = that.privateUserData.refreshToken;
                }
                if (that.userData.roomConfigured) {
                    that.roomConfigured = that.userData.roomConfigured;
                }
                if ((new Date().valueOf() + that.userData.timezoneOffset * MS_TO_SEC * SEC_PER_MIN * MIN_PER_HR) > that.userData.expireTime) {
                    calendarScheduleIDs.forEach(function(calendar){
                        that.tokenCheck(that.entityID, [that.privateUserData.token, calendar]);
                    });
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
        }
    };


    // After the app is finished linking, it calls initialize rooms to refresh all of their tokens
    this.initializeRooms = function(id, params) {
        if (that.entityID === id) {
            var userData = {};
            var privateUserData = {};

            that.token = privateUserData.token = params[0];
            that.refreshToken = privateUserData.refreshToken = params[1];
            that.expireTime = userData.expireTime = params[2]; 
            that.timezone = userData.timezone = params[3];
            that.timezoneOffset = userData.timezoneOffset = params[4]; 
            try {
                that.roomConfig = userData.roomConfig = JSON.parse(params[5]);
            } catch (e){
                console.log("problems parsing room config", e);
            }

            that.userData = userData;
            Entities.editEntity(that.entityID, {
                userData: JSON.stringify(userData),
                privateUserData: JSON.stringify(privateUserData)
            });

            calendarScheduleIDs.forEach(function(entity) {
                var address;
                userData.roomConfig.forEach(function(room) {
                    if (room.uuid === entity) {
                        address = room.address;
                        Entities.callEntityMethod(entity, "refreshToken", [
                            that.token, 
                            that.expireTime, 
                            that.timezoneOffset, 
                            that.timezone,
                            address
                        ]);

                    }

                });

            });
        }
    };


    // This function checks to see if the token needs refreshing based on the token sent in the message
    // If token sent is the same as the stored token, make a request to Google to refresh it.
    this.tokenCheck = function(id, params) {
        if (params[0] === that.token || (!params[0] && !that.token)) {
            that.request({
                uri: "https://highfidelity.co/hifiCalendar/api/request_token",
                method: "POST",
                json: true,
                body: {
                    refresh_token: that.refreshToken
                }
            }, function(error, response) {
                if (error || response.status !== "success") {
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
                    try {
                        that.privateUserData = Entities.getEntityProperties(that.entityID, ['privateUserData']).privateUserData;
                        if (that.privateUserData.length > 0) {
                            that.privateUserData = JSON.parse(that.privateUserData);
                        } else {
                            that.privateUserData = {};
                        }
                        that.privateUserData.token = that.token;
                        Entities.editEntity(that.entityID, {privateUserData: JSON.stringify(that.privateUserData)});
                    } catch (e) {
                        console.log("error parsing private user data in tokenServer.js");
                    }
                    
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "REFRESH SUCCESS",
                        entityName: that.entityProperties.name,
                        count: that.refreshCount
                    }));
                    Entities.callEntityMethod(params[1], "refreshToken", [
                        that.token,
                        that.expireTime
                    ]);
                }
            });
        } else {
            Entities.callEntityMethod(params[1], "refreshToken", [
                that.token,
                that.expireTime
            ]);
        }
    };
});