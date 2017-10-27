//
//  ROC_Arena_Creator.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Creates Arena for sword battle game as well as entities around it
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {

    //Name of app that will appear in interface
    var APP_NAME = "VS";
    // Link to your app's HTML file
    var APP_URL = Script.resolvePath("./Battle_App.html") + "?" + Date.now();
    //Link to Navigation ICON
    var APP_ICON = Script.resolvePath("./noun_103193_cc.svg");
    // Get a reference to the tablet
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    //holds the information of the event recieved
    var info;
    //holds id of arena
    var arena;
    //holds id's of every object placed around arena
    var sword1;
    var sword2;
    var rock1;
    var rock2;
    var resetArea;
    var gate;
    var tabletBlueKnightifier;
    var tabletRedKnightifier;
    //holds id of the sign
    var sign;
    //all positions and rotations for swords while in rocks (used later in other scripts to place new swords for new game)
    var pos1;
    var pos2;
    var rot;

    // "Install" your cool new app to the tablet
    // The following lines create a button on the tablet's menu screen
    var button = tablet.addButton({
        icon: APP_ICON,
        text: APP_NAME
    });

    // When user click the app button, we'll display our app on the tablet screen
    function onClicked() {
        tablet.gotoWebScreen(APP_URL);
    }
    button.clicked.connect(onClicked);

    // Handle the events we're recieving from the web UI
    function onWebEventReceived(event) {
        print("VS_Arena_Creator.js received a web event:" + event);
        // Converts string event to JavasScript 
        info = JSON.parse(event);
        if ((info.type == "click") && (info.data == "Place Arena")) {
            //create arena
            var arenaProperties = {
                "type": "Model",
                "lifetime": -1, 
                "position": getPositionToCreateArena(),
                "collisionless": false,
                "collidesWith": "",
                "dynamic": false, 
                "damping": .9,
                "angularDamping": .9,
                "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
                name: "ROC-Sword_Arena",
                modelURL: Script.resolvePath("./SwordGameAssets/beacon.fbx"),
                shapeType: "compound",
            };
            arena = Entities.addEntity(arenaProperties);
            //resize arena (raise it up higher)
            var prop = Entities.getEntityProperties(arena).dimensions;
            var resizeArena = {
                "dimensions": {
                    x: 12,
                    y: prop.y,
                    z: 12
                }
            };
            Entities.editEntity(arena, resizeArena);
            //create equip areas (swords in rocks) as well as other objects around the arena
            createEquipAreas();
        } else if ((info.type == "click") && (info.data == "Clear Arena")) {
            try {
                Entities.deleteEntity(arena);
                Entities.deleteEntity(sword1);
                Entities.deleteEntity(sword2);
                Entities.deleteEntity(rock1);
                Entities.deleteEntity(rock2);
                Entities.deleteEntity(resetArea);
                Entities.deleteEntity(sign);
                Entities.deleteEntity(gate);
                Entities.deleteEntity(tabletBlueKnightifier);
                Entities.deleteEntity(tabletRedKnightifier);
            } catch (err) {
                print("No arena to erase");
            }
        }
    }
    tablet.webEventReceived.connect(onWebEventReceived);

    function createEquipAreas() {
        //create reset sphere
        var resetAreaProperties = {
            "type": "Sphere", 
            "lifetime": -1, 
            "position": getPositionToCreateSign(),
            "collisionless": true,
            "collidesWith": "",
            "dynamic": false,
            "damping": .9,
            "angularDamping": .9,
            "visible": false, 
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
            name: "ROC-Reset_Area",
            shapeType: "sphere",
            "serverScripts": Script.resolvePath("./VS_Equipment_Creator.js") + "?" + Date.now()
        };
        resetArea = Entities.addEntity(resetAreaProperties);

        //create first sword and rock
        var rockProperties1 = {
            "type": "Model", 
            parentID: arena,
            "lifetime": -1, 
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                },
                "swordDrawn": false
            }),
            "position": getPositionToCreateRockandSword1(false),
            "collisionless": true,
            "dimensions": {
                x: 1,
                y: 1,
                z: 1
            },
            "collidesWith": "",
            name: "ROC-Rock",
            modelURL: Script.resolvePath("./SwordGameAssets/rock.fbx"),
            shapeType: "compound",
            "serverScripts": Script.resolvePath("./VS_Blank.js") + "?" + Date.now() //used so my server script can see the rock
        };
        
        rock1 = Entities.addEntity(rockProperties1);

        var swordProperties1 = {
            "type": "Model", 
            "lifetime": -1, 
            "position": getPositionToCreateRockandSword1(true),
            "collisionless": false,
            "collidesWith": "static",
            "rotation": {
                "w": -1.52587890625e-05,
                "x": 1,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "dynamic": true, 
            "damping": .9,
            "angularDamping": .9,
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                },
                equipHotspots: [{
                    position: {x: -0.02, y: -0.13449540972709656, z: 0.0405043363571167},
                    radius: 0.25,
                    joints: { //x and y .15 increase
                        RightHand: [
                            {x: 0.26031082272529602, y: 0.31449540972709656, z: 0.0405043363571167},
                            rotateSwordRight()
                        ],
                        LeftHand: [
                            {x: -0.25801754891872406, y: 0.30447449684143066, z: 0.030637264251708984},
                            rotateSwordLeft()
                        ]
                    },
                    modelURL: Script.resolvePath("./SwordGameAssets/equip-Fresnel-3.fbx"),
                    modelScale: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                }],
                "noGear": true,
                "reset": resetArea,
                "rockID": rock1
            }),
            "dimensions": {
                x: .2440,
                y: .8914,
                z: .0599
            },
            name: "ROC-Sword1",
            modelURL: Script.resolvePath("./SwordGameAssets/broadsword_01.fbx"),
            shapeType: "compound",
            script: Script.resolvePath("./VS_Battle_Simulator.js") + "?" + Date.now(),
            "serverScripts": Script.resolvePath("./VS_Blank.js") + "?" + Date.now() //used so my server script can see the sword
        };
        sword1 = Entities.addEntity(swordProperties1);
        
        //create second sword in rock
        var rockProperties2 = {
            "type": "Model", 
            parentID: arena,
            "lifetime": -1, 
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                },
                "swordDrawn": false
            }),
            "position": getPositionToCreateRockandSword2(false),
            "collisionless": true,
            "dimensions": {
                x: 1,
                y: 1,
                z: 1
            },
            "collidesWith": "",
            name: "ROC-Rock",
            modelURL: Script.resolvePath("./SwordGameAssets/rock.fbx"),
            shapeType: "compound",
            "serverScripts": Script.resolvePath("./VS_Blank.js") + "?" + Date.now() //used so my server script can see the rock
        };
        rock2 = Entities.addEntity(rockProperties2);

        var swordProperties2 = {
            "type": "Model", 
            "lifetime": -1, 
            "position": getPositionToCreateRockandSword2(true),
            "collisionless": false,
            "collidesWith": "static",
            "rotation": {
                "w": -1.52587890625e-05,
                "x": 1,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "dynamic": true, 
            "damping": .9,
            "angularDamping": .9,
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                },
                equipHotspots: [{
                    position: {x: -0.02, y: -0.13449540972709656, z: 0.0405043363571167},
                    radius: 0.25,
                    joints: { //x and y .15 increase
                        RightHand: [
                            {x: 0.26031082272529602, y: 0.31449540972709656, z: 0.0405043363571167},
                            rotateSwordRight()
                        ],
                        LeftHand: [
                            {x: -0.25801754891872406, y: 0.30447449684143066, z: 0.030637264251708984},
                            rotateSwordLeft()
                        ]
                    },
                    modelURL: Script.resolvePath("./SwordGameAssets/equip-Fresnel-3.fbx"),
                    modelScale: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                }],
                "noGear": true,
                "reset": resetArea,
                "rockID": rock2
            }),
            "dimensions": {
                x: .2440,
                y: .8914,
                z: .0599
            },
            name: "ROC-Sword2",
            modelURL: Script.resolvePath("./SwordGameAssets/broadsword_01.fbx"),
            shapeType: "compound",
            script: Script.resolvePath("./VS_Battle_Simulator.js") + "?" + Date.now(),
            "serverScripts": Script.resolvePath("./VS_Blank.js") + "?" + Date.now() //used so my server script can see the sword
        };
        sword2 = Entities.addEntity(swordProperties2);

        //save positions and rotations of swords while in rocks for when resetting game
        pos1 = Entities.getEntityProperties(sword1).position;
        pos2 = Entities.getEntityProperties(sword2).position;
        rot = Entities.getEntityProperties(sword1).rotation;

        //create sign that will be used for reset
        var signProperties = {
            "type": "Model", 
            "lifetime": -1, 
            "position": getPositionToCreateSign(), 
            "rotation": MyAvatar.orientation,
            "collisionless": false,
            "collidesWith": "static,myAvatar,otherAvatar",
            "dynamic": false, 
            "damping": .9,
            "angularDamping": .9,
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false,
                    wantsTrigger: true
                },
                "sword1ID": sword1,
                "sword2ID": sword2,
                "swordPosition1": pos1, 
                "swordPosition2": pos2,
                "swordRotation": rot,
                "reset": resetArea
            }),
            name: "ROC-Sign",
            modelURL: Script.resolvePath("./SwordGameAssets/GameSign.fbx"),
            shapeType: "static-mesh",
            script: Script.resolvePath("./VS_Arena_Resetter.js") + "?" + Date.now(),
            "serverScripts": Script.resolvePath("./VS_Blank.js") + "?" + Date.now()
        };
        sign = Entities.addEntity(signProperties);

        //gate that leads to knighifiers
        var gateProperties = {
            "type": "Model", 
            "lifetime": -1, 
            "position": getPositionToCreateKnightifiers(), 
            "rotation": Quat.multiply(MyAvatar.orientation, Quat.angleAxis(90, {x: 0, y: 1, z: 0})), //turn them right
            "collisionless": false,
            "collidesWith": "",
            "dimensions": {
                x: 2.3,
                y: 2.25,
                z: .7
            },
            "dynamic": false, 
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                }
            }),
            name: "ROC-Gate",
            modelURL: Script.resolvePath("./SwordGameAssets/twoKnights.fbx"),
            shapeType: "static-mesh",
            "serverScripts": Script.resolvePath("./VS_Game_Handler.js") + "?" + Date.now()
        };
        gate = Entities.addEntity(gateProperties);

        //opens up your tablet app to grab the blue knight avatar
        var tabletBlueKnightifierProperties = {
            "type": "Model",
            "lifetime": -1, 
            "position": getPositionToCreateTabletKnightifier(),
            "rotation": Quat.multiply(MyAvatar.orientation, Quat.angleAxis(90, {x: 0, y: 1, z: 0})), //turn it right
            "visible": true,
            "collisionless": false,
            "collidesWith": "dynamic,otherAvatar,myAvatar",
            "dynamic": false, 
            userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: false,
                            ignoreIK: false,
                            wantsTrigger: true
                        },
                        "tabletURL": "https://highfidelity.com/marketplace/items/131e369b-75b8-454d-b8d6-9b40940a123e"
                    }),
            name: "ROC-tabletBlueKnightifier",
            modelURL: Script.resolvePath("./SwordGameAssets/knight_sign_1.fbx"),
            shapeType: "compound",
            script: Script.resolvePath("./VS_Tablet_Opener.js") + "?" + Date.now()
        };
        tabletBlueKnightifier = Entities.addEntity(tabletBlueKnightifierProperties);

        //opens up your tablet app to grab the red knight avatar
        var tabletRedKnightifierProperties = {
            "type": "Model",
            "lifetime": -1, 
            "position": getPositionToCreateTabletKnightifier(),
            "rotation": Quat.multiply(MyAvatar.orientation, Quat.angleAxis(90, {x: 0, y: 1, z: 0})), //turn it right
            "visible": true,
            "collisionless": false,
            "collidesWith": "dynamic,otherAvatar,myAvatar",
            "dynamic": false, 
            userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: false,
                            ignoreIK: false,
                            wantsTrigger: true
                        },
                        "tabletURL": "https://highfidelity.com/marketplace/items/97692c0e-4f2c-43f0-85d7-c7adb1a4dc73"
                    }),
            name: "ROC-tabletRedKnightifier",
            modelURL: Script.resolvePath("./SwordGameAssets/knight_sign_2.fbx"),
            shapeType: "compound",
            script: Script.resolvePath("./VS_Tablet_Opener.js") + "?" + Date.now()
        };
        tabletRedKnightifier = Entities.addEntity(tabletRedKnightifierProperties);

        //add some userdata to reset (will be used in ROC_Equipment_Creator)
        var resetData = {
            grabbableKey: {
                grabbable: false,
                ignoreIK: false
            },
            "sword1ID": sword1,
            "sword2ID": sword2,
            "rock1ID": rock1,
            "rock2ID": rock2,
            "signID": sign,
            "swordPosition1": pos1, 
            "swordPosition2": pos2,
            "swordRotation": rot    
        };

        //send to model
        Entities.editEntity(resetArea, { userData: JSON.stringify(resetData) });
    }

    // Helper function that gives us a position right in front of the user.
    //Two versions. true places arena and false places sign
    function getPositionToCreateArena() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance = 10;
        var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
        return position;
    }

    function getPositionToCreateTabletKnightifier() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance1 = 10;
        var position1 = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance1));
        
        //raise it above knights
        position1.y += 2;

        var newDirection = Quat.getRight(MyAvatar.orientation); 
        var distance2 = 6;
        var position2 = Vec3.sum(position1, Vec3.multiply(newDirection, distance2));

        return position2;
    }

    function getPositionToCreateKnightifiers() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance1 = 10;
        var position1 = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance1));

        var newDirection = Quat.getRight(MyAvatar.orientation); 
        var distance2 = 6;
        var position2 = Vec3.sum(position1, Vec3.multiply(newDirection, distance2));

        return position2;
    }

    function getPositionToCreateSign() {
        var direction = Quat.getFront(MyAvatar.orientation);
        var distance1 = 10;
        var position1 = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance1));

        var newDirection = Quat.getRight(MyAvatar.orientation); 
        var distance2 = -5.5;
        var position2 = Vec3.sum(position1, Vec3.multiply(newDirection, distance2));

        return position2;
    }

    // Helper function that gives us a position right in front of the user 
    //Two versions. true places sword and false places rock
    function getPositionToCreateRockandSword1(check) {
        if (check == true) {
            var direction = Quat.getFront(MyAvatar.orientation);
            var distance = 3;
            var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
            position.y += 0;
            return position;
        } else {
            var direction = Quat.getFront(MyAvatar.orientation);
            var distance = 3;
            var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
            position.y -= .7;
            return position;
        }

    }

    // Helper function that gives us a position right in front of the user 
    //Two versions. true places sword and false places rock
    function getPositionToCreateRockandSword2(check) {
        if (check == true) {
            var direction = Quat.getFront(MyAvatar.orientation);
            var distance = 17;
            var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
            position.y -= .1;
            return position;
        } else {
            var direction = Quat.getFront(MyAvatar.orientation);
            var distance = 17;
            var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
            position.y -= .7;
            return position;
        }
    }

    function rotateSwordLeft() {
        var origRot = {x: -0.32700979709625244, y: 0.623619794845581, z: 0.28943854570388794, w: 0.6483823657035828};
        var degreeRot = Quat.multiply(origRot, Quat.angleAxis(90, {x: 0, y: 1, z: 0}));
        return degreeRot;
    }

    function rotateSwordRight() {
        var origRot = {x: 0.2807741165161133, y: 0.6332069635391235, z: 0.2997693121433258, w: -0.6557632088661194};
        var degreeRot = Quat.multiply(origRot, Quat.angleAxis(90, {x: 0, y: 1, z: 0}));
        return degreeRot;
    }

    // Provide a way to "uninstall" the app
    // Here, we write a function called "cleanup" which gets executed when
    // this script stops running. It'll remove the app button from the tablet.

    function cleanup() {
        print("deleting tablet app button.");
        tablet.removeButton(button);
    }
    Script.scriptEnding.connect(cleanup);

}());
