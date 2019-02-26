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
function create(){
    Users.usernameFromIDReply.connect(_this.handleUserName);

    return _this;
}

// Destory the manager and disconnect from username signal
AvatarListManager.prototype.destroy =
    function(){
        Users.usernameFromIDReply.disconnect(_this.handleUserName);
        _this.reset();
        return _this;
    };

// Add a user to the manager
var MAIN_SCALER = 0.75;
var INTERVAL_CHECK_MS = 100;
var DEFAULT_LEFT_MARGIN = 0.070;
var LINE_HEIGHT_SCALER = 1.0;
var DISTANCE_SCALER = 0.35;
function add(uuid, intersection){
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
        previousDistance: null,
        currentDistance: null,
        initialDistance: null,
        mainInitialDimensions: null,
        subInitialDimensions: null
    };

    _this.getInfo(uuid);
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntityMain = avatar.localEntityMain;

    localEntityMain.add("text", avatarInfo.displayName);

    var textProps = localEntityMain.get(['text', 'lineHeight']);
    var position = 
        intersection.intersection;
    textHelper
        .setText(textProps.text)
        .setLineHeight(textProps.lineHeight);
    
    var eye = Camera.position;
    var target = avatarInfo.position;
    var distance = Vec3.distance(target, eye);
    avatar.previousDistance = distance;
    var adjustedScaler = distance * DISTANCE_SCALER;
    var dimensions = [textHelper.getTotalTextLength(), textProps.lineHeight, 0.1];
    var scaledDimensions = Vec3.multiply(
        Vec3.multiply(dimensions, adjustedScaler), 
        MAIN_SCALER);
    var lineHeight = scaledDimensions.y * LINE_HEIGHT_SCALER;

    avatar.initialDistance = distance;
    avatar.mainInitialDimensions = scaledDimensions; 
    localEntityMain
        .add("lineHeight", lineHeight)
        .add("dimensions", scaledDimensions)
        .add("position", position)
        .add("parentID", uuid)
        // .add("leftMargin", DEFAULT_LEFT_MARGIN * MAIN_SCALER)
        .create(true);

    _this.getUN(uuid);

    avatar.redrawTimeout = Script.setInterval(function(){
        _this.maybeRedraw(uuid);
    }, INTERVAL_CHECK_MS, uuid);
    return _this;
}

 
function handleSelect(uuid, intersection) {
    if (uuid in _this.avatars) {
        _this.remove(uuid);
    } else {
        _this.add(uuid, intersection);
    }    
}


function reDraw(uuid, type){
    var avatar = _this.avatars[uuid];
    var localEntity;
    var initialDimensions = null;
    var initialDistance = null;
    var currentDistance = null;
    var newDimensions = null;
    var lineHeight = null;

    if (type === "main") {
        localEntity = avatar.localEntityMain;
        initialDimensions = avatar.mainInitialDimensions;
        initialDistance = avatar.initialDistance;
        currentDistance = avatar.currentDistance;
        newDimensions = [
            (initialDimensions[X] / initialDistance) * currentDistance,
            (initialDimensions[Y] / initialDistance) * currentDistance,
            (initialDimensions[Z] / initialDistance) * currentDistance
        ];

        lineHeight = newDimensions[Y] * LINE_HEIGHT_SCALER;
        localEntity
            .add("lineHeight", lineHeight)
            .add("dimensions", newDimensions)
            .sync();

    } else {
        log('making sub');
        localEntity = avatar.localEntitySub;

        initialDimensions = avatar.subInitialDimensions;
        initialDistance = avatar.initialDistance;
        currentDistance = avatar.currentDistance;
        newDimensions = [
            (initialDimensions[X] / initialDistance) * currentDistance,
            (initialDimensions[Y] / initialDistance) * currentDistance,
            (initialDimensions[Z] / initialDistance) * currentDistance
        ];
        var adjustedScaler = currentDistance * DISTANCE_SCALER;

        lineHeight = newDimensions[Y] * LINE_HEIGHT_SCALER;
        var localPosition = 
            [0, SUB_OFFSET * adjustedScaler * SUB_NAME_SCALER, 0];
        localEntity
            .add("lineHeight", lineHeight)
            .add("dimensions", newDimensions)
            .add("localPosition", localPosition)
            .sync();
    }
}

var MAX_DISTANCE_METERS = 0.01;
function maybeRedraw(uuid){
    _this.getInfo(uuid);
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    var eye = Camera.position;
    var target = avatarInfo.position;
    avatar.previousDistance = avatar.currentDistance;
    avatar.currentDistance = Vec3.distance(target, eye);
    var distanceDelta = Math.abs(avatar.currentDistance - avatar.previousDistance);

    if (distanceDelta < MAX_DISTANCE_METERS){
        return;
    }

    _this.reDraw(uuid, "main");
    
    if (avatarInfo.username) {
        _this.reDraw(uuid, "sub");
    }
}

// Make the smaller username when it is available
var SUB_OFFSET = -0.175;
var SUB_BACKGROUND = [0, 0, 0];
var SUB_TEXTCOLOR = [255 ,150,255];
var SUB_NAME_SCALER = 0.55;
var SUB_PADDING = 1.0;
var DEFAULT_LEFT_SUB_MARGIN = 0.03;
function makeSubName(uuid){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;      

    var localEntityMain = avatar.localEntityMain;
    var localEntitySub = avatar.localEntitySub;

    localEntitySub.add("text", avatarInfo.username);

    var textProps = localEntitySub.get(['text', 'lineHeight']);

    textHelper
        .setText(textProps.text)
        .setLineHeight(textProps.lineHeight);
    
    var eye = Camera.position;
    var target = avatarInfo.position;
    var distance = Vec3.distance(target, eye);

    var adjustedScaler = distance * DISTANCE_SCALER;
    var dimensions = [textHelper.getTotalTextLength(), textProps.lineHeight, 0.1];
    var scaledDimensions = Vec3.multiply(
        Vec3.multiply(dimensions, adjustedScaler), 
        SUB_NAME_SCALER);
    var lineHeight = scaledDimensions.y * LINE_HEIGHT_SCALER; 
    var localPosition = [0, SUB_OFFSET * adjustedScaler * SUB_NAME_SCALER, 0];
    
    avatar.subInitialLineHeight = lineHeight;
    avatar.subInitialDimensions = scaledDimensions;
    avatar.subInitialLocalPosition = localPosition;

    localEntitySub
        .add("lineHeight", lineHeight)
        .add("localPosition", localPosition)
        .add("backgroundColor", SUB_BACKGROUND)
        .add("textColor", SUB_TEXTCOLOR)
        .add("parentID", localEntityMain.id)
        .add("dimensions", scaledDimensions)
        .create(true);
}

// Request the username

function getUN(uuid){
    if(_this.avatars[uuid].avatarInfo.username) {
        return;
    } else if (Users.canKick) {
        Users.requestUsernameFromID(uuid);
    } else {
        // query metavers
        // iterate location.nodeid matches uuid
        // data.users[n].location.node_id;
    }
}

// Get the current data for an avatar
function getInfo(uuid){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    var newAvatarInfo = AvatarManager.getAvatar(uuid);
    var combinedAvatarInfo = Object.assign({}, newAvatarInfo, {username: avatarInfo === null ? null : avatarInfo.username });
    _this.avatars[uuid] = Object.assign({}, avatar, {avatarInfo: combinedAvatarInfo});

    return _this;
}

// Remove the avatar from the list
function remove(uuid){
    Script.clearInterval(_this.avatars[uuid].redrawTimeout);
    _this.avatars[uuid].redrawTimeout = null;
    _this.removeOverlay(uuid);
    delete _this.avatars[uuid];

    return _this;
}

// Reset the avatar list
function reset(){
    _this.removeAllOverlays();
    _this.avatars = {};

    return _this;
}
// Remove all the current overlays
function removeAllOverlays(){
    for (var uuid in _this.avatars) {
        _this.removeOverlay(uuid);
    }

    return _this;
}

// Remove a single overlay
function removeOverlay(uuid){
    _this.avatars[uuid].localEntityMain.destroy();
    if (_this.avatars[uuid].localEntitySub) {
        _this.avatars[uuid].localEntitySub.destroy();
    }
    return _this;
}

// Handler for the username call
function handleUserName(uuid, username){
    if (username) {
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;
        avatarInfo.username = username;
        _this.getInfoAboutUser(username);
        _this.makeSubName(uuid);
    }
};

var FRIEND_BACKGROUND = [150, 255, 0];
function handleFriend(uuid){
    var localEntityMain = _this.avatars[uuid].localEntityMain;
    var localEntitySub = _this.avatars[uuid].localEntitySub;
    localEntityMain
        .edit("textColor", FRIEND_BACKGROUND);
    localEntitySub
        .edit("backgroundColor", FRIEND_BACKGROUND);
};

function maybeRemove(uuid) {
    if (uuid in _this.avatars) {
        _this.remove(uuid);
    }
};

var METAVERSE_BASE = Account.metaverseServerURL;
function getInfoAboutUser(uuid) {
    var url = METAVERSE_BASE + '/api/v1/users?filter=connections&status=online';
    requestJSON(url, function (connectionsData) {
        var users = connectionsData.users;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.location && user.location.node_id === uuid) {
                _this.handleFriend(uuid, user.username);
            }
        }
    });
};

AvatarListManager.prototype = {
    create: create,
    add: add, // uuid, intersection
    handleSelect: handleSelect, // uuid, intersection
    reDraw: reDraw, // uuid, type
    maybeRedraw: maybeRedraw, // uuid
    makeSubName: makeSubName, // uuid
    getUN: getUN, // uuid
    getInfo: getInfo, // uuid
    remove: remove, // uuid
    reset: reset,
    removeAllOverlays: removeAllOverlays,
    removeOverlay: removeOverlay, // uuid
    handleUserName: handleUserName, // uuid, username
    handleFriend: handleFriend, // uuid
    maybeRemove: maybeRemove, // uuid
    getInfoAboutUser: getInfoAboutUser // uuid
}

module.exports = AvatarListManager;


AvatarListManager.prototype.calculateNewScaledProperties =
    function(uuid, type){
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;
        var eye = Camera.position;
        var target = avatarInfo.position;
        var distance = Vec3.distance(target, eye);
        var adjustedScaler = null;
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
            initialDistance = avatar.mainInitialDistance;
        } else {
            localEntity = avatar.localEntitySub;
            initialLineHeight = avatar.subInitialLineHeight;
            initialDimensions = avatar.subInitialDimensions;
            initialDistance = avatar.subInitialDistance;
        }

        avatar.lastDistanceFromCamera = distance;
        
        if (initialLineHeight === null && initialDimensions === null) {
            // log("### made it to 1")
            var textProps = localEntity.get(['text', 'lineHeight']);
            // log("textProps", textProps)
            textHelper
                .setText(textProps.text)
                .setLineHeight(textProps.lineHeight);
            currentDimensions = [textHelper.getTotalTextLength(), textProps.lineHeight, 0.1];
            adjustedScaler = distance * DISTANCE_SCALER;
            scaledDimensions = Vec3.multiply(currentDimensions, adjustedScaler);

        } else {
            // log("### made it to 2")
            // var adjustedDistance = distance - initialDistance;
            // var adjustedDistance =  Math.abs(initialDistance - distance);
            // log("original distance", distance);
            // log("adjustedDistance", adjustedDistance);
            // log("abs both", Math.abs(distance - initialDistance));
            // log("abs individusal", Math.abs(distance) - Math.abs(initialDistance));
            // adjustedScaler = (initialDistance * DISTANCE_SCALER) + (distance * DISTANCE_SCALER);
            // adjustedScaler = (initialDistance + distance ) * DISTANCE_SCALER;
            // adjustedScaler = (initialDistance - distance ) * DISTANCE_SCALER;
            // adjustedScaler = (Math.abs(initialDistance - distance) + initialDistance) * DISTANCE_SCALER;
            // log(adjustedScaler);
        }
        
        return {
            scaledDimensions: scaledDimensions,
            adjustedScaler: adjustedScaler,
            distance: distance
        };
    };