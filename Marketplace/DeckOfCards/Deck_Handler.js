//
//  Deck_Handler.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 9/14/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Server script that controls some card visibility behavior by swapping textures and creating cards
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() { 
    var _this = this;
    //channels
    var cardChannel;
    //holds ID of all cards
    var cardIDs = [];
    //holds number of the last card grabbed
    var lastCard;
    //holds names of cards for shuffle
    var cards = [];
    var deckLocation;
    var deckRotation;

    _this.preload = function(entityID) {
        print("Loading Deck Handler script."); 
        _this.entityID = entityID;
        //position of deck handler
        deckLocation = Entities.getEntityProperties(entityID).position;
        deckRotation = Entities.getEntityProperties(entityID).rotation;
        for (i = 1; i <= 52; i++) {
            cards.push(i);
        }
        cards = Shuffle(cards);
        //create a single card
        var cardProperties = {
            "type": "Model", 
            "lifetime": -1, 
            "dynamic": true,
            "damping": 0.98,
            "angularDamping": 0.98,
            "gravity": {
                x: 0,
                y: -4,
                z: 0
            },
            "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_' + cards[51] + '.jpg"}',
            "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
            "dimensions": {
                x: .07,
                y: .12,
                z: .006
            },
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: true,
                    ignoreIK: false
                },
                "held": false,
                "card": true,
                "deckHandlerID": entityID
            }),
            "position": {
                x: deckLocation.x,
                y: deckLocation.y + (.053 + .003),
                z: deckLocation.z
            },
            "collisionless": false,
            "collidesWith": "static,dynamic",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
            name: "CARD_" + cards[51],
            shapeType: "box",
            "script": Script.resolvePath("./Card.js") + "?" + Date.now() 
        };
        cardIDs.push(Entities.addEntity(cardProperties));
        //make the deck (used for decoration, makes them think cards are coming from the deck)
        var cardDeckProperties = {
            "type": "Model", 
            "lifetime": -1, 
            "dynamic": false,
            "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_0.jpg"}',
            "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
            "dimensions": {
                x: .07,
                y: .12,
                z: .1
            },
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                },
            }),
            "position": deckLocation,
            "collisionless": false,
            "collidesWith": "dynamic",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
            name: "CARD_DECK",
            shapeType: "box",
        };
        Entities.addEntity(cardDeckProperties);
        //find right of deck
        var direction = Quat.getRight(deckRotation);
        var distance = .7;
        var resetPosition = Vec3.sum(deckLocation, Vec3.multiply(direction, distance));
        //Make reset button
        var resetButtonProperties = {
            "type": "Model", 
            "lifetime": -1, 
            "dynamic": false,
            "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
            "dimensions": {
                x: .07,
                y: .12,
                z: .1
            },
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false,
                    wantsTrigger: true
                },
                "deckHandlerID": entityID
            }),
            "position": resetPosition,
            "collisionless": false,
            "collidesWith": "",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Assets/Basic_Cube.fbx",
            name: "CARD_Reset_Button",
            shapeType: "box",
            "script": Script.resolvePath("./Reset_Button.js") + "?" + Date.now()
        };
        Entities.addEntity(resetButtonProperties);
        //set last card number
        lastCard = 52;
        
        //get all channels
        cardChannel = "card-channel-".concat(entityID);
        resetChannel = "reset-channel-".concat(entityID);
        Messages.subscribe(cardChannel);
        Messages.subscribe(resetChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);
    };

    _this.onReceivedMessage = function(channel, message, senderID) {
        if (channel == cardChannel) {
            showOrHideCard(message);
        } else if (channel == resetChannel) {
            resetDeck();
        }
    };

    function showOrHideCard(message) {
        var data = JSON.parse(message);
        if (data[0] == true) {
            var cardName = Entities.getEntityProperties(data[1]).name;
            var usability = {
               textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/' + cardName + '.jpg"}',
            };
            Entities.editEntity(data[1], usability);
            if ((("CARD_" + cards[lastCard - 1]) == cardName) && (lastCard != 0)) {
                --lastCard;
                var cardProperties = {
                    "type": "Model", 
                    "lifetime": -1, 
                    "dynamic": true,
                    "damping": 0.98,
                    "angularDamping": 0.98,
                    "gravity": {
                        x: 0,
                        y: -4,
                        z: 0
                    },
                    "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_' + cards[lastCard - 1] + '.jpg"}',
                    "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
                    "dimensions": {
                        x: .07,
                        y: .12,
                        z: .006
                    },
                    userData: JSON.stringify({
                        grabbableKey: {
                            grabbable: true,
                            ignoreIK: false
                        },
                        "held": false,
                        "card": true,
                        "deckHandlerID": _this.entityID
                    }),
                    "position": {
                        x: deckLocation.x,
                        y: deckLocation.y + (.053 + .003),
                        z: deckLocation.z
                    },
                    "collisionless": false,
                    "collidesWith": "static,dynamic",
                    "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
                    name: "CARD_" + cards[lastCard - 1],
                    shapeType: "box",
                    "script": Script.resolvePath("./Card.js") + "?" + Date.now() 
                };
                cardIDs.push(Entities.addEntity(cardProperties));
            }
        } else if (data[0] == false) {
            var showChannel = "show-channel".concat(data[1]); 
            var dataToPassBack = [data[2], data[3]];
            Messages.sendMessage(showChannel, JSON.stringify(dataToPassBack));
            var cardName = Entities.getEntityProperties(data[1]).name;
            if ((("CARD_" + cards[lastCard - 1]) == cardName) && (lastCard != 0)) {
                --lastCard;
                //give them time to pickup the card before you spawn a new one
                Script.setTimeout( function() {
                    var cardProperties = {
                        "type": "Model", 
                        "lifetime": -1, 
                        "dynamic": true,
                        "damping": 0.98,
                        "angularDamping": 0.98,
                        "gravity": {
                            x: 0,
                            y: -4,
                            z: 0
                        },
                        "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_' + cards[lastCard - 1] + '.jpg"}',
                        "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
                        "dimensions": {
                            x: .07,
                            y: .12,
                            z: .006
                        },
                        userData: JSON.stringify({
                            grabbableKey: {
                                grabbable: true,
                                ignoreIK: false
                            },
                            "held": false,
                            "card": true,
                            "deckHandlerID": _this.entityID
                        }),
                        "position": {
                            x: deckLocation.x,
                            y: deckLocation.y + (.053 + .003),
                            z: deckLocation.z
                        },
                        "collisionless": false,
                        "collidesWith": "static,dynamic",
                        "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
                        name: "CARD_" + cards[lastCard - 1],
                        shapeType: "box",
                        "script": Script.resolvePath("./Card.js") + "?" + Date.now() 
                    };
                    cardIDs.push(Entities.addEntity(cardProperties));
                }, 1000);
            }
        }

    }

    function Shuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        // While there remain elements to shuffle...
        while (0 !== currentIndex) {
        // Pick a remaining element...
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;

            // And swap it with the current element.
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }

    function resetDeck() {
        //shuffle deck
        Shuffle(cards);
        //delete all cards
        for (i = 0; i < 52; i++) {
            Entities.deleteEntity(cardIDs[i]);
        }
        cardIDs = [];
        //create a single card
        var cardProperties = {
            "type": "Model", 
            "lifetime": -1, 
            "dynamic": true,
            "damping": 0.98,
            "angularDamping": 0.98,
            "gravity": {
                x: 0,
                y: -4,
                z: 0
            },
            "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_' + cards[51] + '.jpg"}',
            "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
            "dimensions": {
                x: .07,
                y: .12,
                z: .006
            },
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: true,
                    ignoreIK: false
                },
                "held": false,
                "card": true,
                "deckHandlerID": _this.entityID
            }),
            "position": {
                x: deckLocation.x,
                y: deckLocation.y + (.053 + .003),
                z: deckLocation.z
            },
            "collisionless": false,
            "collidesWith": "static,dynamic",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
            name: "CARD_" + cards[51],
            shapeType: "box",
            "script": Script.resolvePath("./Card.js") + "?" + Date.now() 
        };
        cardIDs.push(Entities.addEntity(cardProperties));
        //change last card
        lastCard = 52;

    }

    _this.unload = function () {
        Messages.unsubscribe(cardChannel);
        Messages.unsubscribe(resetChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);
    };
})
