(function () {

    var AppUi = Script.require("appUi");

    var userStore = {}; // houses all users, see User constructor for structure

    // radius that avatars are factored in muting and top 10 loudest
    var SEARCH_RADIUS = 10;

    // status of our app
    var activeTargetUUID = null;

    // overlay options
    var selectedUserUUID, // selected avatar with yellow overlay
        OVERLAY_MIN_DIMENSIONS = 0.2,
        OVERLAY_MAX_DIMENSIONS = 1,
        OVERLAY_DEFAULT_DIMENSIONS = { x: 0.3, y: 0.3, z: 0.3 },
        COLOR_IN_LIST = { red: 255, blue: 255, green: 255 },
        COLOR_SELECTED = { red: 255, blue: 0, green: 255 };

    // *** New Features ***

    // sent to Vue to update our html UI
    // app options are housed here
    var settings = {
        users: [],
        ui: {
            isExpandingAudioEnabled: false,
            isAllAvatarsInTopTenEnabled: false,
            isListening: false
        }
    };

    // Range of time to send setGain requests
    // Ensure gain packets do not get lost
    var LISTEN_GAIN = 0; // default value

    var DEBUG = true;

    // #region AUDIO

    // Updates avatar's audio level in the userStore
    var AVERAGING_RATIO = 0.05,
        LOUDNESS_FLOOR = 11.0,
        LOUDNESS_SCALE = 2.8 / 5.0,
        LOG2 = Math.log(2.0),
        AUDIO_PEAK_DECAY = 0.02;
    function updateAudioForAvatar(uuid) {
        if (!userStore[uuid]) {
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


    // Solos target avatar 
    // Mutes the old target avatar
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
        if (userStore[activeTargetUUID]) {
            userStore[activeTargetUUID].isToggled = false;
        }
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
                // print(item.uuid)
                return item.uuid;
            }).indexOf(uuid);
            return index;
        }
        return -1;
    }

    // #endregion LIST MANAGEMENT


    // #region APP

    var ui;
    var BUTTON_NAME = "SEEK LOUD",
        APP_URL = Script.resolvePath('./Tablet/Loud_Tablet.html?v2'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";
    function startup() {
        // Create the tablet app
        ui = new AppUi({
            buttonName: BUTTON_NAME,
            onMessage: onMessage, // UI event listener  
            home: APP_URL,
            graphicsDirectory: Script.resolvePath("./icons/"),
            onOpened: onOpened,
            onClosed: onClosed
        });

        AvatarList.avatarAddedEvent.connect(addUser);
        AvatarList.avatarRemovedEvent.connect(removeUser);
        Users.usernameFromIDReply.connect(setUserName);

        Script.scriptEnding.connect(unload);

        startUpdateInterval();
    }


    function onOpened() {
        Users.requestsDomainListData = true;
        startUpdateInterval();
        addAllOverlays();
    }


    function onClosed() {
        Users.requestsDomainListData = false;
        stopUpdateInterval();
        removeAllOverlays();
    }


    function doUIUpdate(key) {
        ui.sendToHtml({
            type: UPDATE_UI,
            value: key ? settings[key] : settings,
            key: key ? key : ""
        });
    }


    function sortAvatarsByLoudness() {
        console.log("SORT AVATARS BY LOUDNESS");

        // sort by audioLevel
        function sortNumber(a, b) {
            return b.avgAudioLevel - a.avgAudioLevel;
        }

        removeAllOverlays();

        var avatarList = settings.ui.isAllAvatarsInTopTenEnabled ? Object.keys(userStore) : getAvatarsInRadius(SEARCH_RADIUS);
        settings.users = avatarList.map(function (uuid) { return userStore[uuid]; });
        settings.users = settings.users.sort(sortNumber).slice(0, 10);

        addAllOverlays();
    }


    function unload() {
        if (settings.users) {
            settings.users.forEach(function(user) {
                if (user.overlayID) {
                    deleteOverlay(user.uuid)
                }
            });
        }

        stopUpdateInterval();
        stopListening();

        Users.usernameFromIDReply.disconnect(setUserName);
        AvatarList.avatarAddedEvent.disconnect(addUser);
        AvatarList.avatarRemovedEvent.disconnect(removeUser);
    }

    // #endregion APP


    // #region OVERLAYS

    function addOverlayToUser(uuid) {
        var overlayPosition = AvatarList.getAvatar(uuid).getNeckPosition(); // user.currentPosition

        var overlayProperties = {
            position: overlayPosition, // assigned on creation
            dimensions: { x: 0.3, y: 0.3, z: 0.3 },
            solid: true,
            parentID: uuid, // assigned on creation
            color: COLOR_IN_LIST,
            drawInFront: true
        };
        var overlayID = Overlays.addOverlay("sphere", overlayProperties);
        userStore[uuid].overlayID = overlayID;
    }


    function deleteOverlay(uuid) {
        Overlays.deleteOverlay(userStore[uuid].overlayID);
        userStore[uuid].overlayID = null;
    }


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


    function setOverlaySizeToDefault(uuid) {
        if (userStore[uuid].overlayID) {
            Overlays.editOverlay(userStore[uuid].overlayID, {
                dimensions: OVERLAY_DEFAULT_DIMENSIONS
            });
        }
    }


    function deselectUserOverlay(uuid) {
        userStore[uuid].isSelected = false;
        Overlays.editOverlay(userStore[uuid].overlayID, { color: COLOR_IN_LIST });
        selectedUserUUID = null;
    }

    function selectUserOverlay(uuid) {
        if (selectedUserUUID) {
            deselectUserOverlay(selectedUserUUID);
        }
        userStore[uuid].isSelected = true;
        Overlays.editOverlay(userStore[uuid].overlayID, { color: COLOR_SELECTED });
        selectedUserUUID = uuid;
    }


    function removeAllOverlays() {
        // remove previous overlays
        for (var i = 0; i < settings.users.length; i++) {
            deleteOverlay(settings.users[i].uuid);
        }
    }


    function addAllOverlays() {
        // add new overlays
        for (var i = 0; i < settings.users.length; i++) {
            addOverlayToUser(settings.users[i].uuid);
        }
    }


    // #endregion OVERLAYS

    var interval = null, // handled by updateInterval 
        UPDATE_INTERVAL_TIME = 100; // Audio update time
    function startUpdateInterval() {
        if (interval === null) {
            interval = Script.setInterval(handleUpdate, UPDATE_INTERVAL_TIME);
        }
    }


    function stopUpdateInterval() {
        if (interval !== null) {
            Script.clearInterval(interval);
            interval = null;
        }
    }

    function handleUpdate() {
        // if (DEBUG) {
        //     console.log("handle update:" + interval);
        //     console.log("settings.users length: " + settings.users.length);
        // }

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

                // *** Update ***
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

    function removeUserFromSettingsUser(uuid) {
        if (selectedUserUUID === uuid) {
            selectedUserUUID = null;
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


    // Handles messages from UI
    var LISTEN_TOGGLE = "listen_toggle",
        SELECT_AVATAR = "selectAvatar",
        BAN = "ban",
        MUTE = "mute",
        REFRESH = "refresh",
        GOTO = "goto",
        UPDATE_UI = "update_ui",
        SET_GET_ALL_AVATARS = "setGetAllAvatars",
        TOGGLE_EXPANDING_AUDIO = "toggleExpandingAudio";
    function onMessage(data) {

        print("got message!", typeof data, JSON.stringify(data));
        // EventBridge message from HTML script.
        var message = data;
        // try {
        //     message = JSON.parse(data);
        // } catch (e) {
        //     return;
        // }

        switch (message.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                print("OPEN EVENTBRIDGE");
                if (!settings.users.length) {
                    print("settings.users.length is 0");
                    // only add people to the list if there are none
                    sortAvatarsByLoudness();
                }
                doUIUpdate();
                break;
            case LISTEN_TOGGLE:
                print("Event recieved: ", LISTEN_TOGGLE);
                listenToggle(message.value);
                break;
            case SELECT_AVATAR:
                print("Event recieved: ", BAN);
                selectAvatar(message.value);
                break;
            case REFRESH:
                print("Event recieved: ", REFRESH);
                sortAvatarsByLoudness();
                doUIUpdate();
                stopListening();    
                break;
            case GOTO:
                print("Event recieved: ", GOTO);
                handleGoTo(message.value);
                break;
            case BAN:
                print("Event recieved: ", BAN);
                Users.kick(message.value.uuid);
                break;
            case MUTE:
                print("Event recieved: ", MUTE);
                Users.mute(message.value.uuid);
                break;
            case TOGGLE_EXPANDING_AUDIO:
                console.log("Event recieved: " + TOGGLE_EXPANDING_AUDIO + message.value);
                toggleExpandingAudio(message.value);
                break;
            case SET_GET_ALL_AVATARS:
                console.log("Event recieved: " + SET_GET_ALL_AVATARS + message.value);
                setGetAllAvatars(message.value);
                break;
            default:
                break;
        }
    }

    
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
        removeUserFromSettingsUser(sessionUUID);
        if (userStore[sessionUUID]) {
            delete userStore[sessionUUID];
        }
    }

    // #endregion USER UTILITIES


    // #region WEBEVENTS

    function setGetAllAvatars(value) {
        settings.ui.isAllAvatarsInTopTenEnabled = value; // !settings.ui.isAllAvatarsInTopTenEnabled;
    }

    function toggleExpandingAudio(value) {
        settings.ui.isExpandingAudioEnabled = value; // !settings.ui.isExpandingAudioEnabled;
        if (!settings.ui.isExpandingAudioEnabled) {
            // set all users audio bubbles to 0.3 radius
            for (var i = 0; i < settings.users.length; i++) {
                var user = settings.users[i];
                setOverlaySizeToDefault(user.uuid);
            }
        }
    }

    function selectAvatar(avatarInfo) {
        var uuid = avatarInfo.uuid;

        var userPosition = avatarInfo.currentPosition;

        var orientationTowardsUser = Quat.cancelOutRollAndPitch(Quat.lookAtSimple(MyAvatar.position, userPosition));
        MyAvatar.orientation = orientationTowardsUser;

        if (selectedUserUUID === uuid) {
            deselectUserOverlay(uuid);
        } else {
            selectUserOverlay(uuid);
        }
    }

    // Teleport behind the target avatar
    function handleGoTo(avatarInfo) {
        var userOrientation = AvatarList.getAvatar(avatarInfo.uuid).orientation;
        var offset = Vec3.multiplyQbyV(userOrientation, { x: 0, y: 0.2, z: 1.5 });
        var newPosition = Vec3.sum(avatarInfo.currentPosition, offset);

        MyAvatar.position = newPosition;
        MyAvatar.orientation = userOrientation;
    }

    function listenToggle(avatarInfo) {

        print("LISTEN TOGGLE ", avatarInfo.uuid !== activeTargetUUID, JSON.stringify(avatarInfo));

        if (avatarInfo.uuid !== activeTargetUUID) {
            startListeningToAvatar(avatarInfo.uuid);
        } else {
            stopListening();
        }
    }

    // #endregion WEBEVENTS

    startup();
})();
