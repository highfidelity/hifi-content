/*
    pod_ui.js
    Edited by Rebecca Stankus on 2019-04-28 from appreciate_ui.js by Zach Fox
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

/* globals document EventBridge setTimeout */

// Handle EventBridge messages from *_app.js.
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (error) {
        console.log("Couldn't parse script event message: " + error);
        return;
    }
    if (message.app !== "workspace") {
        return;
    }
    switch (message.method) {
        case "updateUI":
            document.getElementById("loadingContainer").style.display = "none";
            var personalPodSettings = message.personalPodSettings;
            var roomAccentColor = message.personalPodSettings.roomAccentColor;
            var lightColor = message.personalPodSettings.lightColor;
            document.getElementById("deskImageURL").value = personalPodSettings.deskImageURL;
            document.getElementById("deskThumb").src = personalPodSettings.deskImageURL;
            document.getElementById("wallImageURL").value = personalPodSettings.wallImageURL;
            document.getElementById("wallThumb").src = personalPodSettings.wallImageURL;
            document.getElementById("colorPickerRoom").style.backgroundColor = 
                "rgb(" + roomAccentColor.red + "," + roomAccentColor.green + "," + roomAccentColor.blue + ")";
            document.getElementById("colorPickerLight").style.backgroundColor = 
            "rgb(" + lightColor.red + "," + lightColor.green + "," + lightColor.blue + ")";
            document.getElementById("windowTintSwitch").checked = personalPodSettings.windowTint;
            break;
        default:
            console.log("Unknown message received from appreciate_app.js! " + JSON.stringify(message));
            break;
    }
}

/* change the image on the desk of the pod */
function sendDeskImageURL(url) {
    // var charsInFileType = 4;
    // var fileType = url.substr(url.length - charsInFileType);
    // if (!(fileType === ".png" || fileType === ".jpg")) {
    //     // show error message about file type
    //     return;
    // }
    EventBridge.emitWebEvent(JSON.stringify({
        app: "workspace",
        method: "deskImageSwap",
        imageURL: url
    }));
    if (url === "") {
        document.getElementById("deskThumb").style.display = "none";
        document.getElementById("deskThumb").src= "";
        document.getElementById("deskThumb").alt= "";
    } else {
        document.getElementById("deskThumb").style.display = "inline";
        document.getElementById("deskThumb").src= url;
        document.getElementById("deskThumb").alt= "User image";
    }
}

/* Change the image on the wall of the pod */
function sendWallImageURL(url, type) {
    // var charsInFileType = 4;
    // var fileType = url.substr(url.length - charsInFileType);
    // if (!(fileType === ".png" || fileType === ".jpg")) {
    //     // show error message about file type
    //     return;
    // }
    EventBridge.emitWebEvent(JSON.stringify({
        app: "workspace",
        method: "wallImageSwap",
        imageURL: url,
        type: type
    }));
    if (url === "") {
        document.getElementById("wallThumb").src= "";
        document.getElementById("wallThumb").alt= "";
    } else {
        document.getElementById("wallThumb").src = url;
        document.getElementById("wallThumb").alt= "User image";
    }
}

/* Change the accent color of the pod */
function setRoomAccentColor(jscolor) {
    var newRoomColor = {
        "red": jscolor.rgb[0],
        "green": jscolor.rgb[1],
        "blue": jscolor.rgb[2]
    };
    EventBridge.emitWebEvent(JSON.stringify({
        app: "workspace",
        method: "updateRoomAccentColor",
        color: newRoomColor
    }));
}

/* Change the color of th pod light */
function setLightColor(jscolor) {
    var newLightColor = {
        "red": jscolor.rgb[0],
        "green": jscolor.rgb[1],
        "blue": jscolor.rgb[2]
    };
    EventBridge.emitWebEvent(JSON.stringify({
        app: "workspace",
        method: "updateLightColor",
        color: newLightColor
    }));
}

/* Update whether or not pod windows are tinted */
function windowTintToggle(checkbox) {
    EventBridge.emitWebEvent(JSON.stringify({
        app: "workspace",
        method: "setWindowTint",
        windowTint: checkbox.checked
    }));
}

// This delay is necessary to allow for the JS EventBridge to become active.
// The delay is still necessary for HTML apps in RC78+.
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "workspace",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();