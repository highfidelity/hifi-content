//
//  guitarPlay.js
//
//  created by Rebecca Stankus on 01/24/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {
    var RIFF_NUMBER_INDEX = 12;
    var properties;
    var _this;
    var guitar;
    var riffNumber;

    var GuitarButton = function() {
        _this = this;
    };
    GuitarButton.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            properties = Entities.getEntityProperties(_this.entityID, ['name', 'parentID']);
            guitar = properties.parentID;
            riffNumber = properties.name.charAt(RIFF_NUMBER_INDEX);
        },
        collisionWithEntity: function(thisEntity, otherEntity, collision) {
            if (collision.type === 0) {
                var data = [riffNumber];
                Entities.callEntityMethod(guitar, 'playSound', data);
            }
        }
    };
    return new GuitarButton;
});
