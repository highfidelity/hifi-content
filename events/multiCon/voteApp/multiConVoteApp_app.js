//
//  multiConVoteApp_app.js
//
//  Created by Robin Wilson and Zach Fox on 2019-03-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global */

(function() {
    // Initialize the app's UI:
    // 1. Get vote app data from the server
    // 2. Send a message to the App's UI to add that data to the UI.
    function initializeUI() {
        ui.sendMessage({
            app: 'multiConVote',
            method: "initializeUI",
            voteData: {}
        });
    }


    // Handle EventBridge Web Events from multiConVoteApp_ui.html
    function onWebEventReceived(event) {
        if (event.app === 'multiConVote') {
            switch (event.type) {
                case "eventBridgeReady":
                    initializeUI();
                    break;
                default:
                    print("error in detecting event.type in MultiCon Vote app");
            }
        }
    }
    

    // Setup AppUI module
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/multiConVoteApp_ui.html?0');
    function startup() {
        ui = new AppUi({
            buttonName: "MULTICON",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived
        });
    }

    startup();
})();
