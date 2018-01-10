//
//  Reset_Button.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 9/14/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Reset card deck 
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _this = this;
    //channel name
    var channelName;
    //blank data
    var data = [];
    //controls haptic feedback
    var pulseStrength;
    var bothHands;

    _this.preload = function(entityID) {
        print("Loading reset script");
        pulseStrength = .9;
        bothHands = 2;
        _this.entityID = entityID;
        //get the id of the reset so you can find the unique channel name
        var properties = JSON.parse(Entities.getEntityProperties(entityID).userData);
        //channel name
        channelName = "reset-channel-" + properties.deckHandlerID;
    };

    _this.startFarTrigger = function(entityID, data) {
        //send the message
        Messages.sendMessage(channelName, JSON.stringify(data));
        //let player know they've hit the sign through haptic feedback
        Controller.triggerShortHapticPulse(pulseStrength, bothHands);
    };

    _this.startNearTrigger = function(entityID, data) {
        //send the message
        Messages.sendMessage(channelName, JSON.stringify(data));
        //let player know they've hit the sign through haptic feedback
        Controller.triggerShortHapticPulse(pulseStrength, bothHands);
    };

    _this.unload = function () {
    };
})
