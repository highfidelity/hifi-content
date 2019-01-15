// voiceHUD.js

//  Created by Mark Brosche on 1-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* (Philip) Script that shows me who is talking by making a cylinder above their head that 
animates with their voice intensity when it is above a threshold
 - a good reference would be the "Loud App"*/
/* global EventBridge Users AccountServices Agent Avatar SoundCache EntityViewer */

(function(){
    var AppUi = Script.require('appUi');
    var powerUp = SoundCache.getSound(Script.resolvePath('./resources/sounds/rezzing.wav'));
    var injector;

    function playSound(sound) {
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: MyAvatar.position,
                volume: 0.2,
                localOnly: true
            });
        } else {
            console.log("no sound downloaded");
        }
    }
    var enabled = false;
    function toggleApp() {
        if (!enabled){
            hud.addAll();
            playSound(powerUp);
            enabled = true; 
        } else {
            hud.removeAll();
            enabled = false;
        }
    }

    function onMessage(data) {
        // EventBridge message from HTML script.
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                ui.sendToHtml({
                    type: "buttonStatus",
                    value: enabled
                });
                break;
            case "TOGGLE_APP":
                toggleApp();
                ui.sendToHtml({
                    type: "buttonStatus",
                    value: enabled
                });
                break;
        }
    }

    function onDomainChange(){
        // turn it off on domain change
        enabled = false;
        ui.sendToHtml({
            type: "buttonStatus",
            value: enabled
        });
    }

    var ui;
    function startup() {
        ui = new AppUi({
            home: Script.resolvePath("./resources/voiceHUD_ui.html"),
            buttonName: "VOICE-HUD", // The name of your app
            graphicsDirectory: Script.resolvePath("./resources/images/"), // Where your button icons are located
            onMessage: onMessage
        });       
        updateInterval.start();
        Script.scriptEnding.connect(scriptEnding);
        Window.domainChanged.connect(onDomainChange);
    }

    var settings = {
        users: []
    };

    // PAL DATA UTILITY AUDIO VARIABLES
    var AVERAGING_RATIO = 0.05,
        LOUDNESS_FLOOR = 11.0,
        LOUDNESS_SCALE = 2.8 / 5.0,
        LOG2 = Math.log(2.0),
        AUDIO_PEAK_DECAY = 0.02;

    var audio = {
        update: function (uuid) {
            var user = userStore[uuid];
            if (!user) {
                console.log("not a user");
                return;
            }

            // scale audio
            function scaleAudio(val) {
                var audioLevel = 0.0;
                if (val <= LOUDNESS_FLOOR) {
                    audioLevel = val / LOUDNESS_FLOOR * LOUDNESS_SCALE;
                } else {
                    audioLevel = (val - (LOUDNESS_FLOOR - 1)) * LOUDNESS_SCALE;
                }
                if (audioLevel > 1.0) {
                    audioLevel = 1;
                }
                return audioLevel;
            }

            // the VU meter should work similarly to the one in AvatarInputs: log scale, exponentially averaged
            // But of course it gets the data at a different rate, so we tweak the averaging ratio and frequency
            // of updating (the latter for efficiency too).
            var audioLevel = 0.0;
            var avgAudioLevel = 0.0;

            if (user) {
                // we will do exponential moving average by taking some the last loudness and averaging
                user.accumulatedLevel = AVERAGING_RATIO * (user.accumulatedLevel || 0) + (1 - AVERAGING_RATIO) * (user.audioLoudness);

                // add 1 to insure we don't go log() and hit -infinity.  Math.log is
                // natural log, so to get log base 2, just divide by ln(2).
                audioLevel = scaleAudio(Math.log(user.accumulatedLevel + 1) / LOG2);

                // decay avgAudioLevel
                avgAudioLevel = Math.max((1 - AUDIO_PEAK_DECAY) * (user.avgAudioLevel || 0), audioLevel).toFixed(3);

            }

            userStore[uuid].audioLevel = audioLevel;
            userStore[uuid].avgAudioLevel = avgAudioLevel;
        }
    };

    var lists = {
        // returns an array of avatarPaldata
        allAvatars: function () {
            return AvatarManager.getPalData().data;
        },
        
        // searches the top 10 list to get the index
        getIndexOfSettingsUser: function (uuid) {
            if (settings.users.length) {
                var index = settings.users.map(function (item) {
                    return item.uuid;
                }).indexOf(uuid);
                return index;
            }
            return -1;
        },

        sortData: function () {
            // sort by audioLevel
            function sortNumber(a, b) {
                return b.avgAudioLevel - a.avgAudioLevel;
            }
            var avatarList = Object.keys(userStore);// : lists.getAvatarsInRadius(SEARCH_RADIUS);
            settings.users = avatarList.map(function (uuid) { return userStore[uuid]; });
        }
    };

    // overlay variables
    var AVATAR_HEIGHT_OFFSET = 1.5,
        HUD_MIN_Z_DIMENSIONS = 0.01,
        HUD_MAX_Z_DIMENSIONS = [
            0.1445,
            0.2451,
            0.3669,
            0.1980,
            0.0911
        ],
        HUD_ALPHA_START = 0.5,
        BAR_ALPHA_START = 1,
        HUD_DEFAULT_DIMENSIONS = { x: 0.05, y: 0.001, z: 0.01 },
        hudIntervalTransparency,
        hudIntervalTimeout;

    var hud = {
        // Create a HUD element over a user's head 
        createHUD: function (uuid) {
            console.log("adding huds");

            var user = userStore[uuid];
            user.hudID = [];
            user.audioBarIDs = [];
            user.userHeight = AvatarManager.getAvatar(uuid).getNeckPosition().y + AvatarManager.getAvatar(uuid).scale * AVATAR_HEIGHT_OFFSET;
            var hudPosition = {x: AvatarManager.getAvatar(uuid).position.x, y: user.userHeight, z:AvatarManager.getAvatar(uuid).position.z}; // user.currentPosition
            user.hudID.push(Overlays.addOverlay("shape", {
                name: "Voice-HUD",
                drawInFront: true,
                shape: "Circle",
                position: hudPosition,
                parentID: uuid,
                alpha: HUD_ALPHA_START,
                dimensions: {
                    x: 0.5,
                    y: 0.001,
                    z: 0.5
                },
                rotation: Quat.multiply(MyAvatar.orientation, Quat.fromPitchYawRollDegrees(90,0,0)),
                solid: true,
                color: {
                    "red": 0,
                    "green": 0,
                    "blue": 0
                }
            }));
            Script.setTimeout(function(){
                var hudProperties = [
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: -0.1771,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: 0.0792,
                            y: 0.001,
                            z: 0.0792
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: 0,
                            y: 0,
                            z: 0,
                            w: 1
                        },
                        solid: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Triangle",
                        localPosition: {
                            x: -0.1364,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: 0.1386,
                            y: HUD_DEFAULT_DIMENSIONS.y,
                            z: 0.1980
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: 0,
                            y: 1,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: -0.0585,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: HUD_DEFAULT_DIMENSIONS.x,
                            y: HUD_DEFAULT_DIMENSIONS.y,
                            z: 0.1445
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: -1,
                            y: 0,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 18,
                            "green": 18,
                            "blue": 18
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.0030,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: HUD_DEFAULT_DIMENSIONS.x,
                            y: HUD_DEFAULT_DIMENSIONS.y,
                            z: 0.2451
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: -1,
                            y: 0,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 18,
                            "green": 18,
                            "blue": 18
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.0631,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: HUD_DEFAULT_DIMENSIONS.x,
                            y: HUD_DEFAULT_DIMENSIONS.y,
                            z: 0.3669
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: -1,
                            y: 0,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 18,
                            "green": 18,
                            "blue": 18
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.1217,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: HUD_DEFAULT_DIMENSIONS.x,
                            y: HUD_DEFAULT_DIMENSIONS.y,
                            z: 0.1980
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: -1,
                            y: 0,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 18,
                            "green": 18,
                            "blue": 18
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.1833,
                            y: 0.002,
                            z: 0
                        },
                        dimensions: {
                            x: HUD_DEFAULT_DIMENSIONS.x,
                            y: HUD_DEFAULT_DIMENSIONS.y,
                            z: 0.0911
                        },
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: -1,
                            y: 0,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 18,
                            "green": 18,
                            "blue": 18
                        },
                        parentID: user.hudID[0]
                    }
                ];
                var audioBarProperties = [
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: -0.0585,
                            y: 0.003,
                            z: 0
                        },
                        dimensions: HUD_DEFAULT_DIMENSIONS,
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: 1,
                            y: 0,
                            z: 0,
                            w: 0
                        },
                        solid: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.003,
                            y: 0.003,
                            z: 0
                        },
                        dimensions: HUD_DEFAULT_DIMENSIONS,
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: 0,
                            y: 0,
                            z: 0,
                            w: 1
                        },
                        solid: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.0631,
                            y: 0.003,
                            z: 0
                        },
                        dimensions: HUD_DEFAULT_DIMENSIONS,
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: 0,
                            y: 0,
                            z: 0,
                            w: 1
                        },
                        solid: true,
                        ignoreForCollisions: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.1217,
                            y: 0.003,
                            z: 0
                        },
                        dimensions: HUD_DEFAULT_DIMENSIONS,
                        alpha: BAR_ALPHA_START,
                        localRotation: {
                            x: 0,
                            y: 0,
                            z: 0,
                            w: 1
                        },
                        solid: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    },
                    {
                        name: "Voice-HUD",
                        drawInFront: true,
                        shape: "Quad",
                        localPosition: {
                            x: 0.1833,
                            y: 0.003,
                            z: 0
                        },
                        alpha: BAR_ALPHA_START,
                        dimensions: HUD_DEFAULT_DIMENSIONS,
                        localRotation: {
                            x: 0,
                            y: 0,
                            z: 0,
                            w: 1
                        },
                        solid: true,
                        color: {
                            "red": 0,
                            "green": 255,
                            "blue": 255
                        },
                        parentID: user.hudID[0]
                    }
                ];
                
                hudProperties.forEach(function(element){   
                    user.hudID.push(Overlays.addOverlay("shape", element));   
                });
                audioBarProperties.forEach(function(element){   
                    user.audioBarIDs.push(Overlays.addOverlay("shape", element));   
                });
            }, 200);
        },
        
        // Delete the HUD over a user
        deleteHUD: function (uuid) {
            var user = userStore[uuid];
            if (hudIntervalTimeout){
                Script.clearInterval(hudIntervalTimeout);
                hudIntervalTimeout = null;
            }
            if (hudIntervalTransparency){
                Script.clearInterval(hudIntervalTransparency);
                hudIntervalTransparency = null;  
            }
            user.hudID.forEach(function(element){
                if (element){
                    Overlays.deleteOverlay(element);
                }
            });
            user.audioBarIDs.forEach(function(element){
                Overlays.deleteOverlay(element);
            });
            user.hudID = [];
            user.audioBarIDs = [];
        },

        // Update the local z-dimensions of the audio bars on the HUD over a user to make it appear in synce with audio level
        updateHUD: function (uuid) {
            var user = userStore[uuid];
            Overlays.editOverlay(user.hudID[0], 
                {rotation: Quat.multiply(Camera.orientation, Quat.fromPitchYawRollDegrees(90,0,0))});
            user.userHeight = AvatarManager.getAvatar(uuid).getNeckPosition().y + 
                AvatarManager.getAvatar(uuid).scale * AVATAR_HEIGHT_OFFSET;
            Overlays.editOverlay(user.hudID[0], 
                {position: {
                    x: AvatarManager.getAvatar(uuid).position.x, 
                    y: user.userHeight, 
                    z :AvatarManager.getAvatar(uuid).position.z
                }});
            if (user.audioLevel > 0.25){ 
                user.hudID.forEach(function(id){
                    Overlays.editOverlay(id, { visible: true });
                });
                user.audioBarIDs.forEach(function(id){
                    Overlays.editOverlay(id, { visible: true });
                });
            } else {
                hud.setDefaultHUD(uuid);
                Script.setTimeout(function(){
                    user.hudID.forEach(function(id){
                        if (user.avgAudioLevel < 0.25){
                            Overlays.editOverlay(id, { visible: false });
                        }
                    });
                    user.audioBarIDs.forEach(function(id){
                        if (user.avgAudioLevel < 0.25){
                            Overlays.editOverlay(id, { visible: false });
                        }
                    });
                }, 5000);
            }
            if (user.audioLevel <= 0.5){ 
                user.audioBarIDs.forEach(function(id){
                    Overlays.editOverlay(id, { color: {
                        "red": 0,
                        "green": 255,
                        "blue": 0
                    } });
                });
            } else if (user.audioLevel > 0.5 && user.audioLevel <= 0.75){ 
                user.audioBarIDs.forEach(function(id){
                    Overlays.editOverlay(id, { color: {
                        "red": 255,
                        "green": 255,
                        "blue": 0
                    } });
                });
            } else if (user.audioLevel > 0.75){ 
                user.audioBarIDs.forEach(function(id){
                    Overlays.editOverlay(id, { color: {
                        "red": 255,
                        "green": 0,
                        "blue": 0
                    } });
                });
            }
            user.audioBarIDs.forEach(function(index){                
                var dimensionsWithSound = HUD_MIN_Z_DIMENSIONS + user.audioLevel * 
                    (HUD_MAX_Z_DIMENSIONS[user.audioBarIDs.indexOf(index)] - HUD_MIN_Z_DIMENSIONS);
                Overlays.editOverlay(index, { 
                    dimensions: { x: HUD_DEFAULT_DIMENSIONS.x, y: HUD_DEFAULT_DIMENSIONS.y, z: dimensionsWithSound } 
                });
            });            
        },

        setDefaultHUD: function (uuid) {
            var user = userStore[uuid];
            user.audioBarIDs.forEach(function(id){
                Overlays.editOverlay(id, { dimensions: HUD_DEFAULT_DIMENSIONS });
            });   
        },

        removeAll: function () {
            // remove previous overlays
            for (var i = 0; i < settings.users.length; i++) {
                var user = settings.users[i];
                var uuid = user.uuid;
                hud.deleteHUD(uuid);
            }
            var overlayList = Overlays.findOverlays(MyAvatar.position, 1000);
            overlayList.forEach(function(overlay){
                if (Overlays.getProperty(overlay, "name") === "Voice-HUD"){
                    Overlays.deleteOverlay(overlay);
                }
            });
            overlayList = null;
        },

        addAll: function () {
            // loook for old overlays to clean up:
            var overlayList = Overlays.findOverlays(MyAvatar.position, 1000);
            overlayList.forEach(function(overlay){
                if (Overlays.getProperty(overlay, "name") === "Voice-HUD"){
                    Overlays.deleteOverlay(overlay);
                }
            });
            overlayList = null;

            if (!settings.users.length) {
                // only add people to the list if there are none
                lists.sortData();
            }

            // add new overlays
            for (var i = 0; i < settings.users.length; i++) {
                var user = settings.users[i];
                var uuid = user.uuid;
                this.createHUD(uuid);
            }
            Object.keys(userStore).forEach(function(key) {
                console.log(key, userStore[key]);
            });
        }
    };

    var userStore = {}, // houses all users, see User constructor for structure
        interval = null, // handled by updateInterval 
        UPDATE_INTERVAL_TIME = 60; // Audio update time

    // constructor for each user in userStore
    function User(uuid) {
        this.uuid = uuid;
        this.audioLevel = 0;
        this.audioAccumulated = 0;
        this.audioAvg = 0;
        this.audioLoudness = 0;
    }

    var userUtils = {
        addUser: function (sessionUUID) {
            var avatarData = AvatarManager.getAvatar(sessionUUID);
            if (!userStore[sessionUUID]) {
                userStore[sessionUUID] = new User(sessionUUID);
            }
            if (ui.isOpen){
                hud.createHUD(sessionUUID);
            }
        },

        removeUser: function (sessionUUID) {
            removeUserFromSettingsUser(sessionUUID);
            if (userStore[sessionUUID]) {
                delete userStore[sessionUUID];
            }
        }
    };

    var updateInterval = {
        start: function () {
            if (!interval){
                interval = Script.setInterval(this.handleUpdate, UPDATE_INTERVAL_TIME);
            }
        },

        stop: function () {
            if (interval) {
                Script.clearInterval(interval);
                interval = false;
            }
        },

        handleUpdate: function () {
            var palList = lists.allAvatars();
            // Add users to userStore
            for (var a = 0; a < palList.length; a++) {
                var user = palList[a];
                var uuid = palList[a].sessionUUID;
                var hasUUID = uuid;
                var isInUserStore = userStore[uuid] !== undefined;
                if (hasUUID && !isInUserStore) {
                    userUtils.addUser(uuid);
                } else if (hasUUID) {
                    userStore[uuid].audioLoudness = user.audioLoudness;
                    userStore[uuid].currentPosition = user.position;
                    // *** Update ***
                    audio.update(uuid);
                    if (userStore[uuid].hudID) {
                        hud.updateHUD(uuid);
                    }
                    // TODO update hud-light for 5 loudest avatars.
                }
            }
            // Remove users from userStore
            for (var uuid in userStore) {
                // if user crashes, leaving domain signal will not be called
                // handle this case
                var hasUUID = uuid;
                var isInNewList = palList.map(function (item) {
                    return item.sessionUUID;
                }).indexOf(uuid) !== -1;
                if (hasUUID && !isInNewList) {
                    console.log("try removing user");
                    userUtils.removeUser(uuid);
                    hud.deleteHUD(uuid);
                }
            }
        }
    };

    function removeUserFromSettingsUser(uuid) {
        var settingsUsersListIndex = lists.getIndexOfSettingsUser(uuid);
        if (settingsUsersListIndex !== -1) {
            if (settings.users[settingsUsersListIndex].hudID) {
                hud.deleteHUD(uuid);
            }
            settings.users.splice(settingsUsersListIndex, 1);
        }
    }

    function scriptEnding() {
        updateInterval.stop();
        for (var i = 0; i < settings.users.length; i++) {
            var user = settings.users[i];
            var uuid = user.uuid;
            userUtils.removeUser(uuid);
            hud.deleteHUD(uuid);
        }
        var overlayList = Overlays.findOverlays(MyAvatar.position, 1000);
        overlayList.forEach(function(overlay){
            if (Overlays.getProperty(overlay, "name") === "Voice-HUD"){
                Overlays.deleteOverlay(overlay);
            }
        });
        overlayList = null;
    }

    startup();
}());