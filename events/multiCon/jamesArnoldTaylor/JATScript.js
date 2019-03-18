//
//  JATAvatarScript.js
//
// Rezzes JAT's avatars as Overlays, and handle clicking on them.
//
//  Created by Zach Fox on 2019-03-15
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {
    var BASE_RELATIVE_POSITION = {"x":20.9303035736084,"y":-11.449395179748535,"z":-50.0930061340332};

    var config = Script.require(Script.resolvePath("config.json?" + Date.now()));

    var AVATAR_OVERLAY_PROPERTIES = [
        {
            "type": "Model",
            "name": config.avatars[0].name,
            "position": {
                "x": 0.8213138580322266,
                "y": 0.022147178649902344,
                "z": 0.5046806335449219
            },
            "dimensions": {
                "x": 0.4687473773956299,
                "y": 0.797889769077301,
                "z": 0.3429218530654907
            },
            "rotation": {
                "x": -0.0000457763671875,
                "y": -0.2866712212562561,
                "z": -0.0000152587890625,
                "w": 0.9580377340316772
            },
            "url": config.avatars[0].url,
            "isFacingAvatar": false
        },
        {
            "id": "{d8ad1d89-038e-43c2-87dc-6d38988a71a4}",
            "type": "Model",
            "name": config.avatars[1].name,
            "position": {
                "x": 2.492778778076172,
                "y": 0.08696365356445312,
                "z": 2.8273887634277344
            },
            "dimensions": {
                "x": 0.5626906156539917,
                "y": 0.9782152771949768,
                "z": 0.20142969489097595
            },
            "rotation": {
                "x": 0.0000152587890625,
                "y": 0.5656976699829102,
                "z": -0.0000457763671875,
                "w": -0.8246127963066101
            },
            "url": config.avatars[1].url,
            "isFacingAvatar": false
        },
        {
            "id": "{ac2a7754-eec7-4bb6-9550-3af9caa970c9}",
            "type": "Model",
            "name": config.avatars[2].name,
            "position": {
                "x": 1.6198616027832031,
                "y": 0.17209148406982422,
                "z": 1.1371917724609375
            },
            "dimensions": {
                "x": 1.1117140054702759,
                "y": 0.8896834254264832,
                "z": 0.6230975985527039
            },
            "rotation": {
                "x": -0.0000457763671875,
                "y": -0.423941433429718,
                "z": -0.0000457763671875,
                "w": 0.9056992530822754
            },
            "url": config.avatars[2].url,
            "isFacingAvatar": false
        },
        {
            "id": "{0b261ed8-4c78-40db-915d-951b819821f5}",
            "type": "Model",
            "name": config.avatars[3].name,
            "position": {
                "x": 0,
                "y": 0.12828731536865234,
                "z": 0
            },
            "dimensions": {
                "x": 1.0574196577072144,
                "y": 1.1382946968078613,
                "z": 0.27917155623435974
            },
            "rotation": {
                "x": -0.0000457763671875,
                "y": -0.22655069828033447,
                "z": -0.0000152587890625,
                "w": 0.9739986658096313
            },
            "url": config.avatars[3].url,
            "isFacingAvatar": false
        },
        {
            "id": "{57168289-d40e-467a-8154-c9f1c6868615}",
            "type": "Model",
            "name": config.avatars[4].name,
            "position": {
                "x": 2.1323165893554688,
                "y": 0,
                "z": 2.091522216796875
            },
            "dimensions": {
                "x": 0.667604386806488,
                "y": 0.8386905193328857,
                "z": 0.1569727063179016
            },
            "rotation": {
                "x": 0.0000152587890625,
                "y": 0.5126268863677979,
                "z": -0.0000762939453125,
                "w": -0.8586099147796631
            },
            "url": config.avatars[4].url,
            "isFacingAvatar": false
        }
    ];

    var BUTTON_DIMENSIONS = {"x": 0.2, "y": 0.2, "z": 0.2};
    var BUTTON_ROTATION = Quat.fromPitchYawRollDegrees(180, 140, 180);
    var BUTTON_ROTATION_PREV = Quat.fromPitchYawRollDegrees(180, -140, 0);

    var CONTROL_BUTTON_PROPERTIES = [
        {
            "name": "play",
            "url": "https://hifi-content.s3.amazonaws.com/alan/dev/playback_play-button.fbx",
            "position": {
                "x": 16.6961,
                "y": -11.1147,
                "z": -48.6680
            },
            "dimensions": BUTTON_DIMENSIONS,
            "rotation": BUTTON_ROTATION
        },
        {
            "name": "pause",
            "url": "https://hifi-content.s3.amazonaws.com/alan/dev/playback_pause-button.fbx",
            "position": {
                "x": 17.1057,
                "y": -11.1149,
                "z": -48.9547
            },
            "dimensions": BUTTON_DIMENSIONS,
            "rotation": BUTTON_ROTATION
        },
        {
            "name": "previous",
            "url": "https://hifi-content.s3.amazonaws.com/alan/dev/playback_ff-rw-button.fbx",
            "position": {
                "x": 17.5153,
                "y": -11.1150,
                "z": -49.2414
            },
            "dimensions": BUTTON_DIMENSIONS,
            "rotation": BUTTON_ROTATION_PREV
        },
        {
            "name": "next",
            "url": "https://hifi-content.s3.amazonaws.com/alan/dev/playback_ff-rw-button.fbx",
            "position": {
                "x": 17.9249,
                "y": -11.1151,
                "z": -49.5279
            },
            "dimensions": BUTTON_DIMENSIONS,
            "rotation": BUTTON_ROTATION
        }
    ];

    var TEXT_OVERLAY_PROPERTIES = {
        "name": "text",
        "lineHeight": 0.10,
        "backgroundAlpha": 0.75,
        "position": {
            "x": 15.7621,
            "y": -11.3145,
            "z": -48.2583
        },
        "rotation": BUTTON_ROTATION,
        "dimensions": {
            "x": 1.5,
            "y": 0.25,
            "z": 1
        },
        "topMargin": 0,
        "rightMargin": 0,
        "bottomMargin": 0,
        "leftMargin": 0
    };

    var METERS_TO_INCHES = 39.3701;
    var WEB_OVERLAY_PROPERTIES = {
        "rotation": BUTTON_ROTATION,
        "dimensions": {
            "x": 1,
            "y": 1,
            "z": 0
        },
        "position": {
            "x": 18.8594,
            "y": -11.3154,
            "z": -50.4261
        },
        "url": config.screenleapURL,
        "dpi": 1920 / (3 * METERS_TO_INCHES),
        "alpha": 0.75
    };

    var rezzedAvatarOverlays = [];
    function rezAvatarOverlays() {
        for (var i = 0; i < AVATAR_OVERLAY_PROPERTIES.length; i++) {
            var currentProps = AVATAR_OVERLAY_PROPERTIES[i];
            currentProps.position = Vec3.sum(currentProps.position, BASE_RELATIVE_POSITION);
            console.log("Rezzing overlay with name " +
                AVATAR_OVERLAY_PROPERTIES[i].name + " at " + JSON.stringify(currentProps.position));
            rezzedAvatarOverlays.push(Overlays.addOverlay("model", currentProps));
        }
    }

    var rezzedControlButtonOverlays = [];
    function rezVideoControlButtons() {
        for (var i = 0; i < CONTROL_BUTTON_PROPERTIES.length; i++) {
            var currentProps = CONTROL_BUTTON_PROPERTIES[i];
            console.log("Rezzing overlay with name " +
                CONTROL_BUTTON_PROPERTIES[i].name + " at " + JSON.stringify(currentProps.position));
            rezzedControlButtonOverlays.push(Overlays.addOverlay("model", currentProps));
        }
    }

    var textOverlay = false;
    function rezTextOverlay() {
        console.log("Rezzing overlay with name " +
            TEXT_OVERLAY_PROPERTIES.name + " at " + JSON.stringify(TEXT_OVERLAY_PROPERTIES.position));
        textOverlay = Overlays.addOverlay("text3d", TEXT_OVERLAY_PROPERTIES);
    }

    var webOverlay = false;
    function rezWebOverlay() {
        console.log("Rezzing overlay with name " +
        WEB_OVERLAY_PROPERTIES.name + " at " + JSON.stringify(WEB_OVERLAY_PROPERTIES.position));
        webOverlay = Overlays.addOverlay("web3d", WEB_OVERLAY_PROPERTIES);
    }

    function startup() {
        console.log("Welcome to rezJATAvatars.js!");
    
        rezAvatarOverlays();
        rezVideoControlButtons();
        rezTextOverlay();
        rezWebOverlay();
    }

    function onScriptEnding() {
        for (var i = 0; i < rezzedAvatarOverlays.length; i++) {
            console.log("Deleting local entity with ID " + rezzedAvatarOverlays[i]);
            Overlays.deleteOverlay(rezzedAvatarOverlays[i]);
        }
        for (i = 0; i < rezzedAvatarOverlays.length; i++) {
            console.log("Deleting local entity with ID " + rezzedControlButtonOverlays[i]);
            Overlays.deleteOverlay(rezzedControlButtonOverlays[i]);
        }

        if (textOverlay) {
            Overlays.deleteOverlay(textOverlay);
        }

        if (webOverlay) {
            Overlays.deleteOverlay(webOverlay);
        }

        Overlays.mousePressOnOverlay.disconnect(onMousePressOnOverlay);
    }

    var MESSAGE_CHANNEL = config.controlsMessageChannel;
    function handleControlButtonPress(id) {
        var name = Overlays.getProperties(id, ["name"]).name;

        switch (name) {
            case "play":
                Messages.sendMessage(MESSAGE_CHANNEL, 'play');
                break;

            case "pause":
                Messages.sendMessage(MESSAGE_CHANNEL, 'pause');
                break;

            case "previous":
                Messages.sendMessage(MESSAGE_CHANNEL, 'previous');
                break;

            case "next":
                Messages.sendMessage(MESSAGE_CHANNEL, 'next');
                break;

            default:
                console.log("Unhandled button overlay pressed");
        }
    }

    var STATUS_MESSAGE_CHANNEL = config.statusMessageChannel;
    function onMessageReceived(channel, message) {
        if (channel === STATUS_MESSAGE_CHANNEL && textOverlay){
            console.log("message", message);
            Overlays.editOverlay(textOverlay, {text: message});
        }
    }

    function onMousePressOnOverlay(id, event) {
        if (!event.button === "Primary") {
            return;
        }
        
        if (rezzedAvatarOverlays.indexOf(id) > -1) {
            var modelURL = Overlays.getProperties(id, ["url"]).url;
            MyAvatar.useFullAvatarURL(modelURL);
        } else if (rezzedControlButtonOverlays.indexOf(id) > -1) {
            handleControlButtonPress(id);
        }
    }

    Overlays.mousePressOnOverlay.connect(onMousePressOnOverlay);
    Script.scriptEnding.connect(onScriptEnding);
    Messages.subscribe(STATUS_MESSAGE_CHANNEL);
    Messages.messageReceived.connect(onMessageReceived);
    startup();
})();
