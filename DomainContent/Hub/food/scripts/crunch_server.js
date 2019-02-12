//
// crunch_server
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities */

(function() {
    var _entityID;
    var LIFETIME = 30;

    var Food = function() {
    };
  
    Food.prototype = {
        remotelyCallable: ['deleteFood', 'setUpFood'],

        preload: function(entityID) {
            _entityID = entityID;
        },

        deleteFood: function() {
            Entities.deleteEntity(_entityID);
        },

        setupFood: function() {
            var age = Entities.getEntityProperties(_entityID, "age").age;
            Entities.editEntity( _entityID, {
                lifetime: age + LIFETIME,
                visible: true,
                dynamic: true,
                collisionless: false
            });
        }
    };
  
    return new Food();

});
