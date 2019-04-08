//  hiFiCalendarServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var that;

    this.remotelyCallable = [
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
        that.entityProperties = Entities.getEntityProperties(that.entityID, ['id', 'name', 'type', 'parentID']);
        that.room = {};
        if (that.entityProperties.name.indexOf("_SCHEDULE") === -1 && 
            that.entityProperties.name.indexOf("_OCCUPANTS") === -1 && 
            that.entityProperties.type === "Text") {
            that.room = {
                "id": that.entityProperties.id, 
                "name": that.entityProperties.name,
                "eventList": [],
                "scheduleEntityID": that.entityProperties.parentID
            };
            Entities.editEntity(that.room.scheduleEntityID, {text: ""});
            that.updateSignColor(that.room.id, [that.room.name, "GREEN"]);
        } else {
            that.room = {
                "id": that.entityProperties.id, 
                "occupants": []
            };
            return;
        }
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