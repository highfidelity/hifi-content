//  showClickForTheCalendarAppClientScript.js
//
//  Created by Milad Nazeri on 7-1-2019
//  Copyright 2019 High Fidelity, Inc.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {

    var _this = null;
    function ShouldShowClickForTheCalendarApp() {
        _this = this;
        
        _this.calendarBackgroundID = null;
        _this.clickForTheCalendarAppEntityID = null;
    }

    
    // get the entityID -> 
    // check to see if you have private user permsissions -> 
    // if so create the local entity ->
    // connect onPrivateUserDataPermissionsChanged
    var clickForTheCalendarAppDimensions = [0.75, 0.150, 0.1];
    var clickForTheCalendarAppPosition = [0, -0.85, 0.04];
    var clickForTheCalendarAppScriptURL = Script.resolvePath("./clickForTheCalendarAppClientScript.js");
    var clickForTheCalendarApp = {
        "name": "Click this sign for the calendar App",
        "type": "Text",
        "text": "Click here to setup\nGoogle Calendar integration",
        "lineHeight": 0.065,
        "dimensions": clickForTheCalendarAppDimensions,
        "localPosition": clickForTheCalendarAppPosition,
        "script": clickForTheCalendarAppScriptURL
    };
    function preload(calendarBackgroundID) {
        _this.calendarBackgroundID = calendarBackgroundID;
        clickForTheCalendarApp.parentID = _this.calendarBackgroundID;

        _this.maybeCreateClickForTheCalendarAppEntity();

        Entities.canGetAndSetPrivateUserDataChanged.connect(_this.onCanGetAndSetPrivateUserDataChanged);
    }


    // if you can get and set private user data, then create the local entity 
    function maybeCreateClickForTheCalendarAppEntity() {
        if (Entities.canGetAndSetPrivateUserData()) {
            _this.clickForTheCalendarAppEntityID = Entities.addEntity(clickForTheCalendarApp, "local");
        }
    }


    // if the entity exists, then you can delete it
    function maybeDeleteClickForTheCalendarAppEntity() {
        if (_this.clickForTheCalendarAppEntityID) {
            Entities.deleteEntity(_this.clickForTheCalendarAppEntityID);
            _this.clickForTheCalendarAppEntityID = null;        
        }        
    }


    // check to see if you need to delete the app entity ->
    // disconnect from private user data change handler
    function unload() {
        maybeDeleteClickForTheCalendarAppEntity();
        Entities.canGetAndSetPrivateUserDataChanged.disconnect(_this.onCanGetAndSetPrivateUserDataChanged);
    }


    // the private user data permissions have changed for this user, so handle the change by either creating or deleting
    function onCanGetAndSetPrivateUserDataChanged(canGetAndSetPrivateUserData) {
        if (canGetAndSetPrivateUserData) {
            _this.maybeCreateClickForTheCalendarAppEntity();
        } else {
            _this.maybeDeleteClickForTheCalendarAppEntity();
        }
    }


    ShouldShowClickForTheCalendarApp.prototype = {
        preload: preload,
        unload: unload,
        onCanGetAndSetPrivateUserDataChanged: onCanGetAndSetPrivateUserDataChanged,
        maybeCreateClickForTheCalendarAppEntity: maybeCreateClickForTheCalendarAppEntity,
        maybeDeleteClickForTheCalendarAppEntity: maybeDeleteClickForTheCalendarAppEntity
    };


    return new ShouldShowClickForTheCalendarApp();
});