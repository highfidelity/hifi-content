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
    //hand joints
    var rightHandJoint;
    var leftHandJoint;

    _this.preload = function(entityID) {
        print("Loading Card script"); 
        _this.entityID = entityID; 
        rightHandJoint = MyAvatar.getJointIndex("RightHandMiddle1");
        leftHandJoint = MyAvatar.getJointIndex("LeftHandMiddle1");
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
        if ((channel == showChannel) && (MyAvatar.sessionUUID == data[0]) && (_this.entityID == data[2])) {
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
        if (held == true) {
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
            var data = [false, _this.entityID, MyAvatar.sessionUUID, hand, _this.entityID];
            Messages.sendMessage(cardChannel, JSON.stringify(data));
        }
    };

    _this.startDistanceGrab = function(entityID, args) {
        //if the glove is in your hand then check to see if its touching a card
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        var held = properties.held;
        if (held == true) {
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
            var data = [false, _this.entityID, MyAvatar.sessionUUID, hand, _this.entityID];
            Messages.sendMessage(cardChannel, JSON.stringify(data));
        }
    };

    _this.releaseGrab = function (entityID, args) {
        var hand = args[0];
        //check if the object you are holding is a card and if it isnt already in your hand
        var props = Entities.getEntityProperties(_this.entityID);
        var properties = JSON.parse(props.userData);
        var checkIfCard = properties.card;
        var held = properties.held;
        var deckHandlerID = properties.deckHandlerID;
        if ((checkIfCard == true) && (held == false) && (hand == "right")) {
            //feedback to let you know you attached the card to your hand
            Controller.triggerShortHapticPulse(.9, 1);
            //get position of left and right hand
            var left = MyAvatar.getLeftPalmPosition();
            var right = props.position;
            //get distance between right hand and left hand
            var dx = left.x - right.x;
            var dy = left.y - right.y;
            var dz = left.z - right.z;
            var dist = getDistance(dx, dy, dz);
            //if card is within an acceptable distance to your hand then place it
            if (dist < .10) {
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
                    parentID: MyAvatar.sessionUUID,
                    parentJointIndex: leftHandJoint
                };
                Entities.editEntity(_this.entityID, placement);
            //reset card if not close enough
            } else if (dist >= .10) {
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
            var left = props.position;
            var right = MyAvatar.getRightPalmPosition();
            //get distance between right hand and left hand
            var dx = left.x - right.x;
            var dy = left.y - right.y;
            var dz = left.z - right.z;
            var dist = getDistance(dx, dy, dz);
            //if card is within an acceptable distance to your hand then place it
            if (dist < .10) {
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
                    parentID: MyAvatar.sessionUUID,
                    parentJointIndex: rightHandJoint
                };
                Entities.editEntity(_this.entityID, placement);
            //reset card if not close enough
            } else if (dist >= .10) {
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
        //if you were already holding a card
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
