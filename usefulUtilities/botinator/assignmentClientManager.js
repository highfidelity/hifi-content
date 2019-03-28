// Assignment client Manager

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIO   
    
    console.log("\n\n MILAD-Control 3 \n\n!")
    // Use a ring to cycle through the list for as many unique recordings as are available
    function findValue(index, array, offset) {
        offset = offset || 0;
        return array[(index + offset) % array.length];
    }
    
    function randFloat(low, high) {
        return low + Math.random() * (high - low);
    }

    // Get a random location based on the user's desired min and max range.   
    function getRandomLocation(locationObject) {
        return { 
            x: randFloat(locationObject[0][X], locationObject[1][X]), 
            y: randFloat(locationObject[0][Y], locationObject[1][Y]), 
            z: randFloat(locationObject[0][Z], locationObject[1][Z]) 
        };
    }

    // The following borrowed from Zach's push preventer script

    // A utility function used to ensure that all of the values in "box corner 1" are less than
    // those in "box corner 2"
    function maybeSwapCorners(dimension) {
        var temp;
        if (contentBoundaryCorners[0][dimension] > contentBoundaryCorners[1][dimension]) {
            temp = contentBoundaryCorners[0][dimension];
            contentBoundaryCorners[0][dimension] = contentBoundaryCorners[1][dimension];
            contentBoundaryCorners[1][dimension] = temp;
        }
    }

    // Ensures that all of the values in "box corner 1" are less than those in "box corner 2".
    function fixupContentBoundaryCorners() {
        maybeSwapCorners(X);
        maybeSwapCorners(Y);
        maybeSwapCorners(Z);
    }

    // Make a unique copy of a data object
    // function copy(data){
    //     return JSON.parse(JSON.stringify(data));
    // }

    // function getPreviousData(){
    //     return {
    //         totalNumberOfBots: totalNumberOfBots, 
    //         contentBoundaryCorners: copy(contentBoundaryCorners),

    //     }
    // }


    // Stop all the bots currently playing
    function stopAllBots(){
        console.log("STOP ALL BOTS")
        availableAssignmentClientPlayers.forEach(function(ac){
            ac.stop();
        });
        botCount = 0;
        currentlyRunningBots = false;
    }

    function updateAllBotsPosition(){
        availableAssignmentClientPlayers.forEach(function(ac){
            ac.position = getRandomLocation(contentBoundaryCorners);
        });
    }

    function updateWithRandomOffset(){
        var randomOffset = Math.floor(Math.random() * availableAssignmentClientPlayers.length + (Math.random() * 160));
        availableAssignmentClientPlayers.forEach(function(ac){
            console.log("before random offset", ac.fileToPlay)
            ac.fileToPlay = findValue(botRegisterdCount, BOTS, randomOffset);
            console.log("after random offset", ac.fileToPlay)
        });
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
    console.log("bots:", JSON.stringify(BOTS));
    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";
    var ASSIGNMENT_CLIENT_MESSANGER_CHANNEL = "ASSIGNMENT_CLIENT_MESSANGER_CHANNEL";
    // Array of the assignment client players and their assignment client player object
    var availableAssignmentClientPlayers = [];
    var X = 0;
    var Y = 1;
    var Z = 2;

    // Total number of bots needed
    var totalNumberOfBotsNeeded = 30;

    // Check timer reference
    // var checkTimer;
    // var CHECK_TIMER_INTERVAL = 2500;

    // Current playing bot count we are at
    var botCount = 0;

    // Current registered bount count
    var botRegisterdCount = 0;

    // Range to pull the random location from    
    var contentBoundaryCorners = [[0,0,0], [0,0,0]];

    // var previousSettings = {
    //     botCount: botCount,
    //     contentBoundaryCorners: copy(contentBoundaryCorners)
    // };

    // Check for if currently running
    var currentlyRunningBots = false;

    // #FEATURE
    // Add volume control

    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************


    // *************************************
    // START DYNAMIC_MESSAGES
    // *************************************
    // #region DYNAMIC_MESSAGES
    
    
    // CHANGE LOCATION
    // CHANGE AVATAR RECORDINGS
    // CHANGE NUMBER OF AVATARS
    // STOP AVATARS
    // PLAY AVATARS

    
    // #endregion
    // *************************************
    // END DYNAMIC_MESSAGES
    // *************************************


    // *************************************
    // START ASSIGNMENT_CLIENT_PLAYER
    // *************************************
    // #region ASSIGNMENT_CLIENT_PLAYER


    // Individual AssignmentClientPlayerObject
    function AssignmentClientPlayerObject(uuid, fileToPlay, position) {
        this.uuid = uuid;
        this.fileToPlay = fileToPlay;
        this.isPlaying = "";
        this.position = position;
    }


    // Sets the position to play this bot at
    function setPosition (position) {
        this.position = position;
    }


    // Update the status of this player
    function updateStatus(statusObject) {
        this.loadedClip = statusObject.loadedClip;
        this.isPlaying = statusObject.isPlaying;
    }


    // Play the current clip
    function play(){
        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
            action: "PLAY",
            fileToPlay: this.fileToPlay,
            position: this.position,
            uuid: this.uuid
        }));
    }


    // Play the current clip
    function stop(){
        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
            action: "STOP",
            uuid: this.uuid
        }));

        updateWithRandomOffset();
    }
    
    AssignmentClientPlayerObject.prototype = {
        setPosition: setPosition,
        updateStatus: updateStatus, 
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


    Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);
    Messages.subscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
    // #TODO subscribe to tablet

    // Handle Messages received
    function onMangerChannelMessageReceived(channel, message, sender) {
        try {
            message = JSON.parse(message);
        } catch (error) {
            console.log("invalid object");
            return;
        }

        if (channel !== ASSIGNMENT_MANAGER_CHANNEL || sender === Agent.sessionUUID) {
            return;
        }

        console.log("MESSAGE IN MANAGER", JSON.stringify(message));

        switch (message.action) {
            case "REGISTER_ME":
                var fileName = findValue(botRegisterdCount, BOTS);
                botRegisterdCount++;
                // console.log("fileName", fileName)
                var position = getRandomLocation(contentBoundaryCorners);
                // console.log("position", position)
                availableAssignmentClientPlayers.push( 
                    new AssignmentClientPlayerObject(message.uuid, fileName, position));
                // console.log(JSON.stringify(availableAssignmentClientPlayers));
                break;
            case "ARE_YOU_THERE_MANAGER":
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


    function onTabletChannelMessageReceived(channel, message, sender){
        try {
            message = JSON.parse(message);
        } catch (error) {
            console.log("invalid object");
            return;
        }

        if (channel !== ASSIGNMENT_CLIENT_MESSANGER_CHANNEL || sender === Agent.sessionUUID) {
            return;
        }

        console.log("MESSAGE IN MANAGER FROM TABLET", JSON.stringify(message));

        switch (message.action) {
            case "REFRESH_SETTINGS":
                console.log("in refresh settings");
                if (currentlyRunningBots) {
                    stopAllBots();
                    currentlyRunningBots = false;
                }   

                if (JSON.stringify(contentBoundaryCorners) !== 
                    JSON.stringify(message.contentBoundaryCorners)) {
                    contentBoundaryCorners = message.contentBoundaryCorners;
                    fixupContentBoundaryCorners();
                    // All the players need the new boundries
                    updateAllBotsPosition();
                }

                if (totalNumberOfBotsNeeded !== message.totalNumberOfBotsNeeded) {
                    totalNumberOfBotsNeeded = message.totalNumberOfBotsNeeded;
                }

                break;
            case "PLAY":
                console.log("in play")

                if (currentlyRunningBots) {
                    return;
                }
                currentlyRunningBots = true;
                startSequence();
                break;
            case "STOP":
                console.log("in stop")
                if (currentlyRunningBots) {
                    stopAllBots();
                }
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
    // START TIMERS
    // *************************************
    // #region TIMERS
    

    // function onCheckTimer(){
    //     if (notAssignedClips.length !== 0) {
    //         Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
    //             action: "GET_UUID"
    //         }));
    //     } else {
    //         Script.clearInterval(checkTimer);
    //         checkTimer = null;
    //     }
    // }    
    
    // #endregion
    // *************************************
    // END TIMERS
    // *************************************

    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN
    
    
    // Start playing sequence to fill players with bots
    var AC_AVAILABILITY_CHECK_MS = 1000;
    function startSequence(){
        console.log("in start sequence");
        console.log("botCount", botCount);
        console.log("totalNumberOfBots", totalNumberOfBotsNeeded);

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

        Script.setTimeout(function(){
            startSequence();
        }, AC_AVAILABILITY_CHECK_MS);
    }

    function startUp(){
        Messages.messageReceived.connect(onMangerChannelMessageReceived);
        Messages.messageReceived.connect(onTabletChannelMessageReceived);
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

    
    function onEnding(){
        Messages.messageReceived.disconnect(onMangerChannelMessageReceived);
        Messages.messageReceived.disconnect(onTabletChannelMessageReceived);
        // if (checkTimer){
        //     Script.clearInterval(checkTimer);
        // }
    }


    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

})();

