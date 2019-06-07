"use strict";

//
//  Bot Player
//  assignmentClientManager.js
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
    

    // Start playing sequence to fill players with bots
    var AC_AVAILABILITY_CHECK_MS = 1000;
    function startSequence() {
        // Check to see how many bots are needed
        if (botCount >= botsFound + 1) {
            return;
        }

        if (botCount < availableAssignmentClientPlayers.length) {
            var player = availableAssignmentClientPlayers[botCount];
            player.play();
            botCount++;

            if (botCount >= botsFound + 1) {
                return;
            }
        }

        Script.setTimeout(function() {
            startSequence();
        }, AC_AVAILABILITY_CHECK_MS);
    }


    // Searching through the s3 bucket to grab which recordings are valid and stop as soon as we get an error
    // Synchronous version of require
    var BASE_PATH = "https://hifi-content.s3.amazonaws.com/howell/bots/usertesting/";
    var MAX_BOTS_TO_TRY = 100;
    var requestSync = Script.require("./requestSync.js").request;
    var botsFound = 0;
    function populateRecordingList(){
        for (var i = 1; i < MAX_BOTS_TO_TRY; i++) {
            var botRecordingFound = true;
            var currentBotUrl = BASE_PATH + "AVATAR_TEST" + i + ".hfr";
            requestSync(currentBotUrl, function(error){
                if (error) {
                    botRecordingFound = false;
                } else {
                    botsFound++;
                    botList.push(currentBotUrl);
                }
            });
            if (!botRecordingFound) {
                break;
            }
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


    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";
    var ASSIGNMENT_CLIENT_MESSANGER_CHANNEL = "ASSIGNMENT_CLIENT_MESSANGER_CHANNEL";

    // Array of the assignment client players and their assignment client player object
    var availableAssignmentClientPlayers = [];

    // Current playing bot count we are at
    var botCount = 0;

    // Current registered bount count
    var botsRegisteredCount = 0;

    // Array of the recordings found
    var botList = [];


    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************

    // *************************************
    // START ASSIGNMENT_CLIENT_PLAYER
    // *************************************
    // #region ASSIGNMENT_CLIENT_PLAYER


    // Individual AssignmentClientPlayerObject
    function AssignmentClientPlayerObject(uuid, fileToPlay, position, volume) {
        this.uuid = uuid;
        this.fileToPlay = fileToPlay;
    }


    // Play the current clip
    function play() {
        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
            action: "PLAY",
            fileToPlay: this.fileToPlay,
            uuid: this.uuid
        }));
    }


    // Stop the current clip
    function stop() {
        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
            action: "STOP",
            uuid: this.uuid
        }));
    }


    AssignmentClientPlayerObject.prototype = {
        play: play,
        stop: stop
    };


    // #endregion
    // *************************************
    // END ASSIGNMENT_CLIENT_PLAYER
    // *************************************
    
    // *************************************
    // START MESSAGES
    // *************************************
    // #region MESSAGES


    // Handle Messages received
    function onMangerChannelMessageReceived(channel, message, sender) {
        if (channel !== ASSIGNMENT_MANAGER_CHANNEL || sender === Agent.sessionUUID) {
            return;
        }

        try {
            message = JSON.parse(message);
        } catch (error) {
            console.log("invalid object");
            console.log("MESSAGE:", message);
            return;
        }

        switch (message.action) {
            case "REGISTER_ME":
                var fileName = botList[botsRegisteredCount];
                availableAssignmentClientPlayers.push( 
                    new AssignmentClientPlayerObject(message.uuid, fileName));
                botsRegisteredCount++;
                var messageToSend = JSON.stringify({
                    action: "AC_AVAILABLE_UPDATE",
                    newAvailableACs: availableAssignmentClientPlayers.length
                });
                Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, messageToSend);
                break;
            case "ARE_YOU_THERE_MANAGER_ITS_ME_BOT":
                Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                    action: "REGISTER_MANAGER",
                    uuid: sender
                }));
                break;
            default:
                console.log("unrecognized action in assignmentClientManger.js");
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
    
    
    // Startup for the manager when it comes online
    function startUp() {
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);
        Messages.subscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Messages.messageReceived.connect(onMangerChannelMessageReceived);
        Script.scriptEnding.connect(onEnding);
        populateRecordingList();
        startSequence();
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

    
    // Cleanup the manager and it's messages
    function onEnding() {
        Messages.messageReceived.disconnect(onMangerChannelMessageReceived);
        var messageToSend = JSON.stringify({
            action: "GET_MANAGER_STATUS",
            newAvailableACs: 0,
            isPlaying: false,
            closeTablet: true
        });
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, messageToSend);
        Messages.unsubscribe(ASSIGNMENT_MANAGER_CHANNEL);
        Messages.unsubscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
    }


    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

})();

