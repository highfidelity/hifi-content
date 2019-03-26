// Assignment client Manager
(function () {

    // Link to get the urls from
    var GOOGLE_SHEET_URL = "https://script.googleusercontent.com/a/macros/highfidelity.io/echo?user_content_key=z30W_Z9rqfb41pGEoxCkUM9yv8ZN8mxWuMyDWUHroj3cJ65OTSWNE_Zq7wvrTybnnFtRp6azMkya2K4Hj_UvG2HA9j2tP4Hjm5_BxDlH2jW0nuo2oDemN9CCS2h10ox_nRPgeZU6HP_Ok_bZ6q4uc2IEwUGUhs3tubd_SaoYEJGc6Y4WQVrmGLClD6RzMAfZPxqtsdMQ32tpzl66ygAELl7JpluoKw78VudcD_Dja5DuJzk35EV1vQ&lib=MzB5vcFo1OT_VNOUwG7287OYoCQvnAuFY";

    // The Assignment Client channel
    var ASSIGNMENT_MANAGER_CHANNEL = "ASSIGNMENT_MANAGER_CHANNEL";

    // I need a map of the Assignment Client Players and their assignment client player object
    var assignmentClientPlayers = {};

    // Map of the loadedClips and which player is playing them.
    var loadedClipsAndPlayers = {};

    // Array of Clips that haven't been assigned yet.  Keep running timer checks until this is to 0. 
    var notAssignedClips = [];

    function makePosition(x,y,z){
        var pos = {};
        pos.x = x;
        pos.y = y;
        pos.z = z;           
    }

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
    var CHECK_TIMER_INTERVAL = 5000;

    AssignmentClientPlayerObject.prototype = {
        setPosition: function (x, y, z) {
            this.position.x = x;
            this.position.y = y;
            this.position.z = z;
        },
        getStatus: function () {
            getHeartBeat();
        },
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

    function getHeartBeat(channel) {
        Messages.sendMessage(channel, JSON.stringify({
            action: "GET_HEARTBEAT"
        }));
    }

    // helper function to wrap an HTTP get request.
    function XHR(url, successCb, failureCb, TIMEOUT) {
        print("XHR: request url = " + url);
        var self = this;
        this.url = url;
        this.successCb = successCb;
        this.failureCb = failureCb;
        this.req = new XMLHttpRequest();
        this.req.open("GET", url, true);
        this.req.timeout = TIMEOUT;
        this.req.ontimeout = function () {
            if (self.failureCb) {
                self.failureCb(0, "timeout");
            }
        };
        this.req.onreadystatechange = function () {
            if (self.req.readyState === self.req.DONE) {
                if (self.req.status === 200 || self.req.status === 203) {
                    if (self.successCb) {
                        self.successCb(self.req.responseText);
                    }
                } else {
                    if (self.failureCb) {
                        self.failureCb(self.req.status, "done");
                    }
                }
            }
        };
        this.req.send();
    }

    // this will contain the contents of the google spreadsheet.
    var TABLE = {};

    function sheetSuccess(response) {
        log("sheetSuccess status, response = " + response);
        TABLE = JSON.parse(response);
        TABLE.shift(); // strip off the header row.
        for (var i = 0; i < TOTAL_TO_GRAB; i++){
            var baseHFRName = baseName(TABLE[i].avatar_HFR);
            notAssignedClips[i] = baseHFRName;
        }
        checkTimer = Script.setInterval(onCheckTimer, CHECK_TIMER_INTERVAL);
    }

    function getTableIndex(name){
        return TABLE.map(function(row){
            return row.avatar_HFR;
        }).indexOf(name);
    }

    function sheetFailure(status, reason) {
        log("sheetFailure status code = " + status + ", reason = " + reason);
    }

    // asynchronously start downloading the spreadsheet.
    var sheetXHR = new XHR(GOOGLE_SHEET_URL, sheetSuccess, sheetFailure);

    // TABLE[self._avatarIndex].avatar_HFR;

    function baseName(str) {
        var base = new String(str).substring(str.lastIndexOf('/') + 1);
        if (base.lastIndexOf(".") !== -1) {
            base = base.substring(0, base.lastIndexOf("."));
        }
        return base;
    }

    function onMessageReceived(channel, message, sender) {
        message = JSON.parse(message);
        if (channel === ASSIGNMENT_MANAGER_CHANNEL) {
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