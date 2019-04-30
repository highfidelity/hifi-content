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

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************


    /* PLAY A SOUND: Plays the specified sound at the specified position using the volume and playback 
    modes requested. */
    var injector;
    function playSound(sound, volume, position, localOnly, loop){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
                injector = null;
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly,
                loop: loop
            });
        }
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* CREATE A QUESTION MARK: Checks that question Mark does not already exist, then calculates position above 
    avatar's head and creates a question mark entity there */
    var changingInterval;

    /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the question mark.
    If we are closing the app, remove the question mark and play a different sound */
    function onOpened() {
    }

    /* ON STOPPING THE SCRIPT: Disconnect signals and clean up */
    function appEnding() {
        cleanUp();
        Window.domainChanged.disconnect(domainChanged);
    }

    /* CLEANUP: Remove question mark, search for any unreferenced question marks to clean up */
    function cleanUp() {
        if (changingInterval) {
            Script.clearInterval(changingInterval);
            changingInterval = null;
        }
        if (injector) {
            injector.stop();
            injector = null;
        }
    }

    function onMessage(message) {
        if (message.app !== "workspace") {
            return;
        }

        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    method: "updateUI"
                });
                break;

            default:
                console.log("Unhandled message from appreciate_ui.js: " + JSON.stringify(message));
                break;
        }
    }

    /* WHEN USER DOMAIN CHANGES: Close app to remove question mark when leaving the domain */
    var WAIT_TO_CLEAN_UP_MS = 2000;
    function domainChanged() {
        Script.setTimeout(function() {
            cleanUp();
        }, WAIT_TO_CLEAN_UP_MS);
    }
    var BUTTON_NAME = "WORKSPACE";
    var APP_UI_URL = Script.resolvePath('resources/pod_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    ui = new AppUI({
        sortOrder: 1,
        home: APP_UI_URL,
        buttonName: BUTTON_NAME,
        // Home Office icon https://icons8.com/icons/set/workspace
        graphicsDirectory: Script.resolvePath('resources/images/icons/'),
        onOpened: onOpened,
        onMessage: onMessage
    });
    Window.domainChanged.connect(domainChanged);
    Script.scriptEnding.connect(appEnding);
}());
