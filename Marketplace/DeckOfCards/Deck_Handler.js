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
    //channels
    var gloveChannel;
    var cardChannel;
    var zoneChannel;
    //holds id of all gloves
    var gloves = [];
    //holds id of player zone
    var zoneID;
    //holds ID of all cards
    var cardIDs = [];
    //holds number of the last card grabbed
    var lastCard;
    //holds names of cards for shuffle
    var cards = [];

    _this.preload = function(entityID) {
        print("Loading Deck Handler script."); 
        _this.entityID = entityID;
        //position of deck handler
        var deckLocation = Entities.getEntityProperties(entityID).position;
        var deckRotation = Entities.getEntityProperties(entityID).rotation;
        //create zone
        var zoneProperties = {
            "type": "Box", 
            "lifetime": -1, 
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: false,
                    ignoreIK: false
                },
                "deckHandlerID": entityID
            }),
            "position": deckLocation,
            "collisionless": false,
            "visible": false,
            "dimensions": {
                x: 6,
                y: 3,
                z: 6
            },
            "collidesWith": "",
            name: "CARD-Equip_Zone",
            shapeType: "box",
            "script": Script.resolvePath("./Equip_Zone.js") + "?" + Date.now() 
        };
        zoneID = Entities.addEntity(zoneProperties);
        for (i = 1; i <= 52; i++) {
            cards.push(i);
        }
        cards = Shuffle(cards);
        //create 51 cards
        for (i = 0; i < 52; i++) {
            if (i == 51) {
                var cardProperties = {
                    "type": "Model", 
                    "lifetime": -1, 
                    "dynamic": true,
                    "damping": 0.98,
                    "angularDamping": 0.98,
                    "gravity": {
                        x: 0,
                        y: -9.8,
                        z: 0
                    },
                    "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_' + cards[i] + '.jpg"}',
                    "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
                    "dimensions": {
                        x: .055,
                        y: .1,
                        z: .003
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
                        y: deckLocation.y + (.003 * i),
                        z: deckLocation.z
                    },
                    "collisionless": false,
                    "collidesWith": "static,dynamic",
                    "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
                    name: "CARD_" + cards[i],
                    shapeType: "box",
                    "script": Script.resolvePath("./Card.js") + "?" + Date.now() 
                };
                cardIDs.push(Entities.addEntity(cardProperties));
            } else {
                var cardProperties = {
                    "type": "Model", 
                    "lifetime": -1, 
                    "dynamic": false,
                    "damping": 0.98,
                    "angularDamping": 0.98,
                    "gravity": {
                        x: 0,
                        y: -9.8,
                        z: 0
                    },
                    "textures": '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_' + (cards[i]) + '.jpg"}',
                    "rotation": Quat.multiply(deckRotation, Quat.angleAxis(90, {x: 1, y: 0, z: 0})),
                    "dimensions": {
                        x: .055,
                        y: .1,
                        z: .003
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
                        y: deckLocation.y + (.003 * i),
                        z: deckLocation.z
                    },
                    "collisionless": false,
                    "collidesWith": "static,dynamic",
                    "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsAssets/master_card.fbx",
                    name: "CARD_" + (cards[i]),
                    shapeType: "box",
                    "script": Script.resolvePath("./Card.js") + "?" + Date.now() 
                };
                cardIDs.push(Entities.addEntity(cardProperties));
            }
        }

        //make last card dynamic
        //Do this so you can grab top card without deck falling apart
        lastCard = 51;
        
        //get all channels
        gloveChannel = "glove-channel".concat(entityID); 
        cardChannel = "card-channel-".concat(entityID);
        zoneChannel = "zone-channel-".concat(zoneID);
        Messages.subscribe(gloveChannel);
        Messages.subscribe(cardChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);
    };

    _this.onReceivedMessage = function(channel, message, senderID) {
        if (channel == gloveChannel) {
            print("glove channel");
            createGlove(message);
        } else if (channel == cardChannel) {
            showOrHideCard(message);
        }
    };

    function createGlove(message) {
        print("creating glove!!");
        var avatarData = JSON.parse(message);
        print(avatarData[0]);
        //create deck handler
        var gloveProperties = {
            "type": "Model",
            "position": Entities.getEntityProperties(_this.entityID).position,
            "name": "Card-Pivot-Point",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/VS/SwordGameAssets/ball.fbx",
            "collidesWith": "dynamic",
            "dimensions": {
                "x": 0.05,
                "y": 0.05,
                "z": 0.05
            },
            "shapeType": "sphere",
            userData: JSON.stringify({
                grabbableKey: {
                    grabbable: true,
                    ignoreIK: false
                },
                equipHotspots: [{
                    position: {x: 0, y: 0, z: 0},
                    radius: 0.13,
                    joints: { //x and y .15 increase
                        RightHand: [
                            {x: -0.02, y: 0.07, z: 0.03},
                            {x: 0.2807741165161133, y: 0.6332069635391235, z: 0.2997693121433258, w: -0.6557632088661194}
                        ],
                        LeftHand: [
                            {x: 0.02, y: 0.07, z: 0.03},
                            {x: -0.32700979709625244, y: 0.623619794845581, z: 0.28943854570388794, w: 0.6483823657035828}
                        ]
                    },
                    modelURL: Script.resolvePath("./DeckOfCardsAssets/equip-Fresnel-3.fbx"),
                    modelScale: {
                        x: 1,
                        y: 1,
                        z: 1
                    }
                }]
            }),
            "script": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/Glove.js" + "?" + Date.now() 
        };
        var gloveID = Entities.addEntity(gloveProperties);
        print(gloveID);
        //add to list of gloves
        gloves.push(gloveID);
        //pass back glove ID
        var data = [gloveID, avatarData[0]];
        Messages.sendMessage(zoneChannel, JSON.stringify(data));
    }

    function showOrHideCard(message) {
        var data = JSON.parse(message);
        if (data[0] == true) {
            print("showing card to everyone");
            var cardName = Entities.getEntityProperties(data[1]).name;
            var usability = {
               textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/' + cardName + '.jpg"}',
            };
            Entities.editEntity(data[1], usability);
            //check to see if the card that was just grabbed is also on the top of the pile.
            var last2 = cardName.slice(-2);
            if(cards[lastCard] == last2) {
                print("last card to be grabbed is " + cards[lastCard]);
                --lastCard;
                var changeDynamic = {
                    dynamic: true
                };
                Entities.editEntity(cardIDs[(lastCard)], changeDynamic);
            }
        } else if (data[0] == false) {
            print("hiding card from everyone!");
            var usability = {
                textures: '{ "HiddenCardFile": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/DeckOfCardsTexture/CARD_0.jpg"}'
            };
            Entities.editEntity(data[1], usability);
            var showChannel = "show-channel".concat(data[1]); 
            var dataToPassBack = [data[2], data[3], data[4]];
            Messages.sendMessage(showChannel, JSON.stringify(dataToPassBack));
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

    _this.unload = function () {
        Messages.unsubscribe(cardChannel);
        Messages.unsubscribe(gloveChannel);
    };
})