//
//  Glove.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 9/6/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This script places an invisible ball on the players hand that is used as a pivot point for the cards
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() { 
    var _this = this;
    //which hand the glove is in
    var hand;
    //holds the number of cards in your hand
    var cardsInHand;
    //makes sure collision with entity doesnt happen too often
    var firstCheck;

    _this.preload = function(entityID) {
        print("Loading glove script");  
        _this.entityID = entityID;
        cardsInHand = 0;
        firstCheck = true;
    };

    _this.startEquip = function(entityID, args) {
        //get hand
        hand = args[0];
        if (hand == "right") {
            //make sure only dynamic objects affect it
            var changeCollidesWith = {
                "collidesWith": "dynamic",
                "rotation": MyAvatar.getRightPalmRotation()
            };
            Entities.editEntity(entityID, changeCollidesWith);
        } else if (hand == "left") {
            //make sure only dynamic objects affect it
            var changeCollidesWith = {
                "collidesWith": "dynamic",
                "rotation": MyAvatar.getLeftPalmRotation()
            };
            Entities.editEntity(entityID, changeCollidesWith);
        }
    };

    _this.releaseEquip = function(entityID, args) {
        //not in any hand
        hand = null;
        //make sure nothing affect it
        var changeCollidesWith = {
            "collidesWith": ""
        };
        Entities.editEntity(entityID, changeCollidesWith);
    };

    _this.collisionWithEntity = function(myID, otherID, collisionInfo) {
        //if the glove is in your hand then check to see if its touching a card
        if (firstCheck == true) {
            firstCheck == false;
            var props = Entities.getEntityProperties(otherID);
            var properties = JSON.parse(props.userData);
            var checkIfCard = properties.card;
            var held = properties.held;
            var deckHandlerID = properties.deckHandlerID;
            if ((checkIfCard == true) && (held == false) && (hand == "right")) {
                print("is a card");
                Controller.triggerShortHapticPulse(.9, 1);
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
                    "damping": 0.98,
                    "angularDamping": 0.98
                };
                Entities.editEntity(otherID, placement);
                //add card to hand
                ++cardsInHand;
                //send message
                var cardChannel = "card-channel-".concat(deckHandlerID);
                var data = [false, otherID, myID, MyAvatar.sessionUUID, hand];
                Messages.sendMessage(cardChannel, JSON.stringify(data));
                //make it so the ball can check to see if an object is a card again
                Script.setTimeout(canCheckAgain, 100);
            } else if ((checkIfCard == true) && (held == false) && (hand == "left")) {
                print("is a card");
                Controller.triggerShortHapticPulse(.9, 0);
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
                    "damping": 0.98,
                    "angularDamping": 0.98
                };
                Entities.editEntity(otherID, placement);
                //add card to hand
                ++cardsInHand;
                //send message
                var cardChannel = "card-channel-".concat(deckHandlerID);
                var data = [false, otherID, myID, MyAvatar.sessionUUID];
                Messages.sendMessage(cardChannel, JSON.stringify(data));
                //make it so the ball can check to see if an object is a card again
                Script.setTimeout(canCheckAgain, 100);
            } else {
                print("not a card");
                //make it so the ball can check to see if an object is a card again
                Script.setTimeout(canCheckAgain, 100);
            }
        }
    };

    function canCheckAgain() {
        firstCheck = true;
    }

    _this.unload = function(entityID) {
    };

})
