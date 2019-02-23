var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
var LocalEntity = Script.require('./entityMaker.js?' + Date.now());
var entityProps = Script.require('./defaultOverlayProps.js?' + Date.now());
var textHelper = new (Script.require('./textHelper.js?' + Date.now()));
var request = Script.require('request').request;
var X = 0;
var Y = 1;
var Z = 2;

var _this;
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
    _this = this;
    _this.avatars = {};
}

// Create the manager and hook up username signal
AvatarListManager.prototype.create =
    function(){
        // console.log("in create");
        Users.usernameFromIDReply.connect(_this.handleUserName);

        return _this;
    };

// Destory the manager and disconnect from username signal
AvatarListManager.prototype.destroy =
    function(){
        Users.usernameFromIDReply.disconnect(_this.handleUserName);
        _this.reset();
        return _this;
    };

// Add a user to the manager
var MAIN_SCALER = 0.75;
var INTERVAL_CHECK_MS = 20;
var DEFAULT_LEFT_MARGIN = 0.070;
var LINE_HEIGHT_SCALER = 1.0;
AvatarListManager.prototype.add = 
    function (uuid, intersection){
        // console.log("adding user");
        _this.avatars[uuid] = {
            dateAdded: Date.now(),
            avatarInfo: null,
            localEntityMain: new LocalEntity('local')
                .add(entityProps),
            localEntitySub: new LocalEntity('local')
                .add(entityProps),
            intersection: intersection.intersection, 
            lastDistance: null,
            redrawTimeout: null,
            mainInitialLineHeight: null,
            mainInitialDimensions: null,
            subInitialLineHeight: null,
            subInitialDimensions: null
        };

        _this.getInfo(uuid);
        var avatar = _this.avatars[uuid];

        var localEntityMain = avatar.localEntityMain;

        var avatarInfo = avatar.avatarInfo;
        // log("_this.avatars[uuid]", _this.avatars[uuid]);
        // log("avatarInfo in add", avatarInfo);
        localEntityMain.add("text", avatarInfo.displayName);


        var calculatedProps = _this.calculateNewScaledProperties(uuid, "main");
        // log("calculatedProps", calculatedProps)
        var lineHeight = calculatedProps.scaledDimensions.y * MAIN_SCALER * LINE_HEIGHT_SCALER;
        // log("lineHeight", lineHeight)
        var dimensions = Vec3.multiply(calculatedProps.scaledDimensions, MAIN_SCALER);
        // log("dimensions", dimensions)
        var position = intersection.intersection;
        // log("position", position)
        avatar.mainInitialLineHeight = lineHeight;
        avatar.mainInitialDimensions = dimensions;
        textHelper
            .setText(avatarInfo.displayName)
            .setLineHeight(lineHeight);
             
        localEntityMain
            .add("lineHeight", lineHeight)
            .add("dimensions", dimensions)
            // .add("leftMargin", DEFAULT_LEFT_MARGIN * MAIN_SCALER)
            .add("position", position)
            .add("parentID", uuid)
            .create(true);

        _this.getUN(uuid);

        avatar.redrawTimeout = Script.setInterval(function(){
            _this.maybeRedraw(uuid);
        }, INTERVAL_CHECK_MS, uuid);
        return _this;
    };

AvatarListManager.prototype.handleSelect =
    function(uuid, intersection) {
        // console.log("in handleSelect");
        if (uuid in _this.avatars) {
            // console.log("removing avatar")
            _this.remove(uuid);
        } else {
            // console.log("adding avatar");
            _this.add(uuid, intersection);
        }    
    };

AvatarListManager.prototype.reDraw = 
    function (uuid, type){
        var avatar = _this.avatars[uuid];

        var localEntity;
        var calculatedProps;
        if (type === "main") {
            localEntity = avatar.localEntityMain;
            calculatedProps = _this.calculateNewScaledProperties(uuid, "main");

            var lineHeight = 
                avatar.mainInitialLineHeight * calculatedProps.adjustedScaler;
            var dimensions = 
                Vec3.multiply(avatar.mainInitialDimensions, calculatedProps.adjustedScaler);
            // log("lineHeight", lineHeight);
            // log("dimensions", dimensions);
            localEntity
                .add("lineHeight", lineHeight)
                .add("dimensions", dimensions)
                // .add("leftMargin", DEFAULT_LEFT_MARGIN * MAIN_SCALER)
                .sync();

        } else {
            localEntity = avatar.localEntitySub;
            calculatedProps = _this.calculateNewScaledProperties(uuid, "sub");
            // log("calculatedProps", calculatedProps);
            // log("LH", avatar.subInitialLineHeight);
            // log("D", avatar.subInitialDimensions);
            // log("AS", calculatedProps.adjustedScaler);
            var lineHeight = 
                avatar.subInitialLineHeight * calculatedProps.adjustedScaler;
            var dimensions =  
                Vec3.multiply(avatar.subInitialDimensions, calculatedProps.adjustedScaler);
            var localPosition = 
                [0, SUB_OFFSET[Y] * calculatedProps.adjustedScaler, 0]
            localEntity
                .add("lineHeight", lineHeight)
                .add("localPosition", localPosition)
                .add("dimensions",dimensions)
                // .add("leftMargin", DEFAULT_LEFT_SUB_MARGIN * subNameScaler)
                .sync();
        }
    };

var MAX_DISTANCE_METERS = 0.02;
AvatarListManager.prototype.maybeRedraw =
    function(uuid){
        _this.getInfo(uuid);
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;
        var eye = Camera.position;
        // log("eye", eye);
        var target = avatarInfo.position;
        // log("target", target);
        var distance = Vec3.distance(target, eye);
        // log("maybe redraw", distance);
        // log("avatar.lastDistanceFromCamera)", avatar.lastDistanceFromCamera);
        var distanceDifference = Math.abs(distance - avatar.lastDistanceFromCamera);
        // log("distanceDifference", distanceDifference)
        avatar.lastDistanceFromCamera = distance;
        if (distanceDifference < MAX_DISTANCE_METERS){
            // log("Returning out of distance check")
            return;
        }
        log("running redraw on main")
        _this.reDraw(uuid, "main");
        
        // log("AVATAR INFO USER NAME", avatarInfo);
        if (avatarInfo.username) {
            _this.reDraw(uuid, "sub");
        }
    };
var DISTANCE_SCALER = .35;
AvatarListManager.prototype.calculateNewScaledProperties =
    function(uuid, type){
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;
        var eye = Camera.position;
        // log("eye", eye);
        var target = avatarInfo.position;
        // log("target", target);
        var distance = Vec3.distance(target, eye);
        log("distance", distance)
        var adjustedScaler = distance * DISTANCE_SCALER;
        log("adjustedScaler", adjustedScaler)
        var currentDimensions = null;
        var scaledDimensions = null;
        var localEntity = null;
        var initialLineHeight = null;
        var initialDimensions = null;
        // log("avatar in calc props", avatar)
        if (type === "main") {
            localEntity = avatar.localEntityMain;
            initialLineHeight = avatar.mainInitialLineHeight;
            initialDimensions = avatar.mainInitialDimensions;
        } else {
            localEntity = avatar.localEntitySub;
            initialLineHeight = avatar.subInitialLineHeight;
            initialDimensions = avatar.subInitialDimensions;
        }

        avatar.lastDistanceFromCamera = distance;
        
        if (initialLineHeight === null && initialDimensions === null) {
            log("### made it to 1")
            var textProps = localEntity.get(['text', 'lineHeight']);
            // log("textProps", textProps)
            textHelper
                .setText(textProps.text)
                .setLineHeight(textProps.lineHeight);
            currentDimensions = [textHelper.getTotalTextLength(), textProps.lineHeight, 0.1];
            scaledDimensions = Vec3.multiply(currentDimensions, adjustedScaler);
        } else {
            log("### made it to 2")
            scaledDimensions = Vec3.multiply(initialDimensions, adjustedScaler);
        }
        
        return {
            scaledDimensions: scaledDimensions,
            adjustedScaler: adjustedScaler
        };
    };

// Make the smaller username when it is available
var SUB_OFFSET = [0, -0.12, 0];
var SUB_BACKGROUND = [0, 0, 0];
var SUB_TEXTCOLOR = [255 ,150,255];
var subNameScaler = 0.55;
var SUB_PADDING = 0.975;
var DEFAULT_LEFT_SUB_MARGIN = 0.03;
var LINE_HEIGHT_SCALER = 0.95;

AvatarListManager.prototype.makeSubName = 
    function(uuid){
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;      
        var localEntityMain = avatar.localEntityMain;
        var localEntitySub = avatar.localEntitySub;
        localEntitySub.add("text", avatarInfo.username);

        // calculatedProps.scaledDimensions.x = calculatedProps.scaledDimensions.x;
        var calculatedProps = _this.calculateNewScaledProperties(uuid, "sub");
        var localPosition = 
            [0, SUB_OFFSET[Y] * calculatedProps.adjustedScaler * subNameScaler, 0];
        var lineHeight = 
            calculatedProps.scaledDimensions.y * subNameScaler * LINE_HEIGHT_SCALER;
        calculatedProps.scaledDimensions = 
            Vec3.multiply(calculatedProps.scaledDimensions, SUB_PADDING);
        var dimensions = 
            Vec3.multiply(calculatedProps.scaledDimensions, subNameScaler);

        // log("calculatedProps", calculatedProps);
        // log("lineheight", lineHeight);
        // log("dimensions", dimensions)
        
        avatar.subInitialLineHeight = lineHeight;
        avatar.subInitialDimensions = dimensions;

        localEntitySub
            // .add("lineHeight", calculatedProps.scaledDimensions.y * subNameScaler * LINE_HEIGHT_SCALER)
            .add("lineHeight", lineHeight)
            // .add("localPosition", [0, SUB_OFFSET[1] * calculatedProps.adjustedScaler * subNameScaler, 0])
            .add("localPosition", localPosition)
            .add("backgroundColor", SUB_BACKGROUND)
            .add("textColor", SUB_TEXTCOLOR)
            .add("parentID", localEntityMain.id)
            // .add("dimensions", Vec3.multiply(calculatedProps.scaledDimensions, subNameScaler))
            .add("dimensions", dimensions)
            // .add("leftMargin", DEFAULT_LEFT_SUB_MARGIN * subNameScaler)
            .create(true);
    };

// Request the username
AvatarListManager.prototype.getUN =
    function(uuid){
        log("calling for username")
        Users.requestUsernameFromID(uuid);
    };

// Get the current data for an avatar
AvatarListManager.prototype.getInfo = 
    function(uuid){
        var avatar = _this.avatars[uuid];
        // log("in get info with:", avatar);
        _this.avatars[uuid] = Object.assign({}, avatar, {avatarInfo: AvatarManager.getAvatar(uuid)});
        // log("### HEY THIS IS THE POSITION FROM GETiNFO",_this.avatars[uuid].avatarInfo.position);

        return _this;
    };

// Remove the avatar from the list
AvatarListManager.prototype.remove = 
    function (uuid){
        Script.clearInterval(_this.avatars[uuid].redrawTimeout);
        _this.avatars[uuid].redrawTimeout = null;
        _this.removeOverlay(uuid);
        delete _this.avatars[uuid];

        return _this;
    };

// Reset the avatar list
AvatarListManager.prototype.reset = 
    function(){
        _this.removeAllOverlays();
        _this.avatars = {};

        return _this;
    };
// Remove all the current overlays
AvatarListManager.prototype.removeAllOverlays = 
    function(){
        for (var uuid in _this.avatars) {
            _this.removeOverlay(uuid);
        }

        return _this;
    };

// Remove a single overlay
AvatarListManager.prototype.removeOverlay = 
    function(uuid){
        _this.avatars[uuid].localEntityMain.destroy();
        if (_this.avatars[uuid].localEntitySub) {
            _this.avatars[uuid].localEntitySub.destroy();
        }
        return _this;
    };

// Handler for the username call
AvatarListManager.prototype.handleUserName = 
    function(uuid, username){
        log("###$ username", username);
        log("UUID", uuid)
        if (username) {
            // log("_this.avatars", _this.avatars);
            var avatar = _this.avatars[uuid];
            var avatarInfo = avatar.avatarInfo;
            _this.avatars[uuid].avatarInfo.username = username;
            // console.log("about to get user info")
            _this.getInfoAboutUser(username);
            _this.makeSubName(uuid);
        }
    };

var FRIEND_BACKGROUND = [150, 255, 0];
AvatarListManager.prototype.handleFriend = 
    function(uuid){
        var localEntityMain = _this.avatars[uuid].localEntityMain;
        var localEntitySub = _this.avatars[uuid].localEntitySub;
        localEntityMain
            .edit("textColor", FRIEND_BACKGROUND);
        localEntitySub
            .edit("backgroundColor", FRIEND_BACKGROUND);
    };

AvatarListManager.prototype.maybeRemove =
    function (uuid) {
        if (uuid in _this.avatars) {
            _this.remove(uuid);
        }
    };

var METAVERSE_BASE = Account.metaverseServerURL;
var SAFETY_LIMIT = 400;
AvatarListManager.prototype.getInfoAboutUser = 
    function getInfoAboutUser(specificUsername) {
        // log("running get info about user");
        var url = METAVERSE_BASE + '/api/v1/users?filter=connections&per_page=' + SAFETY_LIMIT + '&search=' + encodeURIComponent(specificUsername);
        requestJSON(url, function (connectionsData) {
            // You could have (up to SAFETY_LIMIT connections whose usernames contain the specificUsername.
            // Search returns all such matches.
            // log("made it to callback");
            var users = connectionsData.users;
            // log("users", users)
            // log("specific user name", specificUsername);
            for (var i = 0; i < users.length; i++) {
                var user = users[i];
                if (user.username.toLowerCase() === specificUsername.toLowerCase() && user.connection === "friend") {
                    console.log("connection data:" + JSON.stringify(user));
                    var formattedSessionId = user.location.node_id || '';
                    if (formattedSessionId !== '' && formattedSessionId.indexOf("{") != 0) {
                        formattedSessionId = "{" + formattedSessionId + "}";
                    }
                    log("handling friend!!")
                    _this.handleFriend(formattedSessionId);
                }
            }
        });
    };

module.exports = AvatarListManager;