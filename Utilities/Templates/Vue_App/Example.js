"use strict";
/* eslint-disable indent */

//
//  Example Vue App
//
//  Created by Milad Nazeri and Robin Wilson on 2018-10-11
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Tablet, Script, HMD, Controller, Menu */

(function () { // BEGIN LOCAL_SCOPE
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
        var 
            AppUi = Script.require('appUi.js')
        ;
    
    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            URL = Script.resolvePath("./html/Tablet.html"),
            BUTTON_NAME = "BUTTON_NAME", // !important update in Tablet.js as well, MUST match Example.js

            EXAMPLE_MESSAGE = "EXAMPLE_MESSAGE",
            
            EVENT_BRIDGE_OPEN_MESSAGE = BUTTON_NAME + "eventBridgeOpen",
            UPDATE_UI = BUTTON_NAME + "_update_ui"
        ;

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            ui,
            dataStore = {
                ui: {
                }
            }
        ;
    // Constructors
    // /////////////////////////////////////////////////////////////////////////
    // Collections
    // /////////////////////////////////////////////////////////////////////////
    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        function exampleFunctionToRun(){

        }

    // Tablet
    // /////////////////////////////////////////////////////////////////////////
        function startup() {
            ui = new AppUi({
                buttonName: BUTTON_NAME,
                sortOrder: 6,
                home: URL,
                onMessage: onMessage,
                updateUI: updateUI
            });
        }

        function updateUI(dataStore) {
            var messageObject = {
                type: UPDATE_UI,
                value: dataStore  
            };
            ui.sendToHtml(messageObject);
        }

        function onMessage(data) {
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    ui.updateUI(dataStore);
                    break;
                case EXAMPLE_MESSAGE:
                    exampleFunctionToRun();
                    break;
                default: 
            }
        }


    // Main
    // /////////////////////////////////////////////////////////////////////////
        startup();
}()); // END LOCAL_SCOPE