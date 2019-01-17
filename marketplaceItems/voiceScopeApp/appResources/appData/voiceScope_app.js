// voiceScope_app.js

//  Created by Mark Brosche on 1-2-2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function(){

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    
    var POWER_UP = SoundCache.getSound(Script.resolvePath('./resources/sounds/rezzing.wav'));    
    var VOLUME = 0.2;
    var injector;
    function playSound(sound) {
        if (sound.downloaded) {
            if (injector) {   
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: MyAvatar.position,
                volume: VOLUME,
                localOnly: true
            });
        } 
    }
    
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************


    // This function decides how to handle web events from the tablet UI.
    // used by 'ui' in startup()
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


    // This function keeps the app running even if you change domains.
    var DOMAIN_DELAY = 100;
    function onDomainChange(){
        // Do not change app status on domain change
        if (enabled) {
            Script.setTimeout(function(){
                startUpdate();
                addAll();
            }, DOMAIN_DELAY);
        }
    }


    // This function loads appui and connects to the needed signals
    var AppUi = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUi({
            home: Script.resolvePath("./resources/voiceScope_ui.html"),
            buttonName: "V-SCOPE", // The name of your app
            graphicsDirectory: Script.resolvePath("./resources/images/"), // Where your button icons are located
            onMessage: onMessage
        });       
        Script.scriptEnding.connect(scriptEnding);
        Window.domainChanged.connect(onDomainChange);
    }


    // This function starts and stops the app, triggered by the tablet UI
    var enabled = false;
    function toggleApp() {
        if (!enabled){
            startUpdate();
            addAll();
            playSound(POWER_UP);
            enabled = true; 
        } else {
            stopUpdate();
            removeAll();
            enabled = false;
        }
    }


    // scale audio, used in updateAudioLevel()
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


    // This function simplifies the audio data from the Pal
    var AVERAGING_RATIO = 0.05,
        LOUDNESS_FLOOR = 11.0,
        LOUDNESS_SCALE = 2.8 / 5.0,
        LOG2 = Math.log(2.0),
        AUDIO_PEAK_DECAY = 0.02;
    function updateAudioLevel(uuid) {
        var user = userObject[uuid];
        if (!user) {
            return;
        }
        // the VU meter should work similarly to the one in AvatarInputs: log scale, exponentially averaged
        // But of course it gets the data at a different rate, so we tweak the averaging ratio and frequency
        // of updating (the latter for efficiency too).
        var audioLevel = 0.0;
        var avgAudioLevel = 0.0;
        if (user) {
            // we will do exponential moving average by taking some the last loudness and averaging
            user.accumulatedLevel = AVERAGING_RATIO * (user.accumulatedLevel || 0) + 
                (1 - AVERAGING_RATIO) * (user.audioLoudness);
            // add 1 to insure we don't go log() and hit -infinity.  Math.log is
            // natural log, so to get log base 2, just divide by ln(2).
            audioLevel = scaleAudio(Math.log(user.accumulatedLevel + 1) / LOG2);
            // decay avgAudioLevel
            avgAudioLevel = Math.max((1 - AUDIO_PEAK_DECAY) * (user.avgAudioLevel || 0), audioLevel).toFixed(3);
        }
        userObject[uuid].audioLevel = audioLevel;
        userObject[uuid].avgAudioLevel = avgAudioLevel;
    }
    

    // This function creates a HUD element over a user's head 
    // The HUD is made of "Shape" Overlays, some of which are static,
    // and some of which are updated to show audio level
    var AVATAR_HEIGHT_OFFSET = 1.5,
        HUD_DEFAULT_DIMENSIONS = { x: 0.05, y: 0.001, z: 0.01 },
        HUD_MIN_Z_DIMENSIONS = 0.01,
        HUD_MAX_Z_DIMENSIONS = [
            0.1445,
            0.2451,
            0.3669,
            0.1980,
            0.0911
        ],
        HUD_ALPHA = 0.5,
        BAR_ALPHA = 1,
        HUD_PARENTING_DELAY = 200;
    // Overlay properties for the static parts of the HUD
    var STATIC_HUD_PROPERTIES = [
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
        }
    ];
    // Overlay properties for the dynamic parts of the HUD
    var DYNAMIC_HUD_PROPERTIES = [
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
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
            alpha: BAR_ALPHA,
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
            }
        }
    ];
    function createHUD(uuid) {
        var user = userObject[uuid];
        user.hudID = [];
        user.audioBarIDs = [];
        var avatar = AvatarManager.getAvatar(uuid);
        user.userHeight = avatar.getNeckPosition().y + avatar.scale * AVATAR_HEIGHT_OFFSET;
        var hudPosition = {x: avatar.position.x, y: user.userHeight, z:avatar.position.z};
        user.hudID.push(Overlays.addOverlay("shape", {
            name: "Voice-HUD",
            drawInFront: true,
            shape: "Circle",
            position: hudPosition,
            parentID: uuid,
            alpha: HUD_ALPHA,
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
        // Delay the creation of the child HUD elements to ensure the parent exists.
        Script.setTimeout(function(){            
            STATIC_HUD_PROPERTIES.forEach(function(element){   
                element.parentID = user.hudID[0];
                user.hudID.push(Overlays.addOverlay("shape", element));                   
            });
            DYNAMIC_HUD_PROPERTIES.forEach(function(element){   
                element.parentID = user.hudID[0];
                user.audioBarIDs.push(Overlays.addOverlay("shape", element));   
            });
        }, HUD_PARENTING_DELAY);
    }
    

    // This function deletes the HUD over a user
    function deleteHUD(uuid) {
        var user = userObject[uuid];
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
    }


    // Update the local z-dimensions of the audio bars on the HUD 
    // over a user to make it appear in synce with audio level
    var MIN_THRESHOLD = 0.25,
        GREEN_THRESHOLD = 0.5,
        RED_THRESHOLD = 0.75,
        VISIBILTY_TIMEOUT = 5000;
    function updateHUD(uuid) {
        var user = userObject[uuid];
        var avatar = AvatarManager.getAvatar(uuid);
        Overlays.editOverlay(user.hudID[0], 
            {rotation: Quat.multiply(Quat.cancelOutRoll(Camera.orientation), Quat.fromPitchYawRollDegrees(90,0,0))});
        user.userHeight = avatar.getNeckPosition().y + avatar.scale * AVATAR_HEIGHT_OFFSET;
        Overlays.editOverlay(user.hudID[0], {
            position: {
                x: avatar.position.x, 
                y: user.userHeight, 
                z :avatar.position.z
            }});
        if (user.audioLevel > MIN_THRESHOLD) {
            user.timeSinceDefault = Number.MAX_VALUE;
            if (!Overlays.getProperty(user.hudID[0], "visible").visible){
                user.hudID.forEach(function(id){
                    Overlays.editOverlay(id, { visible: true });
                });
                user.audioBarIDs.forEach(function(id){
                    Overlays.editOverlay(id, { visible: true });
                });
            }
        } 
        if (user.audioLevel < MIN_THRESHOLD){ 
            setDefaultHUD(uuid);
            if (new Date().getTime() - user.timeSinceDefault > VISIBILTY_TIMEOUT) {
                user.hudID.forEach(function(id){
                    Overlays.editOverlay(id, { visible: false });
                });
                user.audioBarIDs.forEach(function(id){
                    Overlays.editOverlay(id, { visible: false });
                });
            }
            if (user.timeSinceDefault === Number.MAX_VALUE){
                user.timeSinceDefault = new Date().getTime();
            }
        } else if (user.audioLevel <= GREEN_THRESHOLD) { 
            user.audioBarIDs.forEach(function(id){
                Overlays.editOverlay(id, { color: {
                    "red": 0,
                    "green": 255,
                    "blue": 0
                } });
            });
        } else if (user.audioLevel <= RED_THRESHOLD){ 
            user.audioBarIDs.forEach(function(id){
                Overlays.editOverlay(id, { color: {
                    "red": 255,
                    "green": 255,
                    "blue": 0
                } });
            });
        } else if (user.audioLevel > RED_THRESHOLD){ 
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
    }


    // Set the bars of the HUD to the default size
    function setDefaultHUD(uuid) {
        var user = userObject[uuid];
        user.audioBarIDs.forEach(function(id){
            Overlays.editOverlay(id, { dimensions: HUD_DEFAULT_DIMENSIONS });
        });   
    }


    // This holds the PAL data
    var userArray = [];
    // houses all users, see User constructor for structure
    var userObject = {};
    // constructor for each user in userObject
    function User(uuid) {
        this.uuid = uuid;
        this.audioLevel = 0;
        this.audioAccumulated = 0;
        this.audioAvg = 0;
        this.audioLoudness = 0;
        this.timeSinceDefault = Number.MAX_VALUE;
    }

    // This function gets data to sort through
    function sortData() {
        var avatarList = Object.keys(userObject);
        userArray = avatarList.map(function (uuid) { 
            return userObject[uuid]; 
        });
    }


    // This function adds HUDs for all users in the PAL list
    function addAll() {
        // look for old overlays to clean up:
        var overlayList = Overlays.findOverlays(MyAvatar.position, RANGE);
        overlayList.forEach(function(overlay){
            if (Overlays.getProperty(overlay, "name") === "Voice-HUD"){
                Overlays.deleteOverlay(overlay);
            }
        });
        overlayList = null;
        if (!userArray.length) {
            // only add people to the list if there are none
            sortData();
        }
        // add new overlays
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            var uuid = user.uuid;
            createHUD(uuid);
        }
    }


    // The function removes all HUDs from all users
    var RANGE = 1000;
    function removeAll() {
        // remove previous overlays
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            var uuid = user.uuid;
            deleteHUD(uuid);
        }
        var overlayList = Overlays.findOverlays(MyAvatar.position, RANGE);
        overlayList.forEach(function(overlay){
            if (Overlays.getProperty(overlay, "name") === "Voice-HUD"){
                Overlays.deleteOverlay(overlay);
            }
        });
        overlayList = null;
    }


    // This adds a user to the userObject object
    function addUser(sessionUUID) {
        if (!userObject[sessionUUID]) {
            userObject[sessionUUID] = new User(sessionUUID);
        }
        if (enabled){
            createHUD(sessionUUID);
        }
    }


    // This removes a user from the userObject object and deletes 
    // their HUD
    function removeUser(sessionUUID) {
        removeUserFromUserArray(sessionUUID);
        if (userObject[sessionUUID]) {
            delete userObject[sessionUUID];
        }
    }
    

    // This starts the update interval to refresh the PAL data
    var hudUpdateInterval = null,
        UPDATE_INTERVAL_TIME = 60;
    function startUpdate() {
        if (!hudUpdateInterval){
            hudUpdateInterval = Script.setInterval(handleUpdate, UPDATE_INTERVAL_TIME);
        }
    }


    // This stops the update interval to refresh the PAL data
    function stopUpdate() {
        if (hudUpdateInterval) {
            Script.clearInterval(hudUpdateInterval);
            hudUpdateInterval = false;
        }
    }


    // This function gets the PAL data and updates existing users
    // and removes users that left
    function handleUpdate() {
        var palList = AvatarManager.getPalData().data;
        // Add users to userObject
        for (var a = 0; a < palList.length; a++) {
            var user = palList[a];
            var uuid = palList[a].sessionUUID;
            var hasUUID = uuid;
            var isInuserObject = userObject[uuid] !== undefined;
            if (hasUUID && !isInuserObject) {
                addUser(uuid);
            } else if (hasUUID) {
                userObject[uuid].audioLoudness = user.audioLoudness;
                userObject[uuid].currentPosition = user.position;
                // *** Update ***
                updateAudioLevel(uuid);
                if (userObject[uuid].hudID) {
                    updateHUD(uuid);
                }
            }
        }
        // Remove users from userObject
        for (var uuid in userObject) {
            // if user crashes, leaving domain signal will not be called
            // handle this case
            var hasUUID = uuid;
            var isInNewList = palList.map(function (item) {
                return item.sessionUUID;
            }).indexOf(uuid) !== -1;
            if (hasUUID && !isInNewList) {
                deleteHUD(uuid);
                removeUser(uuid);
            }
        }
    }
    

    // searches the user list to get the index of a user
    function getIndexOfUserArray(uuid) {
        if (userArray.length) {
            var index = userArray.map(function (item) {
                return item.uuid;
            }).indexOf(uuid);
            return index;
        }
        return -1;
    }

    // This function removes a user from the user list
    function removeUserFromUserArray(uuid) {
        var userArrayIndex = getIndexOfUserArray(uuid);
        if (userArrayIndex !== -1) {
            if (userArray[userArrayIndex].hudID) {
                deleteHUD(uuid);
            }
            userArray.splice(userArrayIndex, 1);
        }
    }


    // This function is called when the script ends
    function scriptEnding() {
        stopUpdate();
        for (var i = 0; i < userArray.length; i++) {
            var user = userArray[i];
            var uuid = user.uuid;
            deleteHUD(uuid);
            removeUser(uuid);
        }
        var overlayList = Overlays.findOverlays(MyAvatar.position, RANGE);
        overlayList.forEach(function(overlay){
            if (Overlays.getProperty(overlay, "name") === "Voice-HUD"){
                Overlays.deleteOverlay(overlay);
            }
        });
        overlayList = null;
        Window.onDomainChanged.disconnect(onDomainChange);
    }


    startup();
})();