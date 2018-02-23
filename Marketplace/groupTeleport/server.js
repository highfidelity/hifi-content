// server.js
// where your node app starts

// init project
var express = require('express');

var bodyParser = require('body-parser')

var low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('db.json')
const db = low(adapter);






// time a group guide has to wait before they can overtake a group in milliseconds
// build in for security, we don't want a group jump around between two domains over and over
const MIN_WAIT_OVERTAKE_MS = 10000; 

// Set some defaults
db.defaults({ groups: [], users: []}).write()


var app = express();

const crypto = require('crypto');
crypto.DEFAULT_ENCODING = 'hex';


// {
//     groupName: "My class",
//     guide: {
//       username: "",
//       hifiSessionUUID: ""
//     },
//     authorizedGuides: ['thoys'],
//     location: "Mexico",
//     position: {x: 100, y: 100, z: 100},
//     restricted-area: ?
//     required-proximity: ?
//     public: false
//     followerUsernames: ["tho", "thoys"], // only when not public
//     password: "123456" // only when not public
// }

// https://stackoverflow.com/questions/17201450/salt-and-hash-password-in-nodejs-w-crypto
function hashPassword(password) {
    var salt = crypto.randomBytes(128).toString('base64');
    var iterations = 10000;
    var hash = crypto.pbkdf2Sync(password, salt, iterations, 512, 'sha512');

    return {
        salt: salt,
        hash: hash,
        iterations: iterations
    };
}

function isPasswordCorrect(savedHash, savedSalt, savedIterations, passwordAttempt) {
    return savedHash == crypto.pbkdf2Sync(passwordAttempt, savedSalt, savedIterations, 512, 'sha512');
}

function isUserPasswordCorrect(username, password) {
    const users = db.get('users');
    var user = users.find({ username: username }).value();
    if (!user) {
        return false;
    }
    var hashedPassword = user.hashedPassword;
    return isPasswordCorrect(hashedPassword.hash, hashedPassword.salt, hashedPassword.iterations, password);
}

app.use(express.static('public'));

// parse application/json
app.use(bodyParser.json());

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});

app.post('/groups', function (request, response) {
    var username = request.body.username;
    var password = request.body.password;
    var isLoggedIn = isUserPasswordCorrect(username, password);
    console.log('isLoggedIn = '  + isLoggedIn);
    // var groupPassword = request.body.groupPassword;
    var groups = db.get('groups').value();
    var mappedGroups = groups.filter(function(group) {
        return group.public ||
          (group.followerUsernames.length === 0 || group.followerUsernames.indexOf(username) !== -1) ||
          (isLoggedIn && group.authorizedGuides.indexOf(username) !== -1);
    }).map(function(group) {
        return {
            groupname: group.groupname,
            public: group.public,
            passwordProtected: !!group.hashedPassword,
            isGuide: isLoggedIn && group.authorizedGuides.indexOf(username) !== -1
        };
    }).sort(function(a, b) {
        return (a.isGuide === b.isGuide) ? a.groupname > b.groupname : a.isGuide ? -1 : 1;
    });
    response.send({groups: mappedGroups, isLoggedIn: isLoggedIn});
});

app.post('/addGroup', function (request, response) {
    console.log(request.body.groupname);
    // Add a Group
    const groups = db.get('groups');
    if (groups.find({ groupname: request.body.groupname }).value()) {
        console.log('group "' + request.body.groupname + '" already exists!');
        response.sendStatus(500);
        return;
    }
    var newGroup = {
        groupname: request.body.groupname,
        public: !!request.body.public,
        authorizedGuides: request.body.authorizedGuides
    };
    if (!newGroup.public) {
        newGroup.hashedPassword = hashPassword(request.body.password);
        newGroup.followerUsernames = request.body.followerUsernames ? request.body.followerUsernames : [];
    }

    groups.push(newGroup).write();
    response.send({success: true});
});

app.post('/addUser', function (request, response) {
    console.log(request.body.username);
    // Add an User
    const users = db.get('users');
    if (users.find({ username: request.body.username }).value()) {
        console.log('user "' + request.body.username + '" already exists!');
        response.sendStatus(500);
        return;
    }
    users.push({
        username: request.body.username,
        hashedPassword: hashPassword(request.body.password)
    }).write();
    response.sendStatus(200);
});

app.post('/getPosition', function (request, response) {
    const groups = db.get('groups');
    // TODO: implement password check
  
    
  
    var group = groups.find({ groupname: request.body.groupname }).value();
    if (!group) {
        console.log('group not found');
        response.sendStatus(500);
        return;
    }
    var guideSessionUUID = group.guide.hifiSessionUUID;
    response.send({
        guideSessionUUID: guideSessionUUID,
        location: group.location,
        position: group.position,
        orientation: group.orientation
    });
});

app.post('/updatePosition', function (request, response) {
    var guideUsername = request.body.username;
    var password = request.body.password;
    if (!isUserPasswordCorrect(guideUsername, password)) {
        console.log('password failed');
        response.sendStatus(500);
        return;
    }
    var guideHifiSessionUUID = request.body.hifiSessionUUID;
    var groupname = request.body.groupname;
    const groups = db.get('groups');
    var group = groups.find({ groupname: request.body.groupname }).value();
    if (!group || group.authorizedGuides.indexOf(guideUsername) === -1) {
        console.log('group auth failed');
        response.sendStatus(500);
        return;
    }
    var currentTimeMs = Date.now();
    if (group.guide !== undefined && group.guide.username !== guideUsername && group.lastUpdate !== undefined
        && (currentTimeMs - group.lastUpdate) < MIN_WAIT_OVERTAKE_MS) {

        console.log('failed to overtake session');
        response.sendStatus(500);
        return;
    }
    var location = request.body.location;
    if (!location || location === "localhost") {
        console.log('invalid location');
        response.sendStatus(500);
        return;
    }
    if (!guideHifiSessionUUID) {
        console.log('invalid sessionUUID');
        response.sendStatus(500);
        return;
    }
    groups.find({ groupname: request.body.groupname })
        .assign({
            guide: {
                username: guideUsername,
                hifiSessionUUID: guideHifiSessionUUID
            },
            location: request.body.location,
            position: request.body.position,
            orientation: request.body.orientation,
            lastUpdate: currentTimeMs
        })
        .write();
  
    console.log('position updated');
    response.sendStatus(200);
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});
