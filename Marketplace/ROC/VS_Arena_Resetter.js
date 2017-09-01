//
//  ROC_Arena_Resetter.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Used to reset swords after a battle 
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    var _this = this;
    //holds id of object that has script which resets arena
    var resetArena;

    _this.preload = function (entityID) {
        print("Loading reset script");
        _this.entityID = entityID;
    };

    _this.startFarTrigger = function(entityID, data) {
        //let player know they've hit the sign through haptic feedback
        Controller.triggerShortHapticPulse(.9, 2);
        //get the id of the reset so you can find the unique channel name
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        resetArena = properties.reset;
        var name = "equip-channel-ROC-Sign"+ resetArena;
        //send the message
        var data = [entityID];
        Messages.sendMessage(name, JSON.stringify(data));
    };

    _this.startNearTrigger = function(entityID, data) {
        //let player know they've hit the sign through haptic feedback
        Controller.triggerShortHapticPulse(.9, 2);
        //get the id of the reset so you can find the unique channel name
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        resetArena = properties.reset;
        var name = "equip-channel-ROC-Sign"+ resetArena;
        //send the message
        var data = [entityID];
        Messages.sendMessage(name, JSON.stringify(data));
    };
})
