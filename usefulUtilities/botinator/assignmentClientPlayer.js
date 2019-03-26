(function () {

    var APP_NAME = "PLAYBACK",
        ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL",
        RECORDER_COMMAND_ERROR = "error",
        HIFI_PLAYER_CHANNEL = "HIFI_PLAYER_CHANNEL:" + Agent.sessionUUID,
        PLAYER_ACTION_PLAY = "play",
        PLAYER_ACTION_STOP = "stop",
        heartbeatTimer = null,
        HEARTBEAT_INTERVAL = 3000,
        TIMESTAMP_UPDATE_INTERVAL = 2500,
        AUTOPLAY_SEARCH_INTERVAL = 5000,
        AUTOPLAY_ERROR_INTERVAL = 30000,  // 30s
        scriptUUID,
        registerd = false,
        Player;

    function log(message) {
        print(APP_NAME + " " + scriptUUID + ": " + message);
    }

    Player = (function () {
        // Recording playback functions.
        var userID = null,
            isPlayingRecording = false,
            recordingFilename = "",
            // autoPlayTimer = null,

            // autoPlay,
            playRecording;

        function error(message) {
            // Send error message to user.
            Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                command: RECORDER_COMMAND_ERROR,
                user: userID,
                message: message
            }));
        }

        function play(recording, position, orientation) {
            var errorMessage;

            playRecording = function (recording, position, orientation, isManual) {
                orientation = orientation || Quat.IDENTITY;
                
                Recording.loadRecording(recording, function (success) {
                    var errorMessage;

                    if (success) {
                        Users.disableIgnoreRadius();

                        Agent.isAvatar = true;
                        Avatar.position = position;
                        Avatar.orientation = orientation;

                        Recording.setPlayFromCurrentLocation(true);
                        Recording.setPlayerUseDisplayName(true);
                        Recording.setPlayerUseHeadModel(false);
                        Recording.setPlayerUseAttachments(true);
                        Recording.setPlayerLoop(true);
                        Recording.setPlayerUseSkeletonModel(true);

                        Recording.setPlayerTime(0.0);
                        Recording.startPlaying();

                        UserActivityLogger.logAction("playRecordingAC_play_recording");
                    } else {
                        errorMessage = "Could not load recording " + recording.slice(4);  // Remove leading "atp:".
                        log(errorMessage);
                        error(errorMessage);

                        isPlayingRecording = false;
                        recordingFilename = "";

                    }
                });
            };
        }

        function stop() {
            log("Stop playing " + recordingFilename);
            if (Recording.isPlaying()) {
                Recording.stopPlaying();
                Agent.isAvatar = false;
            }
            isPlayingRecording = false;
            recordingFilename = "";
        }

        function isPlaying() {
            return isPlayingRecording;
        }

        function recording() {
            return recordingFilename;
        }

        return {
            play: play,
            stop: stop,
            isPlaying: isPlaying,
            recording: recording,
        };
    }());

    function sendHeartbeat() {
        Messages.sendMessage(HIFI_PLAYER_CHANNEL, JSON.stringify({
            playing: Player.isPlaying(),
            recording: Player.recording()
        }));
    }

    function onHeartbeatTimer() {
        sendHeartbeat();
        heartbeatTimer = Script.setTimeout(onHeartbeatTimer, HEARTBEAT_INTERVAL);
    }

    function startHeartbeat() {
        onHeartbeatTimer();
    }

    function stopHeartbeat() {
        if (heartbeatTimer) {
            Script.clearTimeout(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

    function onMessageReceived(channel, message, sender) {
        message = JSON.parse(message);
        if (channel === ASSIGNMENT_MANAGER_CHANNEL) {
            switch (messages.action){
                case "GET_HEARTBEAT":
                    sendHeartbeat();
                    break;
                case "GET_UUID":
                    if (registerd === false) {
                        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                            action: "REGISTERME",
                            uuid: scriptUUID
                        }));
                    }
                    break;
                default:
                    break;
            }
        }

        if (channel === HIFI_PLAYER_CHANNEL){
                switch (message.action) {
                case "REGISTERATION ACCEPTED":
                    registerd = true;
                    break;
                case PLAYER_ACTION_PLAY:
                    if (!Player.isPlaying()) {
                        Player.play(sender, message.recording, message.position, message.orientation);
                    } else {
                        log("Didn't start playing " + message.recording + " because already playing " + Player.recording());
                    }
                    sendHeartbeat();
                    break;
                case PLAYER_COMMAND_STOP:
                    Player.stop();
                    sendHeartbeat();
                    break;
                }
            }
    }

    function setUp() {
        scriptUUID = Agent.sessionUUID;

        Messages.messageReceived.connect(onMessageReceived);
        Messages.subscribe(HIFI_PLAYER_CHANNEL);
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);
    
        startHeartbeat();

        UserActivityLogger.logAction("playRecordingAC_script_load");
    }

    function tearDown() {
        stopHeartbeat();
        Player.stop();

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(HIFI_PLAYER_CHANNEL);
    }

    setUp();
    Script.scriptEnding.connect(tearDown);

}());
