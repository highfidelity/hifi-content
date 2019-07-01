//  clickForTheCalendarAppClientScript.js
//
//  Created by Milad Nazeri on 7-1-2019
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    console.log("THE CALENDAR APP LOCAL SCRIPT WAS JUST LOADED")

    var _this = null;
    function ClickForTheCalendarApp() {
        _this = this;
        
        _this.isCalendarAppRunning = false;
        _this.calendarAppURL = Script.resolvePath("../clientScripts/meetingRoomSetup_app.js");
    }

    
    // check to see if the calendar app is currently in our scripts running list 
    // return t/f
    function checkIfCalendarAppIsRunning() {
        var currentlyRunningScripts = ScriptDiscoveryService.getRunning();

        for (var i = 0; i < currentlyRunningScripts.length; i++) {
            var appToCheck = currentlyRunningScripts[i];
            if (appToCheck.url === _this.calendarAppURL) {
                return true;
            }
        }
        
        return false;
    }


    // check to see if the calendar app is running ->
    // if it isn't, then load the script from the given URL ||
    // if it is, stop the script, then reload it again
    var RELOAD_SCRIPT = true;
    function maybeOpenTheCalendarApp() {
        _this.isCalendarAppRunning = checkIfCalendarAppIsRunning();

        if (!_this.isCalendarAppRunning) { 
            ScriptDiscoveryService.loadScript(_this.calendarAppURL);
        } else {
            ScriptDiscoveryService.stopScript(_this.calendarAppURL, RELOAD_SCRIPT) ;
        }
    }


    // check to see if the calendar app is running before you close it
    function maybeCloseTheCalendarApp() {
        _this.isCalendarAppRunning = checkIfCalendarAppIsRunning();
        if (_this.isCalendarAppRunning) {
            ScriptDiscoveryService.stopScript(_this.calendarAppURL);
            _this.isCalendarAppRunning = false;
        }
    }


    // check to see if you need to delete the app entity ->
    // disconnect from private user data change handler
    function unload() {
        maybeCloseTheCalendarApp();
    }


    // try and open the calendar app if someone clicks on the sign
    function mousePressOnEnitty(event) {
        console.log("mousePressOnEntity!")
        if (event.isPrimaryButton) {
            maybeOpenTheCalendarApp();
        }
    }


    ClickForTheCalendarApp.prototype = {
        unload: unload,
        mousePressOnEnitty: mousePressOnEnitty,
        maybeOpenTheCalendarApp: maybeOpenTheCalendarApp,
        maybeCloseTheCalendarApp: maybeCloseTheCalendarApp
    };


    return new ClickForTheCalendarApp();
});