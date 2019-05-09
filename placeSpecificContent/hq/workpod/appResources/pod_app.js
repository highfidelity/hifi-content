//
//  pod_app.js
//
//  Created by Rebecca Stankus on 02/21/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global  Audio, Camera, Controller, Entities, HMD, Messages, MyAvatar, Quat, Script, Settings, SoundCache, 
Tablet, Users, Vec3, Window */

(function() {

    var DEFAULT_POD_SETTINGS = {
        deskImageURL: Script.resolvePath("resources/images/podAppThumbPortrait.png"),
        wallImageURL: Script.resolvePath("resources/images/podAppThumbLandscape.png"),
        roomAccentColor: { red: 138, green: 199, blue: 115 },
        lightColor: { red: 240, green: 233, blue: 103 },
        windowTint: false,
        podPanelID: "null"
    };

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    // /* PLAY A SOUND: Plays the specified sound at the specified position using the volume and playback 
    // modes requested. */
    // var injector;
    // function playSound(sound, volume, position, localOnly, loop){
    //     if (sound.downloaded) {
    //         if (injector) {
    //             injector.stop();
    //             injector = null;
    //         }
    //         injector = Audio.playSound(sound, {
    //             position: position,
    //             volume: volume,
    //             localOnly: localOnly,
    //             loop: loop
    //         });
    //     }
    // }

    /* Round each value of an RGB color to a whole number */
    function roundRGBValues(color) {
        var numberDecimals = 0;
        color.red = color.red.toFixed(numberDecimals);
        color.green = color.green.toFixed(numberDecimals);
        color.blue = color.blue.toFixed(numberDecimals);
        return color;
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // /* ON STOPPING THE SCRIPT: Disconnect signals and clean up */
    // function appEnding() {
    //     // cleanUp();
    //     Window.domainChanged.disconnect(domainChanged);
    // }

    /*  */
    // function cleanUp() {
    //     if (injector) {
    //         injector.stop();
    //         injector = null;
    //     }
    // }

    /* Handle messages from the pod app. Begin by getting the user's pod preference settings, then editing whichever 
        setting is changed according to this message. Update the user's settings after changes are made. */
    var personalPodSettings;
    var podPanelID;
    function onMessage(message) {
        if (message.app !== "workspace") {
            return;
        }
        personalPodSettings = Settings.getValue("workSpace");
        if (!personalPodSettings) {
            personalPodSettings = DEFAULT_POD_SETTINGS;
        } else if (personalPodSettings.podPanelID) {
            podPanelID = personalPodSettings.podPanelID;
        }
        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "workspace",
                    method: "updateUI",
                    personalPodSettings: personalPodSettings
                });
                break;
            case "deskImageSwap":
                print(message.imageURL);
                personalPodSettings.deskImageURL = message.imageURL;
                break;
            case "wallImageSwap":
                print(message.imageURL);
                personalPodSettings.wallImageURL = message.imageURL;
                break;
            case "updateRoomAccentColor":
                var roomColor = roundRGBValues(message.color);
                print(JSON.stringify(roomColor));
                personalPodSettings.roomAccentColor = roomColor;
                break;
            case "updateLightColor":
                var lightColor = roundRGBValues(message.color);
                print(JSON.stringify(lightColor));
                personalPodSettings.lightColor = lightColor;
                break;
            case "setWindowTint":
                print(message.windowTint);
                personalPodSettings.windowTint = message.windowTint;
                break;
            default:
                console.log("Unhandled message from appreciate_ui.js: " + JSON.stringify(message));
                break;
        }
        Settings.setValue("workSpace", personalPodSettings);
        updatePod();
    }

    function updatePod() {
        print("CALLING SERVER TO UPDATE POD");
        Entities.callEntityServerMethod(podPanelID, 'updatePod', [JSON.stringify(personalPodSettings)]);
    }

    // /* When leaving the domain,  */
    // var WAIT_TO_CLEAN_UP_MS = 2000;
    // function domainChanged() {
    //     Script.setTimeout(function() {
    //         cleanUp();
    //     }, WAIT_TO_CLEAN_UP_MS);
    // }
    var BUTTON_NAME = "WORKSPACE";
    var APP_UI_URL = Script.resolvePath('resources/pod_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    personalPodSettings = Settings.getValue("workSpace");
    if (!personalPodSettings) {
        personalPodSettings = DEFAULT_POD_SETTINGS;
    }
    updatePod();
    ui = new AppUI({
        sortOrder: 1,
        home: APP_UI_URL,
        buttonName: BUTTON_NAME,
        // Home Office icon https://icons8.com/icons/set/workspace
        graphicsDirectory: Script.resolvePath('resources/images/icons/'),
        onMessage: onMessage
    });
    // Window.domainChanged.connect(domainChanged);
    // Script.scriptEnding.connect(appEnding);
}());
