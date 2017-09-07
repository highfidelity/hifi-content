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
    var hitChannel;
    var blockedChannel;
    //sounds
    var blockSound;
    var hitSound;

    _this.preload = function(entityID) {
        print("Loading Game handler script");
        _this.entityID = entityID;
        hitChannel = "hit-channel";
        blockedChannel = "blocked-channel";
        Messages.subscribe(hitChannel);
        Messages.subscribe(blockedChannel);
        Messages.messageReceived.connect(_this, _this.onReceivedMessage);  
        blockSound = SoundCache.getSound(Script.resolvePath("./SwordGameSounds/Blocked.wav"));
        hitSound = SoundCache.getSound(Script.resolvePath("./SwordGameSounds/Hit.wav"));
    };

    _this.onReceivedMessage = function(channel, message, senderID) {
        if (channel == hitChannel)
            Hit(message);
        if (channel == blockedChannel)
            Blocked(message);
    };

    function Blocked(message) {
        print("Blocked");
        var data = JSON.parse(message);
        //play collide sound
        Audio.playSound(blockSound, { loop: false, position: data[1], volume: .2 });
        //disable sword collisions and change texture
        var usability = {
            textures: '{ "normal": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/VS/SwordGameAssets/broadsword_01.fbx/broadsword_01.fbm/color-atlas-1b.jpg"}'
        };
        Entities.editEntity(data[0], usability);
        Script.setTimeout(function () {
            var usability = {
                textures: '{ "normal": "https://hifi-content.s3.amazonaws.com/jedon/Game_Creater_Toolkit/VS/SwordGameAssets/broadsword_01.fbx/broadsword_01.fbm/color-atlas-1.jpg"}'
            };
            Entities.editEntity(data[0], usability);
        }, 1000);
    }

    function Hit(message) {
        print("Hit");
        var data = JSON.parse(message);
        //play collide sound
        Audio.playSound(hitSound, { loop: false, position: data[1], volume: .2 });
        //if players health is out then replace shield with rubber chicken. Other player gets a trophy
        if (data[2] == 0) {
            print("You LOST!!!");
            //delete object last heart is parented to (will delete last heart with it)
            Entities.deleteEntity(data[3]);
            Entities.deleteEntity(data[4][data[2]]);
            //put trophy in losers hand
            var replace = {
                modelURL: Script.resolvePath("./SwordGameAssets/trophy.fbx"),
                "dimensions": {
                    x: .5,
                    y: .6,
                    z: .3
                },
                script: Script.resolvePath("./VS_Blank.js") + "?" + Date.now()
            };
            Entities.editEntity(data[0], replace);
            //put rubber chicken in winners hand
            replace = {
                modelURL: Script.resolvePath("./SwordGameAssets/rubberchicken.fbx"),
                "dimensions": {
                    x: .2440,
                    y: .6,
                    z: .3
                },
                script: Script.resolvePath("./VS_Blank.js") + "?" + Date.now()
            };
            Entities.editEntity(data[5], replace);

            //change texture on shield to show health has been lowered
            var heartsLeft = Script.resolvePath("./SwordGameAssets/shield_02.fbx") + "/shield_02.fbm/health-" + data[2] + ".png";
            var lifeLeft = {
                    textures: '{ "health-5": "' + heartsLeft + '"}'
                };
            Entities.editEntity(data[6], lifeLeft);
        } else {
            //delete heart above head
            Entities.deleteEntity(data[4][data[2]]);
            //change texture on shield to show health has been lowered
            var heartsLeft = Script.resolvePath("./SwordGameAssets/shield_02.fbx") + "/shield_02.fbm/health-" + data[2] + ".png";
            var lifeLeft = {
                    textures: '{ "health-5": "' + heartsLeft + '"}'
                };
            Entities.editEntity(data[6], lifeLeft);
        }
    }

    _this.unload = function () {
    };
})
