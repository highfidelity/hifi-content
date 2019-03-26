// Assignment client Manager
(function () {

    // Bots to use
    Script.require("./botstoLoad.js");

    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";

    // I need a map of the Assignment Client Players and their assignment client player object
    var assignmentClientPlayers = {};

    // Map of the loadedClips and which player is playing them.
    var loadedClipsAndPlayers = {};

    // Array of Clips that haven't been assigned yet.  Keep running timer checks until this is to 0. 
    var notAssignedClips = [];

    // Total amount to stop grabbing from the spreadsheet.
    var TOTAL_TO_GRAB = 100;
    
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

    // Check timer reference
    var checkTimer;
    var CHECK_TIMER_INTERVAL = 2500;

    AssignmentClientPlayerObject.prototype = {
        setPosition: function (x, y, z) {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
        },
        // I don't think I need this #TODO
        // getStatus: function () {
        //     getHeartBeat();
        // },
        subscribeToChannel: function (channel) {
            this.subscribedChannel = channel;
        },
        updateStatus: function (statusObject) {
            this.loadedClip = statusObject.loadedClip;
            this.isPlaying = statusObject.isPlaying;
        },
        playClip: function(){
            Messages.sendMessage(this.subscribedChannel, JSON.stringify({
                action: "play",
                file: this.fileToPlay
            }));
        }
    }

    // // I don't think I need this #TODO
    // function getHeartBeat(channel) {
    //     Messages.sendMessage(channel, JSON.stringify({
    //         action: "GET_HEARTBEAT"
    //     }));
    // }

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
            // switch (message.command) {

            // }
        }
    }

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

    Messages.messageReceived.connect(onMessageReceived);
    Messages.subscribe(HIFI_PLAYER_CHANNEL);
    Messages.subscribe(ASSIGNMENT_MANAGER_CHANNEL);

    function onEnding(){
        if (checkTimer){
            Script.clearInterval(checkTimer);
        }
    }

    Script.scriptEnding.connect(onEnding);
});