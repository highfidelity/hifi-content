//
//  Created by Luis Cuenca on 1/31/18
//  Copyright 2018 High Fidelity, Inc.
//
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* jslint bitwise: true */

/* global Script, MyAvatar, GlobalDebugger, Tablet
*/

(function(){
    Script.registerValue("FLOWAPP", true);
    Script.include(Script.resolvePath("./flow.js"));

    
    var TABLET_BUTTON_NAME = "FLOW";
    var HTML_URL = Script.resolvePath("./flowApp.html");
    
    var MSG_DOCUMENT_LOADED = 0;
    var MSG_JOINT_INPUT_DATA = 1;
    var MSG_COLLISION_DATA = 2;
    var MSG_COLLISION_INPUT_DATA = 3;
    var MSG_DISPLAY_DATA = 4;
    var MSG_CREATE = 5;
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var tabletButton = tablet.addButton({
        text: TABLET_BUTTON_NAME,
        icon: Script.resolvePath("./flow-i.svg"),
        activeIcon: Script.resolvePath("./flow-a.svg")
    });
    
    var shown = false;
	var documentLoaded = false;
    
    function manageClick() {
        if (shown) {
            tablet.gotoHomeScreen();
            GlobalDebugger.stop();
        } else {
            tablet.gotoWebScreen(HTML_URL);
        }
    }
    
    tabletButton.clicked.connect(manageClick);
    
    MyAvatar.skeletonChanged.connect(function(){
        if (shown) {
            manageClick();
        }
    });
  
    function onScreenChanged(type, url) {     
		console.log("Screen changed");
        if (type === "Web" && url === HTML_URL) {
            tabletButton.editProperties({isActive: true});
            if (!shown) {
                if (!GlobalDebugger.isActive()) {
                    GlobalDebugger.init();
                }
                // hook up to event bridge
                tablet.webEventReceived.connect(onWebEventReceived);
				Script.setTimeout(function() {
					console.log("document loaded: " + documentLoaded);
				}, 500);
            }
            shown = true;
        } else {
            tabletButton.editProperties({isActive: false});
            if (shown) {
                // GlobalDebugger.stop();
                // disconnect from event bridge
                tablet.webEventReceived.disconnect(onWebEventReceived);
            }
            shown = false;
        }

    }

    function onWebEventReceived(msg) {
        var message = JSON.parse(msg);
        switch(message.type) {
            case MSG_JOINT_INPUT_DATA: {
                GlobalDebugger.setJointDataValue(message.group, message.name, message.value);
                break;
            }
            case MSG_COLLISION_INPUT_DATA: {
                GlobalDebugger.setCollisionDataValue(message.group, message.name, message.value);
                break;
            }
            case MSG_DISPLAY_DATA: {
                switch (message.name) {
                    case "collisions":
                        GlobalDebugger.toggleCollisions();
                        break;
                    case "debug":
                        GlobalDebugger.toggleDebugShapes();
                        break;
                    case "solid":
                        GlobalDebugger.toggleSolidShapes();
                        break;
                    case "avatar":
                        GlobalDebugger.toggleAvatarVisible();
                        break;
                }
                break;
            }
            case MSG_DOCUMENT_LOADED: {
				documentLoaded = true;
                tablet.emitScriptEvent(JSON.stringify(  
                    {   "type": MSG_CREATE, 
                        "data": {
                                    "display": GlobalDebugger.getDisplayData(), 
                                    "group": GlobalDebugger.getGroupData(), 
                                    "collisions": GlobalDebugger.getCollisionData(),
                                    "joints": MyAvatar.getJointNames()
                                }
                    }  
                ));
                break;
            }
            case MSG_COLLISION_DATA: {
                switch (message.name) {
                    case "add":
                        var success = GlobalDebugger.addCollision(message.value);
                        if (success) {
                            var collisionData = GlobalDebugger.getDefaultCollisionData();
                            tablet.emitScriptEvent(JSON.stringify({"type": MSG_COLLISION_DATA, "name": message.value,  "data": collisionData}));
                        }
                        break;
                    case "remove":
                        var jointName = message.value;
                        GlobalDebugger.removeCollision(jointName);
                        break;
                }
                break;
            }
        }
    }
    
    tablet.screenChanged.connect(onScreenChanged);
    
    function shutdownTabletApp() {
        GlobalDebugger.stop();
        tablet.removeButton(tabletButton);
        if (shown) {
            tablet.webEventReceived.disconnect(onWebEventReceived);
            tablet.gotoHomeScreen();
        }
        tablet.screenChanged.disconnect(onScreenChanged);
    }
        
    Script.scriptEnding.connect(function () {
        shutdownTabletApp();
    });
    
}());