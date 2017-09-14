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
            "collidesWith": "",
            "collisionMask": 0,
            "collisionless": 1,
            "color": {
                "blue": 222,
                "green": 29,
                "red": 51
            },
            "created": "2017-09-11T22:18:46Z",
            "damping": 0.8999999761581421,
            "dimensions": {
                "x": 0.20000000298023224,
                "y": 0.008494749665260315,
                "z": 0.20000000298023224
            },
            "id": "{7f8d8281-0ef4-42b2-bbc7-1a63da3f252f}",
            "ignoreForCollisions": 1,
            "lastEdited": 1505168629878212,
            "lastEditedBy": "{6978b7ed-091f-442a-a78a-33f8a4176fc7}",
            "name": "CARD-Deck_Handler",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0.0002378225326538086,
                "y": 0.4577655792236328,
                "z": 0
            },
            "queryAACube": {
                "scale": 0.28297024965286255,
                "x": -0.14124730229377747,
                "y": 0.31628045439720154,
                "z": -0.14148512482643127
            },
            "rotation": {
                "w": 1,
                "x": -1.52587890625e-05,
                "y": -1.52587890625e-05,
                "z": -1.52587890625e-05
            },
            "serverScripts": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/DeckOfCards/Deck_Handler.js" + "?" + Date.now(),
            "shape": "Hexagon",
            "type": "Shape",
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}"
        },
        {
            "clientOnly": 0,
            "color": {
                "blue": 0,
                "green": 0,
                "red": 255
            },
            "created": "2017-09-11T22:18:46Z",
            "dimensions": {
                "x": 1.6153218746185303,
                "y": 0.9037846326828003,
                "z": 0.7385615110397339
            },
            "id": "{a6358d02-998e-48a8-99aa-c433a531076b}",
            "lastEdited": 1505168617230535,
            "lastEditedBy": "{6978b7ed-091f-442a-a78a-33f8a4176fc7}",
            "name": "CARD-Table",
            "owningAvatarID": "{00000000-0000-0000-0000-000000000000}",
            "position": {
                "x": 0,
                "y": 0,
                "z": 0.0680856704711914
            },
            "queryAACube": {
                "scale": 1.9928784370422363,
                "x": -0.9964392185211182,
                "y": -0.9964392185211182,
                "z": -0.9283535480499268
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
        }
    ],
    "Version": 73
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
