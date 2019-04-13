//  hiFiCalendarServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var INTERVAL_FREQUENCY_MS = 60000;
    var EXPIRY_BUFFER = 300000;
    var HOURS_PER_DAY = 24;
    var HALF_DAY_HR = 12;
    var CHANNEL = "HiFi.Google.Calendar";
    var GREEN_TEXT = [168, 255, 168];
    var RED_TEXT = [255, 168, 168];
    var GREEN = [125, 255, 125];
    var RED = [255, 125, 125];

    var that;

    this.remotelyCallable = [
        "refreshToken",
        "enteredMeetingZone",
        "leftMeetingZone"
    ];


    this.preload = function(entityID) {
        console.log("PRELOADING");
        that = this;
        that.entityID = entityID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData']);
        if (that.entityProperties.userData.length !== 0) {
            try {
                that.userData = JSON.parse(that.entityProperties.userData);
            } catch (e) {
                console.log(e, "Could not parse userData");
                return;
            }
            that.roomScheduleID = that.userData.roomScheduleID; 
            that.roomOccupantListID = that.userData.roomOccupantListID; 
        } else {
            console.log("Please enter appropriate userData to enable functionality of this server script.");
            return;
        }

        if (that.entityID === that.roomScheduleID) {
            that.sentAlready = false;
            that.token = that.userData.token;
            that.expireTime = that.userData.expireTime;
            that.timezoneOffset = that.userData.timezoneOffset;
            that.timezoneName = that.userData.timezoneName;
            that.calendarID = that.userData.roomCalendarAddress;
            that.roomColorID = that.userData.roomColorID;
            that.roomColorOccupantsID = that.userData.roomColorOccupantsID; 
            that.roomEntityIDs = [
                that.roomScheduleID,
                that.roomColorID,
                that.roomColorOccupantsID,
                that.roomOccupantListID
            ];                
            that.room = {};
            that.room = {
                "eventList": []
            };
            that.request = Script.require('https://hifi-content.s3.amazonaws.com/brosche/dev/googleCalendar/resources/modules/request.js').request;
            that.clearEventList(that.entityID);
            that.updateSignColor(that.roomEntityIDs[1], ["GREEN"]);
            that.updateSignColor(that.roomEntityIDs[2], ["GREEN"]);
            that.googleRequest(that.token);
        } else if (that.entityID === that.roomOccupantListID) {
            console.log("PRELOADING OCCUPANTS");
            that.room = {};
            that.room = {
                "occupants": []
            };
            Entities.editEntity(that.entityID, {
                text: 'loading'
            });
        }
    };


    this.refreshToken = function(id) {
        console.log("REFRESHING TOKEN");
        if (that.entityID === id) {
            if (that.interval) {
                console.log("CLEARING INTERVAL");
                Script.clearInterval(that.interval);
                that.interval = false;
            }
            that.entityProperties = Entities.getEntityProperties(that.entityID, ['userData']);
            if (that.entityProperties.userData.length !== 0) {
                try {
                    that.userData = JSON.parse(that.entityProperties.userData);
                } catch (e) {
                    console.log(e, "no userData found");
                    return;
                }
                that.token = that.userData.token;
                that.expireTime = that.userData.expireTime;
                that.sentAlready = false;
                that.googleRequest(that.token);
            }
        }
    };


    this.googleRequest = function(token) {
        console.log("REQUESTING DATA FROM GOOGLE");
        var tomorrowMidnight = new Date();
        tomorrowMidnight.setHours(HOURS_PER_DAY, 0, 0, 0);
        that.scheduleURL = "https://www.googleapis.com/calendar/v3/calendars/" + 
            that.calendarID + 
            "/events?&timeMin=" + (new Date()).toISOString() +
            "&timeMax=" + tomorrowMidnight.toISOString() +
            "&showDeleted=" + false + 
            "&singleEvents=" + true +
            "&maxResults=2" +
            "&orderBy=startTime" +
            "&access_token=" + token;
        if (!that.interval) {
            that.interval = Script.setInterval(function() {
                console.log("STARTING INTERVAL");
                if ((new Date()).valueOf() > (that.expireTime - EXPIRY_BUFFER) && !that.sentAlready) {
                    that.sentAlready = true;
                    console.log("SENDING MESSAGE FOR NEW TOKEN");
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "REFRESH TOKEN",
                        token: that.token,
                        uuid: that.roomScheduleID
                    }));
                } else if ((new Date()).valueOf() > (that.expireTime)) {
                    console.log("EXCEEDED EXPIRATION OF TOKEN");
                    Entities.editEntity(that.entityID, {text: "Couldn't refresh authorization, please notify Mark B."});
                    Script.clearInterval(that.interval);
                    that.interval = false;
                    return;
                }
                that.request(that.scheduleURL, function (error, response) {
                    if (error) {
                        console.log("could not complete request", error);
                        Script.clearInterval(that.interval);
                        that.interval = false;
                        return;
                    } else {
                        that.clearEventList(that.entityID);
                        console.log(JSON.stringify(response));
                        var events = response.items;
                        if (events.length > 0) {
                            for (var i = 0; i < events.length; i++) {
                                var event = events[i];
                                var start = event.start.dateTime;
                                var end = event.end.dateTime;
                                var summary = event.summary;
                                if (!start) {
                                    start = event.start.date;
                                }        
                                var startTimestamp = that.googleDateToUTCDate(start);
                                var endTimestamp = that.googleDateToUTCDate(end);
                  
                                that.addEvent(that.entityID, [summary, startTimestamp, endTimestamp]);
                            }
                        } else {
                            that.showNoScheduledEvents(that.entityID);
                        }
                    } 
                });
            }, INTERVAL_FREQUENCY_MS);
        } else {
            Script.clearInterval(that.interval);
            that.interval = Script.setInterval(function() {
                console.log("STARTING INTERVAL");
                if ((new Date()).valueOf() > (that.expireTime - EXPIRY_BUFFER) && !that.sentAlready) {
                    that.sentAlready = true;
                    console.log("SENDING MESSAGE FOR NEW TOKEN");
                    Messages.sendMessage(CHANNEL, JSON.stringify({
                        type: "REFRESH TOKEN",
                        token: that.token,
                        uuid: that.roomScheduleID
                    }));
                } else if ((new Date()).valueOf() > (that.expireTime)) {
                    console.log("EXCEEDED EXPIRATION OF TOKEN");
                    Entities.editEntity(that.entityID, {text: "Couldn't refresh authorization, please notify Mark B."});
                    Script.clearInterval(that.interval);
                    that.interval = false;
                    return;
                }
                that.request(that.scheduleURL, function (error, response) {
                    if (error) {
                        console.log("could not complete request", error);
                        Script.clearInterval(that.interval);
                        that.interval = false;
                        return;
                    } else {
                        that.clearEventList(that.entityID);
                        console.log(JSON.stringify(response));
                        var events = response.items;
                        if (events.length > 0) {
                            for (var i = 0; i < events.length; i++) {
                                var event = events[i];
                                var start = event.start.dateTime;
                                var end = event.end.dateTime;
                                var summary = event.summary;
                                if (!start) {
                                    start = event.start.date;
                                }        
                                var startTimestamp = that.googleDateToUTCDate(start);
                                var endTimestamp = that.googleDateToUTCDate(end);
                  
                                that.addEvent(that.entityID, [summary, startTimestamp, endTimestamp]);
                            }
                        } else {
                            that.showNoScheduledEvents(that.entityID);
                        }
                    } 
                });
            }, INTERVAL_FREQUENCY_MS);
        }
    };


    var googleDate = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})([+-]\d{2}):(\d{2})$/;
    var MINS_PER_HOUR = 60;
    this.googleDateToUTCDate = function(d) {
        console.log("transitioning date formats");
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


    this.showNoScheduledEvents = function(id) {
        console.log("SHOW NO SCHEDULED EVENTS", id);
        if (id === that.entityID) {
            Entities.editEntity(id, {text: "No events scheduled for this room"});
        }
    };


    this.addEvent = function(id, params) {
        console.log("ADDING EVENT");
        if (id === that.entityID) {
            var startTimestamp = params[1];
            var endTimestamp = params[2];

            console.log("add start: ", startTimestamp);
            console.log("add end: ", endTimestamp);

            var tempEvent = {
                summary: params[0],
                startTimestamp: startTimestamp,
                endTimestamp: endTimestamp
            };

            that.room.eventList.push(tempEvent);

            var printedSchedule = '';
            that.room.eventList.forEach(function(event) {
                var startHours;
                var endHours;
                if (event.startTimestamp.getHours() - that.timezoneOffset <= 0) {
                    startHours = event.startTimestamp.getHours() - that.timezoneOffset + HALF_DAY_HR;
                } else if (event.startTimestamp.getHours() - that.timezoneOffset <= (HALF_DAY_HR + 1)) {
                    startHours = event.startTimestamp.getHours() - that.timezoneOffset;
                } else {
                    startHours = event.startTimestamp.getHours() - that.timezoneOffset - HALF_DAY_HR;
                }
                if (event.endTimestamp.getHours() - that.timezoneOffset <= 0) {
                    endHours = event.endTimestamp.getHours() - that.timezoneOffset + HALF_DAY_HR;
                } else if (event.endTimestamp.getHours() - that.timezoneOffset <= (HALF_DAY_HR + 1)) {
                    endHours = event.endTimestamp.getHours() - that.timezoneOffset;                    
                } else {
                    endHours = event.endTimestamp.getHours() - that.timezoneOffset - HALF_DAY_HR;
                }
                
                var startAmPm;
                var endAmPm;
                if (event.startTimestamp.getHours() - that.timezoneOffset < 0) {
                    startAmPm = "pm";
                } else if (event.startTimestamp.getHours() - that.timezoneOffset < (HALF_DAY_HR)) {
                    startAmPm = "am";
                } else {
                    startAmPm = "pm";
                }
                if (event.endTimestamp.getHours() - that.timezoneOffset < 0) {
                    endAmPm = "pm";
                } else if (event.endTimestamp.getHours() - that.timezoneOffset < (HALF_DAY_HR)) {
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
                (JSON.stringify(event.startTimestamp.getMinutes()).length > 1 ? 
                    event.startTimestamp.getMinutes() :
                    event.startTimestamp.getMinutes() + "0") + 
                ' ' + 
                endAmPm +
                ' ' + that.timezoneName + '\n\n';                
            });            
            Entities.editEntity(id, {text: printedSchedule});
            that.setBusyLight();
        }
    };


    this.clearEventList = function(id) {
        console.log("CLEAR LIST");
        that.room.eventList = [];
        Entities.editEntity(id, {text: ""});
    };


    this.setBusyLight = function() {
        console.log("SET BUSY LIGHT");
        var now = new Date();
        console.log("Now: ", now);
        if (typeof that.room.eventList[0] === "object") {
            var endValue = that.room.eventList[0].endTimestamp;
            var startValue = that.room.eventList[0].startTimestamp;
            console.log("Start: ", startValue, " End: ",endValue);
            if (now <= endValue && now >= startValue) {
                console.log("IN USE");
                that.updateSignColor(that.roomEntityIDs[1], ["RED"]);
                that.updateSignColor(that.roomEntityIDs[2], ["RED"]);
            } else {
                console.log("AVAILABLE");
                that.updateSignColor(that.roomEntityIDs[1], ["GREEN"]);
                that.updateSignColor(that.roomEntityIDs[2], ["GREEN"]);
            }
        } else {
            console.log("AVAILABLE, EVENTLIST NOT AN OBJECT");
            that.updateSignColor(that.roomEntityIDs[1], ["GREEN"]);
            that.updateSignColor(that.roomEntityIDs[2], ["GREEN"]);
        }
    };


    this.enteredMeetingZone = function(id, params) {
        if (that.entityID === id) {    
            var uuid = params[0];
            var displayName = params[1];

            that.room.occupants[uuid] = displayName;

            Entities.editEntity(id, {
                "text": (Object.values(that.room.occupants)).join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };  


    this.leftMeetingZone = function(id, params) {
        if (that.entityID === id) {    

            var uuid = params[0];

            if (uuid in that.room.occupants) {
                delete that.room.occupants[uuid];
            }

            Entities.editEntity(id, {
                "text": (Object.values(that.room.occupants)).join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };  
    
    
    this.updateSignColor = function(id, params) {
        console.log("UPDATE SIGN COLOR");
        if (id === that.roomEntityIDs[1]) {    
            if (params[0] === "GREEN") {
                Entities.editEntity(id, {
                    "text": 'AVAILABLE', 
                    "textColor": [0,0,0], 
                    "textAlpha": 1, 
                    "backgroundColor": GREEN
                });
            } else {
                Entities.editEntity(id, {
                    "text": 'IN USE', 
                    "textColor": [0,0,0], 
                    "textAlpha": 1, 
                    "backgroundColor": RED
                });
            }
        } else {
            if (params[0] === "GREEN") {
                Entities.editEntity(id, {
                    "text": 'occupants', 
                    "textColor": GREEN_TEXT
                });
            } else {
                Entities.editEntity(id, {
                    "text": 'occupants', 
                    "textColor": RED_TEXT
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