var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
var LocalEntity = Script.require('./entityMaker.js?' + Date.now());
var entityProps = Script.require('./defaultOverlayProps.js?' + Date.now());
var request = Script.require('request').request;
Script.require('./bind.js?' + Date.now());

function requestJSON(url, callback) {
    request({
        uri: url
    }, function (error, response) {
        if (error || (response.status !== 'success')) {
            print("Error: unable to get request", error || response.status);
            return;
        }
        callback(response.data);
    });
}


function AvatarListManager(){
    this.avatars = {};
    this._bindedHandleUserName = null;
}

// Create the manager and hook up username signal
AvatarListManager.prototype.create =
    function(){
        console.log("in create");
        this._bindedHandleUserName = this.handleUserName.bind(this);
        Users.usernameFromIDReply.connect(this._bindedHandleUserName);

        return this;
    };

// Destory the manager and disconnect from username signal
AvatarListManager.prototype.destroy =
    function(){
        Users.usernameFromIDReply.disconnect(this._bindedHandleUserName);
        this.reset();
        return this;
    };

// Add a user to the manager
AvatarListManager.prototype.add = 
    function (uuid, intersection){
        console.log("adding user");
        this.avatars[uuid] = {
            dateAdded: Date.now(),
            avatarInfo: null,
            localEntityMain: new LocalEntity('local')
                .add(entityProps),
            localEntitySub: new LocalEntity('local')
                .add(entityProps),
            intersection: intersection.intersection
        };

        this.getInfo(uuid);
        var avatar = this.avatars[uuid].avatarInfo;
        this.avatars[uuid].localEntityMain
            .add("position", intersection.intersection)
            .add("parentID", uuid)
            .add("text", avatar.displayName)
            .create();
        this.getUN(uuid);
        return this;
    };

AvatarListManager.prototype.handleSelect =
    function(uuid, intersection) {
        console.log("in handleSelect");
        if (uuid in this.avatars) {
            console.log("removing avatar")
            this.remove(uuid);
        } else {
            console.log("adding avatar");
            this.add(uuid, intersection);
        }    
    };

// Make the smaller username when it is available
var SUB_BACKGROUND = [0, 0, 255];
// var SUB_BACKGROUND = {red: 0, green: 0, blue: 255};
AvatarListManager.prototype.makeSubName = 
    function(uuid){
        var avatar = this.avatars[uuid].avatarInfo;
        var localEntityMain = this.avatars[uuid].localEntityMain;
        var eye = Camera.position;
        var target = avatar.position;
        var distance = Vec3.distance(target, eye);

        log("in makeSubNAME!!!")

        this.avatars[uuid].localEntitySub
            .add("localPosition", [0, -0.15, 0])
            .add("backgroundColor", [0, 20, 250])
            .add("textColor", [80 ,80,250])
            .add("parentID", localEntityMain.id)
            .add("text", avatar.username)
            .add("dimensions", 0.032 * distance)
            .create();
    };
// Request the username
AvatarListManager.prototype.getUN =
    function(uuid){
        Users.requestUsernameFromID(uuid);
    };
// Get the current data for an avatar
AvatarListManager.prototype.getInfo = 
    function(uuid){
        this.avatars[uuid].avatarInfo = AvatarManager.getAvatar(uuid);

        return this;
    };
// Remove the avatar from the list
AvatarListManager.prototype.remove = 
    function (uuid){
        this.removeOverlay(uuid);
        delete this.avatars[uuid];

        return this;
    };
// Reset the avatar list
AvatarListManager.prototype.reset = 
    function(){
        this.removeAllOverlays();
        this.avatars = {};

        return this;
    };
// Remove all the current overlays
AvatarListManager.prototype.removeAllOverlays = 
    function(){
        for (var uuid in this.avatars) {
            this.removeOverlay(uuid);
        }

        return this;
    };
// Remove a single overlay
AvatarListManager.prototype.removeOverlay = 
    function(uuid){
        this.avatars[uuid].localEntityMain.destroy();
        if (this.avatars[uuid].localEntitySub) {
            this.avatars[uuid].localEntitySub.destroy();
        }
        return this;
    };

// Handler for the username call
AvatarListManager.prototype.handleUserName = 
    function(uuid, username){
        if (username) {
            this.avatars[uuid].avatarInfo.username = username;
            console.log("about to get user info")
            this.getInfoAboutUser(username);
            this.makeSubName(uuid);
        }
    };

var FRIEND_BACKGROUND = [150, 255, 0];
AvatarListManager.prototype.handleFriend = 
    function(uuid){
        var localEntityMain = this.avatars[uuid].localEntityMain;
        localEntityMain
            .edit("textColor", FRIEND_BACKGROUND);
    };
AvatarListManager.prototype.maybeRemove =
    function (uuid) {
        if (uuid in this.avatars) {
            this.remove(uuid);
        }
    };
    

var METAVERSE_BASE = Account.metaverseServerURL;
var SAFETY_LIMIT = 400;
AvatarListManager.prototype.getInfoAboutUser = 
    function getInfoAboutUser(specificUsername) {
        var url = METAVERSE_BASE + '/api/v1/users?filter=connections&per_page=' + SAFETY_LIMIT + '&search=' + encodeURIComponent(specificUsername);
        requestJSON(url, function (connectionsData) {
            // You could have (up to SAFETY_LIMIT connections whose usernames contain the specificUsername.
            // Search returns all such matches.
            var users = connectionsData.users;
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.username.toLowerCase() === specificUsername.toLowerCase() && user.connection === "friend") {
                    console.log("connection data:" + JSON.stringify(user));
                    var formattedSessionId = user.location.node_id || '';
                    if (formattedSessionId !== '' && formattedSessionId.indexOf("{") != 0) {
                        formattedSessionId = "{" + formattedSessionId + "}";
                    }

                    this.handleFriend(formattedSessionId);
                }
            }
        }.bind(this));
    };

module.exports = AvatarListManager;