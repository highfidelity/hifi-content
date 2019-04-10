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
    var ATLANTIS_LABEL_ID = "{3cedc32a-025b-43b4-8160-17aac6e9e562}";
    var JAKKU_LABEL_ID = "{990c5409-dedf-438f-b0f8-7eb0d6740b60}";
    var CAPITOL_LABEL_ID = "{ea7a6b67-332e-4d8c-ba88-b5e96ff17cfc}";
    var FANTASIA_LABEL_ID = "{1cad2f9e-26d5-4ac3-b8d1-ebc4cc6e68df}";
    var OZ_LABEL_ID = "{1d064179-f32d-49bd-a6f4-77a1a18c46e0}";
    var NARNIA_LABEL_ID = "{8a568c27-519f-48d2-b361-9a08468cdc17}";
    var calendarLabelIDs = [
        ATLANTIS_LABEL_ID,
        JAKKU_LABEL_ID,
        CAPITOL_LABEL_ID,
        FANTASIA_LABEL_ID,
        OZ_LABEL_ID,
        NARNIA_LABEL_ID
    ];
    var MS_TO_S = 1000;
    var expirationTimeValue;
    function onWebMessage(data) {
        // EventBridge message from HTML script.
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                break;
            case "TOKEN":
                // calendarLabelIDs.forEach(function(id) {
                //     Entities.callEntityServerMethod(id, "updateToken", [data.token, data.expires_at]);
                // });
                // expirationTimeValue = (data.expires_in * MS_TO_S) - MS_TO_S;
                // Script.setTimeout(function() {
                //     ui.sendToHtml({
                //         type: "RENEW_TOKEN"
                //     });
                // }, expirationTimeValue);
                break;
        }
    }


    // This function loads appui and connects to the needed signals
    var AppUi = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUi({
            home: "http://localhost/test.html",
            buttonName: "GCAL", // The name of your app
            graphicsDirectory: Script.resolvePath("../resources/images/"), // Where your button icons are located
            onMessage: onWebMessage
        });       
        Script.scriptEnding.connect(scriptEnding);
    }
    startup();


    function scriptEnding() {
    }
})();    
