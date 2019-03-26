//
// notify_app.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    function onEventBridgeReady() {
        ui.sendMessage({
            app: APP_NAME,
            method: "initializeUI"
        });
    }


    // Handle EventBridge messages from UI JavaScript.
    function onWebEventReceived(event) {
        if (event.app !== APP_NAME) {
            return;
        }
        
        switch (event.method) {
            case "eventBridgeReady":
                onEventBridgeReady();
                break;


            default:
                console.log("Unrecognized event method supplied to App JS: " + event.method);
                break;
        }
    }


    // When the script starts up, setup AppUI and call `cacheSounds()`.
    // Also hook up necessary signals and open the app's UI.
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/notify_ui.html?0');
    var APP_NAME = "NOTIFY";
    function startup() {
        ui = new AppUi({
            buttonName: APP_NAME,
            home: appPage,
            onMessage: onWebEventReceived
        });
    }
    startup();
})();
