// Assignment client Manager

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIO   
    
    console.log("\n\n\nC-v11\n\n\n")
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
            x: randFloat(locationObject.min_x, locationObject.max_x), 
            y: randFloat(locationObject.min_y, locationObject.max_y), 
            z: randFloat(locationObject.min_z, locationObject.max_z) 
        };
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
    console.log("bots:", JSON.stringify(BOTS))
    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";

    // Array of the assignment client players and their assignment client player object
    var availableAssignmentClientPlayers = [];

    // Range to pull the random location from
    // #FEATURE Maybe make sure that the locations are unique in case it messed up any needed testing if they are too close together.
    var locationRange = { 
        min_x: -3, max_x: 3, 
        min_y: 1, max_y: 2,
        min_z: -2, max_z: 2
    };

    // Total number of bots needed
    var totalNumberOfBots = 30;

    // Check timer reference
    // var checkTimer;
    // var CHECK_TIMER_INTERVAL = 2500;

    // Current assignment count we are at
    var botCount = 0;


    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
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
    function playClip(){
        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
            action: "PLAY",
            fileToPlay: this.fileToPlay,
            position: this.position,
            uuid: this.uuid
        }));
    }


    AssignmentClientPlayerObject.prototype = {
        setPosition: setPosition,
        updateStatus: updateStatus, 
        playClip: playClip 
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
                var fileName = findValue(botCount, BOTS, 35);
                console.log("fileName", fileName)
                var position = getRandomLocation(locationRange);
                console.log("position", position)
                availableAssignmentClientPlayers.push( 
                    new AssignmentClientPlayerObject(message.uuid, fileName, position));
                console.log(JSON.stringify(availableAssignmentClientPlayers));
                break;
            case "ARE_YOU_THERE_MANAGER":
                Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                    action: "REGISTER_MANAGER"
                }));
                break;
            default:
                console.log("unrecongized action in assignmentClientManger.js")
                break;
        }
    }

    function onTabletChannelMessageReceived(){

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
        console.log("in start sequence")
        console.log("botCount", botCount)
        console.log("totalNumberOfBots", totalNumberOfBots)

        // Check to see how many bots are needed
        if (botCount >= totalNumberOfBots) {
            return;
        }

        if (botCount < availableAssignmentClientPlayers.length) {
            var player = availableAssignmentClientPlayers[botCount];
            player.playClip();
            botCount++;

            if (botCount >= totalNumberOfBots) {
                return;
            }
        }

        Script.setTimeout(function(){
            startSequence();
        }, AC_AVAILABILITY_CHECK_MS);
    }

    function startUp(){
        Messages.messageReceived.connect(onMangerChannelMessageReceived);
        Script.scriptEnding.connect(onEnding);

        // For Testing
        startSequence();

        Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
            action: "REGISTER_MANAGER"
        }));
        
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
        // if (checkTimer){
        //     Script.clearInterval(checkTimer);
        // }
    }


    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

})();