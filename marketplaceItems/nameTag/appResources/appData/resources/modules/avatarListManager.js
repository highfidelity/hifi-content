var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
var LocalEntity = Script.require('./entityMaker.js?' + Date.now());
var entityProps = Script.require('./defaultOverlayProps.js?' + Date.now());
var textHelper = new (Script.require('./textHelper.js?' + Date.now()));
var request = Script.require('request').request;
var X = 0;
var Y = 1;
var Z = 2;

var _this;

function AvatarListManager(){
    _this = this;
    _this.avatars = {};
    _this.selectedAvatars = {};
    _this.redrawTimeout = null;
}


// Create the manager and hook up username signal
function create(){
    Users.usernameFromIDReply.connect(_this.handleUserName);

    return _this;
}


// Destory the manager and disconnect from username signal
function destroy(){
    Users.usernameFromIDReply.disconnect(_this.handleUserName);
    _this.reset();

    return _this;
}

// Add a user to the manager
function add(uuid, intersection){
    if (!_this.avatars[uuid]) {
        _this.avatars[uuid] = {
            avatarInfo: null,
            localEntityMain: new LocalEntity('local')
                .add(entityProps),
            localEntitySub: new LocalEntity('local')
                .add(entityProps),
            intersection: intersection.intersection, 
            lastDistance: null,
            previousDistance: null,
            currentDistance: null,
            initialDistance: null,
            mainInitialDimensions: null,
            subInitialDimensions: null,
            created: null
        };
        _this.getInfo(uuid);
        _this.getUN(uuid);
    }

    _this.selectedAvatars[uuid] = true;
    _this.shouldShowOrCreate(uuid, intersection);
    shouldToggleInterval();

    return _this;
}

var DESTROY = true;
var HIDE = false;
function shouldDestoryOrHide(uuid){
    var avatar = _this.avatars[uuid];
    if (avatar) {
        _this.removeOverlay(uuid, HIDE);
    } else {
        _this.removeOverlay(uuid, DESTROY);
    }
}

var CREATE = true;
var SHOW = false;
function shouldShowOrCreate(uuid, intersection){
    log("should show or create")
    var localEntityMainID = _this.avatars[uuid].localEntityMain.id;
    var localEntitySubID = _this.avatars[uuid].localEntitySub.id;
    log("localEntityMainID", localEntityMainID);
    if (localEntityMainID) {
        log("should show");
        _this.makeMainName(uuid, intersection, SHOW);
    } else {
        log("should create");
        _this.makeMainName(uuid, intersection, CREATE);
    }

    if (localEntityMainID && localEntitySubID) {
        _this.makeSubName(uuid, SHOW);
    } else if (localEntityMainID) {
        _this.makeSubName(uuid, CREATE);
    }
}


function shouldToggleInterval(){
    var currentNumberOfAvatarsSelected = Object.keys(_this.selectedAvatars).length;

    if (currentNumberOfAvatarsSelected === 0 && _this.redrawTimeout) {
        toggleInterval();
        return;
    }

    if (currentNumberOfAvatarsSelected > 0 && !_this.redrawTimeout) {
        toggleInterval();
        return; 
    }
}


function handleUUIDChanged(){

}


// makes sure clear interval exists before changing.
function maybeClearInterval(){
    if (_this.redrawTimeout) {
        Script.clearInterval(_this.redrawTimeout);
        _this.redrawTimeout = null;
    }
}


var Z_SIZE = 0.1;
var SUB_OFFSET = -0.175;
var MAIN_SCALER = 0.75;
var SUB_SCALER = 0.55;
var LINE_HEIGHT_SCALER = 0.95;
var DISTANCE_SCALER = 0.35;
function calculateInitialProperties(uuid, type) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntity;
    var adjustedScaler = null;
    var textProps = null;
    var target = null;
    var distance = null;
    var dimensions = null;
    var lineHeight = null;
    var scaledDimensions = null;
    var localPosition = null;
    var initialDimensions = null;

    if (type === "main") {
        localEntity = avatar.localEntityMain;
        initialDimensions = avatar.mainInitialDimensions;
    } else {
        localEntity = avatar.localEntitySub;
        initialDimensions = avatar.subInitialDimensions;
    }

    textProps = localEntity.get(['text', 'lineHeight']);
    textHelper
        .setText(textProps.text)
        .setLineHeight(textProps.lineHeight);
    
    target = avatarInfo.position;    
    distance = _this.getDistance(avatar, target);
    adjustedScaler = distance * DISTANCE_SCALER;
    dimensions = [textHelper.getTotalTextLength(), textProps.lineHeight, Z_SIZE];
    scaledDimensions = Vec3.multiply(
        Vec3.multiply(dimensions, adjustedScaler), 
        type === "main" ? MAIN_SCALER : SUB_SCALER
    );
    lineHeight = scaledDimensions.y * LINE_HEIGHT_SCALER;
    
    if (type === "sub") {
        localPosition =
            [0, SUB_OFFSET * adjustedScaler * SUB_SCALER, 0];
    }

    return {
        distance: distance,
        scaledDimensions: scaledDimensions,
        lineHeight: lineHeight,
        localPosition: localPosition
    };
}

function getDistance(avatar) {
    var eye = Camera.position;
    var target = avatar.avatarInfo.position;

    avatar.previousDistance = avatar.currentDistance;
    avatar.currentDistance = Vec3.distance(target, eye);

    return avatar.currentDistance;
}

var REDRAW_TIMEOUT = 25;
function makeMainName(uuid, intersection, shouldCreate){
    log("made it to makeMainName")
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    var localEntityMain = avatar.localEntityMain;
    var calculatedProps = null;
    var position = null;
    var distance = null;
    var scaledDimensions = null;
    var lineHeight = null;

    position = intersection.intersection;
    avatar.created = Date.now();
    
    if (shouldCreate){
        log("creating");
        localEntityMain.add("text", avatarInfo.displayName);

        calculatedProps = _this.calculateInitialProperties(uuid, "main");
        lineHeight = calculatedProps.lineHeight;
        scaledDimensions = calculatedProps.scaledDimensions;
        distance = calculatedProps.distance;
        avatar.initialDistance = distance;
        avatar.mainInitialDimensions = scaledDimensions;
    
        localEntityMain
            .add("lineHeight", lineHeight)
            .add("dimensions", scaledDimensions)
            .add("position", position)
            .add("parentID", uuid)
            .create(true);

    } else {
        log("showing");
        localEntityMain.edit("position", position);
        _this.getInfo(uuid);
        _this.getDistance(avatar);
        _this.reDraw(uuid, "main");
        Script.setTimeout(function(){
            localEntityMain.show();
        }, REDRAW_TIMEOUT);
    }

}


// Make the smaller username when it is available
var SUB_BACKGROUND = [0, 0, 0];
var SUB_TEXTCOLOR = [255 ,150,255];
var SUB_PADDING = 1.0;
var DEFAULT_LEFT_SUB_MARGIN = 0.03;
function makeSubName(uuid, shouldCreate){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;      
    var localEntityMain = avatar.localEntityMain;
    var localEntitySub = avatar.localEntitySub;
    var calculatedProps = null;
    var distance = null;
    var scaledDimensions = null;
    var lineHeight = null;
    var localPosition = null;

    if (shouldCreate) {
        localEntitySub.add("text", avatarInfo.username);

        calculatedProps = _this.calculateInitialProperties(uuid, "sub");
        lineHeight = calculatedProps.lineHeight;
        scaledDimensions = calculatedProps.scaledDimensions;
        distance = calculatedProps.distance;
        localPosition = calculatedProps.localPosition;
    
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
    } else {
        _this.reDraw(uuid, "sub");
        Script.setTimeout(function(){
            localEntitySub.show();
        }, REDRAW_TIMEOUT);
    }
   
}


function handleSelect(uuid, intersection) {
    if (uuid in _this.selectedAvatars) {
        _this.remove(uuid);
    } else {
        _this.add(uuid, intersection);
    }    
}


// Handle redrawing if needed
function reDraw(uuid, type){
    var avatar = _this.avatars[uuid];
    var localEntity;
    var initialDimensions = null;
    var initialDistance = null;
    var currentDistance = null;
    var newDimensions = null;
    var lineHeight = null;
    var adjustedScaler = null;
    var localPosition = null;

    initialDistance = avatar.initialDistance;
    currentDistance = avatar.currentDistance;
    
    if (type === "main") {
        localEntity = avatar.localEntityMain;
        initialDimensions = avatar.mainInitialDimensions;
    } else {
        localEntity = avatar.localEntitySub;
        initialDimensions = avatar.subInitialDimensions;
    }

    log("initial dimensions", initialDimensions)
    log("initialDistance", initialDistance)
    log("currentDistance", currentDistance)

    newDimensions = [
        (initialDimensions[X] / initialDistance) * currentDistance,
        (initialDimensions[Y] / initialDistance) * currentDistance,
        (initialDimensions[Z] / initialDistance) * currentDistance
    ];

    lineHeight = newDimensions[Y] * LINE_HEIGHT_SCALER;

    adjustedScaler = currentDistance * DISTANCE_SCALER;

    localEntity
        .add("lineHeight", lineHeight)
        .add("dimensions", newDimensions);

    if (type === "sub") {
        localPosition =
            [0, SUB_OFFSET * adjustedScaler * SUB_SCALER, 0];
        localEntity
            .add("localPosition", localPosition);
    }

    log('running sync')
    localEntity
        .sync();
}


var MAX_DISTANCE_METERS = 0.01;
var DELETE_TIMEOUT_MS = 1000;
function maybeRedraw(uuid){
    _this.getInfo(uuid);
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    
    if (_this.maybeDelete(uuid)) {
        _this.removeOverlay(uuid);

        return;
    }

    _this.getDistance(avatar);
    var distanceDelta = Math.abs(avatar.currentDistance - avatar.previousDistance);

    if (distanceDelta < MAX_DISTANCE_METERS){
        return;
    }

    _this.reDraw(uuid, "main");
    
    if (avatarInfo.username) {
        _this.reDraw(uuid, "sub");
    }
}

function maybeDelete(uuid){
    log("in maybe delete");
    var avatar = _this.avatars[uuid];
    var createdTime = avatar.created;
    var currentTime = Date.now();
    var timeSinceCreated = currentTime - createdTime;

    if (timeSinceCreated > DELETE_TIMEOUT_MS) {
        return true;
    } else {
        return false;
    }

}

function checkAllSelectedForRedraw(){
    for (var avatar in _this.selectedAvatars) {
        maybeRedraw(avatar);
    }
}


// Turn off and on the redraw check
var INTERVAL_CHECK_MS = 100;
function toggleInterval(){
    if (_this.redrawTimeout){
        maybeClearInterval();
    } else {
        _this.redrawTimeout = 
            Script.setInterval(_this.checkAllSelectedForRedraw, INTERVAL_CHECK_MS);
    }
}


// Request the username
function getUN(uuid){
    if (_this.avatars[uuid].avatarInfo.username) {
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
    shouldDestoryOrHide(uuid);

    delete _this.selectedAvatars[uuid];
    shouldToggleInterval();
    
    return _this;
}


// Reset the avatar list
function reset(){
    _this.removeAllOverlays();
    _this.avatars = {};
    shouldToggleInterval();

    return _this;
}


// Remove all the current overlays
function removeAllOverlays(){
    for (var uuid in _this.selectedAvatars) {
        _this.removeOverlay(uuid);
        delete _this.selectedAvatars[uuid];
    }

    return _this;
}


// Remove a single overlay
function removeOverlay(uuid, shouldDestory){
    var type = shouldDestory ? 'destroy' : 'hide';

    _this.avatars[uuid].localEntityMain[type]();
    if (_this.avatars[uuid].localEntitySub) {
        _this.avatars[uuid].localEntitySub[type]();
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
        _this.makeSubName(uuid, CREATE);
    }
}


var FRIEND_BACKGROUND = [150, 255, 0];
function handleFriend(uuid){
    var localEntityMain = _this.avatars[uuid].localEntityMain;
    var localEntitySub = _this.avatars[uuid].localEntitySub;
    localEntityMain
        .edit("textColor", FRIEND_BACKGROUND);
    localEntitySub
        .edit("backgroundColor", FRIEND_BACKGROUND);
}


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
}


AvatarListManager.prototype = {
    create: create,
    destroy: destroy,
    add: add, // uuid, intersection
    calculateInitialProperties: calculateInitialProperties,
    handleSelect: handleSelect, // uuid, intersection
    handleUserName: handleUserName, // uuid, username
    handleUUIDChanged: handleUUIDChanged, // ## todo
    handleFriend: handleFriend, // uuid
    checkAllSelectedForRedraw: checkAllSelectedForRedraw,
    reDraw: reDraw, // uuid, type
    maybeRedraw: maybeRedraw, // uuid
    // maybeRemove: maybeRemove, // uuid
    makeMainName: makeMainName, // uuid
    makeSubName: makeSubName, // uuid
    maybeDelete: maybeDelete,
    maybeClearInterval: maybeClearInterval, // ## todo
    getUN: getUN, // uuid
    getInfo: getInfo, // uuid
    getDistance: getDistance,
    remove: remove, // uuid
    reset: reset,
    removeAllOverlays: removeAllOverlays,
    removeOverlay: removeOverlay, // uuid
    getInfoAboutUser: getInfoAboutUser, // uuid
    shouldShowOrCreate: shouldShowOrCreate
};

module.exports = AvatarListManager;



var DEFAULT_LEFT_MARGIN = 0.070;

function maybeRemove(uuid) {
    if (uuid in _this.avatars) {
        _this.remove(uuid);
    }
}

