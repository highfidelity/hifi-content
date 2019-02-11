//
// ShatterPlateServer.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
/* globals Entities, Uuid */
(function() {
  
    var _entityID;

    var LIFETIME = 10;

    var Plate = function(){
    };
  
  
    Plate.prototype = {
        remotelyCallable : ['makeFragile'],

        preload: function(entityID) {
            _entityID = entityID;
        },

        makeFragile: function() {
            Entities.editEntity(_entityID, {
                collidesWith: "static,dynamic,kinematic",
                lifetime: LIFETIME 
            });
        }
    };
  
    return new Plate();

});
