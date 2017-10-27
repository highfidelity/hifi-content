//
//  Card.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 9/14/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Controls card behavior when grabbed and released
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() { 
    var _this = this;
    //holds id of deck handler
    var deckHandlerID;
    //name of card
    var cardName;
    //channel
    var showChannel
    //overlays that are on cards
    var cardOverlay;
    //your id
    var me;
    //hand joints
    var rightHandJoint;
    var leftHandJoint;

    _this.preload = function(entityID) {
        print("Loading Card script"); 
        _this.entityID = entityID; 
        me = MyAvatar.sessionUUID;
        rightHandJoint = MyAvatar.getJointIndex("RightHand");
        leftHandJoint = MyAvatar.getJointIndex("LeftHand");
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        deckHandlerID = properties.deckHandlerID;
        cardName = props.name;
        cardOverlay = undefined;
        //subscribe to channel
        showChannel = "show-channel".concat(_this.entityID); 
        Messages.subscribe(showChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);
    };

    _this.onReceivedMessage = function(channel, message, senderID) {
        try {
            var data = JSON.parse(message);
        } catch (err) {
            // e
        }
        if ((channel == showChannel) && (MyAvatar.sessionUUID == data[0])) {
            var card = Entities.getEntityProperties(_this.entityID, ['position', 'rotation', 'dimensions', 'name']);
            //get which hand the card is in
            hand = data[1];
            //add overlay to card so that the person holding the card can still see it
            cardOverlay = Overlays.addOverlay("image3d", {
                url: "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/" + card.name + ".jpg",
                //scale: 0.13,
                subImage: { x: 1024, y: 361, width: 1024, height: 1326},
                ignoreRayIntersection: true,
                parentID: _this.entityID,
                rotation: card.rotation,
                localPosition: {
                        x: 0,
                        y: 0,
                        z: .01
                    },
                dimensions: card.dimensions,
                color: { red: 255, green: 255, blue: 255},
                alpha: 1,
                solid: true,
                isFacingAvatar: false,
                drawInFront: false
            });
        }
    };

    _this.startNearGrab = function(entityID, args) {
        //if the glove is in your hand then check to see if its touching a card
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        var held = properties.held;
        if(held == true) {
            //get hand
            hand = args[0];

            //delete an overlay if there is one
            try {
                Overlays.deleteOverlay(cardOverlay);
                cardOverlay = undefined;
            } catch (err) {
                //e
            }
        } else if (held == false) {
            hand = args[0];
            //unparent to hand and change held state
            var changeTexture = {
                parentID: "",
                parentJointIndex: "",
                textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_X.jpg"}',
            };
            Entities.editEntity(_this.entityID, changeTexture);
            var cardChannel = "card-channel-".concat(deckHandlerID);
            var data = [false, _this.entityID, MyAvatar.sessionUUID, hand];
            Messages.sendMessage(cardChannel, JSON.stringify(data));
        }
    };

    _this.startDistanceGrab = function(entityID, args) {
        //if the glove is in your hand then check to see if its touching a card
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        var held = properties.held;
        if(held == true) {
            //get hand
            hand = args[0];
            //maybe all true releaseGrab code here

            //delete an overlay if there is one
            try {
                Overlays.deleteOverlay(cardOverlay);
                cardOverlay = undefined;
            } catch (err) {
                //e
            }
        } else if (held == false) {
            hand = args[0];
            //unparent to hand and change held state
            var changeTexture = {
                parentID: "",
                parentJointIndex: "",
                textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_X.jpg"}',
            };
            Entities.editEntity(_this.entityID, changeTexture);
            var cardChannel = "card-channel-".concat(deckHandlerID);
            var data = [false, _this.entityID, MyAvatar.sessionUUID, hand];
            Messages.sendMessage(cardChannel, JSON.stringify(data));
        }
    };

    _this.releaseGrab = function(entityID, args) {
        var hand = args[0];
        //if the glove is in your hand then check to see if its touching a card
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        var checkIfCard = properties.card;
        var held = properties.held;
        var deckHandlerID = properties.deckHandlerID;
        if ((checkIfCard == true) && (held == false) && (hand == "right")) {
            Controller.triggerShortHapticPulse(.9, 1);
            //get position of left and right hand
            var cardPos = props.position;
            var right = MyAvatar.getJointPosition(rightHandJoint);
            //get distance between right hand and left hand
            var dx = cardPos.x - right.x;
            var dy = cardPos.y - right.y;
            var dz = cardPos.z - right.z;
            var dist = getDistance(dx, dy, dz);
            if (dist < .3) {
                //place card and change held state
                var placement = {
                    userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: true,
                            ignoreIK: false
                        },
                        "held": true,
                        "card": true,
                        "deckHandlerID": deckHandlerID
                    }),
                    parentID: me,
                    parentJointIndex: leftHandJoint 
                };
                Entities.editEntity(_this.entityID, placement);
            } else if (dist >= .3) {
                //unparent to hand and change held state
                var unparentToMe = {
                    parentID: ""
                };
                Entities.editEntity(_this.entityID, unparentToMe);
                //send message
                var cardChannel = "card-channel-".concat(deckHandlerID);
                var data = [true, _this.entityID, MyAvatar.sessionUUID];
                Messages.sendMessage(cardChannel, JSON.stringify(data));
                //delete an overlay if there is one
                try {
                    Overlays.deleteOverlay(cardOverlay);
                    cardOverlay = undefined;
                } catch (err) {
                    //e
                }
            }
        } else if ((checkIfCard == true) && (held == false) && (hand == "left")) {
            Controller.triggerShortHapticPulse(.9, 0);
            //get position of left and right hand
            var left = MyAvatar.getJointPosition(leftHandJoint);
            var cardPos = props.position;
            //get distance between right hand and left hand
            var dx = left.x - cardPos.x;
            var dy = left.y - cardPos.y;
            var dz = left.z - cardPos.z;
            var dist = getDistance(dx, dy, dz);
            if (dist < .3) {
                //place card and change held state
                var placement = {
                    userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: true,
                            ignoreIK: false
                        },
                        "held": true,
                        "card": true,
                        "deckHandlerID": deckHandlerID
                    }),
                    parentID: me,
                    parentJointIndex: rightHandJoint    
                };
                Entities.editEntity(_this.entityID, placement);
            } else if (dist >= .3) {
                //unparent to hand and change held state
                var unparentToMe = {
                    parentID: ""
                };
                Entities.editEntity(_this.entityID, unparentToMe);
                //send message
                var cardChannel = "card-channel-".concat(deckHandlerID);
                var data = [true, _this.entityID, MyAvatar.sessionUUID];
                Messages.sendMessage(cardChannel, JSON.stringify(data));
                //delete an overlay if there is one
                try {
                    Overlays.deleteOverlay(cardOverlay);
                    cardOverlay = undefined;
                } catch (err) {
                    //e
                }
            }
        } else if ((checkIfCard == true) && (held == true)) {
            //unparent to hand and change held state. Also make it fall
            var unparent = {
                parentID: "",
                parentJointIndex: "",
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true,
                        ignoreIK: false
                    },
                    "held": false,
                    "card": true,
                    "deckHandlerID": deckHandlerID
                }),
                "velocity": {
                    x: 0,
                    y: -4,
                    z: 0
                },
                "damping": 0.98,
                "angularDamping": 0.98,
                "collidesWith": "static,dynamic"
            };
            Entities.editEntity(_this.entityID, unparent);
            //make it stop moving
            var stopMoving = {
                "velocity": {
                    x: 0,
                    y: 0,
                    z: 0
                }
            };
            Entities.editEntity(_this.entityID, stopMoving);
            //send message
            var cardChannel = "card-channel-".concat(deckHandlerID);
            var data = [true, _this.entityID, MyAvatar.sessionUUID];
            Messages.sendMessage(cardChannel, JSON.stringify(data));
            //delete an overlay if there is one
            try {
                Overlays.deleteOverlay(cardOverlay);
                cardOverlay = undefined;
            } catch (err) {
                //e
            }
        } 
    };

    function getDistance(dx, dy, dz) {
        //get distance between model and beacon
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
        return dist;
    }

    _this.unload = function () {
        //unsubscribe to channel
        Messages.unsubscribe(showChannel);
        Messages.messageReceived.disconnect(_this, _this.onReceivedMessage);
    };
})
