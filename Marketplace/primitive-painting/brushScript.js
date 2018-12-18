//
//  brushScript.js
//
//  created by Liv Erickson on 12/04/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function () {
    var COLOR_NAME = "Paint-Color";
    this.collisionWithEntity = function (myID, theirID, collision) {
        var collisionProperties = Entities.getEntityProperties(theirID, ['name', 'color']);
        if (collisionProperties.name === COLOR_NAME) {
            Entities.editEntity(myID, { 'color': collisionProperties.color });
        } else {
            if (collisionProperties.name.indexOf('brush') === -1 &&
                collisionProperties.name.indexOf('Palette') === -1 &&
                collisionProperties.name.indexOf('Parent') === -1) {
                Entities.editEntity(theirID, { 'color': Entities.getEntityProperties(myID, 'color').color });
            }
        }
    };
});