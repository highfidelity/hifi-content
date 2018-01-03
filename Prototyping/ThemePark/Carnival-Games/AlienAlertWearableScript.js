//
//  AlienAlertWearableScript.js
//
//  This script can be attached to an entity with a child light entity to warn of incoming invasions
// 
//  Created by Liv Erickson on 12/11/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    
    var COLORS = [{red: 255, green: 255, blue: 255 }, 
        { red: 0, green: 255, blue: 0 },
        { red: 0, green: 0, blue: 255 }];

    var ALERT_COLOR = {red: 255, green: 0, blue: 0};

    var INTERVAL = 10000;

    var loop;
    var lightID;    
    var isAttack = false;

    var alienListener = function(channel, message, sender){
        message = JSON.parse(message);
        if (channel === "InvasionChannel" && message.type === 'before_it_all_happens') {
            Script.clearInterval(loop);
            Entities.editEntity(lightID, {'color' : ALERT_COLOR});
            isAttack = true;
        } else if (channel === "InvasionChannel" && message.type === 'gameover') {
            isAttack = false;
            Script.setInterval(lightEffect, INTERVAL);
        }
    };

    var lightEffect = function(){
        var color = Math.round(Math.random() * COLORS.length); 
        if (!isAttack){
            Entities.editEntity(lightID, {'color' : COLORS[color]});            
        }
    };

    var HatEffect = function(){

    };

    HatEffect.prototype = {
        preload: function(entityID){
            lightID = Entities.getChildrenIDs(entityID)[0]; 
            Messages.subscribe("InvasionChannel");
            Messages.messageReceived.connect(alienListener);
            loop = Script.setInterval(lightEffect, 10000);
        },
        unload: function(){
            Messages.messageReceived.disconnect(alienListener);
            Script.clearInterval(loop);
        }
    };
    return new HatEffect();
});
