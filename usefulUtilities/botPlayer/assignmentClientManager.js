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
    var request = Script.require("https://hifi-content.s3.amazonaws.com/Experiences/Releases/modules/request/v1.0/request.js").request;
    var BASE_PATH = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/Projects/Testing/Flow/out/_hfr%20%285.8.2019%203.09.53%20PM%29/";
    request(BASE_PATH + "Jene_5_160.hfr", function(error, response){
        if (!error) console.log("no error")
        // if (response) console.log("response", JSON.stringify(response, null, 4));
    })

    var TOTAL_BOTS = 100;

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
        if (botCount >= totalNumberOfBotsNeeded) {
            return;
        }

        if (botCount < availableAssignmentClientPlayers.length) {
            var player = availableAssignmentClientPlayers[botCount];
            player.play();
            botCount++;

            if (botCount >= totalNumberOfBotsNeeded) {
                return;
            }
        }

        Script.setTimeout(function() {
            startSequence();
        }, AC_AVAILABILITY_CHECK_MS);
    }



    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // *************************************
    // START CONSTS_AND_VARS
    // *************************************
    // #region CONSTS_AND_VARS


    // List of possible bots to use    
    var BOTS = Script.require("./botsToLoad.js");

    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";
    var ASSIGNMENT_CLIENT_MESSANGER_CHANNEL = "ASSIGNMENT_CLIENT_MESSANGER_CHANNEL";

    // Array of the assignment client players and their assignment client player object
    var availableAssignmentClientPlayers = [];

    // Total number of bots needed
    var totalNumberOfBotsNeeded = 0;

    // Current playing bot count we are at
    var botCount = 0;

    // Current registered bount count
    var botRegisterdCount = 0;

    // Check for if currently running
    var isPlaying = false;


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
                var fileName = findValue(botRegisterdCount, BOTS);
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
        Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);
        Messages.subscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Messages.messageReceived.connect(onMangerChannelMessageReceived);
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

