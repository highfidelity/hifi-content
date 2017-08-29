//  bowlingPinEntity.js
//
//  Created by Thijs Wenker on September 21, 2016.
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this; 
    
    var BOWLING_ALLEY_PREFIX_URL = 'http://hifi-content.s3.amazonaws.com/caitlyn/production/bowlingAlley/';

    var PIN_FALL_SOUNDS = [
        'bowlingPinFall_r_1.wav',
        'bowlingPinFall_r_2.wav',
        'bowlingPinFall_r_3.wav',
        'bowlingPinFall_r_4.wav'
    ];

    function BowlingPin() {
        _this = this;
        _this.pinFallSounds = [];
        PIN_FALL_SOUNDS.forEach(function(pinFallSound) {
            _this.pinFallSounds.push(SoundCache.getSound(BOWLING_ALLEY_PREFIX_URL + pinFallSound));
        })
    }

    BowlingPin.prototype = {
        entityID: null,
        pinFallSounds: null,
        preload: function(entityID) {
            _this.entityID = entityID;
        },
        collisionWithEntity: function(entityID, otherID, collisionInfo) {
            var properties = Entities.getEntityProperties(otherID, ['name']);
            if (properties.name.lastIndexOf("Bowling ball -") === 0) {
                print(JSON.stringify(collisionInfo));
                Audio.playSound(_this.pinFallSounds[Math.floor(_this.pinFallSounds.length * Math.random())], {
                    position: collisionInfo.contactPoint,
                    volume: 1 //TODO make it based on the ball speed
                });
            } 
        }
    };

    return new BowlingPin();
})