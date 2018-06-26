//
//  triggerBell.js
//
//  Created by Rebecca Stankus on 06/26/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {

    var _this;

    var TRIGGER_CONTROLS = [Controller.Standard.LT, Controller.Standard.RT];
    var TRIGGER_TOGGLE_VALUE = 0.97;
    var BELL_SOUND = SoundCache.getSound(Script.resolvePath("sounds/bell.wav?78"));
    var AUDIO_VOLUME_LEVEL = 1;

    var equipped = false;
    var currentHand = null;
    var triggerReleased = true;
    
    var TriggerBell = function() {
        _this = this;
    };

    TriggerBell.prototype = {

        preload: function(entityID) {
            _this.entityID = entityID;
        },

        startEquip: function(id, params) {
            equipped = true;
            currentHand = params[0] === "left" ? 0 : 1;
        },

        continueEquip: function(id, params) {
            if (!equipped) {
                var parentJointIndex = Entities.getEntityProperties(_this.entityID, 'parentJointIndex').parentJointIndex;
                currentHand = (parentJointIndex === MyAvatar.getJointIndex("LeftHand")) ? 0 : 1;
                equipped = true;
            } else {
                _this.toggleWithTriggerPressure();
            }
        },
        
        toggleWithTriggerPressure: function() {
            var triggerValue = Controller.getValue(TRIGGER_CONTROLS[currentHand]);
            if (triggerValue >= TRIGGER_TOGGLE_VALUE && triggerReleased) {
                _this.playSound();
            } else if (triggerValue < TRIGGER_TOGGLE_VALUE && !triggerReleased) {
                triggerReleased = true;
            }
        },

        releaseEquip: function(id, params) {
            currentHand = null;
            equipped = false;
        },

        playSound: function() {
            if (BELL_SOUND.downloaded) {
                var position = Entities.getEntityProperties(_this.entityID, 'position').position;
                Audio.playSound(BELL_SOUND, {
                    position: position,
                    volume: AUDIO_VOLUME_LEVEL
                });
            }
        }
    };

    return new TriggerBell();
});
