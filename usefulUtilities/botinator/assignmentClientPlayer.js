// Assignment client player

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIONS
    
    
    function log(message) {
        print(APP_NAME + " " + scriptUUID + ": " + message);
    }

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
    
    
    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // *************************************
    // START CONSTS_AND_VARS
    // *************************************
    // #region CONSTS_AND_VARS
    
    
    var APP_NAME = "PLAYBACK";
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";
    var RECORDER_COMMAND_ERROR = "error";
    var HIFI_PLAYER_CHANNEL = "HIFI_PLAYER_CHANNEL:" + Agent.sessionUUID;
    var PLAYER_ACTION_PLAY = "play";
    var PLAYER_ACTION_STOP = "stop";
    var heartbeatTimer = null;
    var HEARTBEAT_INTERVAL = 3000;
    var scriptUUID;
    var registerd = false;
    var Player;    

   
    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************

    // *************************************
    // START PLAYER
    // *************************************
    // #region PLAYER
    
    
    Player = (function () {
        // Recording playback functions.
        var userID = null,
            isPlayingRecording = false,
            recordingFilename = "",
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
    
    
    // #endregion
    // *************************************
    // END PLAYER
    // *************************************
    

    // *************************************
    // START MESSAGES
    // *************************************
    // #region MESSAGES
    
    
    function onMessageReceived(channel, message, sender) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("Can not parse message object")
            console.log(e)
        }
        
        if (channel === ASSIGNMENT_MANAGER_CHANNEL) {
            switch (message.action){
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
                case PLAYER_ACTION_STOP:
                    Player.stop();
                    sendHeartbeat();
                    break;
            }
        }
    }
        
    
    // #endregion
    // *************************************
    // END MESSAGES
    // *************************************


    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN
    
    
    function startUp() {
        scriptUUID = Agent.sessionUUID;

        Messages.messageReceived.connect(onMessageReceived);
        Messages.subscribe(HIFI_PLAYER_CHANNEL);
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);
    
        startHeartbeat();

        UserActivityLogger.logAction("playRecordingAC_script_load");

        Script.scriptEnding.connect(tearDown);

    }

    startUp();
    
    
    // #endregion
    // *************************************
    // END MAIN
    // *************************************
    

    // *************************************
    // START CLEANUP
    // *************************************
    // #region CLEANUP
    
    
    function tearDown() {
        stopHeartbeat();
        Player.stop();

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(HIFI_PLAYER_CHANNEL);
    }
    
    
    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

}());
