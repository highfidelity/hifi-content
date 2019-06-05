//
//    Lily Pad User Inspector
//    Created by Milad Nazeri on 2019-02-16
//    Copyright 2019 High Fidelity, Inc.
//
//    Distributed under the Apache License, Version 2.0.
//    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//    Click on someone to get a nametag for them
//    

(function () {
    
    var PickRayController = Script.require('./resources/modules/pickRayController.js?' + Date.now());
    var NameTagListManager = Script.require('./resources/modules/nameTagListManager.js?' + Date.now());
    var pickRayController = new PickRayController();
    var nameTagListManager = new NameTagListManager().create();

    // Handles avatar being solo'd
    pickRayController
        .registerEventHandler(selectAvatar)
        .setType("avatar")
        .setMapName("hifi_lilyPadUserInspector")
        .setShouldDoublePress(true)
        .create()
        .enable();


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

    
    // Automatically add an avatar if they come into the domain.  Mainly used for alwaysOn mode.
    function onAvatarAdded(uuid) {
        nameTagListManager.maybeAdd(uuid);
    }


    // Called when the script is closing
    function scriptEnding() {
        nameTagListManager.destroy();
        pickRayController.destroy();
        Window.domainChanged.disconnect(onDomainChange);
        AvatarManager.avatarRemovedEvent.disconnect(onAvatarRemoved);
        AvatarManager.avatarAddedEvent.disconnect(onAvatarAdded);
    }


    // Updates the current user scale
    function updateCurrentUserScaler() {
        ui.sendMessage({
            app: "lilyPadUserInspector",
            method: "updateCurrentUserScaler", 
            currentUserScaler: currentUserScaler
        });
    }


    // Register the initial userScaler if it was saved in your settings
    var currentUserScaler = Settings.getValue("lilyPadUserInspector/userScaler", 0.6);
    nameTagListManager.registerInitialScaler(currentUserScaler);
    function updateUserScaler(newSize){
        nameTagListManager.updateUserScaler(newSize);
    }


    // chose which mode you want the nametags in.  On, off, or alwaysOn.
    var mode = Settings.getValue("lilyPadUserInspector/mode", "on");
    handleMode(mode);
    nameTagListManager.changeMode(mode);
    function handleMode(type){
        mode = type;
        nameTagListManager.changeMode(mode);
    }


    function onMessage(message) {
        if (message.app !== "lilyPadUserInspector") {
            return;
        }
        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "lilyPadUserInspector",
                    method: "updateUI",
                    currentUserScaler: currentUserScaler,
                    mode: mode
                });
                break;
            case "updateUserScaler":
                currentUserScaler = +message.currentUserScaler;
                Settings.setValue("lilyPadUserInspector/userScaler", currentUserScaler);
                updateUserScaler(currentUserScaler);
                break;
            case "handleMode":
                mode = message.mode;
                Settings.setValue("lilyPadUserInspector/mode", mode);
                handleMode(mode);
                break;
            default:
                console.log("Unhandled message from lilyPadUserInspector_ui.js: " + JSON.stringify(message));
                break;
        }
    }

    
    var BUTTON_NAME = "INSPECTOR";
    var APP_UI_URL = Script.resolvePath('resources/lilyPadUserInspector_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            // User by Craig from the Noun Project
            graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
            onMessage: onMessage
        });


        Window.domainChanged.connect(onDomainChange);
        AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);
        AvatarManager.avatarAddedEvent.connect(onAvatarAdded);
    }


    Script.scriptEnding.connect(scriptEnding);
    startup();

})();