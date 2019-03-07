/*

    Name Tag
    Created by Milad Nazeri on 2019-02-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    
*/

(function () {
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    var PickRayController = Script.require('./resources/modules/pickRayController.js?' + Date.now());
    var AvatarListManager = Script.require('./resources/modules/avatarListManager.js?' + Date.now());
    var pickRayController = new PickRayController();
    var avatarListManager = new AvatarListManager().create();

    // Handles avatar being solo'd
    pickRayController
        .registerEventHandler(selectAvatar)
        .setType("avatar")
        .setMapName("hifi_nametags")
        .setShouldDoublePress(true)
        .create();

    function selectAvatar(uuid, intersection) {
        console.log("in selectAvatar");
        avatarListManager.handleSelect(uuid, intersection);
    }


    // Handles reset of list if you change domains
    function onDomainChange() {
        avatarListManager.reset();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(uuid) {
        avatarListManager.maybeRemove(uuid);
    }


    // Called when the script is closing
    function scriptEnding() {
        console.log("script finished")
        avatarListManager.destroy();
        pickRayController.destroy();
        Window.domainChanged.disconnect(onDomainChange);
        AvatarManager.avatarRemovedEvent.disconnect(onAvatarRemoved);
    }


    // Updates the Current Intensity Meter UI element. Called when intensity changes.
    function updateCurrentUserScaler() {
        // var currentUserScaler = Settings.getValue("nametag/enabled", false);
        ui.sendMessage({method: "updateCurrentUserScaler", currentUserScaler: currentUserScaler});
    }


    function onOpened() {
        updateCurrentUserScaler();
    }


    var currentUserScaler = 1.0;
    // var currentUserScaler = Settings.getValue("nameTag/userScaler", 1.0);
    avatarListManager.registerInitialScaler(currentUserScaler);
    function updateUserScaler(newSize){
        avatarListManager.updateUserScaler(newSize);
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
                    // isFirstRun: Settings.getValue("appreciate/firstRun", true),
                });
                break;
            case "nametagSwitchClicked":
                // Settings.setValue("appreciate/firstRun", false);
                nameTagEnabled = message.nameTagEnabled;
                Settings.setValue("nametag/enabled", nameTagEnabled);
                enableOrDisableNameTag();
                break;
            case "updateUserScaler":
                currentUserScaler = +message.currentUserScaler;
                log("currentUserScaler", typeof currentUserScaler);
                // Settings.setValue("nameTag/userScaler", currentUserScaler);
                updateUserScaler(currentUserScaler);
                break;
            default:
                console.log("Unhandled message from nameTag_ui.js: " + JSON.stringify(message));
                break;
        }
    }


    // When called, this function will stop the versions of this script that are
    // baked into the client installation IF there's another version of the script
    // running that ISN'T the baked version.
    function maybeStopBakedScriptVersions() {
        var THIS_SCRIPT_FILENAME = "nameTag.js";
        var RELATIVE_PATH_TO_BAKED_SCRIPT = "system/experiences/nameTag/appResources/appData/" + THIS_SCRIPT_FILENAME;
        var bakedLocalScriptPaths = [];
        var alsoRunningNonBakedVersion = false;

        var runningScripts = ScriptDiscoveryService.getRunning();
        runningScripts.forEach(function(scriptObject) {
            if (scriptObject.local && scriptObject.url.indexOf(RELATIVE_PATH_TO_BAKED_SCRIPT) > -1) {
                bakedLocalScriptPaths.push(scriptObject.path);
            }

            if (scriptObject.name === THIS_SCRIPT_FILENAME && scriptObject.url.indexOf(RELATIVE_PATH_TO_BAKED_SCRIPT) === -1) {
                alsoRunningNonBakedVersion = true;
            }
        });

        if (alsoRunningNonBakedVersion && bakedLocalScriptPaths.length > 0) {
            for (var i = 0; i < bakedLocalScriptPaths.length; i++) {
                ScriptDiscoveryService.stopScript(bakedLocalScriptPaths[i]);
            }
        }
    }

    
    var BUTTON_NAME = "NAMETAG";
    var APP_UI_URL = Script.resolvePath('resources/nameTag_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            // clap by Rena from the Noun Project
            graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
            onOpened: onOpened,
            onMessage: onMessage
        });


        Window.domainChanged.connect(onDomainChange);
        AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);

        enableOrDisableNameTag();
        // maybeStopBakedScriptVersions();
    }


    Script.scriptEnding.connect(scriptEnding);
    startup();


})();


    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN

    // pickRayController.enable();

    // #endregion
    // *************************************
    // STOP MAIN
    // *************************************


    // #endregion
    // *************************************
    // STOP SOLO FUNCTIONS
    // *************************************

    // #endregion 
    // *************************************
    // STOP TABLET FUNCTIONS
    // *************************************

    // *************************************
    // START CLEANUP
    // *************************************
    // #region Cleanup 


    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region Utilty



    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // *************************************
    // START AVATAR FUNCTIONS
    // *************************************
    // #region Solo


    // #endregion
    // *************************************
    // STOP CLEANUP
    // *************************************

