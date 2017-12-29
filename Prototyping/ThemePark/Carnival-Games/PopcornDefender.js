//
//  PopcornDefender.js
//
//  This script can be added to entities to use to ward off aliens by feeding them
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var ALIEN_CHANNEL_BASE = "AlienChannel";

    var FoodWeapon = function(){

    };

    FoodWeapon.prototype = {
        preload: function(entityID){
            Messages.subscribe(ALIEN_CHANNEL_BASE);
        },
        unload: function(){
            Messages.unsubscribe(ALIEN_CHANNEL_BASE);
        },
        collisionWithEntity: function(idA, idB, event) {
            var name = Entities.getEntityProperties(idB, 'name').name;
            if (name.indexOf("Alien") !== -1) {
                Messages.sendMessage(ALIEN_CHANNEL_BASE, JSON.stringify({type: "HitAlienWithFood", alienID: idB}));
            }
        }

    };
    return new FoodWeapon();
});