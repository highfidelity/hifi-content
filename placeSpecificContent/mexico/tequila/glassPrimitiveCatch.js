// This catches when a user clicks the shot glass, but it actually hits the primitive liquor shot inside the glass
//
//  glassPrimitiveCatch.js
//
//  created by Rebecca Stankus on 05/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() {

    var _this;

    var glass;

    function Drink() {
        _this = this;
    }

    Drink.prototype = {
        preload: function(entityID) {
            _this = this;
            _this.entityID = entityID;
            glass = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
        },
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            Entities.callEntityMethod(glass, 'drinkShot');
        }
    };

    return new Drink();
});
