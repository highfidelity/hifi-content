//
// emojiTablet.js
// A tablet app for sending emojis to other users
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2017
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

var library = Script.require(Script.resolvePath("emojiLib.js"));

(function() {

    var APP_NAME = "EMOJIS";
    var APP_URL = Script.resolvePath("emojiTabletUI.html");
    var APP_ICON = "./icons/emoji-i.svg";
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var isOpen = false;

    var DISTANCE = 0.5;
    var WANT_DEBUG = true;

    var button = tablet.addButton({
        icon: APP_ICON,
        text: APP_NAME
    });

    // Activates tablet UI when selected from menu
    function onClicked() {
        if (isOpen) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(APP_URL);
        }
    }
    button.clicked.connect(onClicked);

    function onScreenChanged(type, url) {
        isOpen = (url === APP_URL);
    }

    tablet.screenChanged.connect(onScreenChanged);

    // Gives position right in front of user's avatar
    function getPositionToCreateEntity() {
        var cameraMode = Camera.getModeString();
        var scale = MyAvatar.scale;
        var orientation = MyAvatar.orientation;
        var position = MyAvatar.position;
        var rezOffset;
        if (cameraMode === "first person") {
            rezOffset = {
                x: 0.0,
                y: 0.4,
                z: -0.5
            };

        } else {
            rezOffset = {
                x: 0.0,
                y: 0.7,
                z: -0.5
            };
        }
        rezOffset = Vec3.multiply(rezOffset, scale);
        return Vec3.sum(position, Vec3.multiplyQbyV(orientation, rezOffset));
    }

    var emojiJSON = null;

    // Handles emoji button clicks to retrieve the link to the emoji JSON from emojiLib
    function onWebEventReceived(event) {
        if (JSON.parse(event).type === "emoji-click") {
            var emojiName = (JSON.parse(event)).data;
            var url = library.getEmoji(emojiName, library.emojiLib);
            if (url !== null) {
                emojiJSON = Script.require(url);
                create3DEmoji(emojiJSON, null);
            } else if (WANT_DEBUG) {
                print("Unable to create emoji");
            }
        }
    }
    tablet.webEventReceived.connect(onWebEventReceived);

    function create3DEmoji(emojiJSON, userName) {
        if (WANT_DEBUG) {
            print("Creating " + emojiJSON.name + " emoji");
        }
        emojiJSON.position = getPositionToCreateEntity(emojiJSON.personified);
        Entities.addEntity(emojiJSON);
    }

    // When tablet UI is closed and app is removed from menu
    function cleanup() {
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
    }
    Script.scriptEnding.connect(cleanup);

}());
