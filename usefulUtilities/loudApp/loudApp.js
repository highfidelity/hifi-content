(function () {

    var AppUi = Script.require("appUi");

    var userStore = {}, // houses all users, see User constructor for structure
        interval = null, // handled by updateInterval 
        UPDATE_INTERVAL_TIME = 60; // Audio update time

    // radius that avatars are factored in muting and top 10 loudest
    var SEARCH_RADIUS = 10;
    var muteList = []; // houses avatars that are muted
    
    // status of our app
    var activeTargetUUID = null;
    
    // overlay options
    var selectedUserUUID, // selected avatar with yellow overlay
        OVERLAY_MIN_DIMENSIONS = 0.2,
        OVERLAY_MAX_DIMENSIONS = 1,
        OVERLAY_DEFAULT_DIMENSIONS = { x: 0.3, y: 0.3, z: 0.3 },
        COLOR_IN_LIST = { red: 255, blue: 255, green: 255 },
        COLOR_SELECTED = { red: 255, blue: 0, green: 255 };

    // velocity constants
    var SAMPLE_LENGTH = 100;

    // app methods
    var LISTEN_TOGGLE = "listen_toggle",
        CLOSE_DIALOG_MESSAGE = "closeDialog",
        SELECT_AVATAR = "selectAvatar",
        BAN = "ban",
        MUTE = "mute",
        REFRESH = "refresh",
        GOTO = "goto",
        UPDATE_UI = "update_ui",
        TOGGLE_ALL_AVATARS = "toggleAllAvatars",
        TOGGLE_EXPANDING_AUDIO = "toggleExpandingAudio";
        // *** New Features ***

    // sent to Vue to update our html UI
    // app options are housed here
    var settings = {
        users: [],
        ui: {
            isExpandingAudioEnabled: false,
            isAllAvatarsInTopTenEnabled: false
        },
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
            onMessage: webEvent.recieved, // UI event listener  
            home: APP_URL,
            // Icons are located in graphicsDirectory
            // AppUI is looking for icons named with the BUTTON_NAME "avatar-101" 
            // For example: avatar-101-a.svg for active button icon, avatar-101-i.svg for inactive button icon
            graphicsDirectory: Script.resolvePath("./icons/"), 
            onOpened: onOpened,
            onClosed: onClosed
        });

        AvatarList.avatarAddedEvent.connect(userUtils.addUser);
        AvatarList.avatarRemovedEvent.connect(userUtils.removeUser);
        Users.usernameFromIDReply.connect(userUtils.setUserName);
        
        Script.scriptEnding.connect(unload);

        updateInterval.start();
    }


    function onOpened() {
        overlays.addAll();
    }
    

    function onClosed() {
        overlays.removeAll();
    }


    function doUIUpdate(update) {
        ui.sendToHtml({
            type: UPDATE_UI,
            value: settings,
            update: update || {}
        });
    }


    function sortAvatarsByLoudness() {
        // sort by audioLevel
        function sortNumber(a, b) {
            return b.avgAudioLevel - a.avgAudioLevel;
        }

        overlays.removeAll();

        var avatarList = settings.ui.isAllAvatarsInTopTenEnabled ? Object.keys(userStore) : getAvatarsInRadius(SEARCH_RADIUS);
        settings.users = avatarList.map(function (uuid) { return userStore[uuid]; });
        settings.users = settings.users.sort(sortNumber).slice(0, 10);

        overlays.addAll();
    }


    function unload() {
        if (settings.users) {
            settings.users.forEach(function (user) {
                if (user.overlayID) {
                    overlays.deleteOverlay(user.uuid)
                }
            });
        }
        
        updateInterval.stop();

        stopListening();

        Users.usernameFromIDReply.disconnect(userUtils.setUserName);
        AvatarList.avatarAddedEvent.disconnect(userUtils.addUser);
        AvatarList.avatarRemovedEvent.disconnect(userUtils.removeUser);
    }

    // #endregion APP


    // #region OVERLAYS

    // #endregion OVERLAYS

    var overlays = {

        addOverlayToUser: function (uuid) {
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
        },

        deleteOverlay: function (uuid) {
            Overlays.deleteOverlay(userStore[uuid].overlayID);
            userStore[uuid].overlayID = null;
        },

        updateOverlaySize: function (uuid) {
            var dimensionsWithSound = OVERLAY_MIN_DIMENSIONS + userStore[uuid].avgAudioLevel * (OVERLAY_MAX_DIMENSIONS - OVERLAY_MIN_DIMENSIONS);
            Overlays.editOverlay(userStore[uuid].overlayID, { 
                dimensions: { 
                    x: dimensionsWithSound, 
                    y: dimensionsWithSound, 
                    z: dimensionsWithSound 
                } 
            });
        },

        setOverlaySizeToDefault: function (uuid) {
            if (userStore[uuid].overlayID) {
                Overlays.editOverlay(userStore[uuid].overlayID, { 
                    dimensions: OVERLAY_DEFAULT_DIMENSIONS 
                });
            }
        },

        selectUser: function (uuid) {
            if (selectedUserUUID) {
                this.deselectUser(selectedUserUUID);
            }
            Overlays.editOverlay(userStore[uuid].overlayID, { color: COLOR_SELECTED });
            userStore[uuid].isSelected = true;
            selectedUserUUID = uuid;
        },

        deselectUser: function (uuid) {
            userStore[uuid].isSelected = false;
            Overlays.editOverlay(userStore[uuid].overlayID, { color: COLOR_IN_LIST });
            selectedUserUUID = null;
        },

        removeAll: function () {
            // remove previous overlays
            for (var i = 0; i < settings.users.length; i++) {
                this.deleteOverlay(settings.users[i].uuid);
            }
        },

        addAll: function () {
            // add new overlays
            for (var i = 0; i < settings.users.length; i++) {
                this.addOverlayToUser(settings.users[i].uuid);
            }
        }

    }

    var updateInterval = {
        start: function () {
            interval = Script.setInterval(this.handleUpdate, UPDATE_INTERVAL_TIME);
        },

        stop: function () {
            if (interval) {
                Script.clearInterval(interval);
            }
        },

        handleUpdate: function () {
            var palList = AvatarList.getPalData().data;

            // Add users to userStore
            for (var a = 0; a < palList.length; a++) {
                var currentUUID = palList[a].sessionUUID;

                var hasUUID = palList[a].sessionUUID;
                var isInUserStore = userStore[currentUUID] !== undefined;

                if (hasUUID && !isInUserStore) {
                    // UUID exists and is NOT in userStore

                    userUtils.addUser(currentUUID);

                } else if (hasUUID) {
                    // UUID exists and IS in userStore already

                    userStore[currentUUID].audioLoudness = palList[a].audioLoudness;
                    userStore[currentUUID].currentPosition = palList[a].position;

                    // *** Update ***
                    updateAudioForAvatar(currentUUID);

                    if (settings.ui.isExpandingAudioEnabled && userStore[currentUUID].overlayID) {

                        overlays.updateOverlaySize(currentUUID);

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

                    userUtils.removeUser(uuid);

                }
            }

            doUIUpdate();
        }
    };

    function removeUserFromSettingsUser(uuid) {

        // print("REMOVE USER FROM SETTINGS");

        var settingsUsersListIndex = getIndexOfSettingsUser(uuid);
        var muteListIndex = muteList.indexOf(uuid);

        if (settingsUsersListIndex !== -1) {

            if (settings.users[settingsUsersListIndex].overlayID) {
                overlays.deleteOverlay(uuid);
                // userStore[uuid].hasMovedFast = true;
            }

            settings.users.splice(settingsUsersListIndex, 1);
            doUIUpdate();
        }

        if (muteListIndex !== -1) {
            muteList.splice(muteListIndex, 1);
        }

    }

    var webEvent = {

        recieved: function (data) {
            // EventBridge message from HTML script.
            var message;
            try {
                message = JSON.parse(data);
            } catch (e) {
                return;
            }

            switch (message.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    // print("OPEN EVENTBRIDGE");
                    if (!settings.users.length) {
                        // only add people to the list if there are none
                        sortAvatarsByLoudness();
                    }
                    break;
                case LISTEN_TOGGLE:
                    // print("Event recieved: ", LISTEN_TOGGLE);
                    handleEvent.listenToggle(message.value);
                    break;
                case SELECT_AVATAR:
                    // print("Event recieved: ", BAN);
                    handleEvent.selectAvatar(message.value);
                    break;
                case REFRESH:
                    // print("Event recieved: ", REFRESH);
                    handleEvent.refresh();
                    break;
                case GOTO:
                    // print("Event recieved: ", GOTO);
                    handleEvent.goto(message.value);
                    break;
                case BAN:
                    // print("Event recieved: ", BAN);
                    handleEvent.ban(message.value);
                    break;
                case MUTE:
                    // print("Event recieved: ", MUTE);
                    handleEvent.mute(message.value);
                    break;
                case TOGGLE_EXPANDING_AUDIO:
                    handleEvent.toggleExpandingAudio();
                    break;
                case TOGGLE_ALL_AVATARS:
                    handleEvent.toggleAllAvatars();
                    break;
                case CLOSE_DIALOG_MESSAGE:
                    if (settings.users) {
                        settings.users.forEach(function (user) {
                            if (user.overlayID) {
                                overlays.deleteOverlay(user.uuid)
                            }
                        });
                    }
                    break;
                default:
                    break;
            }
            doUIUpdate();
        }
    };

    function AveragingFilter(length) {
        // initialise the array of past values
        this.pastValues = [];
        for (var i = 0; i < length; i++) {
            this.pastValues.push(0);
        }
        // single arg is the nextInputValue
        this.process = function () {
            if (this.pastValues.length === 0 && arguments[0]) {
                return arguments[0];
            } else if (arguments[0] !== null) {
                this.pastValues.push(arguments[0]);
                this.pastValues.shift();
                var nextOutputValue = 0;
                for (var value in this.pastValues) nextOutputValue += this.pastValues[value];
                return nextOutputValue / this.pastValues.length;
            } else {
                return 0;
            }
        };
    };

    var filter = (function () {
        return {
            createAveragingFilter: function (length) {
                var newAveragingFilter = new AveragingFilter(length);
                return newAveragingFilter;
            }
        };
    })();

    // constructor for each user in userStore
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

        // used for velocity
        this.hasMovedFast = false;
        this.previousPosition = null;
        this.currentDistance = null;
        this.distanceFilter = filter.createAveragingFilter(SAMPLE_LENGTH);
        this.avgDistance = 0;
    }

    var userUtils = {

        setUserName: function (uuid, userName) {
            userStore[uuid].userName = userName ? userName : userStore[uuid].displayName;
            if (getIndexOfSettingsUser(uuid) !== -1) {
                doUIUpdate();
            }
        },

        addUser: function (sessionUUID) {
            var avatarData = AvatarList.getAvatar(sessionUUID);
            if (!userStore[sessionUUID]) {

                userStore[sessionUUID] = new User(sessionUUID, avatarData.displayName, LISTEN_GAIN);
                Users.requestUsernameFromID(sessionUUID);
            }
        },

        removeUser: function (sessionUUID) {

            removeUserFromSettingsUser(sessionUUID);

            if (userStore[sessionUUID]) {
                delete userStore[sessionUUID];
            }

        }
    }

    var handleEvent = {

        toggleAllAvatars: function () {
            settings.ui.isAllAvatarsInTopTenEnabled = !settings.ui.isAllAvatarsInTopTenEnabled;
        },

        toggleExpandingAudio: function () {
            settings.ui.isExpandingAudioEnabled = !settings.ui.isExpandingAudioEnabled;

            if (!settings.ui.isExpandingAudioEnabled) {
                // set all users audio bubbles to 0.3 radius
                for (var i = 0; i < settings.users.length; i++) {
                    var user = settings.users[i];

                    overlays.setOverlaySizeToDefault(user.uuid);
                }
            }
        },

        selectAvatar: function (avatarInfo) {
            var uuid = avatarInfo.uuid;

            var userPosition = avatarInfo.currentPosition;

            var orientationTowardsUser = Quat.cancelOutRollAndPitch(Quat.lookAtSimple(MyAvatar.position, userPosition));
            MyAvatar.orientation = orientationTowardsUser;

            if (selectedUserUUID === uuid) {
                overlays.deselectUser(uuid);
            } else {
                overlays.selectUser(uuid);
            }
        },

        goto: function (avatarInfo) {
            var uuid = avatarInfo.uuid;

            var userOrientation = AvatarList.getAvatar(uuid).orientation;
            var offset = Vec3.multiplyQbyV(userOrientation, { x: 0, y: 0.2, z: 1.5 });
            var newPosition = Vec3.sum(avatarInfo.currentPosition, offset);

            MyAvatar.position = newPosition;
            MyAvatar.orientation = userOrientation;
        },

        ban: function (avatarInfo) {
            Users.kick(avatarInfo.uuid);
        },

        listenToggle: function (avatarInfo) {

            print("LISTEN TOGGLE ", avatarInfo.uuid !== activeTargetUUID, JSON.stringify(avatarInfo));

            if (avatarInfo.uuid !== activeTargetUUID) {
                startListeningToAvatar(avatarInfo.uuid);
            } else {
                stopListening();
            }
        },
        refresh: function () {
            sortAvatarsByLoudness();
            doUIUpdate();
            stopListening();
            muteList = [];
        },
        mute: function (avatarInfo) {
            Users.mute(avatarInfo.uuid);
        }
    };

    startup();
})();
