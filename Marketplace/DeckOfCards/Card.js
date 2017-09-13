//
//  ROC_Blank.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Use this script so my server script can see the entity
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

    _this.preload = function(entityID) {
        print("Loading Card script"); 
        _this.entityID = entityID; 
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
        if ((channel == showChannel) && (MyAvatar.sessionUUID == data[1])) {
            print("showing card to you");
            var card = Entities.getEntityProperties(_this.entityID, ['position', 'rotation', 'dimensions', 'name']);
            print("Card name is " + card.name);
            //get which hand the card is in
            hand = data[2];
            //add overlay to card so that the person holding the card can still see it
            cardOverlay = Overlays.addOverlay("image3d", {
                url: "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/" + card.name + ".jpg",
                //scale: 0.13,
                subImage: { x: 1024, y: 361, width: 1024, height: 1326},
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
        print("showing card to everyone!");
        //unparent to hand and change held state
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
            textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_X.jpg"}',
            "damping": 0.98,
            "angularDamping": 0.98,
            "collidesWith": "static,dynamic"
        };
        Entities.editEntity(_this.entityID, unparent);
        //delete an overlay if there is one
        try {
            Overlays.deleteOverlay(cardOverlay);
            cardOverlay = undefined;
        } catch (err) {
            //e
        }
    };

    _this.startDistanceGrab = function(entityID, args) {
        print("showing card to everyone!");
    	//unparent to hand and change held state
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
            textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_X.jpg"}',
            "damping": 0.98,
            "angularDamping": 0.98,
            "collidesWith": "static,dynamic"
        };
        Entities.editEntity(_this.entityID, unparent);
        //delete an overlay if there is one
        try {
            Overlays.deleteOverlay(cardOverlay);
            cardOverlay = undefined;
        } catch (err) {
            //e
        }
    };

    _this.releaseGrab = function(entityID, args) {
        print("grab released");
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        var held = properties.held;
        print("hey")
        print(cardOverlay);
        print(held);
        if ((held == true) && (cardOverlay != undefined)) {
            print("here");
            var parentToHand = {
                parentID: MyAvatar.sessionUUID,
                parentJointIndex: hand == 'left' ? MyAvatar.getJointIndex("LeftHand") : MyAvatar.getJointIndex("RightHand"),
                collidesWith: ""
            };
            Entities.editEntity(_this.entityID, parentToHand);
        } else if ((held == false) && (cardOverlay != undefined)) {
            Overlays.deleteOverlay(cardOverlay);
            cardOverlay = undefined;
        	var cardChannel = "card-channel-".concat(deckHandlerID);
        	var data = [true, _this.entityID, MyAvatar.sessionUUID];
        	Messages.sendMessage(cardChannel, JSON.stringify(data));
        } else if ((held == false) && (cardOverlay == undefined)) {
            var cardChannel = "card-channel-".concat(deckHandlerID);
            var data = [true, _this.entityID, MyAvatar.sessionUUID];
            Messages.sendMessage(cardChannel, JSON.stringify(data));
        }
    };

    _this.unload = function () {
        //unsubscribe to channel
        Messages.unsubscribe(showChannel);
    };
})
