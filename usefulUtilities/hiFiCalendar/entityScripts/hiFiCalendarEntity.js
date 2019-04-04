// hiFiCalendarEntity.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var FIVE_MINUTES_MS = 300000;
    var ORIGIN = {x:0, y:0, z: 0};
    var RADIUS = 100000;

    var _this;
    var roomName = "";
    var eventList = [];
    var intervalSchedule = false;
    var scheduleTextEntityId;

    var RoomCalendar = function() {
        _this = this;
    };

    RoomCalendar.prototype = {
        preload: function(entityId) {
            _this.entityId = entityId;
            roomName = Entities.getEntityProperties(_this.entityId, ['name']).name;
            scheduleTextEntityId = Entities.findEntitiesByName(roomName + '_SCHEDULE', ORIGIN, RADIUS)[0];
            
            Entities.callEntityServerMethod(_this.entityId, "updateSignColor", [roomName, true]);
            Entities.callEntityServerMethod(scheduleTextEntityId, "updateTextEntity", [""]);
            
            Messages.subscribe("HiFi.GoogleCalendar");
            Messages.messageReceived.connect(_this.messageHandler);
            
            intervalSchedule = Script.setInterval(function(){
                _this.updateCalendar();
                Messages.sendMessage("HiFi.GoogleCalendar", JSON.stringify({
                    type: "schedule request"
                }));   
            }, FIVE_MINUTES_MS);
        },

        messageHandler: function(channel, message, senderUUID, localOnly) {
            if (channel !== "HiFi.GoogleCalendar") {
                return;
            } else {
                try {
                    message = JSON.parse(message);
                } catch (e) {
                    console.log(e, "failed parsing message");
                    return;
                }
            }
            if (message.type === roomName) { 
                if (message.summary === "No upcoming events found.") {
                    Entities.callEntityServerMethod(scheduleTextEntityId, "updateTextEntity", ["No events scheduled for this room."]);
                } else {
                    _this.addEvent(message.summary, message.start, message.end);
                }
            }
        },

        addEvent: function(summary, start, end) {
            var startTime = _this.googleDateToUTCDate(start);
            var endTime = _this.googleDateToUTCDate(end);
            var index = 0;
            var startTimes = [];
            eventList.forEach(function(event) {
                if (startTime - event.start <= FIVE_MINUTES_MS) {
                    startTimes.push("zero");
                }
            });
            if (startTimes.indexOf("zero") !== -1) {
                return;
            } else {
                eventList.forEach(function(event) {
                    if (startTime - event.start > 0) {
                        index++;
                    }
                });
            }
            eventList.splice(index, 0, {summary: summary, start: startTime, end: endTime})
            _this.updateCalendar();
        },

        removeEvent: function(event) {
            eventList.splice(event, 1)[0];
        },

        googleDateToUTCDate: function(s) {
            s = s + '';
            var b = s.split(/\D+/);
            return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6])).toUTCString();
        },

        updateCalendar: function() {
            var now = (new Date()).toUTCString();
            eventList.forEach(function(event) {
                if (now - event.end >= 0) {
                    _this.removeEvent(event);
                }
            });
            var printedSchedule = '';
            if (eventList.length === 0) {
                Entities.callEntityServerMethod(scheduleTextEntityId, "updateTextEntity", ["No events scheduled for this room."]);
            } else {
                eventList.forEach(function(event) {
                    printedSchedule = event.summary + 
                    ': (' + 
                    new Date(event.start).toLocaleDateString() +
                    '   ' +
                    new Date(event.start).toLocaleTimeString() + 
                    ' - ' + 
                    new Date(event.end).toLocaleTimeString() +
                    ') \n\n' +
                    printedSchedule ;                
                })            
                Entities.callEntityServerMethod(scheduleTextEntityId, "updateTextEntity", [printedSchedule]);
            }
            _this.getBusy();
        },
    

        getBusy: function() {
            var now = (new Date()).toUTCString();
            if (typeof eventList[0] === "object") {
                if (now - eventList[0].end < 0 && now - eventList[0].start >= 0) {
                    Entities.callEntityServerMethod(_this.entityId, "updateSignColor", [roomName, false]);
                } else {
                    Entities.callEntityServerMethod(_this.entityId, "updateSignColor", [roomName, true]);
                }
            } else {
                Entities.callEntityServerMethod(scheduleTextEntityId, "updateTextEntity", ["No events scheduled for this room."]);
                Entities.callEntityServerMethod(_this.entityId, "updateSignColor", [roomName, true]);
            }
        },

        unload: function() {
            if (intervalSchedule) {
                Script.clearInterval(intervalSchedule);
                intervalSchedule = false;
            }
            Messages.unsubscribe("HiFi.GoogleCalendar");
            Messages.messageReceived.disconnect(_this.messageHandler);
        }
    }
    return new RoomCalendar;
})

