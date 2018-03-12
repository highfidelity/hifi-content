//
//  wearAppStandalone.js
//
//  Created by Thijs Wenker on 11/30/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var WEAR_RUN_STANDALONE_CHANNEL = 'com.highfidelity.wear.standaloneRun';

    // Trick to make the entity script stop running the app when it is loaded standalone (from MarketPlace)
    Messages.sendMessage(WEAR_RUN_STANDALONE_CHANNEL, '');
    var createWearApp = Script.require('./wearApp.js');
    var wearAppInstance = createWearApp();
    Script.scriptEnding.connect(wearAppInstance.cleanUp);
})();
