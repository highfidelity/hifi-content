"use strict";

//
//  teamControl.js
//
//  Created by David Back on 3/8/18.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Script, Tablet */
/* eslint indent: ["error", 4, { "outerIIFEBody": 0 }] */

(function() { // BEGIN LOCAL_SCOPE

var TEAM_CONTROL_APP_BASE = "TeamControlApp.html";
var TEAM_CONTROL_APP_URL = Script.resolvePath(TEAM_CONTROL_APP_BASE);
var TEAM_CONTROL_LABEL = "TEAMS";
var TEAM_CONTROL_APP_SORT_ORDER = 12;
var TEAM_CONTROL_CHANNEL = "TEAM_CONTROL_CHANNEL";

var GREEN_TEAM_MARKETPLACE_ID = "eae3d891-8376-446a-aa4b-343b80e51ec4";
var BLUE_TEAM_MARKETPLACE_ID = "a1b9e0e7-6568-42a5-80fc-74482da38bcd";
var RED_TEAM_MARKETPLACE_ID = "ce90c695-a98e-4248-876d-651f66c9e6f8";
var YELLOW_TEAM_MARKETPLACE_ID = "ce90c695-a98e-4248-876d-651f66c9e6f8";

var onTeamControlScreen = false;
var button;
var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

button = tablet.addButton({
    text: TEAM_CONTROL_LABEL,
    sortOrder: TEAM_CONTROL_APP_SORT_ORDER
});

function onClicked() {
    if (onTeamControlScreen) {
        tablet.gotoHomeScreen();
    } else {
        onTeamControlScreen = true;
        tablet.gotoWebScreen(TEAM_CONTROL_APP_URL);
    }
}

function onScreenChanged(type, url) {
    onTeamControlScreen = type === "Web" && (url.indexOf(TEAM_CONTROL_APP_BASE) === url.length - TEAM_CONTROL_APP_BASE.length);
    button.editProperties({ isActive: onTeamControlScreen });
}

// Handle the events we're receiving from the web UI
function onWebEventReceived(event) {
    // Converts the event to a JavasScript Object
    if (typeof event === "string") {
        event = JSON.parse(event);
    }
    if (event.type === "teamClick") {
        var teamName = event.data;
        var marketplaceID = undefined;
        if (teamName === "Green Team") {
            marketplaceID = GREEN_TEAM_MARKETPLACE_ID;
        } else if (teamName === "Blue Team") {
            marketplaceID = BLUE_TEAM_MARKETPLACE_ID;
        } else if (teamName === "Red Team") {
            marketplaceID = RED_TEAM_MARKETPLACE_ID;
        } else if (teamName === "Yellow Team") {
            marketplaceID = YELLOW_TEAM_MARKETPLACE_ID;
        }
        Messages.sendMessage(TEAM_CONTROL_CHANNEL, JSON.stringify({marketplaceID: marketplaceID}));
    }
}

button.clicked.connect(onClicked);
tablet.screenChanged.connect(onScreenChanged);
tablet.webEventReceived.connect(onWebEventReceived);

Script.scriptEnding.connect(function () {
    if (onTeamControlScreen) {
        tablet.gotoHomeScreen();
    }
    button.clicked.disconnect(onClicked);
    tablet.screenChanged.disconnect(onScreenChanged);
    if (tablet) {
        tablet.removeButton(button);
    }
});

}()); // END LOCAL_SCOPE
