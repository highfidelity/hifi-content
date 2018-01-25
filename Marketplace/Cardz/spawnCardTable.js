//
//  spawnCardTable.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 9/14/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for card table
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals utils,SHOPPING_ENTITIES, TEMPLATES:true */
CARD_ENTITIES = {
    "Entities": [
        {
            "clientOnly": 0,
            "color": {
                "blue": 0,
                "green": 0,
                "red": 255
            },
            "created": "2017-11-23T20:38:01Z",
            "dimensions": {
                "x": 1.6153218746185303,
                "y": 0.9037846326828003,
                "z": 0.7385615110397339
            },
            "id": "{9c410d95-b889-4728-9479-f4c90afeba20}",
            "lastEdited": 1511469766576694,
            "lastEditedBy": "{ec485a3a-4a9a-411c-9c49-e216c76fb419}",
            "name": "CARD-Table",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0.07380008697509766
            },
            "queryAACube": {
                "scale": 1.9928784370422363,
                "x": -0.9964392185211182,
                "y": -0.9964392185211182,
                "z": -0.9226391315460205
            },
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "shape": "Cube",
            "type": "Box",
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
        },
        {
            "clientOnly": 0,
            "collidesWith": "dynamic,",
            "collisionMask": 2,
            "created": "2017-11-23T20:38:01Z",
            "dimensions": {
                "x": 0.07000000029802322,
                "y": 0.11999999731779099,
                "z": 0.05000000074505806
            },
            "id": "{c8a68b99-ec83-4756-b06c-28e2046b2e00}",
            "lastEdited": 1511470311253918,
            "lastEditedBy": "{ec485a3a-4a9a-411c-9c49-e216c76fb419}",
            "modelURL": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/Cardz/DeckOfCardsAssets/master_card.fbx",
            "name": "CARD_DECK",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.003754138946533203,
                "y": 0.4776268005371094,
                "z": 0
            },
            "queryAACube": {
                "scale": 0.14764823019504547,
                "x": -0.07006997615098953,
                "y": 0.40380269289016724,
                "z": -0.07382411509752274
            },
            "rotation": {
                "w": 0.7070878744125366,
                "x": 0.7070878744125366,
                "y": -4.57763671875e-05,
                "z": -1.52587890625e-05
            },
            "serverScripts": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/Cardz/Deck_Handler.js?" + Date.now(),
            "shapeType": "box",
            "textures": "{ \"HiddenCardFile\": \"https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/Cardz/DeckOfCardsTexture/CARD_0.jpg\"}",
            "type": "Model",
            "userData": "{\"grabbableKey\":{\"grabbable\":false,\"ignoreIK\":false}}"
        }
    ],
    "Version": 79
}

// Add LocalPosition to entity data if parent properties are available
var entities = CARD_ENTITIES.Entities;
var entitiesByID = {};
for (var i = 0; i < entities.length; ++i) {
    var entity = entities[i];
    entitiesByID[entity.id] = entity;
}
for (var i = 0; i < entities.length; ++i) {
    var entity = entities[i];
    if (entity.parentID !== undefined) {
        var parent = entitiesByID[entity.parentID];
        if (parent !== undefined) {
            entity.localPosition = Vec3.subtract(entity.position, parent.position);
            delete entity.position;
        }
    }
}
