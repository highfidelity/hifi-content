var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
var LocalEntity = Script.require('./entityMaker.js?' + Date.now());
var entityProps = Script.require('./defaultOverlayProps.js?' + Date.now());
var textHelper = new (Script.require('./textHelper.js?' + Date.now()));
var request = Script.require('request').request;
var X = 0;
var Y = 1;
var Z = 2;
var HALF = 0.5;
var SHOULD_QUERY_ENTITY = true;
var CLEAR_ENTITY_EDIT_PROPS = true;
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


// properties to give new avatars added to the list
function NewAvatarProps(intersection){
    return {
        avatarInfo: null,
        created: null,
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
        previousName: null,
        localPositionOfIntersection: null,
        displayNameLength: 0,
        usernameLength: 0
    };
}


// Add a user to the list
function add(uuid, intersection){
    // User Doesn't exist so give them new props and save in the cache, get their current avatar info, and handle the different ways to get the username(friend or admin)
    if (!_this.avatars[uuid]) {
        _this.avatars[uuid] = new NewAvatarProps(intersection); 
        _this.getInfo(uuid);
        // _this.getUN(uuid);
    }

    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    // Save the created time to check if it needs to be deleted
    avatar.created = Date.now();
    avatar.intersection = intersection.intersection;

    // Save the intersection position local to the avatar in case we need it again
    avatar.localPositionOfIntersection = worldToLocal(avatar.intersection, avatarInfo.position, avatarInfo.orientation);

    // Add this avatar to the selected list
    _this.selectedAvatars[uuid] = true;

    // When the user clicks someone, we are either creating or showing a hidden nameTag
    _this.shouldShowOrCreate(uuid); 

    // Check to see if anyone is in the selected list now to see if we need to start the interval checking
    shouldToggleInterval();

    return _this;
}


// Convert a point from local to world location
function localToWorld(localOffset, framePosition, frameOrientation) {
    var worldOffset = Vec3.multiplyQbyV(frameOrientation, localOffset);
    return Vec3.sum(framePosition, worldOffset);
}


// Convert from world to local space
function worldToLocal(worldPosition, framePosition, frameOrientation) {
    var inverseFrameOrientation = Quat.inverse(frameOrientation);
    var worldOffset = Vec3.subtract(worldPosition, framePosition);
    return Vec3.multiplyQbyV(inverseFrameOrientation, worldOffset);
}


// Remove the avatar from the list
function remove(uuid){
    shouldDestoryOrHide(uuid);

    delete _this.selectedAvatars[uuid];
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


// Calculate our initial properties for either the main or the sub entity
var Z_SIZE = 0.01;
var MAIN_SCALER = 0.75;
var SUB_SCALER = 0.55;
var LINE_HEIGHT_SCALER = 0.99;
var DISTANCE_SCALER = 0.35; // Empirical value
var userScaler = 1.0;
var previousUserScaler = userScaler;
function calculateInitialProperties(uuid, type) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntity = null;
    var adjustedScaler = null;
    var textProps = null;
    var target = null;
    var distance = null;
    var dimensions = null;
    var lineHeight = null;
    var scaledDimensions = null;
    var localPositionOffset = null;
    var initialDimensions = null;

    // Handle if we are asking for the main or sub properties
    if (type === "main") {
        localEntity = avatar.localEntityMain;
        initialDimensions = avatar.mainInitialDimensions;
    } else {
        localEntity = avatar.localEntitySub;
        initialDimensions = avatar.subInitialDimensions;
    }

    // use the text helper to calculate what our dimensions for the text box should be
    textProps = localEntity.get(['text', 'lineHeight']);
    textHelper
        .setText(textProps.text)
        .setLineHeight(textProps.lineHeight);
    
    // Calculate the distance from the camera to the target avatar
    target = avatarInfo.position;    
    distance = _this.getDistance(uuid, target);
    
    // Adjust the distance by the distance scaler
    adjustedScaler = distance * DISTANCE_SCALER;
    // Get the new dimensions from the text helper
    dimensions = [textHelper.getTotalTextLength(), textProps.lineHeight, Z_SIZE];
    // Adjust the dimensions by the distance scaler
    scaledDimensions = Vec3.multiply(dimensions, adjustedScaler), 
    // Adjust those scaled dimensions by the main scaler or the sub scaler to control the general size
    scaledDimensions = Vec3.multiply(
        scaledDimensions,
        type === "main" ? MAIN_SCALER : SUB_SCALER
    );
    // Adjust the lineheight to be the new scaled dimensions Y 
    lineHeight = scaledDimensions[Y] * LINE_HEIGHT_SCALER;

    // Get the local position offset by adding Half the Y dimensions of the main with half the dimensions of the sub dimensions
    if (type === "sub") {
        var localEntityMainY = avatar.localEntityMain.get('dimensions', SHOULD_QUERY_ENTITY)[Y];
        var halfLocalEntityMainY = localEntityMainY * HALF;
        var halfScaledD = scaledDimensions[Y] * HALF;
        var totalHalfs = halfLocalEntityMainY + halfScaledD;
        localPositionOffset =
            [0, (-totalHalfs), 0];
    }

    return {
        distance: distance,
        scaledDimensions: scaledDimensions,
        lineHeight: lineHeight,
        localPositionOffset: localPositionOffset
    };
}


function handleSelect(uuid, intersection) {
    if (uuid in _this.selectedAvatars) {
        _this.remove(uuid);
    } else {
        _this.add(uuid, intersection);
    }    
}


// Handler for the username call
function handleUserName(uuid, username){
    // log("in handle user name");
    if (username) {
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;
        avatarInfo.username = username;
        avatar.usernameLength = username.length;
        _this.makeSubName(uuid, CREATE);
        _this.getInfoAboutUser(uuid);
    }
}


function handleUUIDChanged(){

}


var FRIEND_TEXT = "#FFFFFF";
var FRIEND_MAIN_BACKGROUND = "#3D3D3D";
var FRIEND_SUB_BACKGROUND = "#111111";

// var FRIEND_TEXT = [100, 255, 50];
function handleFriend(uuid, username) {
    // log("handle friend");
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    avatarInfo.username = username;
    avatar.usernameLength = username.length;

    var localEntityMain = avatar.localEntityMain;
    var localEntitySub = avatar.localEntitySub;
    
    localEntityMain
        .edit("textColor", FRIEND_TEXT)
        .edit("backgroundColor", FRIEND_MAIN_BACKGROUND);

    if (localEntitySub.id){         
        localEntitySub
            .edit("textColor", FRIEND_TEXT)
            .edit("backgroundColor", FRIEND_SUB_BACKGROUND)
    } else {
        _this.makeSubName(uuid, CREATE);
                 
        localEntitySub
            .edit("backgroundColor", FRIEND_SUB_BACKGROUND);

    }
}


function registerInitialScaler(initalScaler){
    userScaler = initalScaler;
    previousUserScaler = initalScaler;
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
    var localPositionOffset = null;

    initialDistance = avatar.initialDistance;
    currentDistance = avatar.currentDistance;
    
    if (type === "main") {
        localEntity = avatar.localEntityMain;
        initialDimensions = avatar.mainInitialDimensions;
    } else {
        localEntity = avatar.localEntitySub;
        initialDimensions = avatar.subInitialDimensions;
    }

    newDimensions = [
        (initialDimensions[X] / initialDistance) * currentDistance,
        (initialDimensions[Y] / initialDistance) * currentDistance,
        (initialDimensions[Z] / initialDistance) * currentDistance
    ];


    lineHeight = newDimensions[Y] * LINE_HEIGHT_SCALER;

    newDimensions = Vec3.multiply(newDimensions, userScaler); 
    lineHeight = lineHeight * userScaler;

    localEntity
        .add("lineHeight", lineHeight)
        .add("dimensions", newDimensions);
    
    if (type === "sub") {
        var subInitialLocalPositionOffsetY = avatar.subInitialLocalPositionOffset[Y];
        var newLocalPosition = (subInitialLocalPositionOffsetY / initialDistance) * currentDistance * userScaler;
        
        // if (userScaler !== previousUserScaler) {
            // newLocalPosition = newLocalPosition * userScaler;
        // }

        localPositionOffset =
            [0, newLocalPosition, 0];

        localEntity
            .add("localPositionOffset", localPositionOffset);
    }

    localEntity
        .sync();

}

function updateUserScaler(newUSerScaler){
    previousUserScaler = userScaler;
    userScaler = newUSerScaler;
    for (var avatar in _this.selectedAvatars) {
        log("avatar:", avatar);
        var avatarInfo = _this.avatars[avatar].avatarInfo;
        _this.reDraw(avatar, "main", true);
        
        if (avatarInfo.username) {
            _this.reDraw(avatar, "sub", true);
        }
    }
}


function maybeDelete(uuid){
    // log("in maybe delete");
    var avatar = _this.avatars[uuid];
    var createdTime = avatar.created;
    var currentTime = Date.now();
    var timeSinceCreated = currentTime - createdTime;
    // log('avatar name', avatar.displayName);
    // log('timeSinceCreated', timeSinceCreated);    
    if (timeSinceCreated > DELETE_TIMEOUT_MS) {
        return true;
    } else {
        return false;
    }
}


// makes sure clear interval exists before changing.
function maybeClearInterval(){
    if (_this.redrawTimeout) {
        Script.clearInterval(_this.redrawTimeout);
        _this.redrawTimeout = null;
    }
}

function updateName(uuid, name){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    avatar.localEntityMain;
    avatar.localEntitySub;
    avatar.localEntityMain.destroy();
    avatar.localEntitySub.destroy();

    avatar.localEntityMain = new LocalEntity('local').add(entityProps);
    avatar.localEntitySub = new LocalEntity('local').add(entityProps);
    var localOffset = avatar.localPositionOfIntersection;
    avatar.intersection = localToWorld(localOffset, avatarInfo.position, avatarInfo.orientation)
    _this.makeMainName(uuid, CREATE);
    _this.makeSubName(uuid, CREATE);
}

var MAX_DISTANCE_METERS = 0.1;
var DELETE_TIMEOUT_MS = 10000;
function maybeRedraw(uuid){
    _this.getInfo(uuid);
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    
    if (_this.maybeDelete(uuid)) {
        _this.remove(uuid);

        return;
    }

    _this.getDistance(uuid);
    var distanceDelta = Math.abs(avatar.currentDistance - avatar.previousDistance);

    if (distanceDelta < MAX_DISTANCE_METERS){
        return;
    }

    avatarInfo.displayName = avatarInfo.displayName === "" ? "anonymous" : avatarInfo.displayName;
    if (avatar.previousName !== avatarInfo.displayName) {
        log("previous name different");
        updateName(uuid, avatarInfo.displayName);
    } else {
        _this.reDraw(uuid, "main");
    }
    
    if (avatarInfo.username) {
        _this.reDraw(uuid, "sub");
    }
}


function maybeRemove(uuid) {
    if (uuid in _this.avatars) {
        _this.remove(uuid);
    }
}

function checkAllSelectedForRedraw(){
    for (var avatar in _this.selectedAvatars) {
        maybeRedraw(avatar);
    }
}


var REDRAW_TIMEOUT = 250;
function makeMainName(uuid, shouldCreate){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    var localEntityMain = avatar.localEntityMain;
    var calculatedProps = null;
    var position = null;
    var distance = null;
    var scaledDimensions = null;
    var lineHeight = null;

    // Get the intersection position for use later in redraw
    position = avatar.intersection;
    
    // Give the user an anonymous display name if the display name is empty
    avatarInfo.displayName = avatarInfo.displayName === "" ? "anonymous" : avatarInfo.displayName;

    // The check to see if should show or create 
    if (shouldCreate){
        localEntityMain.add("text", avatarInfo.displayName);

        // Returns back the properties we need based on what we are looking for and the distance from the avatar
        calculatedProps = _this.calculateInitialProperties(uuid, "main");
        distance = calculatedProps.distance;
        scaledDimensions = calculatedProps.scaledDimensions;
        lineHeight = calculatedProps.lineHeight;

        // Capture the inital dimensions, distance, and displayName in case we need to redraw
        avatar.mainInitialDimensions = scaledDimensions;
        avatar.initialDistance = distance;
        avatar.previousName = avatarInfo.displayName;

        // Multiply the new dimensions with the user selected scaler
        scaledDimensions = Vec3.multiply(scaledDimensions, userScaler);

        // Adjust the lineHeight
        lineHeight = lineHeight * userScaler;

        localEntityMain
            .add("lineHeight", lineHeight)
            .add("dimensions", scaledDimensions)
            .add("position", position)
            .add("parentID", uuid)
            .create(CLEAR_ENTITY_EDIT_PROPS);
    } else {
        // Get the position which is calculated from the initial local nametag position translated to new worldspace
        localEntityMain.edit("position", position);
        // Get all the latest info need to redraw
        _this.getInfo(uuid);
        _this.getDistance(avatar);
        // Redraw the main nametag and give a little time to show it
        _this.reDraw(uuid, "main");
        Script.setTimeout(function(){
            localEntityMain.show();
        }, REDRAW_TIMEOUT);
    }
}


// Make the smaller username when it is available
var SUB_BACKGROUND = "#1A1A1A";
var SUB_TEXTCOLOR = "#868481";
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
    var localPositionOffset = null;

    if (shouldCreate) {
        localEntitySub.add("text", avatarInfo.username);

        
        calculatedProps = _this.calculateInitialProperties(uuid, "sub");
        lineHeight = calculatedProps.lineHeight;
        scaledDimensions = calculatedProps.scaledDimensions;
        avatar.subInitialDimensions = scaledDimensions;

        scaledDimensions = Vec3.multiply(scaledDimensions, userScaler);
        lineHeight = lineHeight * userScaler;

        var subScaledX = scaledDimensions[X];
        var mainEntityX = localEntityMain.get('dimensions', true)[X];

        if (mainEntityX >= subScaledX) {
            var localEntityMainX = localEntityMain.get('dimensions', true)[X];
            var adjustedScale = [localEntityMainX, scaledDimensions[Y], scaledDimensions[Z]];
        } else {
            var adjustedScale = scaledDimensions;
            var currentMainDimensions = localEntityMain.get('dimensions', true);
            var newMainDimensions = [adjustedScale[X], currentMainDimensions[Y], currentMainDimensions[Z]];
            localEntityMain
                .add('dimensions', newMainDimensions)
                .sync();
            avatar.mainInitialDimensions = newMainDimensions;
        }

        distance = calculatedProps.distance;
        var localEntityMainY = avatar.localEntityMain.get('dimensions', SHOULD_QUERY_ENTITY)[Y];
        var halfLocalEntityMainY = localEntityMainY / 2;
        var halfScaledD = adjustedScale[Y] / 2;
        var totalHalfs = halfLocalEntityMainY + halfScaledD;
        localPositionOffset =
            [0, (-totalHalfs), 0];
        avatar.subInitialLocalPositionOffset = localPositionOffset;
        
        localEntitySub
            .add("lineHeight", lineHeight)
            .add("localPositionOffset", localPositionOffset)
            .add("backgroundColor", SUB_BACKGROUND)
            .add("textColor", SUB_TEXTCOLOR)
            .add("parentID", localEntityMain.id)
            .add("dimensions", adjustedScale)
            .create(true);
    } else {
        _this.reDraw(uuid, "sub");
        Script.setTimeout(function(){
            localEntitySub.show();
        }, REDRAW_TIMEOUT);
    }
   
}

var REDRAW_TIMEOUT = 250;
var SUB_BACKGROUND = "#1A1A1A";
var SUB_TEXTCOLOR = "#868481";
function makeNameTag(uuid, shouldCreate, type) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntityMain = avatar.localEntityMain;
    var localEntitySub = avatar.localEntitySub;
    var name = null;
    var localEntity = null;
    var calculatedProps = null;
    var position = null;
    var distance = null;
    var scaledDimensions = null;
    var lineHeight = null;
    var avatar = _this.avatars[uuid];
    var localEntityMain = avatar.localEntityMain;
    var localPositionOffset = null;
    var adjustedScale = null;
    var parentID = null;

    // Common values needed by both

    position = avatar.intersection;
    // Returns back the properties we need based on what we are looking for and the distance from the avatar
    calculatedProps = _this.calculateInitialProperties(uuid, type);
    distance = calculatedProps.distance;
    scaledDimensions = calculatedProps.scaledDimensions;
    lineHeight = calculatedProps.lineHeight;

    // Initial values specific to which type

    if (type === "main"){
        localEntity = localEntityMain;
        avatarInfo.displayName = avatarInfo.displayName === "" ? "anonymous" : avatarInfo.displayName;
        // Capture the inital dimensions, distance, and displayName in case we need to redraw
        avatar.previousDisplayName = avatarInfo.displayName;
        avatar.mainInitialDimensions = scaledDimensions;
        avatar.initialDistance = distance;
        name = avatarInfo.displayName;
        parentID = uuid;
    } else {
        localEntity = localEntitySub;
        avatar.subInitialDimensions = scaledDimensions;
        avatar.subInitialLocalPositionOffset = localPositionOffset;
        name = avatarInfo.username;
        parentID = localEntityMain.id;

        // Get the current x dimensions to see which one is bigger to know how to stretch out the names
        var subScaledX = scaledDimensions[X];
        var mainEntityX = localEntityMain.get('dimensions', CLEAR_ENTITY_EDIT_PROPS)[X];

        if (mainEntityX >= subScaledX) {
            // use the x dimensions of the main entity and the rest of the dimensions from calculated sub dimensions
            scaledDimensions = [mainEntityX, scaledDimensions[Y], scaledDimensions[Z]];
        } else {
            var currentMainDimensions = localEntityMain.get('dimensions', SHOULD_QUERY_ENTITY);
            // use the x dimensions of the sub entity and the rest of the dimensions from the calculated main dimensions
            var newMainDimensions = [scaledDimensions[X], currentMainDimensions[Y], currentMainDimensions[Z]];
            // Save the new inital dimensions for the main entity after it has been resized
            avatar.mainInitialDimensions = newMainDimensions;
            // Apply the new dimensions
            localEntityMain.edit('dimensions', newMainDimensions);                
        }
    }

    if (shouldCreate) {
        // Common values

        localEntity.add("text", name);
        // Multiply the new dimensions and line height with the user selected scaler
        scaledDimensions = Vec3.multiply(scaledDimensions, userScaler);
        lineHeight = lineHeight * userScaler;
        localEntity
            .add("lineHeight", lineHeight)
            .add("dimensions", scaledDimensions)
            .add("parentID", parentID);
    
        // Final values specific to which type

        if (type === "main") {
            localEntity
                .add("position", position);

        } else {
            localEntity
                .add("localPositionOffset", localPositionOffset)
                .add("backgroundColor", SUB_BACKGROUND)
                .add("textColor", SUB_TEXTCOLOR);
        }
        localEntity
            .create(CLEAR_ENTITY_EDIT_PROPS);

    } else {

        if (type === "main") {
            localEntityMain.edit("position", position);
            // Get the position which is calculated from the initial local nametag position translated to new worldspace
            // Get all the latest info need to redraw
            _this.getInfo(uuid);
            _this.getDistance(avatar);

        } else {
            localEntity
                .add("localPositionOffset", localPositionOffset)
                .add("backgroundColor", SUB_BACKGROUND)
                .add("textColor", SUB_TEXTCOLOR);
        }

        // Redraw the nametag and give a little time to show it
        _this.reDraw(uuid, type);
        Script.setTimeout(function(){
            localEntity.show();
        }, REDRAW_TIMEOUT);
    }
}


// Request the username
function getUN(uuid){
    if (_this.avatars[uuid].avatarInfo.username) {
        return;
    } else if (Users.canKick) {
        Users.requestUsernameFromID(uuid);
    } else {
        _this.getInfoAboutUser(uuid);
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


function getDistance(uuid) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var eye = Camera.position;
    var target = avatar.avatarInfo.position;

    avatar.previousDistance = avatar.currentDistance;
    avatar.currentDistance = Vec3.distance(target, eye);

    return avatar.currentDistance;
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
var REG_EX_FOR_ID_FORMATTING = /[\{\}]/g;
function getInfoAboutUser(uuid) {
    // log("running get info about users");
    var url = METAVERSE_BASE + '/api/v1/users?filter=connections&status=online';
    requestJSON(url, function (connectionsData) {
        var users = connectionsData.users;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.location && user.location.node_id === uuid.replace(REG_EX_FOR_ID_FORMATTING, "")) { 
                _this.handleFriend(uuid, user.username);
                break;
            }
        }
    });
}


// Reset the avatar list
function reset(){
    _this.removeAllOverlays();
    _this.avatars = {};
    shouldToggleInterval();

    return _this;
}


var CREATE = true;
var SHOW = false;
function shouldShowOrCreate(uuid){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntityMainID = avatar.localEntityMain.id;
    var localEntitySubID = avatar.localEntitySub.id;

    // If we have the display name entity, then we show it, if not then we create it.
    if (localEntityMainID) {
        _this.makeMainName(uuid, SHOW);
    } else {
        _this.makeMainName(uuid, CREATE);
    }

    // If we have both the display and username entity, then we show it.  If we have the mainID and also a username in the avatar info, then we create it.
    if (localEntityMainID && localEntitySubID) {
        _this.makeSubName(uuid, SHOW);
    } else if (localEntityMainID && avatarInfo.username) {
        _this.makeSubName(uuid, CREATE);
    }
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


AvatarListManager.prototype = {
    create: create,
    destroy: destroy,
    add: add, // uuid, intersection
    remove: remove, // uuid
    removeAllOverlays: removeAllOverlays,
    removeOverlay: removeOverlay, // uuid
    calculateInitialProperties: calculateInitialProperties,
    handleSelect: handleSelect, // uuid, intersection
    handleUserName: handleUserName, // uuid, username
    handleUUIDChanged: handleUUIDChanged, // ## todo
    handleFriend: handleFriend, // uuid
    reDraw: reDraw, // uuid, type
    maybeDelete: maybeDelete,
    maybeClearInterval: maybeClearInterval, // ## todo
    maybeRedraw: maybeRedraw, // uuid
    maybeRemove: maybeRemove, // uuid
    checkAllSelectedForRedraw: checkAllSelectedForRedraw,
    makeMainName: makeMainName, // uuid
    makeSubName: makeSubName, // uuid
    getUN: getUN, // uuid
    getInfo: getInfo, // uuid
    getDistance: getDistance,
    getInfoAboutUser: getInfoAboutUser, // uuid    
    registerInitialScaler: registerInitialScaler,
    reset: reset,
    shouldShowOrCreate: shouldShowOrCreate,
    updateUserScaler: updateUserScaler
};


module.exports = AvatarListManager;


/*

var DEFAULT_LEFT_MARGIN = 0.070;

Billboard

input
1. position
2. rotation
3. billboardMode
4. frustrumPos


avatarUp - GetUp on avatar orientation

cross of position - frustrum, avatarUp

glm conjugate = to quat = look at frustrumpos, position, avatarup

*/

// var box = Entities.addEntity({type: "Box", position: MyAvatar.position})

// Script.clearInterval(clearTimer);
// var handler = function(){
//     var position = Entities.getEntityProperties(box, 'position');
//     var rotation = rotateBillboard(position, Camera.frustum.position);
//     Entities.editEntity(box, {rotation: rotation});
// };
// var clearTimer = Script.setInterval(handler, 10);
