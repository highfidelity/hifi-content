//
// crunch_server.js
// 
// Author: Milad Nazer
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities */

(function() {
    var _entityID;

    var Food = function() {
    };
  
    Food.prototype = {
        remotelyCallable: ['deleteFood'],

        preload: function(entityID) {
            _entityID = entityID;
        },

        deleteFood: function() {
            Entities.deleteEntity(_entityID);
        }
    };
  
    return new Food();

});
