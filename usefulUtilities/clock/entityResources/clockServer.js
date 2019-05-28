//  clockServer.js
//
//  Updated by Mark Brosche on 4/16/2019
//  Created by Rebecca Stankus on 07/02/18
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//  This script displays the time in 12 hour format and for the timezone stored in its entity userData
//  Other scripts may call the refreshTimezone() method to change the timezone displayed on the clock.

(function () {
    var _this;

    var MS_PER_SEC = 1000;
    var HOURS_PER_DAY = 24;
    var TWO_DIGITS = 10;
    var AM_HOURS = 12;
    var PDT_OFFSET = -7;

    
    var Clock = function() {
        _this = this;
    };
    
    Clock.prototype = {
        interval: null,

        remotelyCallable: [
            "refreshTimezone"
        ],
     
        preload: function(entityID) {
            _this.entityID = entityID;
            var props = Entities.getEntityProperties(_this.entityID, ['userData']);
            var userData = {};
            if (props.userData.length !== 0) {
                try {
                    userData = JSON.parse(props.userData);
                    _this.timezoneName = userData.timezoneName;
                    _this.timezoneOffset = userData.timezoneOffset;
                } catch (e) {
                    console.log(e, "Could not parse userData, defaulting to PDT");
                    _this.refreshTimezone(_this.entityID, ["PDT", PDT_OFFSET]);
                }
            } else {
                console.log("No userData found, defaulting to PDT");
                _this.refreshTimezone(_this.entityID, ["PDT", PDT_OFFSET]);
            }
            _this.synchronize();
            _this.interval = Script.setInterval(function() {
                _this.synchronize();
            }, MS_PER_SEC);
        },


        // This function updates the timezone information needed to display the desired time
        refreshTimezone: function(id, params) {
            var userData = {};
            userData.timezoneName = params[0];
            userData.timezoneOffset = params[1];
            _this.timezoneName = params[0];
            _this.timezoneOffset = params[1];
            Entities.editEntity(id, {userData: JSON.stringify(userData)});
        },


        // This function updates the clock display with the current time. Time zone offsets range from -11 to +14
        synchronize: function() {
            var date = new Date();
            var period = "am " + _this.timezoneName;
            var hours = Number(date.getHours()) + Number(_this.timezoneOffset);
            hours = (hours < 0) ? hours + HOURS_PER_DAY : hours; // example GMT 2 + (-5) offset becomes 9am
            hours = (hours >= HOURS_PER_DAY) ? hours - HOURS_PER_DAY : hours; // example GMT = 23 + 14 offset becomes 13
            if (hours === 0) { // example GMT = 7 + (-7) offset = 0
                hours += AM_HOURS; // 0 becomes 12am
            } else if (hours >= AM_HOURS) {
                period = "pm " + _this.timezoneName;
                hours = (hours > AM_HOURS) ? hours - AM_HOURS : hours; // 13 becomes 1pm, 12 remains 12pm
            }
            var minutes = date.getMinutes();
            minutes = minutes < TWO_DIGITS ? "0" + minutes : minutes;
            Entities.editEntity(_this.entityID, { text: hours + ":" + minutes + period});
        },


        unload: function() {
            if (_this.interval) {
                Script.clearInterval(_this.interval);
            }
        }
    };

    return new Clock;

});