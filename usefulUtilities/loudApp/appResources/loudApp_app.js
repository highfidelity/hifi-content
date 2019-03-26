//
//  loudApp_app.js
//
//  Created by Robin Wilson and Milad Nazeri 8/20/2018
//  Updated by Robin Wilson 3/26/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {

    var AppUi = Script.require("appUi");

    // Data management
    var userStore = {}; // houses all users, see User constructor for structure
    // sent to Vue to update our html UI
    // app options are housed here
    var settings = {
        users: [],
        ui: {
            isExpandingAudioEnabled: false,
            searchWholeDomainForLoudestEnabled: false,
            isListening: false
        }
    };
    var DEBUG = true;

    // #region AUDIO

    // Updates avatar's audio level in the userStore
    var AVERAGING_RATIO = 0.05,
        LOG2 = Math.log(2.0),
        AUDIO_PEAK_DECAY = 0.02;
    function updateAudioForAvatar(uuid) {
        if (!userStore[uuid]) {
            return;
        }
        // the VU meter should work similarly to the one in AvatarInputs: log scale, exponentially averaged
        // But of course it gets the data at a different rate, so we tweak the averaging ratio and frequency
        // of updating (the latter for efficiency too).
        var audioLevel = 0.0;
        var avgAudioLevel = 0.0;
        if (userStore[uuid]) {
            // we will do exponential moving average by taking some the last loudness and averaging
            userStore[uuid].accumulatedLevel = AVERAGING_RATIO * (userStore[uuid].accumulatedLevel || 0) + (1 - AVERAGING_RATIO) * (userStore[uuid].audioLoudness);

            // add 1 to insure we don't go log() and hit -infinity.  Math.log is
            // natural log, so to get log base 2, just divide by ln(2).
            audioLevel = scaleAudio(Math.log(userStore[uuid].accumulatedLevel + 1) / LOG2);

            // decay avgAudioLevel
            avgAudioLevel = Math.max((1 - AUDIO_PEAK_DECAY) * (userStore[uuid].avgAudioLevel || 0), audioLevel).toFixed(3);
        }
        userStore[uuid].audioLevel = audioLevel;
        userStore[uuid].avgAudioLevel = avgAudioLevel;
    }


    // Scale audio level
    var LOUDNESS_FLOOR = 11.0,
        LOUDNESS_SCALE = 2.8 / 5.0;
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


    // Solos target avatar 
    // Mutes the old target avatar
    var activeTargetUUID = null;
    function startListeningToAvatar(targetUUID) {
        if (DEBUG) {
            console.log("startListeningToAvatar isListening" + settings.ui.isListening + "targetUUID" + targetUUID + "activeTargetUUID" + activeTargetUUID);
        }
        if (settings.ui.isListening) {
            // is already listening to activeTargetUUID
            // mute old target
            userStore[activeTargetUUID].isToggled = false;
            Audio.removeFromSoloList([activeTargetUUID]);
        } else {
            // turn on settings.ui.isListening
            settings.ui.isListening = true;
        }
        // add new target
        Audio.addToSoloList([targetUUID]);
        userStore[targetUUID].isToggled = true;
        activeTargetUUID = targetUUID;
    }


    // Stops soloing target avatar
    function stopListening() {
        if (DEBUG) {
            console.log("stopListening activeTargetUUID: " + activeTargetUUID + "userStore[activeTargetUUID]" + JSON.stringify(userStore[activeTargetUUID]));
        }
        Audio.resetSoloList();

        // Reset isToggled
        userStore.forEach(function(user) {
            user.isToggled = false;
        })

        settings.ui.isListening = false;
        activeTargetUUID = null;
    }

    // #endregion AUDIO


    // #region LIST MANAGEMENT

    // return all avatars in radius
    function getAvatarsInRadius(radius) {
        return AvatarList.getAvatarsInRange(MyAvatar.position, radius).filter(function (uuid) {
            return uuid !== MyAvatar.sessionUUID;
        });
    }


    // searches the top 10 list to get the index
    function getIndexOfSettingsUser(uuid) {
        if (settings.users.length) {
            var index = settings.users.map(function (item) {
                return item.uuid;
            }).indexOf(uuid);
            return index;
        }
        return -1;
    }

    // #endregion LIST MANAGEMENT


    // #region APP

    // Create the tablet button and setup app callbacks
    var ui,
        BUTTON_NAME = "SEEK LOUD",
        APP_URL = Script.resolvePath('./resources/loudApp_ui.html'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";
    function startup() {
        // Create the tablet app
        ui = new AppUi({
            buttonName: BUTTON_NAME,
            onMessage: onMessage, // UI event listener  
            home: APP_URL,
            graphicsDirectory: Script.resolvePath("./resources/icons/"),
            onOpened: onOpened,
            onClosed: onClosed
        });

        AvatarList.avatarAddedEvent.connect(addUser);
        AvatarList.avatarRemovedEvent.connect(removeUser);
        Users.usernameFromIDReply.connect(setUserName);

        Script.scriptEnding.connect(unload);
    }


    // Open the app callback
    var previousValueOfRequestsDomainListData;
    function onOpened() {
        previousValueOfRequestsDomainListData = Users.requestsDomainListData;
        Users.requestsDomainListData = true;
        startUpdateInterval();
        addAllOverlays();
    }


    // Close the app callback
    function onClosed() {
        Users.requestsDomainListData = previousValueOfRequestsDomainListData;
        stopUpdateInterval();
        removeAllOverlays();
        stopListening();
    }


    // Update UI
    function doUIUpdate(key) {
        ui.sendToHtml({
            type: UPDATE_UI,
            value: key ? settings[key] : settings,
            key: key ? key : ""
        });
    }


    // Sorts users by loudness in userStore then populates ten loudest list
    var SEARCH_RADIUS_DEFAULT = 10; // radius that avatars are factored in muting and top 10 loudest
    function sortAvatarsByLoudness() {
        removeAllOverlays();
        var avatarList = settings.ui.searchWholeDomainForLoudestEnabled ? Object.keys(userStore) : getAvatarsInRadius(SEARCH_RADIUS_DEFAULT);
        settings.users = avatarList.map(function (uuid) { return userStore[uuid]; });
        settings.users = settings.users.sort(sortNumber).slice(0, 10);
        addAllOverlays();
    }


    // Sort by audioLevel
    function sortNumber(a, b) {
        return b.avgAudioLevel - a.avgAudioLevel;
    }


    // Unloads the app
    function unload() {
        if (settings.users) {
            settings.users.forEach(function(user) {
                if (user.overlayID) {
                    deleteOverlay(user.uuid)
                }
            });
        }

        Users.requestsDomainListData = previousValueOfRequestsDomainListData;
        stopUpdateInterval();
        stopListening();

        Users.usernameFromIDReply.disconnect(setUserName);
        AvatarList.avatarAddedEvent.disconnect(addUser);
        AvatarList.avatarRemovedEvent.disconnect(removeUser);
    }

    // #endregion APP


    // #region OVERLAYS

    // Adds overlay to users in top loudest list
    var selectedUserUUID, // selected avatar with yellow overlay
        OVERLAY_DEFAULT_DIMENSIONS = { x: 0.3, y: 0.3, z: 0.3 },
        OVERLAY_DEFAULT_COLOR = { red: 255, blue: 255, green: 255 },
        OVERLAY_SELECTED_COLOR = { red: 255, blue: 0, green: 255 };
    function addOverlayToUser(uuid) {
        var overlayPosition = AvatarList.getAvatar(uuid).getNeckPosition(); // user.currentPosition
        var overlayProperties = {
            position: overlayPosition, // assigned on creation
            dimensions: OVERLAY_DEFAULT_DIMENSIONS,
            solid: true,
            parentID: uuid, // assigned on creation
            color: OVERLAY_DEFAULT_COLOR,
            drawInFront: true
        };
        userStore[uuid].overlayID = Overlays.addOverlay("sphere", overlayProperties);
    }


    // Deletes overlay
    function deleteOverlay(uuid) {
        Overlays.deleteOverlay(userStore[uuid].overlayID);
        userStore[uuid].overlayID = null;
    }


    // Updates overlay dimensions to correspond with loudness
    var OVERLAY_MIN_DIMENSIONS = 0.2,
        OVERLAY_MAX_DIMENSIONS = 1;
    function updateOverlaySize(uuid) {
        var dimensionsWithSound = OVERLAY_MIN_DIMENSIONS + userStore[uuid].avgAudioLevel * (OVERLAY_MAX_DIMENSIONS - OVERLAY_MIN_DIMENSIONS);
        Overlays.editOverlay(userStore[uuid].overlayID, {
            dimensions: {
                x: dimensionsWithSound,
                y: dimensionsWithSound,
                z: dimensionsWithSound
            }
        });
    }


    // Sets overlay size to the default
    function setOverlaySizeToDefault(uuid) {
        if (userStore[uuid].overlayID) {
            Overlays.editOverlay(userStore[uuid].overlayID, {
                dimensions: OVERLAY_DEFAULT_DIMENSIONS
            });
        }
    }


    // Sets overlay to default color
    function deselectUserOverlay(uuid) {
        userStore[uuid].isSelected = false;
        Overlays.editOverlay(userStore[uuid].overlayID, { color: OVERLAY_DEFAULT_COLOR });
        selectedUserUUID = null;
    }


    // Sets overlay to selected color
    function selectUserOverlay(uuid) {
        if (selectedUserUUID) {
            // deselect the old selected user
            deselectUserOverlay(selectedUserUUID);
        }
        userStore[uuid].isSelected = true;
        Overlays.editOverlay(userStore[uuid].overlayID, { color: OVERLAY_SELECTED_COLOR });
        selectedUserUUID = uuid;
    }


    // Removes all overlays on users in top ten loudest list
    function removeAllOverlays() {
        // remove previous overlays
        for (var i = 0; i < settings.users.length; i++) {
            deleteOverlay(settings.users[i].uuid);
        }
    }


    // Removes all overlays on users in top ten loudest list
    function addAllOverlays() {
        // add new overlays
        for (var i = 0; i < settings.users.length; i++) {
            addOverlayToUser(settings.users[i].uuid);
        }
    }

    // #endregion OVERLAYS


    // #region UPDATE

    // Starts the update interval
    var interval = null, // handled by updateInterval 
        UPDATE_INTERVAL_TIME = 100; // Audio update time
    function startUpdateInterval() {
        if (interval === null) {
            interval = Script.setInterval(handleUpdate, UPDATE_INTERVAL_TIME);
        }
    }


    // Clears the update interval
    function stopUpdateInterval() {
        if (interval !== null) {
            Script.clearInterval(interval);
            interval = null;
        }
    }


    // Updates the list, removes avatars that have left, updates loudness
    function handleUpdate() {
        var palList = AvatarList.getPalData().data;

        // Add users to userStore
        for (var a = 0; a < palList.length; a++) {
            var currentUUID = palList[a].sessionUUID;

            var hasUUID = palList[a].sessionUUID;
            var isInUserStore = userStore[currentUUID] !== undefined;

            if (hasUUID && !isInUserStore) {
                // UUID exists and is NOT in userStore
                addUser(currentUUID);
            } else if (hasUUID) {
                // UUID exists and IS in userStore already
                userStore[currentUUID].audioLoudness = palList[a].audioLoudness;
                userStore[currentUUID].currentPosition = palList[a].position;
                updateAudioForAvatar(currentUUID);
                if (settings.ui.isExpandingAudioEnabled && userStore[currentUUID].overlayID) {
                    updateOverlaySize(currentUUID);
                }
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
                removeUser(uuid);
            }
        }
        doUIUpdate();
    }


    // Delete from top ten loudest list
    function removeUserFromSettings(uuid) {
        if (selectedUserUUID === uuid) { // targeted user with yellow overlay
            deselectUserOverlay(uuid);
        }
        if (activeTargetUUID === uuid) { // is listening to this user
             stopListening();
        }
        var settingsUsersListIndex = getIndexOfSettingsUser(uuid);
        if (settingsUsersListIndex !== -1) {
            if (settings.users[settingsUsersListIndex].overlayID) {
                deleteOverlay(uuid);
            }
            settings.users.splice(settingsUsersListIndex, 1);
            doUIUpdate();
        }
    }

    // #endregion UPDATE


    // #region WEBEVENTS

    // Handles messages from UI
    var LISTEN_TOGGLE = "listen_toggle",
        SELECT_AVATAR = "selectAvatar",
        BAN = "ban",
        MUTE = "mute",
        REFRESH = "refresh",
        GOTO = "goto",
        UPDATE_UI = "update_ui",
        SEARCH_WHOLE_DOMAIN_FOR_LOUDEST_ENABLED = "searchWholeDomainForLoudestEnabled",
        TOGGLE_EXPANDING_AUDIO = "toggleExpandingAudio";
    function onMessage(data) {
        if (DEBUG) {
            console.log("LoudApp recieved message: " + data.type);
        }

        switch (data.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                if (!settings.users.length) {
                    // only add people to the list if there are none
                    sortAvatarsByLoudness();
                }
                doUIUpdate();
                break;

            case LISTEN_TOGGLE:
                var avatarInfo = data.value;
                if (DEBUG) {
                    console.log("LISTEN TOGGLE ", avatarInfo.uuid !== activeTargetUUID, JSON.stringify(avatarInfo));
                }
                if (avatarInfo.uuid !== activeTargetUUID) {
                    startListeningToAvatar(avatarInfo.uuid);
                } else {
                    stopListening();
                }
                break;

            case SELECT_AVATAR:
                var avatarInfo = data.value;
                var orientationTowardsUser = Quat.cancelOutRollAndPitch(Quat.lookAtSimple(MyAvatar.position, avatarInfo.currentPosition));
                MyAvatar.orientation = orientationTowardsUser;
                if (selectedUserUUID === avatarInfo.uuid) {
                    deselectUserOverlay(avatarInfo.uuid);
                } else {
                    selectUserOverlay(avatarInfo.uuid);
                }
                break;

            case REFRESH:
                deselectUserOverlay(selectedUserUUID);
                sortAvatarsByLoudness();
                doUIUpdate();
                stopListening();
                break;

            case GOTO:
                // teleport behind the target avatar
                var avatarInfo = data.value;
                var offset = Vec3.multiplyQbyV(AvatarList.getAvatar(avatarInfo.uuid).orientation, { x: 0, y: 0.2, z: 1.5 });
                var newPosition = Vec3.sum(avatarInfo.currentPosition, offset);
        
                MyAvatar.position = newPosition;
                MyAvatar.orientation = userOrientation;
                break;

            case BAN:
                Users.kick(data.value.uuid);
                break;

            case MUTE:
                Users.mute(data.value.uuid);
                break;

            case TOGGLE_EXPANDING_AUDIO:
                settings.ui.isExpandingAudioEnabled = data.value;
                if (!settings.ui.isExpandingAudioEnabled) {
                    // set all users audio bubbles to 0.3 radius
                    for (var i = 0; i < settings.users.length; i++) {
                        var user = settings.users[i];
                        setOverlaySizeToDefault(user.uuid);
                    }
                }
                break;

            case SEARCH_WHOLE_DOMAIN_FOR_LOUDEST_ENABLED:
                settings.ui.searchWholeDomainForLoudestEnabled = data.value
                break;

            default:
                break;
        }
    }

    // #endregion WEBEVENTS

    
    // #region USER UTILITIES

    // Constructor for each user in userStore
    function User(uuid, displayName, initialGain) {

        this.uuid = uuid;
        this.displayName = displayName;
        this.userName = null;
        this.overlayID = null; // only avatars in the settings.users get overlays

        // used for options and app functionality
        this.currentPosition = null;
        this.isSelected = false;

        // used for audio
        this.isToggled = false; // is listening to
        this.audioLevel = 0;
        this.audioAccumulated = 0;
        this.audioAvg = 0;
        this.audioLoudness = 0;
    }


    // Signal callback when usernameFromIDReply returns after username request
    function setUserName(uuid, userName) {
        userStore[uuid].userName = userName ? userName : userStore[uuid].displayName;
        if (getIndexOfSettingsUser(uuid) !== -1) {
            doUIUpdate();
        }
    }


    // Add user to userStore
    var LISTEN_GAIN = 0; // default value
    function addUser(sessionUUID) {
        var avatarData = AvatarList.getAvatar(sessionUUID);
        if (!userStore[sessionUUID]) {
            userStore[sessionUUID] = new User(sessionUUID, avatarData.displayName, LISTEN_GAIN);
            // Request username from ID
            Users.requestUsernameFromID(sessionUUID);
        }
    }


    // Remove user from userStore
    function removeUser(sessionUUID) {
        removeUserFromSettings(sessionUUID);
        if (userStore[sessionUUID]) {
            delete userStore[sessionUUID];
        }
    }

    // #endregion USER UTILITIES

    startup();
})();
