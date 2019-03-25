(function () {

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

    // button options
    var button,
        isAppActive = false,
        isTabletUIOpen = false,
        buttonName = "SEEK LOUD",
        tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system"),
        APP_URL = Script.resolvePath('./Tablet/Loud_Tablet.html?v2'),
        ACTIVE_ICON_URL = Script.resolvePath('./icons/LoudIcon.svg'),
        ICON_URL = Script.resolvePath('./icons/LoudIcon_White.svg'),
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";

    // app methods
    var LISTEN_TOGGLE = "listen_toggle",
        SET_ACTIVE_MESSAGE = "setActive",
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

    // audio constants
    var AVERAGING_RATIO = 0.05,
        LOUDNESS_FLOOR = 11.0,
        LOUDNESS_SCALE = 2.8 / 5.0,
        LOG2 = Math.log(2.0),
        AUDIO_PEAK_DECAY = 0.02;

    // Range of time to send setGain requests
    // Ensure gain packets do not get lost
    var LISTEN_GAIN = 0; // default value

    var audio = {

        update: function (uuid) {
            var user = userStore[uuid];
            if (!user) {
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
        },

        listenToAvatar: function (targetUUID) {
            print("listenToAvatar isListening", settings.ui.isListening);
            print("listenToAvatar targetUUID", targetUUID);
            print("listenToAvatar targetUUID", activeTargetUUID);

            if (settings.ui.isListening) {
                // is already listening to activeTargetUUID
                userStore[activeTargetUUID].isToggled = false;
                Audio.removeFromSoloList([activeTargetUUID]);

                // activeTargetUUID = targetUUID;
                // Audio.addToSoloList([targetUUID]);
                // userStore[targetUUID].isToggled = true;
                // return;
            } else {
                // turn on settings.ui.isListening and mute everyone but the target avatar
                settings.ui.isListening = true;
            }

            // add new target and unmute
            Audio.addToSoloList([targetUUID]);
            userStore[targetUUID].isToggled = true;
            activeTargetUUID = targetUUID;
        },

        resetListenToAvatar: function () {

            Audio.resetSoloList();

            print("activeTargetUUID: ", activeTargetUUID);
            print("userStore activeTargetUUID: ", JSON.stringify(userStore[activeTargetUUID]));

            if (userStore[activeTargetUUID]) {
                userStore[activeTargetUUID].isToggled = false;
            }
            
            settings.ui.isListening = false;
            activeTargetUUID = null;

            // for (var i = 0; i < muteList.length; i++) {

            //     userStore[muteList[i]].isToggled = false;
            //     this.unmute(muteList[i]);
            // }

            // muteList = [];

        }

    };

    var lists = {

        // currently not used
        getAvatarsInRadius: function (radius) {
            return AvatarList.getAvatarsInRange(MyAvatar.position, radius).filter(function (uuid) {
                return uuid !== MyAvatar.sessionUUID;
            });
        },

        // returns an array of avatarPaldata
        // Example of returned: [{"audioLoudness":0,"isReplicated":false,"palOrbOffset":0.2948298454284668,"position":{"x":0.5748982429504395,"y":-10.898207664489746,"z":2.4195659160614014},"sessionDisplayName":"Robin","sessionUUID":""}]
        allAvatars: function () {
            return AvatarList.getPalData().data;
        },

        // searches the top 10 list to get the index
        getIndexOfSettingsUser: function (uuid) {
            if (settings.users.length) {
                var index = settings.users.map(function (item) {
                    // print(item.uuid)
                    return item.uuid;
                }).indexOf(uuid);
                return index;
            }
            return -1;
        }

    };

    var app = {

        setup: function () {
            button = tablet.addButton({
                text: buttonName,
                icon: ICON_URL,
                activeIcon: ACTIVE_ICON_URL,
                isActive: isAppActive
            });

            if (button) {
                button.clicked.connect(this.onTabletButtonClicked);
            } else {
                console.error("ERROR: Tablet button not created! App not started.");
                tablet = null;
                return;
            }

            tablet.gotoHomeScreen();
            tablet.screenChanged.connect(this.onTabletScreenChanged);

            AvatarList.avatarAddedEvent.connect(userUtils.addUser);
            AvatarList.avatarRemovedEvent.connect(userUtils.removeUser);
            Users.usernameFromIDReply.connect(userUtils.setUserName);

            updateInterval.start();
        },

        onTabletButtonClicked: function () {
            // Application tablet/toolbar button clicked.
            if (isTabletUIOpen) {
                tablet.gotoHomeScreen();
            } else {
                // Initial button active state is communicated via URL parameter so that active state is set immediately without
                // waiting for the event bridge to be established.
                tablet.gotoWebScreen(APP_URL + "?active=" + isAppActive);
            }
        },

        doUIUpdate: function (update) {

            if (isTabletUIOpen) {
                tablet.emitScriptEvent(JSON.stringify({
                    type: UPDATE_UI,
                    value: settings,
                    update: update || {}
                }));
            }
        },

        setAppActive: function (active) {
            // print("SETUP APP ACTIVE");
            // Start/stop application activity.
            if (active) {
                // *** 


            } else {

            }
            // isAppActive = active;

        },

        onTabletScreenChanged: function (type, url) {
            // Tablet screen changed / desktop dialog changed.
            var wasTabletUIOpen = isTabletUIOpen;

            isTabletUIOpen = url.substring(0, APP_URL.length) === APP_URL; // Ignore URL parameter.
            if (isTabletUIOpen === wasTabletUIOpen) {
                return;
            }

            if (isTabletUIOpen) {

                button.editProperties({ isActive: true });

                overlays.addAll();

                tablet.webEventReceived.connect(webEvent.recieved);
            } else {

                overlays.removeAll();

                button.editProperties({ isActive: false });
                tablet.webEventReceived.disconnect(webEvent.recieved);
            }
        },

        sortData: function () {
            // sort by audioLevel
            function sortNumber(a, b) {
                return b.avgAudioLevel - a.avgAudioLevel;
            }

            overlays.removeAll();

            var avatarList = settings.ui.isAllAvatarsInTopTenEnabled ? Object.keys(userStore) : lists.getAvatarsInRadius(SEARCH_RADIUS);
            settings.users = avatarList.map(function (uuid) { return userStore[uuid]; });
            settings.users = settings.users.sort(sortNumber).slice(0, 10);

            overlays.addAll();

        },

        unload: function () {

            if (isAppActive) {
                this.setAppActive(false);
            }
            if (isTabletUIOpen) {
                tablet.webEventReceived.disconnect(webEvent.recieved);
            }
            if (button) {
                button.clicked.connect(this.onTabletButtonClicked);
                tablet.removeButton(button);
                button = null;
            }
            if (settings.users) {
                settings.users.forEach(function (user) {
                    if (user.overlayID) {
                        overlays.deleteOverlay(user.uuid)
                    }
                });
            }

            audio.resetListenToAvatar();

            Users.usernameFromIDReply.disconnect(userUtils.setUserName);
            AvatarList.avatarAddedEvent.disconnect(userUtils.addUser);
            AvatarList.avatarRemovedEvent.disconnect(userUtils.removeUser);

            tablet = null;
        }
    };

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
            var palList = lists.allAvatars();

            // Add users to userStore
            for (var a = 0; a < palList.length; a++) {
                var currentUUID = palList[a].sessionUUID;

                var hasUUID = palList[a].sessionUUID;
                var isInUserStore = userStore[currentUUID] !== undefined;

                if (hasUUID && !isInUserStore) {

                    userUtils.addUser(currentUUID);

                } else if (hasUUID) {

                    userStore[currentUUID].audioLoudness = palList[a].audioLoudness;
                    userStore[currentUUID].currentPosition = palList[a].position;

                    // *** Update ***

                    audio.update(currentUUID);

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

            app.doUIUpdate();
        }
    };

    function removeUserFromSettingsUser(uuid) {

        // print("REMOVE USER FROM SETTINGS");

        var settingsUsersListIndex = lists.getIndexOfSettingsUser(uuid);
        var muteListIndex = muteList.indexOf(uuid);

        if (settingsUsersListIndex !== -1) {

            if (settings.users[settingsUsersListIndex].overlayID) {
                overlays.deleteOverlay(uuid);
                // userStore[uuid].hasMovedFast = true;
            }

            settings.users.splice(settingsUsersListIndex, 1);
            app.doUIUpdate();
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
                        app.sortData();
                        app.doUIUpdate();
                    }
                    break;
                case SET_ACTIVE_MESSAGE:
                    // print("Event recieved: ", SET_ACTIVE_MESSAGE);
                    if (isAppActive !== message.value) {
                        // button.editProperties({
                        //     isActive: message.value
                        // });
                        app.setAppActive(message.value);
                    }
                    // tablet.gotoHomeScreen(); // Automatically close app.
                    break;
                case LISTEN_TOGGLE:
                    // print("Event recieved: ", LISTEN_TOGGLE);
                    handleEvent.listenToggle(message.value);
                    app.doUIUpdate();
                    break;
                case SELECT_AVATAR:
                    // print("Event recieved: ", BAN);
                    handleEvent.selectAvatar(message.value);
                    app.doUIUpdate();
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
                    app.doUIUpdate();
                    break;
                case MUTE:
                    // print("Event recieved: ", MUTE);
                    handleEvent.mute(message.value);
                    app.doUIUpdate();
                    break;
                case TOGGLE_EXPANDING_AUDIO:
                    handleEvent.toggleExpandingAudio();
                    app.doUIUpdate();
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
                    // print("CLOSE_DIALOGUE");
                    tablet.gotoHomeScreen();
                    break;
                default:
                    break;
            }
        },

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
            if (lists.getIndexOfSettingsUser(uuid) !== -1) {
                app.doUIUpdate();
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
                audio.listenToAvatar(avatarInfo.uuid);
            } else {
                audio.resetListenToAvatar();
            }
        },
        refresh: function () {
            app.sortData();
            app.doUIUpdate();
            audio.resetListenToAvatar();
            muteList = [];
        },
        mute: function (avatarInfo) {
            Users.mute(avatarInfo.uuid);
        }
    };

    function scriptEnding() {

        updateInterval.stop();
        app.unload();

    }

    app.setup();
    updateInterval.start();

    Script.scriptEnding.connect(scriptEnding);

})();
