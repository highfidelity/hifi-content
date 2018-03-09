//
// groupTeleportApp.js
//
// Created by Thijs Wenker on 2/1/18.
// Copyright 2018 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

// index.js

const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const requestPromise = require('request-promise-native');

const crypto = require('crypto');
const {USERS_TABLE, GROUPS_TABLE, IS_OFFLINE} = process.env;

const DEBUG = false;

let dynamoDb;

if (IS_OFFLINE === 'true') {
    dynamoDb = new AWS.DynamoDB.DocumentClient({
        region: 'localhost',
        endpoint: 'http://localhost:8000'
    });
} else {
    dynamoDb = new AWS.DynamoDB.DocumentClient();
}

// time a group guide has to wait before they can overtake a group in milliseconds
// build in for security, we don't want a group jump around between two domains over and over
const MIN_WAIT_OVERTAKE_MS = 10000;


const MAX_GROUP_INACTIVE_LIST_TIME_MS = 10 /* min */ * 60 /* sec/min */ * 1000 /* ms/sec */;

const DEFAULT_SALT_LENGTH = 128;
const DEFAULT_HASHING_ITERATIONS = 10000;
const DEFAULT_HASH_KEY_LENGTH = 512;
const DEFAULT_HASH_DIGEST = 'sha512';

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
    let salt = crypto.randomBytes(DEFAULT_SALT_LENGTH).toString('base64');
    let hash = crypto.pbkdf2Sync(password, salt, DEFAULT_HASHING_ITERATIONS, DEFAULT_HASH_KEY_LENGTH,
        DEFAULT_HASH_DIGEST).toString('hex');

    return {
        salt: salt,
        hash: hash,
        iterations: DEFAULT_HASHING_ITERATIONS
    };
}

function isPasswordCorrect(savedHash, savedSalt, savedIterations, passwordAttempt) {
    return savedHash === crypto.pbkdf2Sync(passwordAttempt, savedSalt, savedIterations, DEFAULT_HASH_KEY_LENGTH,
        DEFAULT_HASH_DIGEST).toString('hex');
}

function isUserPasswordCorrect(username, password, callback) {
    const params = {
        TableName: USERS_TABLE,
        Key: {
            username: username
        }
    };
    dynamoDb.get(params, (error, result) => {
        if (error) {
            console.log('error = ' + error);
            callback.call(this, false);
            return;
        }
        let user = result.Item;
        if (!user) {
            console.log(`user ${username} not found`);
            callback.call(this, false);
            return;
        }
        let hashedPassword = user.hashedPassword;
        callback.call(this, isPasswordCorrect(hashedPassword.hash, hashedPassword.salt, hashedPassword.iterations, password));
    });
}

app.use(express.static('public'));

// parse application/json
app.use(bodyParser.json({ strict: false }));

app.get('/', function (request, response) {
    response.sendFile(__dirname + '/views/index.html');
});

app.post('/groups', (request, response) => {
    let {username, password} = request.body;
    new Promise((resolve, reject) => {
        isUserPasswordCorrect(username, password, (isLoggedIn) => {
            dynamoDb.scan({
                TableName: GROUPS_TABLE
            }, (error, result) => {
                if (error) {
                    reject('Could not get groups');
                    return;
                }
                let mappedGroups = result.Items.filter(function (group) {
                    let groupTimedOut = (Date.now() - group.lastUpdate) > MAX_GROUP_INACTIVE_LIST_TIME_MS;
                    console.log('groupTimedOut = ' + groupTimedOut ? 'true' : 'false');
                    return (!groupTimedOut && (group.public || (group.followerUsernames.length === 0 ||
                            group.followerUsernames.indexOf(username) !== -1))) ||
                        (isLoggedIn && (group.authorizedGuides.indexOf(username) !== -1 || group.creator === username));
                }).map(function (group) {
                    let isCreator = group.creator === username;
                    return {
                        groupName: group.groupName,
                        public: group.public,
                        passwordProtected: !!group.hashedPassword,
                        isGuide: isLoggedIn && (group.authorizedGuides.indexOf(username) !== -1 || isCreator),
                        isCreator
                    };
                }).sort(function (groupA, groupB) {
                    return (groupA.isGuide === groupB.isGuide) ? groupA.groupName > groupB.groupName : groupA.isGuide ? -1 : 1;
                });
                resolve({
                    groups: mappedGroups,
                    isLoggedIn: isLoggedIn
                });
            });
        });
    }).then((groupResultData) => {
        // when all succeeds
        response.json(Object.assign({
            success: true
        }, groupResultData));
    }).catch((error) => {
        response.json({
            success: false,
            error
        });
    });
});

if (DEBUG) {
    app.post('/addGroup', (request, response) => {
        let {groupName, password, followerUsernames, authorizedGuides} = request.body;
        // public is a reserved word in javascript
        let isPublic = request.body.public;
        new Promise((resolve, reject) => {
            dynamoDb.get({
                TableName: GROUPS_TABLE,
                Key: {
                    groupName
                }
            }, (error, result) => {
                if (error) {
                    reject('Could not get group');
                    return;
                }
                if (result.Item) {
                    reject(`Group ${groupName} already exists`);
                    return;
                }
                let newGroup = {
                    groupName,
                    public: !!isPublic,
                    authorizedGuides
                };
                if (!newGroup.public) {
                    newGroup.hashedPassword = hashPassword(password);
                    newGroup.followerUsernames = followerUsernames ? followerUsernames : [];
                }
                dynamoDb.put({
                    TableName: GROUPS_TABLE,
                    Item: newGroup
                }, (error) => {
                    if (error) {
                        console.log(error);
                        reject('Could not create group');
                        return;
                    }
                    resolve();
                });
            });
        }).then(() => {
            // when all succeeds
            response.json({
                success: true
            });
        }).catch((error) => {
            response.json({
                success: false,
                error
            });
        });
    });

    app.post('/addUser', (request, response) => {
        let {username, password} = request.body;
        new Promise((resolve, reject) => {
            dynamoDb.get({
                TableName: USERS_TABLE,
                Key: {
                    username
                }
            }, (error, result) => {
                if (error) {
                    reject("Database error");
                    return;
                }
                if (result.Item) {
                    reject(`User ${username} already exists`);
                    return;
                }
                dynamoDb.put({
                    TableName: USERS_TABLE,
                    Item: {
                        username,
                        hashedPassword: hashPassword(password)
                    }
                }, (error) => {
                    if (error) {
                        reject("Database error");
                        return;
                    }
                    resolve();
                });
            });
        }).then(() => {
            // when all succeeds
            response.json({
                success: true
            });
        }).catch((error) => {
            response.json({
                success: false,
                error
            });
        });
    });
}

app.post('/setGuidePassword', (request, response) => {
    let {username, token} = request.body;
    requestPromise({
        uri: "https://metaverse.highfidelity.com/api/v1/user/profile",
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${token}`
        },
        json: true
    }).then((response) => {
        // lets check if the token api is valid and belongs to the requesting user
        return new Promise((resolve, reject) => {
            if (response.status !== "success") {
                reject("user profile request failed, please make sure your token is valid");
            }
            if (response.data.user.username !== username) {
                reject("username doesn't match.");
            }
            resolve()
        })
    }).then(() => {
        // valid token, lets see if the user already exists
        return new Promise((resolve, reject) => {
            dynamoDb.get({
                TableName: USERS_TABLE,
                Key: {
                    username
                }
            }, (error, result) => {
                if (error) {
                    reject('Database error');
                    return;
                }
                // returns true if the item is defined
                resolve(!!result.Item);
            });
        });
    }).then((isAlreadyInDatabase) => {
        return new Promise((resolve, reject) => {
            let hashedPassword = hashPassword(request.body.password);
            if (isAlreadyInDatabase) {
                dynamoDb.update({
                    TableName: USERS_TABLE,
                    Key: {
                        username
                    },
                    UpdateExpression: 'SET hashedPassword = :hashedPassword',
                    ExpressionAttributeValues: {
                        ':hashedPassword': hashedPassword
                    }
                }, (error) => {
                    if (error) {
                        reject('Database error');
                        return;
                    }
                    resolve(isAlreadyInDatabase);
                });
            } else {
                dynamoDb.put({
                    TableName: USERS_TABLE,
                    Item: {
                        username,
                        hashedPassword
                    }
                }, (error) => {
                    if (error) {
                        reject('Database error');
                        return;
                    }
                    resolve(isAlreadyInDatabase);
                });
            }
        });
    }).then((updatedExisting) => {
        // when all succeeds, lets celebrate...
        response.json({
            success: true,
            updatedExisting
        });
    }).catch((error) => {
        response.json({
            success: false,
            error
        });
    });
});

app.post('/getPosition', (request, response) => {
    // TODO: implement password check
    let {groupName} = request.body;
    new Promise((resolve, reject) => {
        dynamoDb.get({
            TableName: GROUPS_TABLE,
            Key: {
                groupName
            }
        }, (error, result) => {
            if (error) {
                reject('Database error');
                return;
            }
            let group = result.Item;
            if (!group) {
                reject('group not found');
                return;
            }
            if (!group.guide) {
                reject('group has no guide');
                return;
            }
            let guideSessionUUID = group.guide.hifiSessionUUID;
            let {orientation, position, location, autoFollow, lastSummon} = group;
            resolve({
                guideSessionUUID,
                location,
                position,
                orientation,
                autoFollow,
                lastSummon
            });
        });
    }).then((positionData) => {
        response.send(Object.assign({
            success: true
        }, positionData));
    }).catch((error) => {
        response.json({
            success: false,
            error
        });
    });
});

app.post('/updatePosition', (request, response) => {
    let {username, password, groupName, hifiSessionUUID, location, position, orientation, autoFollow, summon} = request.body;
    new Promise((resolve, reject) => {
        isUserPasswordCorrect(username, password, (isLoggedIn) => {
            if (!isLoggedIn) {
                reject('password failed');
                return;
            }
            resolve();
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            dynamoDb.get({
                TableName: GROUPS_TABLE,
                Key: {
                    groupName
                }
            }, (error, result) => {
                if (error) {
                    reject('Could not get group');
                    return;
                }
                let group = result.Item;
                if (!group || (group.authorizedGuides.indexOf(username) === -1 && group.creator !== username)) {
                    reject('group auth failed');
                    return;
                }
                let currentTimeMs = Date.now();
                if (group.guide !== undefined && group.guide.username !== username && group.lastUpdate !== undefined
                    && (currentTimeMs - group.lastUpdate) < MIN_WAIT_OVERTAKE_MS) {

                    reject('failed to overtake session');
                    return;
                }
                if (!location || location === "localhost") {
                    reject('invalid location');
                    return;
                }
                if (!hifiSessionUUID) {
                    reject('invalid sessionUUID');
                    return;
                }

                let updateExpression =  'SET guide = :guide, #location = :location, #position = :position, ' +
                    'orientation = :orientation, lastUpdate = :lastUpdate, autoFollow = :autoFollow';
                let expressionAttributeValues =  { // a map of substitutions for all attribute values
                    ':guide': {
                        username,
                        hifiSessionUUID
                    },
                    ':location': location,
                    ':position': position,
                    ':orientation': orientation,
                    ':lastUpdate': currentTimeMs,
                    ':autoFollow': autoFollow
                };

                if (summon) {
                    updateExpression += ', lastSummon = :lastSummon';
                    expressionAttributeValues[':lastSummon'] = Date.now();
                }

                dynamoDb.update({
                    TableName: GROUPS_TABLE,
                    Key: {
                        groupName,
                    },
                    UpdateExpression: updateExpression,
                    ExpressionAttributeValues: expressionAttributeValues,
                    ExpressionAttributeNames: {
                        '#location': 'location',
                        '#position': 'position'
                    }
                }, (error) => {
                    if (error) {
                        reject('Database error');
                        return;
                    }
                    console.log('position updated');
                    resolve();
                });
            });
        });
    }).then(() => {
        response.send({
            success: true
        });
    }).catch((error) => {
        response.json({
            success: false,
            error
        });
    });
});

app.post('/createGroup', (request, response) => {
    let {username, password, groupName, groupPassword, followerUsernames, authorizedGuides} = request.body;
    // public is a reserved word in javascript
    let isPublic = request.body.public;
    new Promise((resolve, reject) => {
        isUserPasswordCorrect(username, password, (isLoggedIn) => {
            if (!isLoggedIn) {
                reject('password failed');
                return;
            }
            resolve();
        });
    }).then(() => {
        return new Promise((resolve, reject) => {
            dynamoDb.get({
                TableName: GROUPS_TABLE,
                Key: {
                    groupName
                }
            }, (error, result) => {
                if (error) {
                    reject('Could not get group');
                    return;
                }
                if (result.Item) {
                    reject(`Group ${groupName} already exists`);
                    return;
                }
                let newGroup = {
                    groupName,
                    public: !!isPublic,
                    creator: username,
                    authorizedGuides
                };
                if (!newGroup.public) {
                    newGroup.hashedPassword = hashPassword(groupPassword);
                    newGroup.followerUsernames = followerUsernames ? followerUsernames : [];
                }
                dynamoDb.put({
                    TableName: GROUPS_TABLE,
                    Item: newGroup
                }, (error) => {
                    if (error) {
                        console.log(error);
                        reject('Could not create group');
                        return;
                    }
                    resolve();
                });
            });
        });
    }).then(() => {
        // when all succeeds
        response.json({
            success: true
        });
    }).catch((error) => {
        response.json({
            success: false,
            error
        });
    });
});

module.exports.handler = serverless(app);
