//
//  azoozController.js
//
//  Created by Caitlyn Meeks on 9/3/17
//  Copyright 2017 High Fidelity, Inc.
//  Derived by BoppoScript.js from Thoys 
//
//	An entity script for a Zone to track and display the scores from a system of pickup and trigger volume entities
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals SoundCache Overlays HMD Messages */
(function() {
	
	var _this = this;
	var CHANNEL_PREFIX = 'io.highfidelity.azooz_server_';	
	var COLLECT_CHANNEL = "collect";
	var REGISTER_CHANNEL = "register";
	
	var QUOIN_SOUND = SoundCache.getSound("http://hifi-content.s3.amazonaws.com/DomainContent/production/azooz/cabled-mess__coin-c-02.wav");  
    var VICTORYSOUND_SOURCE = SoundCache.getSound("http://hifi-content.s3.amazonaws.com/DomainContent/production/azooz/320887__rhodesmas__win-04.wav"));
	
	var scoreID = 0;
	var inZone = false;	
	var totalPickups = 0;
	var score = 0;
	var touchedPickups = [];
	var registeredPickups = [];  
  
	var createDisplayTexts = function () {
		scoreID = Overlays.addOverlay("text", {
			width: 200,
			height: 20,
			text: "Score: 0/"+totalPickups,
			alpha: 0.9,
			backgroundAlpha: 1,
			visible: true,
			x: 80, y:40
		});		
	};

	
	var onMessage = function(channel, message, sender) {  // channel string, messageis UID by default, sender is the avatar UID	
        if (channel == REGISTER_CHANNEL) {		
            if (registeredPickups.indexOf(message) == -1) {
              registeredPickups.push(message);
              totalPickups++;
            } else {}
            }			
            if (channel == COLLECT_CHANNEL) {
            if (touchedPickups.indexOf(message) == -1) {
              touchedPickups.push(message);
              score++;
              Audio.playSound(QUOIN_SOUND, {
                position: MyAvatar.position,
                volume: 1,
                localOnly: true
			  });
              
            } 
        }
		
		Overlays.editOverlay(scoreID, {text : "Score: "+score+"/"+totalPickups});
		
		if (score == totalPickups) Audio.playSound(VICTORYSOUND_SOURCE, {
                position: MyAvatar.position,
                volume: 1,
                localOnly: true
			  });
			  
    };				
		
			
    _this.preload = function(entityID) {
        HMD.displayModeChanged.connect(function() {
			createDisplayTexts();        
        });
        Messages.subscribe(COLLECT_CHANNEL);
        Messages.subscribe(REGISTER_CHANNEL);
        Messages.messageReceived.connect(onMessage);
    };

    _this.unload = function() {
        Messages.unsubscribe(COLLECT_CHANNEL);
        Messages.unsubscribe(REGISTER_CHANNEL);
        Overlays.deleteOverlay(scoreID);
    };

    _this.enterEntity = function(entityID) {
        inZone = true;
		createDisplayTexts();
    };

    _this.leaveEntity = function(entityID) {
        Messages.unsubscribe(COLLECT_CHANNEL);
        Messages.unsubscribe(REGISTER_CHANNEL);
        Overlays.deleteOverlay(scoreID);
        inZone = false;		
    };

    _this.unload = _this.leaveEntity;
});
