"use strict";

//
//  webbrowser.js
//
//  Created by Vlad Stelmahovsky on 20 Jun 2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* eslint indent: ["error", 4, { "outerIIFEBody": 0 }] */

(function() { // BEGIN LOCAL_SCOPE

var TABLET_BUTTON_NAME = "WEB";

var ICONS = {
    icon: "http://mpassets.highfidelity.com/41f09ec3-976c-49f2-89fe-2d0e1a2b4a98-v1/icons/tablet-icons/web-i.svg",
    activeIcon: "http://mpassets.highfidelity.com/41f09ec3-976c-49f2-89fe-2d0e1a2b4a98-v1/icons/tablet-icons/web-i.svg"
};

var shouldActivateButton = false;
var onWebBrowserScreen = false;

function onClicked() {
    if (onWebBrowserScreen) {
        // for toolbar-mode: go back to home screen, this will close the window.
        tablet.gotoHomeScreen();
    } else {
        var entity = HMD.tabletID;
        shouldActivateButton = true;
        tablet.loadQMLSource("hifi/WebBrowser.qml");
        onWebBrowserScreen = true;
    }
}

function onScreenChanged(type, url) {
    // for toolbar mode: change button to active when window is first openend, false otherwise.
    button.editProperties({isActive: shouldActivateButton});
    shouldActivateButton = false;
    onWebBrowserScreen = false;
}

var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
var button = tablet.addButton({
    icon: ICONS.icon,
    activeIcon: ICONS.activeIcon,
    text: TABLET_BUTTON_NAME,
    sortOrder: 1
});


button.clicked.connect(onClicked);
tablet.screenChanged.connect(onScreenChanged);

Script.scriptEnding.connect(function () {
    if (onWebBrowserScreen) {
        tablet.gotoHomeScreen();
    }
    button.clicked.disconnect(onClicked);
    tablet.screenChanged.disconnect(onScreenChanged);
    tablet.removeButton(button);
});

}()); // END LOCAL_SCOPE