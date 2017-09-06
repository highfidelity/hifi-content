//
//  ROC_Equipment_Creator.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Creates most of the equipment needed for the game. Shield, body armor, and head armor
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _this = this;
    //holds all data 
    var data = [];
    //holds id of shield
    var shield;
    //holds id's of hit areas
    var body;
    var head;
    //holds data
    var sword1;
    var sword2;
    var swordPos1;
    var swordPos2;
    var swordRot;
    var sign;
    var rock1;
    var rock2;
    //holds id's hearts that float above your head. Index 0 is not a heart but instead an invisible object the others are parented to.
    var hearts = [];
    var focalPoint;
    //channel names
    var equipChannel1;
    var equipChannel2;
    var equipChannel3;
    //holds objects for deleting later
    var objectArray = [];
    //holds the number of players. Used to test if both players are holding a sword
    var players = 0;
    //data needed for ROC_Battle_Simulator
    var gameData = [];

    _this.preload = function (entityID) {
        print("Loading equipment creator script");
        _this.entityID = entityID;
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        sword1 = properties.sword1ID;
        sword2 = properties.sword2ID;
        sign = properties.signID;
        swordPos1 = properties.swordPosition1;
        swordPos2 = properties.swordPosition2;
        swordRot = properties.swordRotation;
        rock1 = properties.rock1ID;
        rock2 = properties.rock2ID;
        equipChannel1 = "equip-channel-ROC-Sword1".concat(entityID);
        equipChannel2 = "equip-channel-ROC-Sword2".concat(entityID);
        equipChannel3 = "equip-channel-ROC-Sign".concat(entityID);
        Messages.subscribe(equipChannel1);
        Messages.subscribe(equipChannel2);
        Messages.subscribe(equipChannel3);
        Messages.messageReceived.connect(this, _this.onReceivedMessage);
    };

    _this.unload = function (entityID) {
        print("unsubscribing to all channels");
        Messages.unsubscribe(equipChannel1);
        Messages.unsubscribe(equipChannel2);
        Messages.unsubscribe(equipChannel3);
    };

    _this.onReceivedMessage = function(channel, message, senderID) {
        if ((channel == equipChannel1) || (channel == equipChannel2))
            createEquipment(message);
        if (channel == equipChannel3)
            resetArena(message);
    };

    function resetArena(message) {
        print("resetting sword game");
        //grab new sword Ids
        var signID = JSON.parse(message);
        var props = Entities.getEntityProperties(signID[0]);
        var properties = JSON.parse(props.userData);
        sword1 = properties.sword1ID;
        sword2 = properties.sword2ID;
        swordPos1 = properties.swordPosition1;
        swordPos2 = properties.swordPosition2;
        swordRot = properties.swordRotation;
        //delete old sword
        Entities.deleteEntity(sword1);
        //cretae new sword
        var newSwordProp1 = {
            "type": "Model", 
            "lifetime": -1, 
            "position": swordPos1,
            "collisionless": false,
            "collidesWith": "static",
            "rotation": swordRot,
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
                "reset": _this.entityID,
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
            script: Script.resolvePath("./VS_Battle_Simulator.js") + "?" + Date.now()
        };
        var newSword1 = Entities.addEntity(newSwordProp1);
        
        //delete old sword
        Entities.deleteEntity(sword2);
        //cretae new sword
        var newSwordProp2 = {
            "type": "Model", 
            "lifetime": -1, 
            "position": swordPos2,
            "collisionless": false,
            "collidesWith": "static",
            "rotation": swordRot,
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
                "reset": _this.entityID,
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
            script: Script.resolvePath("./VS_Battle_Simulator.js") + "?" + Date.now()
        };
        var newSword2 = Entities.addEntity(newSwordProp2);

        //place new sword id's in sign userdata 
        var newSignProp = {
            grabbableKey: {
                grabbable: false,
                ignoreIK: false,
                wantsTrigger: true
            },
            "sword1ID": newSword1,
            "sword2ID": newSword2,
            "swordPosition1": swordPos1, 
            "swordPosition2": swordPos2,
            "swordRotation": swordRot,
            "reset": properties.reset      
        };

        //send to sign
        Entities.editEntity(signID[0], { userData: JSON.stringify(newSignProp) });

        //Delete all other objects (armor, shield, hearts, etc). Also clear arrays
        for (i = 0; i < objectArray.length; i++) {
            Entities.deleteEntity(objectArray[i]);
        }
        players = 0;
        shield = undefined;
        body = undefined;
        head = undefined;
        gameData = [];
        objectArray = [];
        data = [];
        hearts = [];
        sword1 = newSword1;
        sword2 = newSword2;
        sign = signID[0];

        var rockProps = Entities.getEntityProperties(_this.entityID);
        var rockProperties = JSON.parse(rockProps.userData);
        var resetRocks = {
            grabbableKey: {
                grabbable: false,
                ignoreIK: false
            },
            "swordDrawn": false
        };
        Entities.editEntity(rockProperties.rock1ID, { userData: JSON.stringify(resetRocks) });
        Entities.editEntity(rockProperties.rock2ID, { userData: JSON.stringify(resetRocks) });
    };

    function createEquipment(message) {
        print("creating equipment");
        data = JSON.parse(message);
        //Someone grabbed a sword so increase player count
        players++;

        //create shield
        var shieldProperties = {
            "type": "Model", 
            "lifetime": 600, 
            "position": getPositionToCreateShield(data[7], data[12]),
            "rotation": data[12],
            "collisionless": false,
            "visible": false,
            "collidesWith": "dynamic, otherAvatar",
            "dynamic": false, 
            "damping": .9,
            "angularDamping": .9,
            "dimensions": {
                x: .3,
                y: .3,
                z: .14
            },
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: true,
                    ignoreIK: false
                },
                equipHotspots: [{
                    position: {x: 0.01031082272529602, y: 0.09449540972709656, z: 0.0405043363571167},
                    radius: 0.25,
                    joints: { //x and y .15 increase
                        RightHand: [
                            {x: 0.01031082272529602, y: 0.09449540972709656, z: -0.0105043363571167},
                            rotateShieldRight()
                        ],
                        LeftHand: [
                            {x: -0.01001754891872406, y: 0.09447449684143066, z: -0.010637264251708984},
                            rotateShieldLeft()
                        ]
                    },
                    modelURL: Script.resolvePath("./SwordGameAssets/equip-Fresnel-3.fbx"),
                    modelScale: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                }],
                "health": 5
            }),
            name: "ROC-Shield",
            modelURL: Script.resolvePath("./SwordGameAssets/shield_02.fbx"),
            shapeType: "compound"
        };
        shield = Entities.addEntity(shieldProperties);
        objectArray.push(shield);

        //Create hitpoints
        //HITPOINTS WORK BEST FOR knight AVATARS. NOTE: if you get rid of -.08 in body position, game will then work best for mannequin model
        //get dimensions of torso for model
        var neckPos = data[0];
        var hipPos = data[1];
        var torso = getDistance(neckPos, hipPos);
        //get position of spine
        var spine = data[2];
        //get joint index for rotation of model
        var jointIndexSpine = data[3];
        var bodyProperties = {
            "type": "Model", 
            "lifetime": 600, //10 minutes
            "position": {
                x: spine.x,
                y: spine.y - .08,
                z: spine.z
            },
            "rotation": data[12],
            "collisionless": false,
            "collidesWith": "dynamic, otherAvatar",
            "dynamic": false,
            "damping": .9,
            "angularDamping": .9,
            "dimensions": {
                x: .3,

                y: torso,

                z: .3
            },
            "visible": false, 
            name: "ROC-Body",
            modelURL: Script.resolvePath("./SwordGameAssets/breastplate.fbx"),
            shapeType: "compound"
        };
        body = Entities.addEntity(bodyProperties);
        objectArray.push(body);

        //get joint index for rotation of model
        var jointIndexHead = data[5];
        var headPos = data[7];
        var headProperties = {
            "type": "Model",
            "lifetime": 600, //10 minutes
            "position": headPos,
            "rotation": data[12],
            "collisionless": false,
            "collidesWith": "dynamic, otherAvatar",
            "dynamic": false, 
            "damping": .9,
            "angularDamping": .9,
            "dimensions": {
                x: .2,

                y: .3,

                z: .2
            },
            "visible": false, 
            name: "ROC-Head",
            modelURL: Script.resolvePath("./SwordGameAssets/ball.fbx"),
            shapeType: "sphere"
        };
        head = Entities.addEntity(headProperties);
        objectArray.push(head);

        //create the players health (shown above their head)
        createHearts(head, data[12]);

        //Place necessary userdata for head and body. Used in ROC_Battle_Simulator to detect hits/blocks
        var newUserData = {
            grabbableKey: {
                grabbable: false,
                ignoreIK: false
            },
            "shieldID": shield,
            "heartsArray": hearts,
            "swordID": data[6]  
        }
        Entities.editEntity(body, { userData: JSON.stringify(newUserData) });
        Entities.editEntity(head, { userData: JSON.stringify(newUserData) });

        //data which will be passed back. data[4] is ID of user who sent the message
        var newData = [shield, body, head, sign, hearts, focalPoint, data[4]];
        data[10];
        var name = "sword-channel-" + data[10] + data[11];
        Messages.sendMessage(name, JSON.stringify(newData));

        //save player equipment for game
        gameData.push(shield);
        gameData.push(body);
        gameData.push(head);
        gameData.push(hearts);
        gameData.push(data[11]); //sword entity id who sent message
        gameData.push(data[4]); //Avatar ID who sent message
        if (players == 2) {
            //makes sure above message finished before the new one starts
            var messageChecker = Script.setInterval(function() {
                var props1 = Entities.getEntityProperties(rock1);
                var properties1 = JSON.parse(props1.userData);
                var props2 = Entities.getEntityProperties(rock2);
                var properties2 = JSON.parse(props2.userData);
                print(JSON.stringify(properties1.swordDrawn));
                print(JSON.stringify(properties2.swordDrawn));
                if ((properties1.swordDrawn == true) && (properties2.swordDrawn == true)) {
                    print("sending messages");
                    //pass data to both sword
                    var gameName1 = "game-channel-"+ gameData[4];
                    Messages.sendMessage(gameName1, JSON.stringify(gameData));
                    var gameName2 = "game-channel-"+ gameData[10];
                    Messages.sendMessage(gameName2, JSON.stringify(gameData));
                    Script.clearInterval(messageChecker);
                }
            }, 2000);
        }
    };

    function createHearts(head, rot) {
        //find position above your head
        var headPos = Entities.getEntityProperties(head).position;
        headPos.y = headPos.y + .5;
        //get joint index for rotation of model
        var jointIndexHips = data[8];
        var hipProperties = {
            "type": "Model", 
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                }
            }),
            "lifetime": 600, //10 minutes
            "angularDamping": 0,
            "position": headPos,
            "rotation": rot,
            "collisionless": true,
            "collidesWith": "",
            "dynamic": false, 
            "visible": false, 
            name: "ROC-heartFocalPoint",
            modelURL: Script.resolvePath("./SwordGameAssets/ball.fbx"),
            shapeType: "compound"
        };
        focalPoint = Entities.addEntity(hipProperties);
        objectArray.push(focalPoint);
        var focalPointPos = Entities.getEntityProperties(focalPoint).position;

        var spread = -.6;
        hearts = [];
        for (i = 0; i < 5; i++) {
            var heartProperties = {
                parentID: focalPoint,
                "type": "Model", 
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: false,
                        ignoreIK: false
                    }
                }),
                "lifetime": 600, //10 minutes
                "position": {
                    x: focalPointPos.x,
                    y: focalPointPos.y,
                    z: focalPointPos.z + spread
                },
                "collisionless": true,
                "rotation": {
                    "w": 0.014150779694318771,
                    "x": 0.009124668315052986,
                    "y": 0.9996882677078247,
                    "z": -0.018452340736985207
                },
                "dimensions": {
                    x: .0999,
                    y: .2312,
                    z: .2495
                },
                "collidesWith": "",
                "dynamic": false, 
                "visible": true, 
                name: "ROC-heart" + i,
                modelURL: Script.resolvePath("./SwordGameAssets/Game_Heart.fbx"),
                shapeType: "compund"
            };
            hearts.push(Entities.addEntity(heartProperties));
            spread += .3;
        }
    }

    function getPositionToCreateShield(head, rot) {
        var direction = Quat.getFront(rot);
        var distance = 2;
        var position = Vec3.sum(head, Vec3.multiply(direction, distance));
        return position;
    }

    function switchLeftRight(side) {
        return side === 'left' ? 'right' : 'left';
    }

    function getDistance(pointA, pointB) {
        var dx = pointB.x - pointA.x;
        var dy = pointB.y - pointA.y;
        var dz = pointB.z - pointA.z;
    
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
    
        return dist;
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

    function rotateShieldRight() {
        var origRot = {x: 0.2807741165161133, y: 0.6332069635391235, z: 0.2997693121433258, w: -0.6557632088661194};
        var degreeRot = Quat.multiply(origRot, Quat.angleAxis(270, {x: .4, y: 1, z: -.3}));
        return degreeRot;
    }

    function rotateShieldLeft() {
        var origRot = {x: -0.32700979709625244, y: 0.623619794845581, z: 0.28943854570388794, w: 0.6483823657035828};
        var degreeRot = Quat.multiply(origRot, Quat.angleAxis(90, {x: -.4, y: 1, z: -.2}));
        return degreeRot;
    }
})
