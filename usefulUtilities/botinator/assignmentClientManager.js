// Assignment client Manager

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region UTILITY FUNCTIO   
    
    
    // Use a ring to cycle through the list for as many unique recordings as are available
    function findValue(index) {
        return array[(index - 1) % array.length];
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
    var BOTS = Script.require("./botstoLoad.js");

    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";

    // I need a map of the Assignment Client Players and their assignment client player object
    var assignmentClientPlayers = {};

    // Map of the loadedClips and which player is playing them.
    var loadedClipsAndPlayers = {};

    // Range to pull the random location from
    // #FEATURE Maybe make sure that the locations are unique in case it messed up any needed testing if they are too close together.
    var locationRange = { 
        min_x: 0, max_x: 0, 
        y: 0, 
        min_z: 0, max_z: 0
    };    

    // Total number of bots needed
    var totalNumberOfBots = 0;

    // Check timer reference
    var checkTimer;
    var CHECK_TIMER_INTERVAL = 2500;


    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************

    // *************************************
    // START ASSIGNMENT_CLIENT_PLAYER
    // *************************************
    // #region ASSIGNMENT_CLIENT_PLAYER


    // Individual AssignmentClientPlayerObject
    function AssignmentClientPlayerObject(uuid, channel, fileToPlay, position) {
        this.uuid = uuid;
        this.fileToPlay = fileToPlay;
        this.isPlaying = "";
        this.subscribedChannel = channel;
        this.position = position;
        Messages.sendMessage(this.subscribedChannel, JSON.stringify({
            action: "REGISTERATION ACCEPTED"
        }));
    }


    // Sets the position to play this bot at
    function setPosition (position) {
        this.position.x = position;
    }


    // Subscribe this player to a channel
    function subscribeToChannel (channel) {
        this.subscribedChannel = channel;
    }


    // Update the status of this player
    function updateStatus(statusObject) {
        this.loadedClip = statusObject.loadedClip;
        this.isPlaying = statusObject.isPlaying;
    }


    // Play the current clip
    function playClip(){
        Messages.sendMessage(this.subscribedChannel, JSON.stringify({
            action: "play",
            file: this.fileToPlay
        }));
    }


    // I don't think I need this #TODO
    // getStatus: function () {
    //     getHeartBeat();
    // },


    AssignmentClientPlayerObject.prototype = {
        setPosition: setPosition,
        subscribeToChannel: subscribeToChannel,
        updateStatus: updateStatus, 
        playClip: playClip 
    }


    // #endregion
    // *************************************
    // END ASSIGNMENT_CLIENT_PLAYER
    // *************************************
    
    // *************************************
    // START MESSAGES
    // *************************************
    // #region MESSAGES


    // Handle Messages received
    function onMessageReceived(channel, message, sender) {
        try {
            message = JSON.parse(message);
        } catch(error) {
            console.log("invalid object")
            return;
        }
        if (channel !== ASSIGNMENT_MANAGER_CHANNEL) {
            return;
        }

        switch (message.action) {
            case "REGISTER_ME":
                var fileName = notAssignedClips.splice(0,1);
                var tableIndex = getTableIndex(fileName)
                var row = TABLE[tableIndex];
                var position = makePosition(row.positionX, row.positionY,row.positionZ)
                assignmentClientPlayers[message.uuid] = new AssignmentClientPlayerObject(message.uuid, "HIFI_PLAYER_CHANNEL:" + message.uuid, fileName, position);
                break;
            default:
                break;
        }

        let splitIndex = channel.indexOf(":");
        let newChannel;
        if ( splitIndex > -1 ) {
            newChannel = channel.split(splitIndex + 1);
            console.log("messag", JSON.stringify(message));
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
    

    function onCheckTimer(){
        if (notAssignedClips.length !== 0) {
            Messages.sendMessage(ASSIGNMENT_MANAGER_CHANNEL, JSON.stringify({
                action: "GET_UUID"
            }));
        } else {
            Script.clearInterval(checkTimer);
            checkTimer = null;
        }
    }    
    
    // #endregion
    // *************************************
    // END TIMERS
    // *************************************

    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN
    
    
    function startUp(){

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
        if (checkTimer){
            Script.clearInterval(checkTimer);
        }
    }


    // #endregion
    // *************************************
    // END CLEANUP
    // *************************************

});



    // // I don't think I need this #TODO
    // function getHeartBeat(channel) {
    //     Messages.sendMessage(channel, JSON.stringify({
    //         action: "GET_HEARTBEAT"
    //     }));
   // }
