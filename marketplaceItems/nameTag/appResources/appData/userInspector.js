/*

    User Inspector
    Created by Milad Nazeri on 2019-02-16
    Additional code by Zach Foxx
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Click on someone to get a nametag for them
    
*/

(function () {
    
    var PickRayController = Script.require('./resources/modules/pickRayController.js?' + Date.now());
    var NameTagListManager = Script.require('./resources/modules/nameTagListManager.js?' + Date.now());
    var pickRayController = new PickRayController();
    var nameTagListManager = new NameTagListManager().create();

    // Handles avatar being solo'd
    pickRayController
        .registerEventHandler(selectAvatar)
        .setType("avatar")
        .setMapName("hifi_userInspector")
        .setShouldDoublePress(true)
        .create();


    function selectAvatar(uuid, intersection) {
        nameTagListManager.handleSelect(uuid, intersection);
    }


    // Handles reset of list if you change domains
    function onDomainChange() {
        nameTagListManager.reset();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(uuid) {
        nameTagListManager.maybeRemove(uuid);
    }


    // Called when the script is closing
    function scriptEnding() {
        nameTagListManager.destroy();
        pickRayController.destroy();
        Window.domainChanged.disconnect(onDomainChange);
        AvatarManager.avatarRemovedEvent.disconnect(onAvatarRemoved);
    }


    // Updates the current user scale
    function updateCurrentUserScaler() {
        var currentUserScaler = Settings.getValue("nametag/enabled", false);
        ui.sendMessage({method: "updateCurrentUserScaler", currentUserScaler: currentUserScaler});
    }


    // Run when the tablet is opened
    function onOpened() {
        updateCurrentUserScaler();
    }


    // Register the initial userScaler if it was saved in your settings
    var currentUserScaler = Settings.getValue("nameTag/userScaler", 1.0);
    nameTagListManager.registerInitialScaler(currentUserScaler);
    function updateUserScaler(newSize){
        nameTagListManager.updateUserScaler(newSize);
    }


    // Enables or disables the app's main functionality
    var nameTagEnabled = Settings.getValue("nametag/enabled", false);
    function enableOrDisableNameTag() {
        if (nameTagEnabled) {
            pickRayController.enable();
        } else {
            pickRayController.disable();
        }
    }


    function onMessage(message) {
        if (message.app !== "nametag") {
            return;
        }
        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    method: "updateUI",
                    nameTagEnabled: nameTagEnabled,
                    currentUserScaler: currentUserScaler
                });
                break;
            case "nametagSwitchClicked":
                nameTagEnabled = message.nameTagEnabled;
                Settings.setValue("nametag/enabled", nameTagEnabled);
                enableOrDisableNameTag();
                break;
            case "updateUserScaler":
                currentUserScaler = +message.currentUserScaler;
                Settings.setValue("nameTag/userScaler", currentUserScaler);
                updateUserScaler(currentUserScaler);
                break;
            default:
                console.log("Unhandled message from userInspector_ui.js: " + JSON.stringify(message));
                break;
        }
    }

    
    var BUTTON_NAME = "INSPECTOR";
    var APP_UI_URL = Script.resolvePath('resources/userInspector_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            // User by Craig from the Noun Project
            graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
            onOpened: onOpened,
            onMessage: onMessage
        });


        Window.domainChanged.connect(onDomainChange);
        AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);

        enableOrDisableNameTag();
    }


    Script.scriptEnding.connect(scriptEnding);
    startup();

})();