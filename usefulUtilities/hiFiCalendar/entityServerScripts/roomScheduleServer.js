//  roomScheduleServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Handed off to Milad Nazeri on 5-15-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var CHANNEL = "HiFi.Google.Calendar";
    var TOKEN = 0;
    var EXPIRE_TIME = 1;
    var TIMEZONE_OFFSET = 2;
    var TIMEZONE_NAME = 3;
    var ADDRESS = 4;
    var INTERVAL_FREQUENCY_MS = 60000;
    var EXPIRY_BUFFER_MS = 300000;
    var HOURS_PER_DAY = 24;
    var NOON_HR = 12;
    var SIGN_TEXT_COLOR_AVAILABLE = [168, 255, 168];
    var SIGN_TEXT_COLOR_INUSE = [255, 168, 168];
    var SIGN_BACKGROUND_COLOR_AVAILABLE = [125, 255, 125];
    var SIGN_BACKGROUND_COLOR_INUSE = [255, 125, 125];
    var REFRESH_TIMEOUT = 1920000; // 32 minutes
    var SCRIPT_NAME = "roomScheduleServer.js";
    var that = this;

    this.remotelyCallable = [
        "refreshToken",
        "secondarySync",
        "updateTimeZoneInfo"
    ];


    this.preload = function(entityID) {
        that.entityID = entityID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['privateUserData', 'userData', 'name']);
        var userData;
        var privateUserData;

        try {
            if (that.entityProperties.userData.length > 0) {
                userData = JSON.parse(that.entityProperties.userData);
            } else {
                userData = {};
            }
            if (that.entityProperties.privateUserData.length > 0) {
                privateUserData = JSON.parse(that.entityProperties.privateUserData);
            } else {
                privateUserData = {};
            }
        } catch (e) {
            console.log(e, "Could not parse userData");
            return;
        }

        that.request = Script.require('https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js').request;

        that.room = {
            "eventList": []
        };

        that.TOKEN_SERVER_ID = userData.tokenServerID;
        that.secondaryRoomSchedule = userData.secondaryRoomSchedule;
        that.roomScheduleID = userData.roomScheduleID; 
        that.roomOccupantsListID = userData.roomOccupantsListID;
        that.roomColorID = userData.roomColorID;
        that.roomColorOccupantsID = userData.roomColorOccupantsID; 
        that.roomClockID = userData.roomClockID;
        that.roomEntityIDs = [
            that.roomScheduleID,
            that.roomColorID,
            that.roomColorOccupantsID,
            that.roomOccupantsListID
        ];
        that.timezoneName = userData.timezoneName;
        that.address = userData.address;
        that.expireTime = userData.expireTime;

        that.isSecondarySchedule = userData.isSecondarySchedule;

        that.token = privateUserData.token;
        that.timezoneOffset = +userData.timezoneOffset;

        that.clearEventList(that.entityID);
        that.updateSignColor(that.roomEntityIDs[1], [true]);
        that.updateSignColor(that.roomEntityIDs[2], [true]);

        that.sentAlready = false;


        if (that.secondaryRoomSchedule){
            Entities.callEntityMethod(that.secondaryRoomSchedule, "updateTimeZoneInfo", [that.timezoneName, that.timezoneOffset ]);
        }

        if (that.token && !that.isSecondarySchedule) {
            that.googleRequest(that.token);
        }

        if (!that.isSecondarySchedule) {
            Entities.callEntityMethod(that.roomClockID, "refreshTimezone", [that.timezoneName, that.timezoneOffset]);
        }

    };


    // Make sure the secondary calendar has the correct timezone for it's ui update
    that.updateTimeZoneInfo = function(id, params) {
        var userData = Entities.getEntityProperties(that.entityID, ['userData']).userData;
        try {
            if (userData.length > 0) {
                userData = JSON.parse(userData);
            } else {
                userData = {};
            }
        } catch (e) {
            console.log("trouble parsing userData");
        }
        userData.timezoneName = params[0];
        userData.timezoneOffset = params[1];

        Entities.editEntity(that.entityID, { userData: JSON.stringify(userData) });
    };


    // If this is a secondary display, then this will update the UI without making a call
    this.secondarySync = function(id, params) {
        var events = JSON.parse(params[0]);

        that.createEvents(events);
    };


    // Called when the token server has a new token to give the calendar schedules
    this.refreshToken = function(id, params) {
        if (that.entityID === id) {
            that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData', 'name']);

            if (that.interval) {
                Script.clearInterval(that.interval);
                that.interval = false;
            }

            var userData;
            var privateUserData = {};
            if (that.entityProperties.userData.length !== 0) {
                try {
                    userData = JSON.parse(that.entityProperties.userData);
                } catch (e) {
                    console.log(e, "no userData found");
                }
            } else {
                userData = {};
            }

            that.token = privateUserData.token = params[TOKEN];
            that.expireTime = userData.expireTime = params[EXPIRE_TIME];
            that.timezoneOffset = userData.timezoneOffset = +params[TIMEZONE_OFFSET];
            that.timezoneName = userData.timezoneName = params[TIMEZONE_NAME];
            that.address = userData.address = params[ADDRESS];

            Entities.editEntity(that.entityID, {
                userData: JSON.stringify(userData),
                privateUserData: JSON.stringify(privateUserData)
            });

            that.sentAlready = false;

            Entities.callEntityMethod(that.roomClockID, "refreshTimezone", [that.timezoneName, that.timezoneOffset]);

            that.googleRequest(that.token);
        }
    };

    
    // Prepare the API request to google 
    this.googleRequest = function(token) {
        var tomorrowMidnight = new Date();
        tomorrowMidnight.setHours(HOURS_PER_DAY, 0, 0, 0);
        that.scheduleURL = encodeURI("https://www.googleapis.com/calendar/v3/calendars/" + 
            that.address + 
            "/events?&timeMin=" + (new Date()).toISOString() +
            "&timeMax=" + tomorrowMidnight.toISOString() +
            "&showDeleted=" + false + 
            "&singleEvents=" + true +
            "&maxResults=2" +
            "&orderBy=startTime" +
            "&access_token=" + token);
        if (!that.interval) {
            that.requestScheduleData(that.scheduleURL);
        } else {
            Script.clearInterval(that.interval);
            that.requestScheduleData(that.scheduleURL);
        }
    };


    // Call the google API and get back the list of events to post
    var RETRY_TIMEOUT = 5000;
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
                
                return;
            } else {
                var events = response.items;
                that.createEvents(events);
            }
        });
        that.interval = Script.setInterval(function() {

            if ((new Date()).valueOf() > (that.expireTime - EXPIRY_BUFFER_MS) && !that.sentAlready) {
                that.sentAlready = true;
                Entities.callEntityMethod(that.TOKEN_SERVER_ID, "tokenCheck", [that.token, that.entityID]);
            } else if ((new Date()).valueOf() > (that.expireTime)) {
                Messages.sendMessage(CHANNEL, JSON.stringify({
                    type: "ERROR",
                    entityName: that.entityProperties.name,
                    errorMessage: "Token expired without refreshing",
                    actionAttempted: "Requesting refresh token from Token Server"
                }));
                if (that.interval) {
                    Script.clearInterval(that.interval);
                    that.interval = false;
                }
                return;
            }
            that.request(scheduleURL, function (error, response) {
                if (error) {
                    if (that.interval) {
                        Script.clearInterval(that.interval);
                        that.interval = false;
                    } 
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "ERROR",
                        entityName: that.entityProperties.name,
                        errorMessage: error,
                        actionAttempted: "Requesting schedule from Google - Loop"
                    }));
                    return;
                } else {
                    var events = response.items;
                    that.createEvents(events);
                } 
            });
        }, INTERVAL_FREQUENCY_MS);
    };


    // handle preparing the event post
    this.createEvents = function(events) {
        that.clearEventList(that.entityID);
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

        if (that.secondaryRoomSchedule){
            Entities.callEntityMethod(that.secondaryRoomSchedule, "updateTimeZoneInfo", [that.timezoneName, that.timezoneOffset ]);
            Entities.callEntityMethod(that.secondaryRoomSchedule, "secondarySync", [JSON.stringify(events)]);
        }

        Entities.callEntityMethod(that.roomClockID, "refreshTimezone", [that.timezoneName, that.timezoneOffset]);
    };


    // Format the given google date from the response
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


    // Update the calendar UI when we have the latest calendar information
    this.postEvents = function(id, summary, start, end) {
        if (id === that.entityID) {
            var printedSchedule = '';

            var startTimestamp = start;
            var endTimestamp = end;

            var tempEvent = {
                summary: summary,
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp
            };

            that.room.eventList.push(tempEvent);

            that.room.eventList.forEach(function(event) {
                var startHours;
                var endHours;

                var eventStartHour = +event.startTimestamp.getHours();
                var eventEndHour = +event.endTimestamp.getHours();
                if (eventStartHour + that.timezoneOffset <= 0) {
                    startHours = eventStartHour + that.timezoneOffset + NOON_HR;
                } else if (eventStartHour + that.timezoneOffset <= (NOON_HR)) {
                    startHours = eventStartHour + that.timezoneOffset;
                } else {
                    startHours = eventStartHour + that.timezoneOffset - NOON_HR;
                }

                if (eventEndHour + that.timezoneOffset <= 0) {
                    endHours = eventEndHour + that.timezoneOffset + NOON_HR;
                } else if (eventEndHour + that.timezoneOffset <= (NOON_HR)) {
                    endHours = eventEndHour + that.timezoneOffset;
                } else {
                    endHours = eventEndHour + that.timezoneOffset - NOON_HR;
                }

                var startAmPm;
                var endAmPm;

                if (eventStartHour + that.timezoneOffset < 0) {
                    startAmPm = "pm";
                } else if (eventStartHour + that.timezoneOffset < (NOON_HR)) {
                    startAmPm = "am";
                } else {
                    startAmPm = "pm";
                }

                if (eventEndHour + that.timezoneOffset < 0) {
                    endAmPm = "pm";
                } else if (eventEndHour + that.timezoneOffset < (NOON_HR)) {
                    endAmPm = "am";            
                } else {
                    endAmPm = "pm";
                }

                printedSchedule = 
                    printedSchedule + 
                    event.summary +
                    "\n" +
                    startHours + 
                    ':' + 
                    (event.startTimestamp.getMinutes() < 10 ?
                        "0" + event.startTimestamp.getMinutes() :
                        event.startTimestamp.getMinutes()) + 
                    ' ' + 
                    startAmPm +
                    ' - ' + 
                    endHours + 
                    ':' + 
                    (event.endTimestamp.getMinutes() < 10 ? 
                        "0" + event.endTimestamp.getMinutes() :
                        event.endTimestamp.getMinutes()) + 
                    ' ' + 
                    endAmPm +
                    ' ' + that.timezoneName + '\n\n';                
            });            

            Entities.editEntity(id, {text: printedSchedule});
            that.setBusyLight();
        }
    };


    // Erase the current event list
    this.clearEventList = function(id) {
        that.room.eventList = [];
        Entities.editEntity(id, {text: ""});
    };


    // Switch the color occupants the top color of the schedule to show if it is in use or available
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

    
    // Handles whenever the color occupants and the top availabilty/in use color bar need to be changed
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