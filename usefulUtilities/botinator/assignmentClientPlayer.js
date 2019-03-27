// Assignment client player

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIONS
    
    
    function log(message) {
        print(APP_NAME + " " + scriptUUID + ": " + message);
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
    var scriptUUID;

    var player; 

    var manager;

   
    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************

    // *************************************
    // START PLAYER
    // *************************************
    // #region PLAYER
    
    
    // Player for the hfr recordings
    function Player() {
        this.isPlayingRecording = false;
        this.recordingFilename = "";
        this.playRecording;
    }


    function play(fileToPlay, position, orientation) {
        console.log("play playing " + JSON.stringify(fileToPlay));

        orientation = orientation || Quat.IDENTITY;
        
        Recording.loadRecording(fileToPlay, function (success) {
            console.log("IN LOAD RECORDING");
            if (success) {
                console.log("IN LOAD RECORDING sUCCESS ");

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

            } else {
                var errorMessage = "Could not load recording " + fileToPlay;
                log(errorMessage);

                this.isPlayingRecording = false;
                this.recordingFilename = "";
            }
        });
    }


    function stop() {
        console.log("Stop playing " + this.recordingFilename);

        if (Recording.isPlaying()) {
            Recording.stopPlaying();
            Agent.isAvatar = false;
        }
        this.isPlayingRecording = false;
        this.recordingFilename = "";
    }


    function isPlaying() {
        console.log("isPlaying");
        return this.isPlayingRecording;
    }


    Player.prototype = {
        play: play,
        stop: stop,
        isPlaying: isPlaying
    };

    
    // #endregion
    // *************************************
    // END PLAYER
    // *************************************

    // *************************************
    // START MESSAGES
    // *************************************
    // #region MESSAGES
    
    var PLAYER_MESSAGES = ["REGISTER_ME", "ARE_YOU_THERE_MANAGER"];
    function onMessageReceived(channel, message, sender) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("Can not parse message object");
            console.log(e);
        }
        
        if (channel !== ASSIGNMENT_MANAGER_CHANNEL || sender === scriptUUID || PLAYER_MESSAGES.indexOf(message.action) > -1) {
            return;
        }

        console.log("sender:" + sender);
        console.log("MESSAGE IN PLAYER:" + scriptUUID, JSON.stringify(message));

        switch (message.action){
            case "PLAY":
                if (message.uuid !== scriptUUID) {
                    return;
                }
                
                if (!player.isPlaying()) {
                    player.play(message.fileToPlay, message.position, message.orientation);
                } else {
                    log("Didn't start playing " + message.fileToPlay + " because already playing " + player.recording());
                }
                break;
            case "STOP":
                player.stop();
                break;
            case "REGISTER_MANAGER": 
                manager = true;
                break;
            case "UPDATE_LOCATION":
                // #TODO
                break; 
            default:
                console.log("unrecongized action in assignmentClientPlayer.js");
                break;
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
    
    
    var MANAGER_CHECK_RETRY_MS = 2000;
    function searchForManager(){
        if (manager) {
            Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                action: "REGISTER_ME",
                uuid: scriptUUID
            }));

            return;
        } else {
            Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                action: "ARE_YOU_THERE_MANAGER"
            }));
        }

        Script.setTimeout(function(){
            searchForManager();
        }, MANAGER_CHECK_RETRY_MS);
    }

    function startUp() {
        scriptUUID = Agent.sessionUUID;
        console.log("script UUID", scriptUUID);
        player = new Player();

        Messages.messageReceived.connect(onMessageReceived);
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);


        searchForManager();

        Script.scriptEnding.connect(onEnding);
    }

    // Give a little time for the manager to become available
    startUp();
    
    
    // #endregion
    // *************************************
    // END MAIN
    // *************************************
    
    // *************************************
    // START CLEANUP
    // *************************************
    // #region CLEANUP
    
    
    function onEnding() {
        player.stop();

        Messages.messageReceived.disconnect(onMessageReceived);
        Messages.unsubscribe(ASSIGNMENT_MANAGER_CHANNEL);
    }
    
    
    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

})();
