//
// groupTeleportApp.js
//
// Created by Thijs Wenker on 2/1/18.
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals Account, MyAvatar, Script, Settings, Tablet, Uuid, Vec3, Quat, Messages */

var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

var APP_NAME = "GROUP-TP";
var APP_URL = Script.resolvePath("groupTeleportApp.html");
var APP_ICON = Script.resolvePath("./group-teleport-i.svg");
var APP_ICON_ACTIVE = Script.resolvePath("./group-teleport-a.svg");

// TODO: get a proper cloudfront setup for this API ( https://trello.com/c/zgKrjbGy )
var GROUP_TELEPORT_API = "https://njyh1g59ji.execute-api.us-east-1.amazonaws.com/dev";
var request = Script.require("request").request;

var GROUP_TELEPORT_MESSAGE_CHANNEL = 'io.highfidelity.app.groupTeleport';

var GROUP_TELEPORT_SETTINGS_NAMESPACE = "io.highfidelity.app.groupTeleport";
var SETTING_MODE = GROUP_TELEPORT_SETTINGS_NAMESPACE + ".mode";
var SETTING_LAST_GROUP = GROUP_TELEPORT_SETTINGS_NAMESPACE + ".lastGroup";
var SETTING_LAST_GROUP_SECRET = GROUP_TELEPORT_SETTINGS_NAMESPACE + ".lastGroupSecret";

var INVALID_GROUP = "";

var MODE = {
    NONE: 0,
    FOLLOWING: 1,
    GUIDE: 2
};

var UPDATE_INTERVAL_MS = 5000;

var MINIMUM_FOLLOW_DISTANCE = 50; // Meters
var MINIMUM_SUMMON_DISTANCE = 7.5; // Meters

var mode = Settings.getValue(SETTING_MODE, MODE.NONE);
var groupName = Settings.getValue(SETTING_LAST_GROUP, INVALID_GROUP);

// TODO: implement sessions to not have to store password in memory
var userPassword = "";
var loggedIn = false;
var followPlacename = "";
var autoFollow = true;

// password for password protected groups
var groupPassword = Settings.getValue(SETTING_LAST_GROUP_SECRET, "");
var guideSessionUUID = Uuid.NULL;

var button = tablet.addButton({
    text: APP_NAME,
    icon: APP_ICON,
    activeIcon: APP_ICON_ACTIVE
});

button.clicked.connect(function() {
    tablet.gotoWebScreen(APP_URL);
});

function refresh() {
    if (mode === MODE.NONE) {
        request({
            uri: GROUP_TELEPORT_API + '/groups',
            method: 'POST',
            json: true,
            body: {
                username: Account.username,
                password: userPassword
            }
        }, function(error, response) {
            if (error) {
                print('error');
            }
            print(JSON.stringify(response));
            tablet.emitScriptEvent(JSON.stringify({
                app: 'GROUP-TP',
                action: 'refresh',
                groups: response.groups,
                mode: mode,
                loggedIn: response.isLoggedIn
            }));
        });
    } else {
        tablet.emitScriptEvent(JSON.stringify({
            app: 'GROUP-TP',
            action: 'refresh',
            groupName: groupName,
            mode: mode,
            loggedIn: loggedIn
        }));
    }
}

function changeMode(newMode) {
    if (mode === newMode) {
        return;
    }
    mode = newMode;
    Settings.setValue(SETTING_MODE, newMode);
}

function changeGroup(newGroup) {
    if (groupName === newGroup) {
        return;
    }
    groupName = newGroup;
    Settings.setValue(SETTING_LAST_GROUP, groupName);
}

function onWebEventReceived(webEvent) {
    var eventData = null;
    try {
        eventData = JSON.parse(webEvent);
    } catch (e) {
        // ignore non JSON-data webEvent
        return;
    }
    if (eventData.app !== "GROUP-TP") {
        return;
    }
    switch (eventData.action) {
        case 'refresh':
            refresh();
            break;
        case 'login':
            userPassword = eventData.password ? eventData.password : "";
            loggedIn = true;
            refresh();
            break;
        case 'logout':
            userPassword = "";
            loggedIn = false;
            refresh();
            break;
        case 'createAccount':
            request({
                uri: GROUP_TELEPORT_API + '/setGuidePassword',
                method: 'POST',
                json: true,
                body: {
                    username: Account.username,
                    password: userPassword,
                    token: groupName
                }
            }, function(error, response) {
                if (error) {
                    print('error');
                }
                print(JSON.stringify(response));
            });
            break;
        case 'follow':
            groupPassword = eventData.groupPassword;
            Settings.setValue(SETTING_LAST_GROUP_SECRET, groupPassword)
            changeGroup(eventData.groupName);
            changeMode(MODE.FOLLOWING);
            refresh();
            break;
        case 'guide':
            changeGroup(eventData.groupName);
            changeMode(MODE.GUIDE);
            refresh();
            break;
        case 'summon':
            print('sending summon message' + JSON.stringify({
              action: 'summon',
              position: MyAvatar.position,
              orientation: MyAvatar.orientation
            }));
            Messages.sendMessage(GROUP_TELEPORT_MESSAGE_CHANNEL, JSON.stringify({
              action: 'summon',
              position: MyAvatar.position,
              orientation: MyAvatar.orientation
            }));
            break;
        case 'off':
            changeMode(MODE.NONE);
            refresh();
            break;
    }
}

tablet.webEventReceived.connect(onWebEventReceived);

var MINIMUM_OFFSET_RADIUS = 1.2;
var MAXIMUM_OFFSET_RADIUS = 2.2;

var MINIMUM_OFFSET_ANGLE = 70;
var MAXIMUM_OFFSET_ANGLE = 290;

function getOffsetPositionFromTarget(targetPosition, targetOrientation) {
    var offsetRadius = ((MAXIMUM_OFFSET_RADIUS - MINIMUM_OFFSET_RADIUS) * Math.random()) + MINIMUM_OFFSET_RADIUS;
    var randomYawAngle = ((MAXIMUM_OFFSET_ANGLE - MINIMUM_OFFSET_ANGLE) * Math.random()) + MINIMUM_OFFSET_ANGLE;
    var relativeTargetOrientation = Quat.multiply(targetOrientation, Quat.fromPitchYawRollDegrees(0, randomYawAngle, 0));
    var offset = Vec3.multiplyQbyV(relativeTargetOrientation, Vec3.multiply(Vec3.FRONT, offsetRadius));
    return Vec3.sum(targetPosition, offset);
}

var updateInterval = Script.setInterval(function() {
    if (groupName === INVALID_GROUP) {
        if (mode !== MODE.NONE) {
            changeMode(MODE.NONE);
        }
        return;
    }
    if (mode === MODE.GUIDE && userPassword.length > 0) {
        request({
            uri: GROUP_TELEPORT_API + '/updatePosition',
            method: 'POST',
            json: true,
            body: {
                username: Account.username,
                password: userPassword,
                groupName: groupName,
                hifiSessionUUID: MyAvatar.sessionUUID,
                location: location.placename !== "" ? location.placename : location.hostname,
                position: MyAvatar.position,
                orientation: MyAvatar.orientation
            }
        }, function(error, response) {
            if (error) {
                print('error');
            }
            print(JSON.stringify(response));
        });
    } else if (mode === MODE.FOLLOWING) {
        request({
            uri: GROUP_TELEPORT_API + '/getPosition',
            method: 'POST',
            json: true,
            body: {
                username: Account.username,
                groupName: groupName
            }
        }, function(error, response) {
            if (error) {
                print('error');
            }
            guideSessionUUID = response.guideSessionUUID;
            if (response.skip) {
                return;
            }
          
            // TODO: check hostname
            var position = response.position;

            if (location.placename !== response.location || Vec3.distance(position, MyAvatar.position) > MINIMUM_FOLLOW_DISTANCE) {
                position = getOffsetPositionFromTarget(position, response.orientation);
                location = 'hifi://' + response.location + '/' + position.x + ',' + position.y + ',' + position.z;
                MyAvatar.orientation = response.orientation;
            }
        });
    }
}, UPDATE_INTERVAL_MS);

Messages.subscribe(GROUP_TELEPORT_MESSAGE_CHANNEL);
var onMessageReceived = function(channel, message, senderID, localOnly) {
    if (senderID === MyAvatar.sessionUUID) {
        return;
    }
    if (channel === GROUP_TELEPORT_MESSAGE_CHANNEL && senderID === guideSessionUUID) {
        var data = JSON.parse(message);
        if (data.action === 'summon' && Vec3.distance(data.position, MyAvatar.position) > MINIMUM_SUMMON_DISTANCE) {
            // TODO: guideSessionUUID should match senderID
            MyAvatar.position = getOffsetPositionFromTarget(data.position, data.orientation);
            MyAvatar.orientation = data.orientation;
        }
    }
};

Messages.messageReceived.connect(onMessageReceived);

Script.scriptEnding.connect(function() {
    Messages.messageReceived.disconnect(onMessageReceived);
    Script.clearInterval(updateInterval);
    tablet.removeButton(button);
});

//Window.alert("app started" + request);

// Guide / Teacher
// 1. sign on (don't save password for security)
// 2. send the password with every request for now (until we have sessions)

// Followers / Students
// 1. setup group (save for next time)
// 2. follow guide/teacher
