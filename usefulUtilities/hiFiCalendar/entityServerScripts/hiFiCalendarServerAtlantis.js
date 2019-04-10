//  hiFiCalendarServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var INTERVAL_FREQUENCY_MS = 120000;
    var DELAY_MS = INTERVAL_FREQUENCY_MS;
    var ATLANTIS_ID = 'highfidelity.io_3438323439353030343438@resource.calendar.google.com';

    var that;
    var request;
    var interval = false;
    var userData;
    var scheduleURL;

    this.remotelyCallable = [
        "updateToken",
        "enteredMeetingZone",
        "leftMeetingZone",
        "updateSignColor",
        "showNoScheduledEvents",
        "addEvent",
        "clearEventList"
    ];


    this.preload = function(entityID) {
        that = this;
        that.entityID = entityID;
        that.calendarID = ATLANTIS_ID;
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['id', 'name', 'type', 'userData','parentID']);
        that.request = Script.require('../resources/modules/request.js').request;
        that.room = {};
        that.room = {
            "id": that.entityProperties.id, 
            "name": that.entityProperties.name,
            "eventList": [],
            "scheduleEntityID": that.entityProperties.parentID
        };
        Entities.editEntity(that.room.scheduleEntityID, {text: ""});
        that.updateSignColor(that.room.id, [that.room.name, "GREEN"]);
        if (that.entityProperties.userData.length !== 0) {
            try {
                that.userData = JSON.parse(that.entityProperties.userData);
            } catch (e) {
                console.log(e, "no userData found");
                Script.setTimeout(function() {
                    //try again in 2 minutes
                }, DELAY_MS);
            }
            
        }
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

        return new Date(year, month - 1, day, hour, minute - tzOffset, second, msec);
    };

    this.listUpcomingEvents = function () {

        gapi.client.calendar.events.list({
            'calendarId': that.calendarID,
            'timeMin': (new Date()).toISOString(),
            'timeMax': tomorrowMidnight.toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 2,
            'orderBy': 'startTime'
        }).then(function (response) {
            var events = response.result.items;

            if (events.length > 0) {
                for (i = 0; i < events.length; i++) {
                var event = events[i];
                var start = event.start.dateTime;
                appendPre(JSON.stringify(event.start))
                var end = event.end.dateTime;
                var summary = event.summary;
                if (!start) {
                    start = event.start.date;
                }
                appendPre(summary + ' (' + start + ')' + ' (' + end + ')');

                var startTimestamp = googleDateToUTCDate(start);
                var endTimestamp = googleDateToUTCDate(end);

                var formattedStartTimeString =
                    startTimestamp.toLocaleTimeString('en-us', {
                    timeZone: "America/Los_Angeles",
                    hour12: true
                    });
                var formattedEndTimeString =
                    endTimestamp.toLocaleTimeString('en-us', {
                    timeZone: "America/Los_Angeles",
                    hour12: true
                    });

                EventBridge.emitWebEvent(JSON.stringify({
                    type: "SEND_SCHEDULE",
                    room: calendar.id,
                    summary: summary,
                    startTimestamp: startTimestamp.valueOf(),
                    formattedStartTimeString: formattedStartTimeString,
                    endTimestamp: endTimestamp.valueOf(),
                    formattedEndTimeString: formattedEndTimeString
                }));
                }
            } else {
                EventBridge.emitWebEvent(JSON.stringify({
                type: "SEND_SCHEDULE",
                room: calendar.id
                }));
            }
        });
    };


    this.showNoScheduledEvents = function(id, params) {
        if (id === that.entityID) {
            Entities.editEntity(that.room.scheduleEntityID, {text: "No events scheduled for this room"});
        }
    };


    this.addEvent = function(id, params) {
        if (id === that.entityID) {
            var startTimestamp = params[1];
            var formattedStartTimeString = params[2];
            var endTimestamp = params[3];
            var formattedEndTimeString = params[4];

            var tempEvent = {
                summary: params[0],
                startTimestamp: startTimestamp,
                formattedStartTimeString: formattedStartTimeString,
                endTimestamp: endTimestamp,
                formattedEndTimeString: formattedEndTimeString
            };

            that.room.eventList.push(tempEvent);

            var printedSchedule = "Today's Meetings:\n";
            that.room.eventList.forEach(function(event) {
                printedSchedule = printedSchedule + 
                event.summary +
                "\n" +
                event.formattedStartTimeString + 
                ' - ' + 
                event.formattedEndTimeString +
                '\n\n';                
            });            
            Entities.editEntity(that.room.scheduleEntityID, {text: printedSchedule});
            that.setBusyLight();
        }
    };


    this.clearEventList = function(id, params) {
        if (id === that.entityID) {
            that.room.eventList = [];

            Entities.editEntity(that.room.scheduleEntityID, {text: ""});
        }
    };


    this.setBusyLight = function() {
        var now = new Date().valueOf();
        if (typeof that.room.eventList[0] === "object") {
            var endValue = that.room.eventList[0].endTimestamp.valueOf();
            var startValue = that.room.eventList[0].startTimestamp.valueOf();
            if (now <= endValue && now >= startValue) {
                that.updateSignColor(that.room.id, [that.room.name, "RED"]);
            } else {
                that.updateSignColor(that.room.id, [that.room.name, "GREEN"]);
            }
        } else {
            that.updateSignColor(that.room.id, [that.room.name, "GREEN"]);
        }
    };


    this.enteredMeetingZone = function(id, params) {
        if (that.entityID === id) {    
            var displayName = params[0];

            if (that.room.occupants.indexOf(displayName) === -1) {
                that.room.occupants.push(displayName);
            }

            Entities.editEntity(id, {
                "text": (that.room.occupants).join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };  


    this.leftMeetingZone = function(id, params) {
        if (that.entityID === id) {    
            var displayName = params[0];

            var index = that.room.occupants.indexOf(displayName);
            if (index > -1) {
                that.room.occupants.splice(index, 1);
            }

            Entities.editEntity(id, {
                "text": (that.room.occupants).join("\n"), 
                "textColor": [255, 255, 255]
            });
        }
    };  
    
    
    this.updateSignColor = function(id, params) {
        if (that.entityID === id) {    
            if (params[1] === "GREEN") {
                Entities.editEntity(id, {
                    "text": params[0], 
                    "textColor": [0,0,0], 
                    "textAlpha": 1, 
                    "backgroundColor": [125, 255, 125]
                });
            } else {
                Entities.editEntity(id, {
                    "text": params[0], 
                    "textColor": [0,0,0], 
                    "textAlpha": 1, 
                    "backgroundColor": [255, 125, 125]
                });
            }
        }
    };      
});