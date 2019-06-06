//
//
//  Botinator
//  assignmentClientManager.js
//  Created by Milad Nazeri on 2019-03-28
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Manages the differnt ac scripts needed
//
//


(function() {
    console.log("\n\n\n\n\n\n\n\n\n\n\n\n\n\nTEST TEST TEST V4\n\n\n\n\n\n\n\n\n");
    // Synchronous version of require
    var request = Script.require("./requestSync.js").request;
    console.log("\n\n\n request:", JSON.stringify(request));
    var BASE_PATH = "https://hifi-content.s3.amazonaws.com/howell/bots/usertesting/";
    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIONS   
    

    // Stop all the bots currently playing
    // function stopAllBots() {
    //     availableAssignmentClientPlayers.forEach(function(ac) {
    //         ac.stop();
    //     });
    //     botCount = 0;
    //     isPlaying = false;
    // }



    // Start playing sequence to fill players with bots
    var AC_AVAILABILITY_CHECK_MS = 1000;
    function startSequence() {
        // Check to see how many bots are needed
        console.log("\n\n!botCount\n\n", botCount)
        console.log("\n\n!botsFound\n\n",botsFound)
        if (botCount >= botsFound + 1) {
            return;
        }

        if (botCount < availableAssignmentClientPlayers.length) {
            var player = availableAssignmentClientPlayers[botCount];
            console.log("\n\n\n\n\n playing bot! \n\n\n\n\n", botCount);
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
    var MAX_BOTS_TO_TRY = 100;
    var botsFound = 0;
    function populateRecordingList(){
        console.log("STARTING BOT SEARCH")
        for (var i = 1; i < MAX_BOTS_TO_TRY; i++) {
            var botRecordingFound = true;
            var currentBotUrl = BASE_PATH + "AVATAR_TEST" + i + ".hfr";
            request(currentBotUrl, function(error){
                if (error) {
                    botRecordingFound = false;
                    console.log("BOT ERROR:", botsFound);
                } else {
                    botsFound++;
                    botList.push(currentBotUrl);
                    console.log("BOT GOOD!:", botsFound);
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
    var botRegisterdCount = 0;

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
                var fileName = botList[botRegisterdCount];
                availableAssignmentClientPlayers.push( 
                    new AssignmentClientPlayerObject(message.uuid, fileName));
                botRegisterdCount++;
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
                console.log("unrecongized action in assignmentClientManger.js");
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
        console.log("\n \n \nIN STARTUP \n \n \n")
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);
        Messages.subscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Messages.messageReceived.connect(onMangerChannelMessageReceived);
        Script.scriptEnding.connect(onEnding);
        console.log(" \n \n \n ABOUT TO RUN POPULATE RECORDING LIST \n \n \n ")
        populateRecordingList();
        console.log("botList", JSON.stringify(botList, null, 4));
        startSequence();
    }    
    
    console.log("\n \n \nABOUT TO RUN STARTUP \n \n \n")
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

