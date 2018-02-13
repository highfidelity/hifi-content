// loadSupportApp.js
// 
// Copyright 2018 High Fidelity Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var SupportItem = function(){

    };

    SupportItem.prototype = {

        preload: function(entityID) {
            Script.require('./support.js');
        }

    };
    return new SupportItem();

});