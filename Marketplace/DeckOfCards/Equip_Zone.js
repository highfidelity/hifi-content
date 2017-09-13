//
//  ROC_Blank.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Use this script so my server script can see the entity
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() { 
    var _this = this;
    //channels
    var gloveChannel;
    var zoneChannel;
    //glove on your hand
    var glove;

    _this.preload = function(entityID) {
        print("Loading Equip Zone script");  
        _this.entityID = entityID;
        //get necessary properties
        var props = Entities.getEntityProperties(entityID);
        var properties = JSON.parse(props.userData);
        //get glove channel
        gloveChannel = "glove-channel".concat(properties.deckHandlerID); 
        //subscribe to channel
        zoneChannel = "zone-channel-".concat(_this.entityID);
        Messages.subscribe(zoneChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);
    };

    _this.onReceivedMessage = function(channel, message, senderID) {
    	try {
            var data = JSON.parse(message);
        } catch (err) {
            // e
        }
        if ((channel == zoneChannel) && (MyAvatar.sessionUUID == data[1])) {
        	print("about to attach");
        	glove = data[0];
	    	//Attaching everything
	        Script.setTimeout(function() {
	            Messages.sendLocalMessage('Hifi-Hand-Grab', JSON.stringify({
	            hand: "right",
	            entityID: data[0]
	            }));
	        }, 700);
            //attachGlove(message);
        } 
    };

    _this.enterEntity = function(entityID) {
        print("Entering entity!"); 
        var data = [MyAvatar.sessionUUID];
        Messages.sendMessage(gloveChannel, JSON.stringify(data)); 
    };

    _this.leaveEntity = function(entityID) {
        print("Leaving entity!");  
        Entities.deleteEntity(glove);
    };

    _this.unload = function () {
        Messages.unsubscribe(zoneChannel);
    };
})
