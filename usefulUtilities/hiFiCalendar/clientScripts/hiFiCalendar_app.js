// hiFiCalendar_app.js
//
//  Created by Mark Brosche on 4-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // This function decides how to handle web events from the tablet UI.
    // used by 'ui' in startup()
    var ATLANTIS_LABEL_ID = "{298237cd-57ae-427c-98b6-52d30fa342ea}";
    var JAKKU_LABEL_ID = "{931a0267-45c4-4791-ba0a-54cd7bebd7fb}";
    var CAPITOL_LABEL_ID = "{79f5718e-1520-4515-a131-9424939e95ce}";
    var FANTASIA_LABEL_ID = "{b7cca77b-77fb-484e-b098-9f1fb2d8729a}";
    var OZ_LABEL_ID = "{83a72d97-8952-425c-b07d-f9cba4b38ebd}";
    var NARNIA_LABEL_ID = "{8a568c27-519f-48d2-b361-9a08468cdc17}";
    var calendarLabelIDs = [
        ATLANTIS_LABEL_ID,
        JAKKU_LABEL_ID,
        CAPITOL_LABEL_ID,
        FANTASIA_LABEL_ID,
        OZ_LABEL_ID,
        NARNIA_LABEL_ID
    ];
    function onWebMessage(data) {
        // EventBridge message from HTML script.
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                break;
            case "SEND_SCHEDULE":
                var targetEntityID;
                switch (data.room) {
                    case "ATLANTIS":
                        targetEntityID = calendarLabelIDs[0];
                        break;
                    case "JAKKU":
                        targetEntityID = calendarLabelIDs[1];
                        break;
                    case "CAPITOL":
                        targetEntityID = calendarLabelIDs[2];
                        break;
                    case "FANTASIA":
                        targetEntityID = calendarLabelIDs[3];
                        break;
                    case "OZ":
                        targetEntityID = calendarLabelIDs[4];
                        break;
                    case "NARNIA":
                        targetEntityID = calendarLabelIDs[5];
                        break;
                }
                if (data.summary) {
                    Entities.callEntityServerMethod(targetEntityID, "addEvent",
                        [data.summary, data.startTimestamp, data.formattedStartTimeString, data.endTimestamp, data.formattedEndTimeString]);
                } else {
                    Entities.callEntityServerMethod(targetEntityID, "showNoScheduledEvents");
                }
                break;
        }
    }


    function getAllCalendarData() {
        for (var i = 0; i < calendarLabelIDs.length; i++) {
            Entities.callEntityServerMethod(calendarLabelIDs[i], "clearEventList");
        }        
        ui.sendToHtml({
            type: "UPDATE_SCHEDULE"
        });
    }


    var getDataInterval = false;
    var GET_DATA_INTERVAL_MS = 120000;
    function setupGetDataInterval() {
        getDataInterval = Script.setInterval(function() {
            getAllCalendarData();
        }, GET_DATA_INTERVAL_MS);
    }


    // This function loads appui and connects to the needed signals
    var AppUi = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUi({
            home: "http://localhost/hiFiCalendar.html?v45",
            buttonName: "GCAL", // The name of your app
            graphicsDirectory: Script.resolvePath("../resources/images/"), // Where your button icons are located
            onMessage: onWebMessage
        });       
        Script.scriptEnding.connect(scriptEnding);

        setupGetDataInterval();
    }
    startup();


    function scriptEnding() {
        if (getDataInterval) {
            Script.clearInterval(getDataInterval);
            getDataInterval = false;
        }
    }
})();    
