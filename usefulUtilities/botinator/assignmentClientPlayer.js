//
//
//  Botinator
//  assignmentClientPlayer.js
//  Created by Milad Nazeri on 2019-03-28
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  assignmentClientPlayer
//
//


(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIONS
    
    
    // Keep trying to see if the manager is available before registering
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
                action: "ARE_YOU_THERE_MANAGER_ITS_ME_BOT"
            }));
        }

        Script.setTimeout(function(){
            searchForManager();
        }, MANAGER_CHECK_RETRY_MS);
    }


    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // *************************************
    // START CONSTS_AND_VARS
    // *************************************
    // #region CONSTS_AND_VARS
    
    
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
    
    
    // Player Class for the hfr recordings
    function Player() {
        this.isPlayingRecording = false;
        this.recordingFilename = "";
    }

    
    // Play the bot
    function play(fileToPlay, position, orientation, volume) {
        console.log("play playing " + JSON.stringify(fileToPlay));

        orientation = orientation || Quat.IDENTITY;
        var _this = this;
        Recording.loadRecording(fileToPlay, function (success, url) {
            console.log("url", url);
            console.log("IN LOAD RECORDING");
            if (success) {
                console.log("IN LOAD RECORDING sUCCESS ");
                console.log(JSON.stringify(player));
                _this.isPlayingRecording = true;

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
                Recording.setPlayerVolume(volume);
            } else {
                console.log("Could not load recording " + fileToPlay);

                _this.isPlayingRecording = false;
                _this.recordingFilename = "";
            }
        });
    }


    // Stop the bot and remove 
    // #NOTE:  Adding and removing the agent is currently causing issues.  Using a work around for the meantime
    function stop() {
        console.log("Stop playing " + this.recordingFilename);
        console.log(JSON.stringify(player));

        if (Recording.isPlaying()) {
            Recording.stopPlaying();
            Agent.isAvatar = true;
        }
        this.isPlayingRecording = false;
    }

    
    // Check if the bot is playing
    function isPlaying() {
        console.log("isPlaying");
        console.log(JSON.stringify(player));
        console.log("this.isPlayingRecording", this.isPlayingRecording)
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
    

    // Handle messages fromt he manager
    var PLAYER_MESSAGES = ["REGISTER_ME", "ARE_YOU_THERE_MANAGER"];
    function onMessageReceived(channel, message, sender) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("Can not parse message object");
            console.log("MESSAGE:", message);

            console.log(e);
        }
        
        if (channel !== ASSIGNMENT_MANAGER_CHANNEL || 
            sender === scriptUUID || 
            // message.uuid !== scriptUUID ||
            PLAYER_MESSAGES.indexOf(message.action) > -1) {
            return;
        }

        if (message.uuid !== scriptUUID) {
            return;
        }

        console.log("sender:" + sender);
        console.log("MESSAGE IN PLAYER:" + scriptUUID, JSON.stringify(message));

        switch (message.action){
            case "PLAY":
                if (!player.isPlaying()) {
                    player.play(message.fileToPlay, message.position, message.orientation, message.volume);
                } else {
                    console.log("Didn't start playing " + message.fileToPlay + " because already playing ");
                }
                break;
            case "STOP":
                console.log("ABOUT TO CHECK STOP")
                console.log(JSON.stringify(player));
                if (player.isPlaying()) {
                    console.log("PLAYER IS PLAYING SO ABOUT TO STOP")
                    player.stop();
                }
                break;
            case "REGISTER_MANAGER": 
                manager = true;
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
    

    // Main function to run when player comes online
    function startUp() {
        scriptUUID = Agent.sessionUUID;
        console.log("script UUID", scriptUUID);
        player = new Player();

        Messages.messageReceived.connect(onMessageReceived);
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);


        searchForManager();

        Script.scriptEnding.connect(onEnding);
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
