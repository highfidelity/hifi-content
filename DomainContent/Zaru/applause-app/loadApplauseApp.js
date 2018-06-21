// loadApplauseApp.js
// 
// Loads the applause app on to a user's device while they are in the vicinity
// Created by Liv Erickson 6/18/2018 
// 
// Copyright 2018 High Fidelity Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function(){
    var HAS_APPLAUSE_APP_SETTING = 'io.highfidelity.applauseEnabled.appPresent';
    var ApplauseItem = function() {};
    ApplauseItem.prototype = {
        preload: function(entityID) {
            if (!Settings.getValue(HAS_APPLAUSE_APP_SETTING)) {
                Script.require('./applause-app.js');
            }
        },
        unload: function() {
            Settings.setValue(HAS_APPLAUSE_APP_SETTING, false);
        }
    };
    return new ApplauseItem();
});
