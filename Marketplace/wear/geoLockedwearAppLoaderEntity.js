//
//  geoLockedwearAppLoaderEntity.js
//
//  Created by Thijs Wenker on 11/30/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var WEAR_RUN_STANDALONE_CHANNEL = 'com.highfidelity.wear.standaloneRun';
    var WEAR_STANDALONE_SCRIPT_NAME = 'wearAppStandalone.js';
    var createWearApp = Script.require('./wearApp.js');
    var wearAppInstance = null;

    var isRunningStandaloneWearApp = function() {
        var isRunning = false;
        ScriptDiscoveryService.getRunning().forEach(function(script) {
            if (script.name === WEAR_STANDALONE_SCRIPT_NAME) {
                isRunning = true;
            }
        });
        return isRunning;
    };

    if (!isRunningStandaloneWearApp()) {
        wearAppInstance = createWearApp();
        
        Messages.subscribe(WEAR_RUN_STANDALONE_CHANNEL);
        var onMessageReceived;
        
        var unloadWearApp = function() {
            if (wearAppInstance === null) {
                return;
            }
            Messages.messageReceived.disconnect(onMessageReceived);
            Messages.unsubscribe(WEAR_RUN_STANDALONE_CHANNEL);
            wearAppInstance.cleanUp();
            wearAppInstance = null;
        };

        onMessageReceived = function(channel, message, sender) {
            if (channel === WEAR_RUN_STANDALONE_CHANNEL && sender === MyAvatar.sessionUUID) {
                unloadWearApp();
            }
        };
        Messages.messageReceived.connect(onMessageReceived);

        this.unload = function() {
            unloadWearApp();
        };
    }
});
