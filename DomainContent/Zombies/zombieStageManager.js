//
// zombieStageManager.js
// A tablet app for managing playable zombie locations
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

(function () {
	var APP_NAME = "ZOMBIES";
	var APP_URL = Script.resolvePath("./zombieStageManager.html");
	var APP_ICON = "https://hifi-content.s3.amazonaws.com/elisalj/blocks/blocks-i.svg";
	var APP_ICON_ACTIVE = "https://hifi-content.s3.amazonaws.com/elisalj/blocks/blocks-a.svg";
	//var ZOMBIE_LOCATIONS = Script.require("./Zombie-Positions.json");
	var zombiePositions = Script.require("./zombiePositions.js");

	var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
	var button = tablet.addButton({
	    icon: APP_ICON,
        activeIcon: APP_ICON_ACTIVE,
		text: APP_NAME
	});

	function onClicked() {
        tablet.gotoWebScreen(APP_URL);
    };
    button.clicked.connect(onClicked);

	var shown = false;

	function onScreenChanged(type, url) {
	    if (type === 'Web') {
	        button.editProperties({ isActive: true });
	        shown = true;
	    } else {
	        button.editProperties({ isActive: false });
	        shown = false;
	    }
	}

	tablet.screenChanged.connect(onScreenChanged);

	// need to load json in as variable and get location from that
    function onWebEventReceived(event) {
    	var eventJSON = JSON.parse(event);
        var number = eventJSON.data;
        var color = eventJSON.color;
        var position = zombiePositions.getPosition(color, number, zombiePositions.positions);
        print("position is: " + position);
    };
    tablet.webEventReceived.connect(onWebEventReceived);

	function cleanup() {
		tablet.webEventReceived.disconnect(onWebEventReceived);
	    tablet.removeButton(button);
	}

	Script.scriptEnding.connect(cleanup);
}());
