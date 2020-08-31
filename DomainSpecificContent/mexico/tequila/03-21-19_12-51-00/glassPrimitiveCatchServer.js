//
// glassPrimativeCatchServer.js
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

    var Glass = function() {
    };
  
    Glass.prototype = {
        remotelyCallable: ['deleteGlass'],

        preload: function(entityID) {
            _entityID = entityID;
        },

        deleteGlass: function() {
            Entities.deleteEntity(_entityID);
        }
    };
  
    return new Glass();

});
