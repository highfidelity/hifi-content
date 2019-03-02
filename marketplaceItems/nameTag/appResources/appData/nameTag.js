/*

    Name Tag
    Created by Milad Nazeri on 2019-02-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    
*/

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region Utilty
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    var PickRayController = Script.require('./resources/modules/pickRayController.js?' + Date.now());
    var AvatarListManager = Script.require('./resources/modules/avatarListManager.js?' + Date.now());
    var pickRayController = new PickRayController();
    var avatarListManager = new AvatarListManager().create();


    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // *************************************
    // START AVATAR FUNCTIONS
    // *************************************
    // #region Solo


    // Handles avatar being solo'd
    pickRayController
        .registerEventHandler(selectAvatar)
        .setType("avatar")
        .setMapName("hifi_nametags")
        .setShouldDoublePress(true)
        .create();

    function selectAvatar(uuid, intersection) {
        console.log("in selectAvatar");
        log("intersection", intersection)
        avatarListManager.handleSelect(uuid, intersection);
    }


    // #endregion
    // *************************************
    // STOP SOLO FUNCTIONS
    // *************************************

    // *************************************
    // START TABLET FUNCTIONS
    // *************************************
    // #region Tabletv 


    var BUTTON_NAME = "NAME_TAG";
    var URL = Script.resolvePath('./resources/nametag_ui.html');
    var appUi = Script.require('appUi');

    var ui = new appUi({
        buttonName: BUTTON_NAME,
        home: URL,
        graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
        onMessage: onMessage
    });


    // Handles incoming tablet messages
    function onMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                updateUI();
                break;
            case "CLEAR_LIST":
                resetTags();
                break;
            case "REMOVE_USER":
                removeUser(data.value);
                break;
            default:
        }
    }


    // Handles how the UI gets updated
    function updateUI() {
        // var avatarNames = [];
        // for (var key in avatars) {
        //     avatarNames.push(avatars[key].name);
        // }
        // ui.sendToHtml({
        //     type: "UPDATE_TAGS",
        //     value: avatarNames
        // });
    }

    // #endregion 
    // *************************************
    // STOP TABLET FUNCTIONS
    // *************************************

    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN

    pickRayController.enable();

    // #endregion
    // *************************************
    // STOP MAIN
    // *************************************


    // *************************************
    // START CLEANUP
    // *************************************
    // #region Cleanup 


    // Handles reset of list if you change domains
    function onDomainChange() {
        avatarListManager.reset();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(uuid) {
        avatarListManager.maybeRemove(uuid);
    }

    Window.domainChanged.connect(onDomainChange);

    AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);

    // Called when the script is closing
    function scriptEnding() {
        console.log("script finished")
        avatarListManager.destroy();
        pickRayController.destroy();
        Window.domainChanged.disconnect(onDomainChange);
        AvatarManager.avatarRemovedEvent.disconnect(onAvatarRemoved);
    }


    Script.scriptEnding.connect(scriptEnding);


    // #endregion
    // *************************************
    // STOP CLEANUP
    // *************************************

})();



// Calculate the distance

// Update the overlay

// Track how long the overlay lasts

// 

// Create an overlay

// Get a user name

// Create the second overlay

// Handle being a friend

// Make sure always in front

// Get the intersection point

// Controller Interaction