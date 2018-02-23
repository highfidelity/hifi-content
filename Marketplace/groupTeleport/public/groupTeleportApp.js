/* globals Account, MyAvatar, Script, Settings, Tablet, Uuid, Vec3 */

var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");

var APP_NAME = "GROUP-TP";
var APP_URL = Script.resolvePath("groupTeleportApp.html");
var APP_ICON = Script.resolvePath("./goto-i.svg");
var APP_ICON_ACTIVE = Script.resolvePath("./goto-a.svg");

var GROUP_TELEPORT_API = "https://group-teleporter.glitch.me";
var request = Script.require("request").request;

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

var mode = Settings.getValue(SETTING_MODE, MODE.NONE);
var groupName = Settings.getValue(SETTING_LAST_GROUP, INVALID_GROUP);

// TODO: implement sessions to not have to store password in memory
var userPassword = "";
var loggedIn = false;

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
            userPassword = eventData.password;
            loggedIn = true;
            refresh();
            break;
        case 'logout':
            userPassword = "";
            loggedIn = false;
            refresh();
            break;
        case 'follow':
            groupPassword = eventData.groupPassword;
            changeGroup(eventData.groupName);
            changeMode(MODE.FOLLOWING);
            break;
        case 'guide':
            changeGroup(eventData.groupName);
            changeMode(MODE.GUIDE);
            break;
        case 'off':
            changeMode(MODE.NONE);
            break;
    }
}

tablet.webEventReceived.connect(onWebEventReceived);

// test
//mode = MODE.GUIDE;
//groupName = "FollowTheLeader";
//userPassword = "123456";

var updateInterval = Script.setInterval(function() {
    if (groupName === INVALID_GROUP) {
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
                groupname: groupName,
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
                groupname: groupName
            }
        }, function(error, response) {
            if (error) {
                print('error');
            }
            // TODO: check hostname
            var pos = response.position;
            if (location.placename !== response.location || Vec3.distance(pos, MyAvatar.position) > 50) {
                
                location = 'hifi:/' + response.location + '/' + pos.x + ',' +pos.y +','+pos.z;
                MyAvatar.orientation = response.orientation;
            }
        });
    }
}, UPDATE_INTERVAL_MS);

Script.scriptEnding.connect(function() {
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
