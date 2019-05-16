//  roomScheduleServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var INTERVAL_FREQUENCY_MS = 60000;
    var EXPIRY_BUFFER_MS = 300000;
    var HOURS_PER_DAY = 24;
    var NOON_HR = 12;
    var CHANNEL = "HiFi.Google.Calendar";
    // ### figure out the token server ID
    var TOKEN_SERVER_ID = '{de23b09f-0e49-4250-8de9-394453bb8565}';
    var SIGN_TEXT_COLOR_AVAILABLE = [168, 255, 168];
    var SIGN_TEXT_COLOR_INUSE = [255, 168, 168];
    var SIGN_BACKGROUND_COLOR_AVAILABLE = [125, 255, 125];
    var SIGN_BACKGROUND_COLOR_INUSE = [255, 125, 125];

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
        
        that.roomScheduleID = userData.roomScheduleID; 
        that.roomOccupantListID = userData.roomOccupantListID; 
        if (that.entityID === that.roomScheduleID) {
            that.sentAlready = false;
            that.token = userData.token;
            that.expireTime = userData.expireTime;
            that.timezoneOffset = userData.timezoneOffset;
            that.timezoneName = userData.timezoneName;
            that.address = userData.address;
            that.roomColorID = userData.roomColorID;
            that.roomColorOccupantsID = userData.roomColorOccupantsID; 
            that.roomClockID = userData.roomClockID;
            that.roomEntityIDs = [
                that.roomScheduleID,
                that.roomColorID,
                that.roomColorOccupantsID,
                that.roomOccupantListID
            ];                
            that.room = {
                "eventList": []
            };
            that.request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;
            that.clearEventList(that.entityID);
            that.updateSignColor(that.roomEntityIDs[1], [true]);
            that.updateSignColor(that.roomEntityIDs[2], [true]);
            Entities.callEntityMethod(that.roomClockID, "refreshTimezone", [that.timezoneName, that.timezoneOffset]);
            that.googleRequest(that.token);
        } else if (that.entityID === that.roomOccupantListID) {
            that.room = {};
            that.room = {
                "occupants": []
            };
            Entities.editEntity(that.entityID, {
                text: 'loading'
            });
        }
    };


    this.refreshToken = function(id, params) {
        console.log("\n\n\n &&&&&& \n REFRESH TOKEN PARAMS: ", JSON.stringify(params));
        if (that.entityID === id) {
            if (that.interval) {
                console.log("CLEARING INTERVAL: ", that.entityProperties.name);
                Script.clearInterval(that.interval);
                that.interval = false;
            }
            if (params[5]) {
                Entities.editEntity(that.entityID, {name: "Calendar_RoomSchedule" + params[5] + that.entityID});
            }
            that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name']);
            var userData;
            if (that.entityProperties.userData.length !== 0) {
                try {
                    userData = JSON.parse(that.entityProperties.userData);
                } catch (e) {
                    console.log(e, "no userData found");
                    return;
                }
                userData.token = params[0];
                userData.expireTime = params[1];
                if (params[2]) {
                    that.timezoneOffset = userData.timezoneOffset = params[2];
                }
                if (params[3]) {
                    userData.timezoneName = that.timezoneName = params[3];
                }
                if (params[4]) {
                    userData.address = that.address = params[4];
                }
                Entities.editEntity(that.entityID, {
                    userData: JSON.stringify(userData)
                });
                that.token = params[0];
                that.expireTime = params[1];
                that.sentAlready = false;
                // # What does this do, I don't see any references to this
                if (userData.secondScheduleID) {
                    Entities.callEntityMethod(userData.secondScheduleID, "refreshToken", params);
                }
                Entities.callEntityMethod(that.roomClockID, "refreshTimezone", [that.timezoneName, that.timezoneOffset]);
                that.googleRequest(that.token);
            }
        }
    };


    this.googleRequest = function(token) {
        var tomorrowMidnight = new Date();
        tomorrowMidnight.setHours(HOURS_PER_DAY, 0, 0, 0);
        that.scheduleURL = "https://www.googleapis.com/calendar/v3/calendars/" + 
            that.address + 
            "/events?&timeMin=" + (new Date()).toISOString() +
            "&timeMax=" + tomorrowMidnight.toISOString() +
            "&showDeleted=" + false + 
            "&singleEvents=" + true +
            "&maxResults=2" +
            "&orderBy=startTime" +
            "&access_token=" + token;
            console.log(" that.scheduleURL",  that.scheduleURL)
        if (!that.interval) {
            that.requestScheduleData(that.scheduleURL);
        } else {
            Script.clearInterval(that.interval);
            that.requestScheduleData(that.scheduleURL);
        }
    };


    this.requestScheduleData = function(scheduleURL) {
        that.request(scheduleURL, function (error, response) {
            if (error) {
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "ERROR",
                    entityName: that.entityProperties.name,
                    errorMessage: error,
                    actionAttempted: "Requesting schedule from Google - Initial"
                }));
                if (that.interval) {
                    Script.clearInterval(that.interval);
                    that.interval = false;
                } 

                Entities.callEntityMethod(TOKEN_SERVER_ID, "tokenCheck", [that.token, that.entityID]);
                return;
            } else {
                that.clearEventList(that.entityID);
                var events = response.items;
                if (events.length > 0) {
                    for (var i = 0; i < events.length; i++) {
                        var event = events[i];
                        var start = event.start.dateTime;
                        var end = event.end.dateTime;
                        var summary = event.summary;
                        if (!(start && end)) {
                            console.log("Event received without a start and end dateTime!");
                            continue;
                        }        
                        var startTimestamp = that.googleDateToUTCDate(start);
                        var endTimestamp = that.googleDateToUTCDate(end);
          
                        that.postEvents(that.entityID, summary, startTimestamp, endTimestamp);
                    }
                } else {
                    Entities.editEntity(that.entityID, {text: "Nothing on the schedule for this room today."});
                }
            } 
        });
        that.interval = Script.setInterval(function() {
            if ((new Date()).valueOf() > (that.expireTime - EXPIRY_BUFFER_MS) && !that.sentAlready) {
                that.sentAlready = true;
                console.log("CALLING FOR NEW TOKEN", that.entityProperties.name);
                Entities.callEntityMethod(TOKEN_SERVER_ID, "tokenCheck", [that.token, that.entityID]);
            } else if ((new Date()).valueOf() > (that.expireTime)) {
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "ERROR",
                    entityName: that.entityProperties.name,
                    errorMessage: "Token expired without refreshing",
                    actionAttempted: "Requesting refresh token from Token Server"
                }));
                Script.clearInterval(that.interval);
                that.interval = false;
                return;
            }
            that.request(scheduleURL, function (error, response) {
                if (error) {
                    console.log("Error: ", error," could not complete request for ", that.entityProperties.name);
                    Script.clearInterval(that.interval);
                    that.interval = false;
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "ERROR",
                        entityName: that.entityProperties.name,
                        errorMessage: error,
                        actionAttempted: "Requesting schedule from Google - Loop"
                    }));
                    return;
                } else {
                    that.clearEventList(that.entityID);
                    var events = response.items;
                    if (events.length > 0) {
                        for (var i = 0; i < events.length; i++) {
                            var event = events[i];
                            var start = event.start.dateTime;
                            var end = event.end.dateTime;
                            var summary = event.summary;
                            if (!(start && end)) {
                                console.log("Event received without a start and end dateTime!");
                                continue;
                            }        
                            var startTimestamp = that.googleDateToUTCDate(start);
                            var endTimestamp = that.googleDateToUTCDate(end);
              
                            that.postEvents(that.entityID, summary, startTimestamp, endTimestamp);
                        }
                    } else {
                        Entities.editEntity(that.entityID, {text: "Nothing on the schedule for this room today."});
                    }
                } 
            });
        }, INTERVAL_FREQUENCY_MS);
    };


    var googleDate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})$/;
    var MINS_PER_HOUR = 60;
    this.googleDateToUTCDate = function(d) {
        var m = googleDate.exec(d);
        var year = +m[1];
        var month = +m[2];
        var day = +m[3];
        var hour = +m[4];
        var minute = +m[5];
        var second = +m[6];
        var msec = 0;
        var tzHour = +m[7];
        var tzMin = +m[8];
        var tzOffset = new Date().getTimezoneOffset() + tzHour * MINS_PER_HOUR + tzMin;
        var date = new Date(Date.UTC(year, month - 1, day, hour, minute - tzOffset, second, msec));
        return date;
    };


    this.postEvents = function(id, summary, start, end) {
        if (id === that.entityID) {
            var startTimestamp = start;
            var endTimestamp = end;

            var tempEvent = {
                summary: summary,
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp
            };

            that.room.eventList.push(tempEvent);

            var printedSchedule = '';
            that.room.eventList.forEach(function(event) {
                var startHours;
                var endHours;
                if (event.startTimestamp.getHours() - that.timezoneOffset <= 0) {
                    startHours = event.startTimestamp.getHours() - that.timezoneOffset + NOON_HR;
                } else if (event.startTimestamp.getHours() - that.timezoneOffset <= (NOON_HR)) {
                    startHours = event.startTimestamp.getHours() - that.timezoneOffset;
                } else {
                    startHours = event.startTimestamp.getHours() - that.timezoneOffset - NOON_HR;
                }
                if (event.endTimestamp.getHours() - that.timezoneOffset <= 0) {
                    endHours = event.endTimestamp.getHours() - that.timezoneOffset + NOON_HR;
                } else if (event.endTimestamp.getHours() - that.timezoneOffset <= (NOON_HR)) {
                    endHours = event.endTimestamp.getHours() - that.timezoneOffset;                    
                } else {
                    endHours = event.endTimestamp.getHours() - that.timezoneOffset - NOON_HR;
                }
                
                var startAmPm;
                var endAmPm;
                if (event.startTimestamp.getHours() - that.timezoneOffset < 0) {
                    startAmPm = "pm";
                } else if (event.startTimestamp.getHours() - that.timezoneOffset < (NOON_HR)) {
                    startAmPm = "am";
                } else {
                    startAmPm = "pm";
                }
                if (event.endTimestamp.getHours() - that.timezoneOffset < 0) {
                    endAmPm = "pm";
                } else if (event.endTimestamp.getHours() - that.timezoneOffset < (NOON_HR)) {
                    endAmPm = "am";            
                } else {
                    endAmPm = "pm";
                }
                printedSchedule = printedSchedule + 
                event.summary +
                "\n" +
                startHours + 
                ':' + 
                (JSON.stringify(event.startTimestamp.getMinutes()).length > 1 ? 
                    event.startTimestamp.getMinutes() :
                    event.startTimestamp.getMinutes() + "0") + 
                ' ' + 
                startAmPm +
                ' - ' + 
                endHours + 
                ':' + 
                (JSON.stringify(event.endTimestamp.getMinutes()).length > 1 ? 
                    event.endTimestamp.getMinutes() :
                    event.endTimestamp.getMinutes() + "0") + 
                ' ' + 
                endAmPm +
                ' ' + that.timezoneName + '\n\n';                
            });            
            Entities.editEntity(id, {text: printedSchedule});
            that.setBusyLight();
        }
    };


    this.clearEventList = function(id) {
        that.room.eventList = [];
        Entities.editEntity(id, {text: ""});
    };


    this.setBusyLight = function() {
        var now = new Date();
        var isAvailable = true;
        if (typeof that.room.eventList[0] === "object") {
            var endValue = that.room.eventList[0].endTimestamp;
            var startValue = that.room.eventList[0].startTimestamp;
            if (now <= endValue && now >= startValue) {
                isAvailable = false;
            } else {
                isAvailable = true;
            }
        } else {
            isAvailable = true;
        }
        that.updateSignColor(that.roomEntityIDs[1], [isAvailable]);
        that.updateSignColor(that.roomEntityIDs[2], [isAvailable]);
    };

    
    this.updateSignColor = function(id, params) {
        if (id === that.roomEntityIDs[1]) {    
            if (params[0] === true) {
                Entities.editEntity(id, {
                    "text": 'AVAILABLE', 
                    "textColor": [0,0,0], 
                    "textAlpha": 1, 
                    "backgroundColor": SIGN_BACKGROUND_COLOR_AVAILABLE
                });
            } else {
                Entities.editEntity(id, {
                    "text": 'IN USE', 
                    "textColor": [0,0,0], 
                    "textAlpha": 1, 
                    "backgroundColor": SIGN_BACKGROUND_COLOR_INUSE
                });
            }
        } else {
            if (params[0] === true) {
                Entities.editEntity(id, {
                    "text": 'occupants', 
                    "textColor": SIGN_TEXT_COLOR_AVAILABLE
                });
            } else {
                Entities.editEntity(id, {
                    "text": 'occupants', 
                    "textColor": SIGN_TEXT_COLOR_INUSE
                });
            } 
        }
    };      

    this.unload = function() {
        if (that.interval) {
            Script.clearInterval(that.interval);
            that.interval = false;
        }
    };
});