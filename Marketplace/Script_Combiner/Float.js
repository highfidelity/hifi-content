//
//  Float.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/22/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for script combiner
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function () {
    var _this = this;
    
    _this.preload = function (entityID) {
        _this.entityID = entityID;
        var newProperties = {
            "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
            dynamic: true,
            gravity: {x: 0, y: 1, z: 0},
            lifetime: 1200
        };
        Entities.editEntity(entityID, newProperties);
        var floatSound = SoundCache.getSound("https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/sci-fi-float.wav");
        if (floatSound.downloaded && !floatSound.playing) {
            Audio.playSound(floatSound, { loop: false, position: MyAvatar.position, volume: .3 });
        }
    }
})
