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

var GREEN_TEAM_MARKETPLACE_ID = "1170a3f7-bb36-4aeb-a5a1-0c0c4a5ed0ed";
var BLUE_TEAM_MARKETPLACE_ID = "c1d3a80a-3ae3-4eab-8549-57401d82b247";
var RED_TEAM_MARKETPLACE_ID = "7241253f-1957-47a0-9856-2b16bd252075";
var YELLOW_TEAM_MARKETPLACE_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";
var NO_TEAM_MARKETPLACE_ID = "ffffffff-ffff-ffff-ffff-ffffffffffff";

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
        } else if (teamName === "No Team") {
            marketplaceID = NO_TEAM_MARKETPLACE_ID;
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
