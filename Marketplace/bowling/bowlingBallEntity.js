//  bowlingBallEntity.js
//
//  Created by Thijs Wenker on September 21, 2016.
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function() { 
    var _this; 
    
    const LIFETIME_AFTER_THROWN = 20; // make the ball exist for only 20 seconds more after released

    const FLOOR_CHECKER_INTERVAL_MS = 20;

    const AUDIO_UPDATE_FREQUENCY = 200; // 200Hz

    const BOWLING_ALLEY_PREFIX_URL = 'http://hifi-content.s3.amazonaws.com/caitlyn/production/bowlingAlley/';
    const BOWLING_SYSTEM_PREFIX = 'Bowling System - ';
    const FLOORBANG_SOUND_URL = BOWLING_ALLEY_PREFIX_URL + '336491__faulkin__floorbang-03_edit.wav';
    const ROLLING_SOUND_URL = BOWLING_ALLEY_PREFIX_URL + '116679__puniho__rolling-steel-bar_edit2.wav';

    const ROLLING_FLOOR_NAME = 'Bowling System - Floor Collision Detection';

    const ENTITY_MANIPULATON_OWNER_KEY = 'EntityManipulationOwner';
    const EMO_SETTING_OWNER = 'ownerID';
    const EMO_SETTING_MAX_DISTANCE = 'maxDistance';

    const COLLISION_EVENT_TYPE = {
        START: 0,
        CONTINUE: 1,
        END: 2
    };

    ConnectableEvent = function() {
        this.callbacks = [];
    };

    ConnectableEvent.prototype = {
        callbacks: null,
        connect: function(callback) {
            this.callbacks.push(callback);
        },
        disconnect: function(callback) {
            var callbackIndex = this.callbacks.indexOf(callback);
            if (callbackIndex > -1) {
                this.callbacks.splice(callbackIndex, 1);
            }
        },
        emit: function() {
            var emitArguments = arguments;
            this.callbacks.forEach(function(callback) {
                callback.apply(this, emitArguments);
            });
        }
    };

    // The current player
    EntityManipulationOwner = function(entityID) {
        this.entityID = entityID;
        this.onOwnerChanged = new ConnectableEvent();
        Messages.subscribe(this.getChannelName());
    };

    EntityManipulationOwner.prototype = {
        entityID: null,
        ownerSessionID: null,
        onOwnerChanged: null,
        refresh: function() {
            var settings = this.getSettings();
            if (settings !== null) {
                this.ownerSessionID = settings[EMO_SETTING_OWNER] !== undefined ? settings[EMO_SETTING_OWNER] : null;
            }
        },
        /** claim yourself as the EntityManipulationOwner **/
        claim: function() {
            if (this.ownerSessionID === MyAvatar.sessionUUID) {
                return;
            }
            this.ownerSessionID = MyAvatar.sessionUUID;
            this.updateSetting(ENTITY_MANIPULATON_OWNER_KEY, MyAvatar.sessionUUID);
            Messages.sendMessage(this.getChannelName(), JSON.stringify({type: 'claimed'}), true);
        },
        abandon: function() {
            this.updateSetting(ENTITY_MANIPULATON_OWNER_KEY, '');
            Messages.sendMessage(this.getChannelName(), JSON.stringify({type: 'abandoned'}), true);
        },
        getUserData: function() {
            var userData = Entities.getEntityProperties(this.entityID, ['userData']).userData;
            try {
                return JSON.parse(userData);
            } catch (e) {
                return {};
            }
        },
        getSettings: function() {
            var userData = this.getUserData();
            return userData[ENTITY_MANIPULATON_OWNER_KEY] !== undefined ? userData[ENTITY_MANIPULATON_OWNER_KEY] : {};
        },
        updateSettings: function(settings) {
            var userData = this.getUserData();
            userData[ENTITY_MANIPULATON_OWNER_KEY] = settings;

        },
        updateSetting: function(setting_key, setting_value) {
            var settings = this.getSettings();
            if (settings === null) {
                settings = {};
            }
            settings[setting_key] = setting_value;
            this.updateSettings(settings);
        },
        getChannelName: function() {
            return ENTITY_MANIPULATON_OWNER_KEY + '_' + this.entityID;
        },
        cleanUp: function() {
            Messages.unsubscribe(this.getChannelName());
        }
    };


    function BowlingBall() {
        _this = this;
        _this.floorBangSound = SoundCache.getSound(FLOORBANG_SOUND_URL);
        _this.rollingSound = SoundCache.getSound(ROLLING_SOUND_URL);
    }

    BowlingBall.prototype = {
        entityID: null,
        floorBangSound: null,
        rollingSound: null,
        rollingInjector: null,
        audioUpdateInterval: null,
        entityManipulationOwner: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.entityManipulationOwner = new EntityManipulationOwner(_this.entityID);
        },
        unload: function() {
            _this.stopRollingSound();
            _this.entityManipulationOwner.cleanUp();
        },
        setLifeTime: function() {
            Entities.editEntity(_this.entityID, {
                lifetime: Entities.getEntityProperties(_this.entityID, ['age']).age + LIFETIME_AFTER_THROWN
            });
        },
        startNearGrab: function(entityID, args) {
            _this.entityManipulationOwner.claim();
        },
        releaseGrab: function(entityID, args) {
            _this.setLifeTime();
        },
        clickReleaseOnEntity: function(entityID, mouseEvent) {
            _this.setLifeTime();
        },
        startRollingSound: function() {
            if (_this.audioUpdateInterval !== null) {
                return;
            }
            var properties = Entities.getEntityProperties(_this.entityID, ['position', 'velocity']);
            var injectorProperties = {
                localOnly: false,
                loop: true,
                position: properties.position,
                volume: /*0.01//*/Vec3.length(properties.velocity)
            };
            _this.rollingInjector = Audio.playSound(_this.rollingSound, injectorProperties);
            _this.audioUpdateInterval = Script.setInterval(function() {
                var properties = Entities.getEntityProperties(_this.entityID, ['position', 'velocity']);
                injectorProperties['volume'] = Vec3.length(properties.velocity);
                injectorProperties['position'] = properties.position;
                _this.rollingInjector.setOptions(injectorProperties);
            }, 1000 / AUDIO_UPDATE_FREQUENCY);
        },
        stopRollingSound: function() {
            if (_this.rollingInjector !== null) {
                Script.clearInterval(_this.audioUpdateInterval);
                _this.audioUpdateInterval = null;
                _this.rollingInjector.stop();
                _this.rollingInjector = null;
            }
        },
        collisionWithEntity: function(entityID, otherID, collisionInfo) {
            var properties = Entities.getEntityProperties(otherID, ['name']);
            if (properties.name === ROLLING_FLOOR_NAME) {
                _this.entityManipulationOwner.refresh();
                var ballPosition = Entities.getEntityProperties(_this.entityID, ['position']).position;
                if (collisionInfo.velocityChange.y > 3) {
                    Audio.playSound(_this.floorBangSound, {
                        position: ballPosition,
                        volume: collisionInfo.velocityChange.y / 10.0
                    })
                }
                if (collisionInfo.type === COLLISION_EVENT_TYPE.START || collisionInfo.type === COLLISION_EVENT_TYPE.CONTINUE) {
                    _this.startRollingSound();
                } else if (collisionInfo.type === COLLISION_EVENT_TYPE.END) {
                    _this.stopRollingSound();
                }
            } else if (properties.name === (BOWLING_SYSTEM_PREFIX + 'Ball Return Collider')) {
                var bowlingAlleyID = Entities.getEntityProperties(otherID, ['parentID']).parentID;
                Entities.getChildrenIDs(bowlingAlleyID).forEach(function(entityID) {
                    if (Entities.getEntityProperties(entityID, ['name']).name === (BOWLING_SYSTEM_PREFIX + 'Reset Console')) {
                        var resetConsoleButtonID = Entities.getChildrenIDs(entityID)[0];
                        Entities.callEntityMethod(resetConsoleButtonID, 'createRandomBallInRetractor');
                    }
                });
                Entities.deleteEntity(_this.entityID);
            }
        }
    };

    return new BowlingBall();
})