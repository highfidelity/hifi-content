"use strict";

//
//  Bot Player
//  assignmentClientPlayer.js
//  Created by Milad Nazeri on 2019-06-06
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//


(function() {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIONS
    
    
    // Keep trying to see if the manager is available before registering
    var MANAGER_CHECK_RETRY_MS = 2000;
    function searchForManager() {
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

        Script.setTimeout(function() {
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
    function play(fileToPlay) {
        console.log("play playing " + JSON.stringify(fileToPlay));
        this.recordingFilename = fileToPlay;
        var _this = this;
        
        Recording.loadRecording(fileToPlay, function(success, url) {
            if (success) {
                _this.isPlayingRecording = true;

                Users.disableIgnoreRadius();

                Agent.isAvatar = true;

                Recording.setPlayFromCurrentLocation(false);
                Recording.setPlayerUseDisplayName(true);
                Recording.setPlayerUseHeadModel(false);
                Recording.setPlayerUseAttachments(true);
                Recording.setPlayerLoop(true);
                Recording.setPlayerUseSkeletonModel(true);
                Recording.setPlayerTime(0.0);
                Recording.setPlayerVolume(0.5);
                
                Recording.startPlaying();
            } else {
                console.log("Could not load recording " + fileToPlay);

                _this.isPlayingRecording = false;
                _this.recordingFilename = "";
                // This should remove the avatars however they are coming back in as white spheres at the origin
                // Agent.isAvatar = false;
            }
        });
    }


    // Stop the bot and remove 
    // #NOTE:  Adding and removing the agent is currently causing issues.  Using a work around for the meantime
    function stop() {
        console.log("Stop playing " + this.recordingFilename);

        if (Recording.isPlaying()) {
            Recording.stopPlaying();

            // This looks like it's a platform bug that this can't be removed
            // Agent.isAvatar = false;
        }
        this.isPlayingRecording = false;
    }

    
    // Check if the bot is playing
    function isPlaying() {
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
    var IGNORE_PLAYER_MESSAGES = ["REGISTER_ME", "ARE_YOU_THERE_MANAGER"];
    var playInterval = null;
    function onMessageReceived(channel, message, sender) {
        if (channel !== ASSIGNMENT_MANAGER_CHANNEL || 
            sender === scriptUUID || 
            IGNORE_PLAYER_MESSAGES.indexOf(message.action) > -1) {
            return;
        }

        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("Can not parse message object");
            console.log(e);

            return;
        }

        if (message.uuid !== scriptUUID) {
            return;
        }

        switch (message.action){
            case "PLAY":
                if (!player.isPlaying()) {
                    player.play(message.fileToPlay);
                } else {
                    console.log("Didn't start playing " + message.fileToPlay + " because already playing ");
                }
                break;
            case "STOP":
                if (player.isPlaying()) {
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

        if (playInterval) {
            Script.clearInterval(playInterval);
            playInterval = null;
        }
    }
    
    
    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

})();
