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
        var AppUi = Script.require('./AppUi.js');
        var Helper = Script.require('https://raw.githubusercontent.com/highfidelity/hifi-content/master/Utilities/Helper.js');
    
    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var URL = Script.resolvePath("./html/tablet.html"),
            BUTTON_NAME = "VOTEAPP",

            EXAMPLE_MESSAGE = "EXAMPLE_MESSAGE",
            EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";

        var locationList = ["theSpot", "help"];
        var VOTE_APP_SETTINGS_NAME = "robinTest";

    // Init
    // /////////////////////////////////////////////////////////////////////////
        var ui;
        var dataStore = {
            openPolls: {
                avatar: false,
                domain: true
            },
            visitedAllDomains: false,
            clientData: { help: false, studio: true },
            domainList: {

            }
        };
    // Constructors
    // /////////////////////////////////////////////////////////////////////////
    // Collections
    // /////////////////////////////////////////////////////////////////////////
    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////
        var handleEvent = {

            onHostChanged: function (host) {
                print("Host changed to: " + host);

                if (isLocationVisitable(host)) {
                    this.markVisitedOrSetup(host);
                }
            },
            setup: function () {

                var locations = {};
                locationList.forEach(function (locationName) {
                    locationName = locationName.toLowerCase();
                    locations[locationName] = false; // for visited false
                });
                Settings.setValue(VOTE_APP_SETTINGS_NAME, locations);

            },

            markVisitedOrSetup: function (host) {

                var hostName = host.toLowerCase();
                var clientData = Settings.getValue(VOTE_APP_SETTINGS_NAME);

                // no data on client setup()
                if (!clientData) {
                    this.setup();
                    clientData = Settings.getValue(VOTE_APP_SETTINGS_NAME);
                }

                if (clientData) {
                    // mark as visited
                    clientData[hostName] = true;
                }
                Settings.setValue(VOTE_APP_SETTINGS_NAME, clientData);
                
                // update ui's clientData
                ui.clientData = clientData;
                ui.visitedAllDomains = checkVisitedAllDomains(clientData);

                ui.uiUpdate(dataStore);
            }

        };

        function resetLocationList() {
            // userData changed
            // added a new location
            // collect old location data and integrate that into the new list
            // set the lowercase locationList
        }

        function checkVisitedAllDomains(clientData) {
            var locations = Object.keys(clientData);

            var visitedAllDomains = locations.reduce(function (hasVisitedAllDomains, locationName) {
                return hasVisitedAllDomains && clientData[locationName];
            }, true);

            return visitedAllDomains;
        }

        function isLocationVisitable(host) {
            var hostName = host.toLowerCase();

            // get locations in lowercase form
            var locations = Object.keys(locationList).map(function (name) {
                return name.toLowerCase(); 
            }); // get from userData
            var isCurrentLocationVisitable = locations.indexOf(hostName) !== -1; // currentLocation is on list

            return isCurrentLocationVisitable;
        }

    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
        function exampleFunctionToRun() {

        }

    // Tablet
    // /////////////////////////////////////////////////////////////////////////
        function startup() {
            ui = new AppUi({
                buttonName: BUTTON_NAME,
                home: URL,
                onMessage: onMessage,
                graphicsDirectory: Script.resolvePath("./icons/")
            });

            location.hostChanged.connect(handleEvent.onHostChanged);
        }

        function unload() {
            location.hostChanged.disconnect(handleEvent.onHostChanged);
        }

        function onMessage(data) {
            // EventBridge message from HTML script.
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    // ***  ui.updateUI(dataStore);
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

        Script.scriptEnding.connect(unload);
        
}()); // END LOCAL_SCOPE