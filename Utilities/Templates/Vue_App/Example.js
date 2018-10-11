"use strict";
/* eslint-disable indent */

//
//  Example Vue App
//
//  Created by Milad Nazeri on 2018-10-11
//  Modified from AppUi.js by Howard Stearns on 2 Nov 2016
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Tablet, Script, HMD, Controller, Menu */

(function () { // BEGIN LOCAL_SCOPE
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
        var 
            AppUi = Script.require('./AppUi.js')
        ;
    
    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            URL = Script.resolvePath("./html/tablet.html"),
            BUTTON_NAME = "BUTTON_NAME",

            EXAMPLE_MESSAGE = "EXAMPLE_MESSAGE",
            EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen"
        ;

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var 
            ui
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
                onMessage: onMessage
            });
        }

        function onMessage(data) {
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    ui.uiUpdate();
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