//
//  ROC_Battle_Simulator.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Controls game behavior (hits, blocks, etc)
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _this = this;
    //holds id of sword
    var sword;
    //holds id of shield
    var shield;
    //holds id's of hit areas
    var body;
    var head;
    //enemy shield and sword id 
    var enemyShield;
    var enemySword;
    //enemy hitpoints
    var enemyHead;
    var enemyBody;
    //holds current health
    var health = 5;
    //makes sure it dosent count a bunch of hits
    var firstHit = true;
     var firstBlock = true;
    //swordHand
    var hand;
    //holds id's hearts that float above your head. Index 0 is not a heart but instead an invisible object the others are parented to.
    var hearts = [];
    var enemyHearts = [];
    var focalPoint;
    //sounds
    var blockSound;
    var hitSound;
    var swishSound;
    var equipSound;
    //holds id of rock
    var resetArea;
    //channels
    var swordChannel;
    var gameChannel;
    var hitChannel;
    var blockedChannel;
    //data that will hold equipment info
    var equipData;

    _this.preload = function(entityID) {
        print("Loading battle script");
        _this.entityID = entityID;
        var name = Entities.getEntityProperties(entityID).name;
        //makes sure each sword has a unique channel
        swordChannel = ("sword-channel-" + name).concat(entityID);
        gameChannel = ("game-channel-").concat(entityID);
        hitChannel = "hit-channel";
        blockedChannel = "blocked-channel";
        sword = entityID;
        blockSound = SoundCache.getSound(Script.resolvePath("./SwordGameSounds/Blocked.wav"));
        hitSound = SoundCache.getSound(Script.resolvePath("./SwordGameSounds/Hit.wav"));
        swishSound = SoundCache.getSound(Script.resolvePath("./SwordGameSounds/Sword_collide.wav"));
        equipSound = SoundCache.getSound(Script.resolvePath("./SwordGameSounds/equipSound.wav"));
    }

    _this.onReceivedMessage = function(channel, message, senderID) {
        //since its an entity script every player recieves the message so I need to make sure the message is only run for the player with the sword
        try {
            equipData = JSON.parse(message);
        } catch (err) {
            // e
        }
        if ((channel == swordChannel) && (MyAvatar.sessionUUID == equipData[6])) {
            shield = equipData[0];
            body = equipData[1];
            head = equipData[2];
            hearts = equipData[4];
            focalPoint = equipData[5];

            var currentID = MyAvatar.sessionUUID;
            //play equipping sound
            Audio.playSound(equipSound, { loop: false, position: MyAvatar.position, volume: .2 });
            
            //needed to add a short timeout because the functions below happened faster than the message could unpackage the data
            Script.setTimeout(function() {
                var parentBodyArmor = {
                    parentID: currentID,
                    parentJointIndex: MyAvatar.getJointIndex("Spine2"),
                    localPosition: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                    //rotation: MyAvatar.orientation
                };
                var parentHeadArmor = {
                    parentID: currentID,
                    parentJointIndex: MyAvatar.getJointIndex("Head"),
                    localPosition: {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                    //rotation: MyAvatar.orientation
                };
                var parentHeartArmor = {
                    parentID: currentID,
                    parentJointIndex: MyAvatar.getJointIndex("Hips"),
                    localPosition: {
                        x: 0,
                        y: 1.7,
                        z: 0
                    }
                };
                var visibleShield = {
                    visible: true
                };
                Entities.editEntity(body, parentBodyArmor);
                Entities.editEntity(head, parentHeadArmor);
                Entities.editEntity(focalPoint, parentHeartArmor);
                Entities.editEntity(shield, visibleShield);

                //Attaching everything
                Script.setTimeout(function() {
                    Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({
                    hand: switchLeftRight(hand),
                    entityID: shield
                    }));
                }, 500);
            }, 4000);
        } 

        if ((channel == gameChannel) && (MyAvatar.sessionUUID == equipData[5])) {
            enemyShield = equipData[6];
            enemyBody = equipData[7];
            enemyHead = equipData[8];
            enemyHearts = equipData[9];
            enemySword = equipData[10];
        } 
        
        if ((channel == gameChannel) && (MyAvatar.sessionUUID == equipData[11])) {
            enemyShield = equipData[0];
            enemyBody = equipData[1];
            enemyHead = equipData[2];
            enemyHearts = equipData[3];
            enemySword = equipData[4];
        }
    }

    _this.startEquip = function(entityID, args) {
        Messages.subscribe(swordChannel);
        Messages.subscribe(gameChannel);
        Messages.subscribe(hitChannel);
        Messages.subscribe(blockedChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);
        //get hand
        hand = args[0];
        //play grabbed sword sound
        Audio.playSound(swishSound, { loop: false, position: MyAvatar.position, volume: .1 });
        //holds all important body data (used for equipment placing later)
        var neckPos = MyAvatar.getJointPosition("Neck");
        var hipPos = MyAvatar.getJointPosition("Hips");
        var spine = MyAvatar.getJointPosition("Spine2");
        var jointIndexSpine = MyAvatar.getJointIndex("Spine2");
        var jointIndexHead = MyAvatar.getJointIndex("RightEye");
        var me = MyAvatar.sessionUUID;
        var avatarRot = MyAvatar.orientation;
        var head = MyAvatar.getHeadPosition();
        var hips = MyAvatar.getJointIndex("Hips");
        //get name of sword (used for passing back the message in ROC_Equipment_Creator)
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        //place all info in data and get channel name
        var data = [neckPos, hipPos, spine, jointIndexSpine, me, jointIndexHead, entityID, head, hips, hand, props.name, sword, avatarRot];
        resetArea = properties.reset;
        var name = "equip-channel-" + props.name + properties.reset;
        //make sure sword is not already in use by someone
        if (properties.noGear) {
            Messages.sendMessage(name, JSON.stringify(data));
            //set userdata properties in sword so sword cant be used by multiple people at once 
            var set1 = {
                grabbableKey: {
                grabbable: false,
                ignoreIK: false
            },
            equipHotspots: [{
                position: {x: 0.11031082272529602, y: -0.13449540972709656, z: 0.0405043363571167},
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
            "noGear": false,
            "reset": resetArea
            };
            //send to model
            Entities.editEntity(sword, { userData: JSON.stringify(set1) });
        }
    };

    _this.collisionWithEntity = function(myID, otherID, collisionInfo) {
        //if the sword hits the enemy shield then I disable collisions
        if ((enemyShield == otherID) && firstBlock) {
            firstBlock = false;
            var data = [sword, MyAvatar.position];
            Messages.sendMessage(blockedChannel, JSON.stringify(data));
            //let player know they've been blocked and receive haptic feedback
            hand == 'left' ? Controller.triggerHapticPulse(.9, 3100, 0) : Controller.triggerHapticPulse(.9, 3100, 1);
            //Since it would happen 60 times a second I set a wait time 
            Script.setTimeout(Wait, 3000);
        //if the sword hits the enemy players body then I do damage. firstHit is used to control collision speed.
        } else if (((enemyBody == otherID) || (enemyHead == otherID)) && firstHit) { 
            firstHit = false;
            //deal damage
            health--;
            var data = [sword, MyAvatar.position, health, focalPoint, enemyHearts, enemySword, enemyShield];
            Messages.sendMessage(hitChannel, JSON.stringify(data));
            //let player know they've been hit or had a hit through haptic feedback
            Controller.triggerShortHapticPulse(.9, 2);
            //Since it would happen 60 times a second I set a wait time 
            Script.setTimeout(Wait, 1250);
        }
    };

    function switchLeftRight(side) {
        return side === 'left' ? 'right' : 'left';
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

    //function used to reenable sword after disabled from sword hitting a shield
    function Wait() {
        firstHit = true;
    }

    Entities.deletingEntity.connect(function(entityID){
        try{
            print("unsubscribing to channels")
            Messages.unsubscribe(swordChannel);
            Messages.unsubscribe(gameChannel);
            Messages.unsubscribe(hitChannel);
            Messages.unsubscribe(blockedChannel);
        } catch (err) {
            print("Never subscribed to channels");
        }
    });

})
