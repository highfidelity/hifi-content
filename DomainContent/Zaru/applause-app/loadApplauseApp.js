// loadApplauseApp.js
// 
// Copyright 2018 High Fidelity Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){

    var ApplauseItem = function(){

    };

    ApplauseItem.prototype = {

        preload: function(entityID) {
            Script.require('./applause-app.js');
        }

    };
    return new ApplauseItem();

});