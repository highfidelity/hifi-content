// moneyTreeRecevierClient.js

//  Created by Mark Brosche on 10-18-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* global EventBridge Users AccountServices Agent Avatar */

(function (){
// get userData
// spawn Overlays for clients with ID == giverID
// delete after overlay after click event or after timer expires.
// send data to google sheet
    var SECRETS = Script.require(Script.resolvePath('../moneyTreeChannels.json'));
    var COIN_CLICKED = SoundCache.getSound(Script.resolvePath('../resources/sounds/payout.wav')),
        MONEY_TREE_CHANNEL = SECRETS.RECPIENT_CHANNEL,
        AUDIO_VOLUME = 0.1;
    var MAX_TIME_WAIT = 60000;

    var _this,
        injector,
        spawnerProperties,
        userData,
        receiverID,
        amount,
        answer;

    var TreeGift = function(){
        _this = this;
    };

    TreeGift.prototype = {

        preload: function(entityID){
            Messages.subscribe(MONEY_TREE_CHANNEL);
            _this.entityID = entityID;
            _this.getEntityData();
            _this.spawnMessageAlert();
        },

        playSound: function(sound, position, localOnly) {
            if (sound.downloaded) {
                if (injector) {
                    injector.stop();
                }
                injector = Audio.playSound(sound, {
                    position: position,
                    volume: AUDIO_VOLUME,
                    localOnly: localOnly
                });
            }
        },

        getEntityData: function() {     
            spawnerProperties = Entities.getEntityProperties(_this.entityID, ["position", "rotation", "userData", "parentID"]);
            if (!spawnerProperties.userData || spawnerProperties.userData === "{}") {
                print("spawner ", _this.entityID, " is missing user data.");
                return;
            }
            try {
                userData = JSON.parse(spawnerProperties.userData);
                receiverID = userData.receiverID;
                if (MyAvatar.sessionUUID !== receiverID){
                    _this.unload();
                }
                amount = userData.amount;
                // verify that settings are legit
            } catch (e) {
                print("Error in retrieving entity Data");
                return;
            }
        },

        
        spawnMessageAlert: function() {
            if (MyAvatar.sessionUUID === receiverID){ // 
                var text = "Somebody here picked you to receive " + amount + 
                " HFC! \nClick 'YES' within 60 seconds to accept this gift. \n\nThank you for being part of the community!";
                // _this.playSound(COIN_WAITING, Camera.position, true);
                var time = new Date().getTime();
                answer = Window.confirm(text);  
                var timeDiff = (new Date() - time);
                if (timeDiff > MAX_TIME_WAIT){
                    Window.announcement("You took to long to accept your gift.\n\n Please acknowledge sooner next time.");
                } else if (answer) {
                    Messages.sendMessage("RecipientChannel", JSON.stringify({
                        type: "accept",
                        nodeID: receiverID,
                        amount: amount
                    }));
                    _this.playSound(COIN_CLICKED, Camera.position, true);
                } else {
                    Window.announcement("You chose not to receive any HFC.");
                    Messages.sendMessage("RecipientChannel", JSON.stringify({
                        type: "decline"
                    }));
                }
            }
        },


        unload: function(){
            if (injector) {
                injector.stop();
            }
            Messages.unsubscribe(MONEY_TREE_CHANNEL);
        }
    };

    return new TreeGift;
});