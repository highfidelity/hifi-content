/*

    Nametag
    nameTagListManager.js
    Created by Milad Nazeri on 2019-03-09
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Helps manage the list of avatars added to the nametag list

*/
var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')

var LocalEntity = Script.require('./entityMaker.js?' + Date.now());
var entityProps = Script.require('./defaultLocalEntityProps.js?' + Date.now());
var textHelper = new (Script.require('./textHelper.js?' + Date.now()));
var request = Script.require('request').request;
var X = 0;
var Y = 1;
var Z = 2;
var HALF = 0.5;
var SHOULD_QUERY_ENTITY = true;
var CLEAR_ENTITY_EDIT_PROPS = true;

// *************************************
// START UTILTY
// *************************************
// #region UTILTY


// properties to give new avatars added to the list
function NewAvatarProps(intersection) {
    return {
        avatarInfo: null,
        created: null,
        localEntityMain: new LocalEntity('local')
            .add(entityProps),
        localEntitySub: new LocalEntity('local')
            .add(entityProps),
        intersection: intersection.intersection,
        previousDistance: null,
        currentDistance: null,
        initialDistance: null,
        mainInitialDimensions: null,
        subInitialDimensions: null,
        previousName: null,
        localPositionOfIntersection: null,
        subInitialLocalPositionOffset: null
    };
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


// Request wrapper for the url endpoint
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


// Add a user to the list.
function add(uuid, intersection){
    // User Doesn't exist so give them new props and save in the cache, get their current avatar info, and handle the different ways to get the username(friend or admin)
    if (!_this.avatars[uuid]) {
        _this.avatars[uuid] = new NewAvatarProps(intersection); 
        getAvatarData(uuid);
        getUN(uuid);
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
    shouldShowOrCreate(uuid); 

    // Check to see if anyone is in the selected list now to see if we need to start the interval checking
    shouldToggleInterval();

    return _this;
}


// Remove the avatar from the list.
function remove(uuid){
    shouldDestoryOrHide(uuid);

    delete _this.selectedAvatars[uuid];
    shouldToggleInterval();
    
    return _this;
}


// Remove all the current LocalEntities.
function removeAllLocalEntities(){
    for (var uuid in _this.selectedAvatars) {
        removeLocalEntity(uuid);
        delete _this.selectedAvatars[uuid];
    }

    return _this;
}


// Remove a single LocalEntity.
function removeLocalEntity(uuid, shouldDestory){
    var avatar = _this.avatars[uuid];

    var type = shouldDestory ? 'destroy' : 'hide';

    avatar.localEntityMain[type]();
    if (avatar.localEntitySub) {
        avatar.localEntitySub[type]();
    }

    return _this;
}


// Handler for the username call.
function handleUserName(uuid, username) {
    if (username) {
        var avatar = _this.avatars[uuid];
        var avatarInfo = avatar.avatarInfo;

        avatarInfo.username = username.trim();
        makeNameTag(uuid, CREATE, "sub");
        // Check to see if they are also a friend
        getInfoAboutUser(uuid);
    }
}


// Update the look of the nametags if the user is your friend.
var FRIEND_TEXT = "#FFFFFF";
var FRIEND_MAIN_BACKGROUND = "#3D3D3D";
var FRIEND_SUB_BACKGROUND = "#111111";
function handleFriend(uuid, username) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntityMain = avatar.localEntityMain;
    var localEntitySub = avatar.localEntitySub;

    avatarInfo.username = username.trim();

    localEntityMain
        .edit("textColor", FRIEND_TEXT)
        .edit("backgroundColor", FRIEND_MAIN_BACKGROUND);

    if (localEntitySub.id) {
        localEntitySub
            .edit("textColor", FRIEND_TEXT)
            .edit("backgroundColor", FRIEND_SUB_BACKGROUND);
    } else {
        // You aren't an admin so this is the first time we are making a sub nametag
        makeNameTag(uuid, CREATE, "sub");

        localEntitySub
            .edit("backgroundColor", FRIEND_SUB_BACKGROUND);
    }
}


// Calculate where the suboffset should be placed.
function getLocalPositionOffset(main, sub){
    var halfLocalEntityMainY = main[Y] * HALF;
    var halfScaledD = sub[Y] * HALF;
    var totalHalfs = halfLocalEntityMainY + halfScaledD;
    return -totalHalfs;
}


// Check to see if the time since created for the name tag needs to be deleted.
function maybeDelete(uuid){
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


// Makes sure clear interval exists before changing.
function maybeClearInterval(){
    if (_this.redrawTimeout) {
        Script.clearInterval(_this.redrawTimeout);
        _this.redrawTimeout = null;
    }
}


// Calculate our initial properties for either the main or the sub entity.
var Z_SIZE = 0.01;
var MAIN_SCALER = 0.75;
var SUB_SCALER = 0.55;
var LINE_HEIGHT_SCALER = 0.99;
var DISTANCE_SCALER = 0.35; // Empirical value
var userScaler = 1.0;
var DEFAULT_LINE_HEIGHT = entityProps.lineHeight;
function calculateInitialProperties(uuid, type) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntity = null;
    var adjustedScaler = null;
    var target = null;
    var distance = null;
    var dimensions = null;
    var lineHeight = null;
    var scaledDimensions = null;
    var name = null;

    // Handle if we are asking for the main or sub properties
    if (type === "main") {
        localEntity = avatar.localEntityMain;
        name = avatarInfo.displayName;
    } else {
        localEntity = avatar.localEntitySub;
        name = avatarInfo.username;
    }

    // Use the text helper to calculate what our dimensions for the text box should be
    textHelper
        .setText(name)
        .setLineHeight(DEFAULT_LINE_HEIGHT);

    // Calculate the distance from the camera to the target avatar
    target = avatarInfo.position;    
    distance = getDistance(uuid, target);
    
    // Adjust the distance by the distance scaler
    adjustedScaler = distance * DISTANCE_SCALER;
    // Get the new dimensions from the text helper
    dimensions = [textHelper.getTotalTextLength(), DEFAULT_LINE_HEIGHT, Z_SIZE];
    // Adjust the dimensions by the modified distance scaler
    scaledDimensions = Vec3.multiply(dimensions, adjustedScaler);

    // Adjust those scaled dimensions by the main scaler or the sub scaler to control the general size
    scaledDimensions = Vec3.multiply(
        scaledDimensions,
        type === "main" ? MAIN_SCALER : SUB_SCALER
    );
    
    // Adjust the lineheight to be the new scaled dimensions Y 
    lineHeight = scaledDimensions[Y] * LINE_HEIGHT_SCALER;

    return {
        distance: distance,
        scaledDimensions: scaledDimensions,
        lineHeight: lineHeight
    };
}


// Create or make visible either the sub or the main tag.
var REDRAW_TIMEOUT = 100;
var SUB_BACKGROUND = "#1A1A1A";
var SUB_TEXTCOLOR = "#868481";
var LEFT_MARGIN_SCALER = 0.15;
var RIGHT_MARGIN_SCALER = 0.10;
var TOP_MARGIN_SCALER = 0.07;
var BOTTOM_MARGIN_SCALER = 0.01;
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
    var localPositionOffset = null;
    var parentID = null;

    // Make sure an anonymous name is covered before sending to calculate
    if (type === "main") {
        avatarInfo.displayName = avatarInfo.displayName === "" ? "anonymous" : avatarInfo.displayName.trim();
        avatar.previousName = avatarInfo.displayName;
        position = avatar.intersection;
    }

    // Common values needed by both

    // Returns back the properties we need based on what we are looking for and the distance from the avatar
    calculatedProps = calculateInitialProperties(uuid, type);
    distance = calculatedProps.distance;
    scaledDimensions = calculatedProps.scaledDimensions;
    lineHeight = calculatedProps.lineHeight;

    // Initial values specific to which type
    if (type === "main") {
        localEntity = localEntityMain;
        // Capture the inital dimensions, distance, and displayName in case we need to redraw
        avatar.previousDisplayName = avatarInfo.displayName;
        avatar.mainInitialDimensions = scaledDimensions;
        avatar.initialDistance = distance;
        name = avatarInfo.displayName;
        parentID = uuid;
    } else {
        localEntity = localEntitySub;
        avatar.subInitialDimensions = scaledDimensions;
        name = avatarInfo.username;
        parentID = localEntityMain.id;
    }

    if (shouldCreate) {
        // Common values
        localEntity.add("text", name);

        // Multiply the new dimensions and line height with the user selected scaler
        scaledDimensions = Vec3.multiply(scaledDimensions, userScaler);
        lineHeight = scaledDimensions[Y] * LINE_HEIGHT_SCALER;
        // Add some room for the margin by using lineHeight as a reference
        scaledDimensions[X] += (lineHeight * LEFT_MARGIN_SCALER) + (lineHeight * RIGHT_MARGIN_SCALER);
        scaledDimensions[Y] += (lineHeight * TOP_MARGIN_SCALER) + (lineHeight * BOTTOM_MARGIN_SCALER);

        localEntity
            .add("leftMargin", lineHeight * LEFT_MARGIN_SCALER)
            .add("rightMargin", lineHeight * RIGHT_MARGIN_SCALER)
            .add("topMargin", lineHeight * TOP_MARGIN_SCALER)
            .add("bottomMargin", lineHeight * BOTTOM_MARGIN_SCALER)
            .add("lineHeight", lineHeight)
            .add("dimensions", scaledDimensions)
            .add("parentID", parentID);


        // Final values specific to each type

        if (type === "main") {
            localEntity
                .add("position", position);
        } else {
            // Get the localPosition offset
            var localEntityMainDimensions = avatar.localEntityMain.get('dimensions', SHOULD_QUERY_ENTITY);
            localPositionOffset = [
                0,
                getLocalPositionOffset(localEntityMainDimensions, scaledDimensions),
                0
            ];

            localEntity
                .add("localPosition", localPositionOffset)
                .add("backgroundColor", SUB_BACKGROUND)
                .add("textColor", SUB_TEXTCOLOR);
        }

        localEntity
            .create(CLEAR_ENTITY_EDIT_PROPS);

    } else {
        // Handle if we are just showing again

        if (type === "main") {
            // Get the position which is calculated from the initial local nametag position translated to new worldspace
            // Get all the latest info need to redraw
            localEntityMain.edit("position", position);
            getAvatarData(uuid);
            getDistance(uuid);
        }

        // Redraw the nametag and give a little time to show it
        reDraw(uuid, type);
        Script.setTimeout(function () {
            localEntity.show();
        }, REDRAW_TIMEOUT);
    }
}


// Check to see if the display named changed or if the distance is big enough to need a redraw.
var MAX_DISTANCE_METERS = 0.1;
var DELETE_TIMEOUT_MS = 6500;
function maybeRedraw(uuid){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;
    getAvatarData(uuid);
    
    if (maybeDelete(uuid)) {
        remove(uuid);

        return;
    }

    getDistance(uuid);
    var distanceDelta = Math.abs(avatar.currentDistance - avatar.previousDistance);

    if (distanceDelta < MAX_DISTANCE_METERS){
        return;
    }

    avatarInfo.displayName = avatarInfo.displayName === "" ? "anonymous" : avatarInfo.displayName.trim();

    if (avatar.previousName !== avatarInfo.displayName) {
        updateName(uuid, avatarInfo.displayName);
    } else {
        reDraw(uuid, "main");
    }
    
    if (avatarInfo.username) {
        reDraw(uuid, "sub");
    }
}


// Handle redrawing if needed
function reDraw(uuid, type) {
    var avatar = _this.avatars[uuid];

    var localEntity = null;
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

    // Find our new dimensions from the new distance 
    newDimensions = [
        (initialDimensions[X] / initialDistance) * currentDistance,
        (initialDimensions[Y] / initialDistance) * currentDistance,
        (initialDimensions[Z] / initialDistance) * currentDistance
    ];

    // Multiply the new dimensions and line height with the user selected scaler
    newDimensions = Vec3.multiply(newDimensions, userScaler);
    lineHeight = newDimensions[Y] * LINE_HEIGHT_SCALER;

    // Add some room for the margin by using lineHeight as a reference
    newDimensions[X] += (lineHeight * LEFT_MARGIN_SCALER) + (lineHeight * RIGHT_MARGIN_SCALER);
    newDimensions[Y] += (lineHeight * TOP_MARGIN_SCALER) + (lineHeight * BOTTOM_MARGIN_SCALER);

    localEntity
        .add("leftMargin", lineHeight * LEFT_MARGIN_SCALER)
        .add("rightMargin", lineHeight * RIGHT_MARGIN_SCALER)
        .add("topMargin", lineHeight * TOP_MARGIN_SCALER)
        .add("bottomMargin", lineHeight * BOTTOM_MARGIN_SCALER)
        .add("lineHeight", lineHeight)
        .add("dimensions", newDimensions);

    if (type === "sub") {
        // Get the localPosition offset
        var localEntityMainDimensions = avatar.localEntityMain.get('dimensions', SHOULD_QUERY_ENTITY);

        localPositionOffset = [
            0,
            getLocalPositionOffset(localEntityMainDimensions, newDimensions),
            0
        ];

        localEntity
            .add("localPosition", localPositionOffset);
    }

    localEntity
        .sync();
}


// Go through the selected avatar list and see if any of the avatars need a redraw.
function checkAllSelectedForRedraw(){
    for (var avatar in _this.selectedAvatars) {
        maybeRedraw(avatar);
    }
}


// Remake the nametags if the display name changes.  
function updateName(uuid) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    avatar.localEntityMain.destroy();
    avatar.localEntitySub.destroy();

    avatar.localEntityMain = new LocalEntity('local').add(entityProps);
    avatar.localEntitySub = new LocalEntity('local').add(entityProps);

    var localOffset = avatar.localPositionOfIntersection;
    avatar.intersection = localToWorld(localOffset, avatarInfo.position, avatarInfo.orientation);

    makeNameTag(uuid, CREATE, "main");
    makeNameTag(uuid, CREATE, "sub");
}


// Request the username.
function getUN(uuid){
    if (_this.avatars[uuid].avatarInfo.username) {
        return;
    } else if (Users.canKick) {
        // User has admin priv and can get the username this way
        Users.requestUsernameFromID(uuid);
    } else {
        getInfoAboutUser(uuid);
    }
}


// Get the current data for an avatar.
function getAvatarData(uuid){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var newAvatarInfo = AvatarManager.getAvatar(uuid);
    // Save the username so it doesn't get overwritten when grabbing new avatarData
    var combinedAvatarInfo = Object.assign({}, newAvatarInfo, {
        username: avatarInfo === null ? null : avatarInfo.username 
    });

    // Now combine that avatar data with the main avatar object
    _this.avatars[uuid] = Object.assign({}, avatar, { avatarInfo: combinedAvatarInfo });

    return _this;
}


// Calculate the distance between the camera and the target avatar.
function getDistance(uuid) {
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var eye = Camera.position;
    var target = avatarInfo.position;

    avatar.previousDistance = avatar.currentDistance;
    avatar.currentDistance = Vec3.distance(target, eye);

    return avatar.currentDistance;
}


// Get info about a user through the metaverse to see if you are friends.
var METAVERSE_BASE = Account.metaverseServerURL;
var REG_EX_FOR_ID_FORMATTING = /[\{\}]/g;
function getInfoAboutUser(uuid) {
    var url = METAVERSE_BASE + '/api/v1/users?filter=connections&status=online';
    requestJSON(url, function (connectionsData) {
        var users = connectionsData.users;
        for (var i = 0; i < users.length; i++) {
            var user = users[i];
            if (user.location && user.location.node_id === uuid.replace(REG_EX_FOR_ID_FORMATTING, "")) { 
                handleFriend(uuid, user.username);
                break;
            }
        }
    });
}


// Handle whether this is a new nametag or old one made visible again.
var CREATE = true;
var SHOW = false;
function shouldShowOrCreate(uuid){
    var avatar = _this.avatars[uuid];
    var avatarInfo = avatar.avatarInfo;

    var localEntityMainID = avatar.localEntityMain.id;
    var localEntitySubID = avatar.localEntitySub.id;

    // If we have the display name entity, then we show it, if not then we create it.
    if (localEntityMainID) {
        makeNameTag(uuid, SHOW, "main");
    } else {
        makeNameTag(uuid, CREATE, "main");
    }

    // If we have both the display and username entity, then we show it.  If we have the mainID and also a username in the avatar info, then we create it.
    if (localEntityMainID && localEntitySubID) {
        makeNameTag(uuid, SHOW, "sub");
    } else if (localEntityMainID && avatarInfo.username) {
        makeNameTag(uuid, CREATE, "sub");
    }
}


// Handle if we are destroying the nametag or if we need to make a new one.
var DESTROY = true;
var HIDE = false;
function shouldDestoryOrHide(uuid){
    var avatar = _this.avatars[uuid];
    if (avatar) {
        removeLocalEntity(uuid, HIDE);
    } else {
        removeLocalEntity(uuid, DESTROY);
    }
}


// Check to see if we need to toggle our interval check because we went to 0 avatars 
// or if we got our first avatar in the select list.
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


// Turn off and on the redraw check.
var INTERVAL_CHECK_MS = 50;
function toggleInterval(){
    if (_this.redrawTimeout){
        maybeClearInterval();
    } else {
        _this.redrawTimeout = 
            Script.setInterval(checkAllSelectedForRedraw, INTERVAL_CHECK_MS);
    }
}


// #endregion
// *************************************
// END UTILTY
// *************************************

var _this = null;
function nameTagListManager(){
    _this = this;

    _this.avatars = {};
    _this.selectedAvatars = {};
    _this.redrawTimeout = null;
}


// *************************************
// START API
// *************************************
// #region API


// Create the manager and hook up username signal.
function create() {
    Users.usernameFromIDReply.connect(handleUserName);

    return _this;
}


// Destory the manager and disconnect from username signal.
function destroy() {
    Users.usernameFromIDReply.disconnect(handleUserName);
    _this.reset();

    return _this;
}


// Handles what happens when an avatar gets triggered on.
function handleSelect(uuid, intersection) {
    if (uuid in _this.selectedAvatars) {
        remove(uuid);
    } else {
        add(uuid, intersection);
    }
}


// Check to see if the uuid is in the avatars list before removing.
function maybeRemove(uuid) {
    if (uuid in _this.avatars) {
        remove(uuid);
    }
}


// Register the beggining scaler in case it was saved from a previous session.
function registerInitialScaler(initalScaler) {
    userScaler = initalScaler;
}


// Handle the user updating scale.
function updateUserScaler(newUSerScaler) {
    userScaler = newUSerScaler;
    for (var avatar in _this.selectedAvatars) {
        var avatarInfo = _this.avatars[avatar].avatarInfo;
        reDraw(avatar, "main");

        if (avatarInfo.username) {
            reDraw(avatar, "sub");
        }
    }
}


// Reset the avatar list.
function reset() {
    removeAllLocalEntities();
    _this.avatars = {};
    shouldToggleInterval();

    return _this;
}


// #endregion
// *************************************
// END API
// *************************************

nameTagListManager.prototype = {
    create: create,
    destroy: destroy,
    handleSelect: handleSelect, 
    maybeRemove: maybeRemove, 
    registerInitialScaler: registerInitialScaler,
    updateUserScaler: updateUserScaler,
    reset: reset
};


module.exports = nameTagListManager;