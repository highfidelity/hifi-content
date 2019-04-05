//  hiFiCalendarServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {

    var FIVE_MINUTES_MS = 300000;

    var _entityID;
    var entityProperties;
    var that = this;
    var room;
    var intervalSchedule = false;

    this.remotelyCallable = [
        "updateTextEntity",
        "addEvent"
    ];


    this.preload = function(entityID) {
        _entityID = entityID;
        entityProperties = Entities.getEntityProperties(_entityID, ['id', 'name', 'type', 'parentID']);
        if (entityProperties.name.indexOf("_SCHEDULE") === -1 && 
            entityProperties.name.indexOf("_OCCUPANTS") === -1 && 
            entityProperties.type === "Text") {
            room = {
                "id": entityProperties.id, 
                "name": entityProperties.name,
                "eventList": [],
                "scheduleEntityID": entityProperties.parentID
            };
        } else {
            return;
        }
        intervalSchedule = Script.setInterval(function(){
            that.updateCalendar();
            Messages.sendMessage("HiFi.GoogleCalendar", JSON.stringify({
                type: "schedule request"
            }));   
        }, FIVE_MINUTES_MS);
    };


    this.addEvent = function(id, params) {
        if (id === _entityID) {
            var startTime = that.googleDateToUTCDate(params[1]);
            var endTime = that.googleDateToUTCDate(params[2]);
            var tempEvent = {summary: params[0], start: startTime, end: endTime};
            var index = 0;
            if (room.eventList.indexOf(tempEvent) > -1) {
                return;
            } else {
                room.eventList.forEach(function(event) {
                    if (new Date(startTime) - new Date(event.start) === 0 && room.eventList.length > 0) {
                        index = -1;
                        return;
                    } else if (new Date(startTime) - new Date(event.start) > 0) {
                        index++;
                    }
                });
                if (index > -1) {
                    room.eventList.splice(index, 0, tempEvent);
                }
            }
            this.updateCalendar();
        }
    };


    this.removeEvent = function(event) {
        if (room.indexOf(event) > -1) {
            room.eventList.splice(event, 1)[0];
        }
    };


    this.googleDateToUTCDate = function(s) {
        s = s + '';
        var b = s.split(/\D+/);
        return new Date(Date.UTC(b[0], --b[1], b[2], b[3], b[4], b[5], b[6])).toUTCString();
    };


    this.updateCalendar = function() { 
        var now = (new Date()).toUTCString();
        room.eventList.forEach(function(event) {
            if (now - event.end >= 0) {
                that.removeEvent(event);
            }
        });
        var printedSchedule = '';
        if (room.eventList.length === 0) {
            Entities.editEntity(room.scheduleEntityID, {text: "No events scheduled for this room"});
        } else {
            room.eventList.forEach(function(event) {
                printedSchedule = event.summary + 
                ': (' + 
                new Date(event.start).toLocaleDateString() +
                '   ' +
                new Date(event.start).toLocaleTimeString() + 
                ' - ' + 
                new Date(event.end).toLocaleTimeString() +
                ') \n\n' + 
                printedSchedule ;                
            });            
            Entities.editEntity(room.scheduleEntityID, {text: printedSchedule});
        }
        that.getBusy();
    };


    this.getBusy = function() {
        var now = (new Date()).toUTCString();
        if (typeof room.eventList[0] === "object") {
            if (now - room.eventList[0].end < 0 && now - room.eventList[0].start >= 0) {
                that.updateSignColor(room.id, [room.name, "RED"]);
            } else {
                that.updateSignColor(room.id, [room.name, "GREEN"]);
            }
        } else {
            Entities.editEntity(room.scheduleEntityID, {text: "No events scheduled for this room"});
            that.updateSignColor(room.id, [room.name, "GREEN"]);
        }
    };


    this.updateTextEntity = function(id, params) {
        if (_entityID === id) {    
            Entities.editEntity(id, {
                "text": params[0], 
                "textColor": [255, 255, 255]
            });
        }
    };  
    
    
    this.updateSignColor = function(id, params) {
        if (_entityID === id) {    
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


    this.unload = function() {
        if (intervalSchedule) {
            Script.clearInterval(intervalSchedule);
            intervalSchedule = false;
        }
    };
});