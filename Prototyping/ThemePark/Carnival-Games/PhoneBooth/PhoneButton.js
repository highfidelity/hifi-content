//
//  PhoneButton.js
//
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    var MESSAGE_CHANNEL = "RingRingRingRingRingRingRingBananaPhone";
    var HOVER_ACTIVE_COLOR = {red: 255, green: 0, blue: 0};
    var HOVER_NOT_ACTIVE_COLOR = {red: 99, green: 99, blue:99};
    var ALLOWED_NUMBERS = ["0", "1", "5", "6"];
    
    var isActiveButton = false;
    var name;

    var PhoneButton = function() {

    };
    PhoneButton.prototype = {
        preload: function(entityID){
            name = Entities.getEntityProperties(entityID, 'name').name;
            if (ALLOWED_NUMBERS.indexOf(name) !== -1) {
                isActiveButton = true;
                Messages.subscribe(MESSAGE_CHANNEL);                
            }
        },
        unload: function(){ 
            if (isActiveButton){
                Messages.unsubscribe(MESSAGE_CHANNEL);                
            }
        },
        hoverEnterEntity: function(id, event) {
            Entities.editEntity(id, {color: HOVER_ACTIVE_COLOR});
        },
        hoverLeaveEntity: function(id, event) {
            Entities.editEntity(id, {color: HOVER_NOT_ACTIVE_COLOR});
        },
        clickDownOnEntity: function() {
            if (isActiveButton) {
                Messages.sendMessage(MESSAGE_CHANNEL, name);
            }
        }
    };
    return new PhoneButton;
});
