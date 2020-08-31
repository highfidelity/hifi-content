//  ACmoneyTree.js

//  Created by Mark Brosche on 10-18-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var SECRETS = Script.require(Script.resolvePath('JSON GOES HERE')),
    request = Script.require('../resources/modules/request.js').request;

// Get the latest list of banned users from Google.
var BANNED_URL = SECRETS.bannedURL;
function requestBannedUsers(callback) {
    request(BANNED_URL, function (error, response) {
        if (error || response.status !== "success") {
            console.log(error || JSON.stringify(response));
        }
        if (response.usernames){
            bannedUsers = response.usernames;
            callback();
        }
    });
}

    
// These 4 functions handle the different message channels used to communicate 
// with entities and clients.  Multiple functions are used to decrease the likelihood
// that bad actors successfully send or receive messages.

var hiFiStaff = SECRETS.hiFiStaff;
var treeOperators = SECRETS.treeOperators;
var userList= [],
    bannedUsers = [],
    operatorsPresent = [];
var messageHandler = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== MONEY_TREE_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'entering' && message.nodeID === senderUUID) { 
        requestBannedUsers(function(){
            var avatarsInDomain = AvatarList.getAvatarIdentifiers();   
            var nameOnList = false;
            var isBanned = false;
            avatarsInDomain.forEach(function(nodeID){
                if (treeOperators.indexOf(message.username.toLowerCase()) !== -1 && 
                !operatorsPresent[operatorsPresent.map(function(e) { 
                    return e.username; 
                }).indexOf(message.username.toLowerCase())]) {
                    operatorsPresent.push({
                        username: message.username.toLowerCase(),
                        nodeID: message.nodeID
                    });
                    bankerOverlay(message.nodeID, false);
                    updateMarquis();  
                    console.log("operator entered zone :", message.username);                                      
                }
                // If the username or UUID is already on the list, do not add it to the list!
                userList.forEach(function(index){
                    if (message.username.toLowerCase() === index.username || 
                    Uuid.isEqual(message.nodeID, index.nodeID)) {
                        nameOnList = true;
                    }
                });              
                // if username is banned do not add them to the list.
                if (bannedUsers.indexOf(message.username.toLowerCase()) !== -1){
                    isBanned = true;
                } 
                if (!nameOnList && !isBanned) {
                    // Add name and nodeID to list
                    userList.push({
                        username: message.username.toLowerCase(),
                        nodeID: message.nodeID,
                        staff: false
                    });
                    console.log("user entered zone :", message.username);                                      

                    // If user is staff, mark [].staff 'true'
                    hiFiStaff.forEach(function(username) {
                        if (message.username.toLowerCase() === username) {
                            userList[userList.map(function(e) { 
                                return e.username; 
                            }).indexOf(message.username.toLowerCase())].staff = true;
                        }
                    });
                    // Update Signs
                    updateMarquis();
                }         
            });
        });
    // Someone left the zone, remove them from the lists
    } else if (message.type === 'leaving' && message.nodeID === senderUUID) {
        leftZone(message.nodeID);
    }            
}; 
var treePower = true;
var messageHandlerOperator = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== OPERATOR_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'tree power' && senderUUID !== Avatar.sessionUUID) {
        if (operatorsPresent.length > 0){
            treePower = message.state;
            if (treePower === true) {
                if (coinSpawnTimeout){
                    Script.clearTimeout(coinSpawnTimeout);
                    coinSpawnTimeout = false;
                }
                console.log("turned on the tree via power button, new interval starting", userList.length, " people present");
                startTree();
                updateMarquis(SIGN_TEXT[6]);
            } else {
                if (coinSpawnTimeout){
                    Script.clearTimeout(coinSpawnTimeout);
                    coinSpawnTimeout = false;
                }            
                updateMarquis(SIGN_TEXT[1]);
            }
        }
    // Someone entered the zone, add them to a list
    }        
}; 
var responseTimeout = Number.MAX_VALUE;
var messageHandlerRecipient = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== RECIPIENT_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    if (message.type === 'accept' && senderUUID === recipient.nodeID) {
        if (new Date().getTime() - responseTimeout < SHOW_TIME_SECONDS) {
            sendInput(recipient.username, amount); 
        }
    } else if (message.type === 'decline' && senderUUID === recipient.nodeID) {
        recipient = null;
        targetRecipients = [];
        responseTimeout = Number.MAX_VALUE;
    }
}; 
var amount = null;
var recipient = null;
var messageHandlerGiver = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== GIVER_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'moneyGiven' && senderUUID === targetGiver.nodeID) {
        recipient = targetRecipients[targetRecipients.map(function(e) { 
            return e.nodeID; 
        }).indexOf(message.recipientID)];
        amount = randomizeHFC();
        if (recipient && amount !== 0){
            spawnReceiverMessage(amount);  
            updateMarquis(SIGN_TEXT[7]);  
            responseTimeout = new Date().getTime();  
            Script.clearTimeout(noOneGave);
            noOneGave = false;
            console.log(targetGiver.username, "gave to ", recipient.username, " starting new interval.");
            startTree();
        }
    // Receiver accepts
    }          
}; 


// This function updates the money tree sign status and count.  Providing a string as 
// an argument overrides sign logic and displays the string.
var SIGN_TEXT = [
    "OOH SHINY!", 
    "OUT OF ORDER", 
    "BANKRUPT!", 
    "MOAR PPL PLZ", 
    "PREPARE 4 $",
    "BOOTING UP",
    "STARTING...",
    "PLZ WAIT 4 $"
];
var marquisMessage = "";
function updateMarquis(displayText) {
    Entities.editEntity(populationID, {text: userList.length});
    marquisMessage = Entities.getEntityProperties(marquisID, ['text']);
    if (!displayText){
        if ((marquisMessage.text === SIGN_TEXT[1] || marquisMessage.text === SIGN_TEXT[2]) && !treePower){
            return;
        } else if (marquisMessage.text !== SIGN_TEXT[0] && userList.length < RECIPIENT_MAX) {
            Entities.editEntity(marquisID, {text: SIGN_TEXT[3]});
        } else if (marquisMessage.text !== SIGN_TEXT[0] && userList.length >= RECIPIENT_MAX){
            Entities.editEntity(marquisID, {text: SIGN_TEXT[4]});
        }
    } else {
        Entities.editEntity(marquisID, {text: displayText});
    }
}


// This function is used to allow the AC script to see and change entities
// in the domain.
var MS_TO_SEC = 1000;
var MONEY_TREE_CHANNEL = SECRETS.MONEY_TREE_CHANNEL,
    GIVER_CHANNEL = SECRETS.GIVER_CHANNEL,
    OPERATOR_CHANNEL = SECRETS.OPERATOR_CHANNEL,
    RECIPIENT_CHANNEL = SECRETS.RECIPIENT_CHANNEL,
    TEN_SECONDS = 10 * MS_TO_SEC,
    PPS = 6 * MS_TO_SEC,    
    SEARCH_CENTER = {x: -18.1834, y: -7.7738, z: -11.8755},
    SEARCH_AREA_M = 1000,
    populationID,
    moneyTreeZone,
    marquisID,
    octreeInterval = null;
function allowEntityAccess() {
    Entities.setPacketsPerSecond(PPS);
    EntityViewer.setPosition(SEARCH_CENTER);
    EntityViewer.setCenterRadius(SEARCH_AREA_M);
    // This should allow us to see nano-scale entities from great distances
    EntityViewer.setVoxelSizeScale(Number.MAX_VALUE);
    if (!octreeInterval) {
        octreeInterval = Script.setInterval(function() {
            EntityViewer.queryOctree();
        }, MS_TO_SEC);
    }
    Script.setTimeout(function(){
        try {
            if (Entities.getEntityProperties(Entities.findEntitiesByName("Money Tree Counter", SEARCH_CENTER, SEARCH_AREA_M)[0], ["id"]).id !== undefined) {
                populationID = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Money Tree Counter", SEARCH_CENTER, SEARCH_AREA_M)[0], ["id"]).id;
                Entities.editEntity(populationID, {text: "--"});
                marquisID = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Money Tree Status", SEARCH_CENTER, SEARCH_AREA_M)[0], ["id"]).id;
                updateMarquis(SIGN_TEXT[5]);
                powerButtonSpawner = Entities.findEntitiesByName("Power Button Spawner", SEARCH_CENTER, SEARCH_AREA_M);
                powerButtonSpawner.forEach(function(entityID){
                    Entities.deleteEntity(entityID);
                });
                powerButtonMaterial = Entities.findEntitiesByName("Power Button Material", SEARCH_CENTER, SEARCH_AREA_M);
                powerButtonMaterial.forEach(function(entityID){
                    Entities.deleteEntity(entityID);
                });
                moneyTreeZone = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Money Tree Zone", SEARCH_CENTER, SEARCH_AREA_M)[0], ['position', 'rotation', 'dimensions']);
            } else {    
                populationID = Entities.addEntity({
                    type: "Text",
                    dimensions: { x: 0.3, y: 0.1854, z: 0.01 },
                    lineHeight: 0.125,
                    text: "-",
                    textColor: {"red": 255, "green": 255, "blue": 255},
                    backgroundColor: {"red": 0, "green": 0, "blue": 0},
                    name: "Money Tree Counter",
                    position: {"x":-17.9620418548584,"y":-10.537128448486328,"z":-10.67333984375},
                    rotation: {"x":-0.16071832180023193,"y":0.6887953877449036,"z":0.1588284969329834,"w":0.6887840032577515},
                    visible: true,
                    collisionless: true,
                    userData: "{ \"grabbableKey\": { \"grabbable\": false, \"kinematic\": false } }"
                });            
                marquisID = Entities.addEntity({
                    type: "Text",
                    dimensions: { x: 0.7585, y: 0.1695, z: 0.01 },
                    lineHeight: 0.115,
                    text: "STARTING...",
                    textColor: {"red": 255, "green": 255, "blue": 255},
                    backgroundColor: {"red": 0, "green": 0, "blue": 0},
                    name: "Money Tree Status",
                    position: {"x":-17.9667,"y":-10.5250,"z":-11.4147},
                    rotation: {"x":-0.15957793593406677,"y":0.6889334321022034,"z":0.1589823216199875,"w":0.6888881921768188},
                    visible: true,
                    collisionless: true,
                    userData: "{ \"grabbableKey\": { \"grabbable\": false, \"kinematic\": false } }"
                });
            }   
            Messages.subscribe(MONEY_TREE_CHANNEL);
            Messages.subscribe(OPERATOR_CHANNEL);
            Messages.subscribe(GIVER_CHANNEL);
            Messages.subscribe(RECIPIENT_CHANNEL);
            Messages.messageReceived.connect(messageHandler);
            Messages.messageReceived.connect(messageHandlerOperator);
            Messages.messageReceived.connect(messageHandlerRecipient);
            Messages.messageReceived.connect(messageHandlerGiver);
            generateRandomIntervals();
            console.log("First tree interval since startup", userList.length, " people present");
            startTree();
        } catch (e) {
            print("[MONEY TREE] could not find or create anything", e);
        }           
    }, TEN_SECONDS);
}


// This function checks to make sure that the entity server exists
// and that the AC script has Rez permissions.
// If one or both of those things is false, we'll check again in 5 seconds.
var FIVE_SECONDS = 5 * MS_TO_SEC;
function maybeAllowEntityAccess() {
    if (Entities.serversExist() && Entities.canRez()) {
        allowEntityAccess();
    } else {
        Script.setTimeout(maybeAllowEntityAccess, FIVE_SECONDS);
    }
}


// This function will be called on startup.
function startup() {
    // The AC Script needs to have an avatar to access avatar information
    Agent.isAvatar = true;   
    Avatar.skeletonModelURL = Script.resolvePath('../resources/models/invisible_avatar/invisible_avatar.fst');
    Avatar.displayName = "Money Tree Agent";
    Avatar.position = {"x":-19.109256744384766,"y":-20.8349714279174805,"z":-11.181184768676758}; // Tree Position
    maybeAllowEntityAccess();
}


// This function loads an invisible entity that creates a tree power button overlay
// and makes announcements to tree operators regarding the tree activity.
var powerButtonSpawner = [],
    powerButtonMaterial = [];
function bankerOverlay(uuid, remove) {
    if (remove) {
        try {
            var powerButtonSpawner = Entities.findEntitiesByName("Power Button Spawner", SEARCH_CENTER, SEARCH_AREA_M);
            powerButtonSpawner.forEach(function(entityID){
                var entityData = Entities.getEntityProperties(entityID, ['userData']);
                userData = JSON.parse(entityData.userData);
                var validID = userData.bankerID;
                if (validID === uuid) {
                    Entities.deleteEntity(entityID);
                }
            });           
        } catch (e){
            console.log("error removing overlay", e);
        }
    } else {
        var userData = { bankerID: uuid, power: treePower };
        var powerButtonSpawner = Entities.addEntity({
            type: "Box",
            dimensions: { x: 0.5, y: 0.5, z: 0.5 },
            name: "Power Button Spawner",
            script: Script.resolvePath("../entityScripts/moneyTreeBankerClient.js?v6"),
            userData: JSON.stringify(userData),
            position: { x: -16.9779, y: -9.132, z: -10.7944 },
            visible: false,
            collisionless: true
        });    
    }
}


// This function determines whether an avatar uuid is inside the money tree zone.
var HALF_MULTIPLIER = 0.5;
function isAvatarInsideZone(uuid) {
    var avatar = AvatarList.getAvatar(uuid);
    var localPosition = Vec3.multiplyQbyV(Quat.inverse(moneyTreeZone.rotation),
        Vec3.subtract(avatar.position, moneyTreeZone.position));
    var halfDimensions = Vec3.multiply(moneyTreeZone.dimensions, HALF_MULTIPLIER);
    return -halfDimensions.x <= localPosition.x &&
            halfDimensions.x >= localPosition.x &&
           -halfDimensions.y <= localPosition.y &&
            halfDimensions.y >= localPosition.y &&
           -halfDimensions.z <= localPosition.z &&
            halfDimensions.z >= localPosition.z;
}


// If someone leaves the zone or the domain, remove them from any lists they were on.
function leftZone(uuid) {
    var isOperator = operatorsPresent[operatorsPresent.map(function(e) { 
        return e.nodeID; 
    }).indexOf(uuid)];
    console.log("operator left: ", JSON.stringify(isOperator));
    var isUser = userList[userList.map(function(e) { 
        return e.nodeID; 
    }).indexOf(uuid)];
    console.log("user left: ", JSON.stringify(isUser));
    if (isOperator && operatorsPresent.indexOf(isOperator) !== -1) {
        bankerOverlay(uuid, true);
        operatorsPresent.splice(operatorsPresent.indexOf(isOperator),1)[0];
    }
    if (isUser && userList.indexOf(isUser) !== -1){
        userList.splice(userList.indexOf(isUser), 1)[0];
    }    
    updateMarquis();
}


// This function loads an invisible entity that creates pop-up alerts for recipients
function spawnReceiverMessage(amount) {
    if (recipient) {
        Messages.sendMessage(OPERATOR_CHANNEL, JSON.stringify({
            type: "given",
            receiver: recipient.username
        }));
        var userData = { 
            receiverID: recipient.nodeID, 
            amount: amount 
        };
        var avatar = AvatarList.getAvatar(recipient.nodeID);
        Entities.addEntity({
            type: "Box",
            dimensions: { x: 0.5, y: 0.5, z: 0.5 },
            name: "Tree Gift Receipt",
            script: Script.resolvePath("../entityScripts/moneyTreeReceiverClient.js?v6"),
            userData: JSON.stringify(userData),
            lifetime: 30,
            position: Vec3.sum(avatar.position, Vec3.multiplyQbyV(avatar.orientation, { x: -2.5, y: 0, z: -5 })),
            visible: false,
            collisionless: true,
            parentID: recipient
        });
        Entities.addEntity({
            type: "ParticleEffect",
            name: "Coin Particle",            
            lifetime: 10,
            collidesWith: "",
            collisionMask: 0,
            collisionless: true,
            position: Vec3.sum(avatar.position, Vec3.multiplyQbyV(avatar.orientation, { x: 0, y: 0, z: -1 })),
            dimensions: {
                x: 0.15,
                y: 0.15,
                z: 0.15
            },
            isEmitting: true,                           
            userData: "{\"grabbableKey\":{\"grabbable\":false}}",          
            lifespan: 0.5,
            maxParticles: 10,
            textures: Script.resolvePath("../resources/pictures/coin.png"),
            emitRate: 10,
            emitSpeed: 1.5,
            speedSpread: 2,
            emitDimensions: {
                x: 0,
                y: 0,
                z: 0
            },
            emitOrientation: {
                x: -0.707,
                y: 0,
                z: 0,
                w: 0.707
            },
            emitterShouldTrail: false,
            particleRadius: 0.15,
            radiusSpread: 0,
            radiusStart: 0,
            radiusFinish: 0.15,
            color:{
                red:255,
                blue:255,
                green:255
            },
            colorSpread:{
                red:0,
                blue:0,
                green:0
            },
            colorStart:{
                red:255,
                blue:255,
                green:255
            },
            colorFinish:{
                red:255,
                blue:255,
                green:255
            },
            emitAcceleration:{
                x:0,
                y:-10,
                z:1
            },
            accelerationSpread:{
                x:5,
                y:3,
                z:5
            },
            alpha: 1,
            alphaSpread: 0,
            alphaStart: 1,
            alphaFinish: 1,
            particleSpin: 0,
            spinSpread: 0,
            spinStart: 0,
            spinFinish: 0,
            rotateWithEntity: true,
            polarStart: 0,
            polarFinish: 0,
            azimuthStart: -2.9321532249450684,
            azimuthFinish: 0.5235987901687622
        });
    }
}


// This function generates a random amount of HFC between 5 and 50 HFC
// TODO: When Commerce API intergration comes, if the tree lacks funds, it will shutdown.
var AVERAGE_HFC_AMOUNT = 10,
    HFC_MAX = 50,
    HFC_MIN = 5,
    HFC_STANDARD_DEVIATION = 5;
function randomizeHFC() {
    var funds = true;
    var rand = gaussian(AVERAGE_HFC_AMOUNT, HFC_STANDARD_DEVIATION);
    var listLength =Math.sqrt(userList.length);
    var amount = Math.ceil(rand*listLength) - Math.ceil(rand*listLength) % HFC_STANDARD_DEVIATION;
    if (!funds){
        updateMarquis(SIGN_TEXT[2]);
        Script.clearTimeout(coinSpawnTimeout);
        coinSpawnTimeout = false;
        treePower = false;
        Messages.sendMessage(OPERATOR_CHANNEL, JSON.stringify({
            type: "tree power",
            state: treePower
        }));
        return 0;
    }
    if (amount >= HFC_MAX){
        amount = HFC_MAX;
    } else if (amount <= HFC_MIN){
        amount = HFC_MIN;
    }
    return amount;
}


// This function generates an array of 10 random intervals based on an average
var AVERAGE_INTERVAL_MIN = 2,
    SHOW_TIME_SECONDS = 60 * MS_TO_SEC, 
    randomIntervals = [SHOW_TIME_SECONDS];
function generateRandomIntervals() {
    for (var i = 0; i < 1000; i++){
        var interval = gaussian(AVERAGE_INTERVAL_MIN, 1) * SHOW_TIME_SECONDS;
        randomIntervals.push(            
            interval > SHOW_TIME_SECONDS ? interval : SHOW_TIME_SECONDS
        );
    }
    console.log(randomIntervals.length, "intervals left");
}


// This function loads an invisible entity that creates overlays for the giver to click on
// over the heads of 2 or 3 users.
var coinSpawner = [];
function createCoinSpawner() {
    console.log("spawning coins");
    if (targetRecipients[0] === null){
        return;
    } else if (targetRecipients.length < RECIPIENT_MAX-1){
        return;
    } else {            
        Messages.sendMessage(OPERATOR_CHANNEL, JSON.stringify({
            type: "coins",
            giver: targetGiver.username
        }));
        updateMarquis(SIGN_TEXT[0]);
        for (var i = 0; i < targetRecipients.length; i++){
            var avatar = AvatarList.getAvatar(targetRecipients[i].nodeID);
            var sum = Vec3.sum(avatar.position, Vec3.UP);
            var userData = {
                giverID: targetGiver.nodeID
            };
            console.log("spawning coins above ", targetRecipients[i].username);
            coinSpawner[i] = Entities.addEntity({
                type: "Box",
                dimensions: { x: 0.5, y: 0.5, z: 0.5 },
                name: "Money Tree Gift",
                script: Script.resolvePath("../entityScripts/moneyTreeGiverClient.js?v6"),
                userData: JSON.stringify(userData),
                lifetime: 60,
                position: sum,
                visible: false,
                collisionless: true,
                parentID: avatar.sessionUUID
            });
        }
    }
}


// This function picks someone at random to be the giver 
var userListGiverIndex = null;
var targetGiver = [];
function pickAGiver() {   
    userListGiverIndex = randInt(0, userList.length-1);
    if (userListGiverIndex < 0){
        return;
    } else {
        if (targetGiver){ // If there is a giver previously defined, do this stuff:
            if (userList[userListGiverIndex].username === ""){// Remove anything without a username (like this AC script)
                userList.splice(userListGiverIndex, 1)[0];
                if (userListGiverIndex >= userList.length){
                    userListGiverIndex = randInt(0, userList.length-1);
                }
            }
            if (targetGiver.username !== userList[userListGiverIndex].username){// Try not to pick the same giver twice in a row
                targetGiver = userList[userListGiverIndex];
            } else {
                userListGiverIndex = randInt(0, userList.length-1);
                targetGiver = userList[userListGiverIndex];
            }
        } else { // If there was no previous giver, then this is the first one.
            targetGiver = userList[userListGiverIndex];
        }
    }
}


// This function picks the potential recipients of the present and qualified users.
var RECIPIENT_MAX = 3,
    targetRecipients = [],
    tempList = [];
function pickRecipients() {
    targetRecipients = [];
    tempList = [];
    tempList = userList.slice();// Make a copy of the user list to whittle down.
    tempList.splice(userListGiverIndex, 1)[0]; // Do not include the giver on this list.
    for (var i = 0; i < tempList.length; i++) {
        if (tempList[i].staff === true) { // Remove all staff as they are not qualified to receive.
            console.log("Removing staff", JSON.stringify(tempList[i]));
            tempList.splice(i,1)[0];
            i--;
        }
    }
    if (tempList.length < RECIPIENT_MAX-1) { // If the list is less than 2 qualified receivers, then you don't have enough!
        updateMarquis(SIGN_TEXT[3]);
        return;
    }
    var recipientCount = (tempList.length > RECIPIENT_MAX) ? RECIPIENT_MAX : tempList.length;
    for (var j = 0; j < recipientCount; j++){ 
        var index = randInt(0, tempList.length-1);
        targetRecipients.push(tempList.splice(index, 1)[0]);// Add two or three recipients to the final list.     //why remove index-j?
    }
}


// This function returns a random float between high and low limits.
function randFloat(low, high) {
    return low + Math.random() * (high - low);
}


// This function returns a random integer between high and low limits.
function randInt(low, high) {
    return Math.floor(randFloat(low, high));
}


// This function returns a gaussian random variate with the given mean and stdev.
function gaussian(mean, stdev) {
    var y2;
    var useLast = false;
    var y1;
    if (useLast) {
        y1 = y2;
        useLast = false;
    } else {
        var x1, x2, w;
        do {
            x1 = 2.0 * Math.random() - 1.0;
            x2 = 2.0 * Math.random() - 1.0;
            w = x1 * x1 + x2 * x2;               
        } while ( w >= 1.0);
        w = Math.sqrt((-2.0 * Math.log(w))/w);
        y1 = x1 * w;
        y2 = x2 * w;
        useLast = true;
    }

    var retval = mean + stdev * y1;
    if (retval > 0) {
        return retval;
    }
    return -retval;
}


// Send info to google sheets.
var GOOGLE_URL = SECRETS.googleURL;
function sendInput(recipientUsername, amount) {      
    var paramString = encodeURLParams({
        date: new Date().toLocaleString(),
        recipientUsername: recipientUsername,
        amount: amount
    });

    var request = new XMLHttpRequest();
    request.open('GET', GOOGLE_URL + "?" + paramString);
    request.timeout = 10000;
    request.send();
    recipient = null; 
    targetRecipients = [];
    responseTimeout = Number.MAX_VALUE;
}


// Encode parameters to send to google sheets.
function encodeURLParams(params) {
    var paramPairs = [];
    for (var key in params) {
        paramPairs.push(key + "=" + params[key]);
    }
    return paramPairs.join("&");
}


// Remove any remaining entities created in a cycle and ensure lists are up to date.
function cleanUpEntities() {
    console.log("cleaning");
    try {     
        operatorsPresent.forEach(function(index){
            if (!isAvatarInsideZone(index.nodeID)){
                console.log(index.username, "is not here anymore, so remove them");
                bankerOverlay(index.nodeID, true);
                operatorsPresent.splice(index,1)[0];
            }
        });
        userList.forEach(function(index){
            if (!isAvatarInsideZone(index.nodeID)) {
                console.log(index.username, "is not here anymore, so remove them");
                userList.splice(index,1)[0];
            }
        });
        var extraCoins = Entities.findEntitiesByName("Money Tree Gift", SEARCH_CENTER, SEARCH_AREA_M);
        if (extraCoins.length > 0){
            extraCoins.forEach(function(entityID){
                Entities.deleteEntity(entityID);
            });
            extraCoins = [];
        }
        var extraButtons = Entities.findEntitiesByName("Power Button Spawner", SEARCH_CENTER, SEARCH_AREA_M);
        if (extraButtons.length > 0 && operatorsPresent.length === 0){
            extraButtons.forEach(function(entityID){
                Entities.deleteEntity(entityID);
            });
            extraButtons = [];
        }
        extraButtons = Entities.findEntitiesByName("Power Button Material", SEARCH_CENTER, SEARCH_AREA_M);
        if (extraButtons.length > 0 && operatorsPresent.length === 0){
            extraButtons.forEach(function(entityID){
                Entities.deleteEntity(entityID);
            });
            extraButtons = [];
        }
        updateMarquis();
    } catch (e) {
        print("[MONEY TREE] entity sweep failed.");
        return;
    }
}


// Start the tree cycle!
var coinSpawnTimeout = null;
var noOneGave = false;
function startTree() {
    var message = JSON.stringify("The next selection begins in " + 
        (randomIntervals[randomIntervals.length-1]/MS_TO_SEC).toFixed(0) + " seconds");
    Messages.sendMessage(OPERATOR_CHANNEL, JSON.stringify({
        type: "time",
        message: message
    }));
    console.log(randomIntervals.length, "intervals left");
    if (randomIntervals.length <= 5){
        console.log("generating more intervals...")
        generateRandomIntervals();
    }
    coinSpawnTimeout = Script.setTimeout(function(){
        cleanUpEntities();
        console.log("done cleaning");
        if (userList.length >= RECIPIENT_MAX){
            pickAGiver();
            console.log("giver", JSON.stringify(targetGiver));
            pickRecipients();    
            console.log("recipients: ", JSON.stringify(targetRecipients));
            if (targetRecipients.length > 1) {
                createCoinSpawner();
                console.log("giver", JSON.stringify(targetGiver), "recipients: ", JSON.stringify(targetRecipients));
                noOneGave = Script.setTimeout(function(){
                    startTree();
                    console.log("user didn't give to anyone", userList.length, " people present");
                }, 1.5*SHOW_TIME_SECONDS);
            } 
        } else {
            updateMarquis(SIGN_TEXT[3]);
            console.log("couldn't find enough people", userList.length, " people present");
            startTree();
        }
    }, randomIntervals.pop());
    
}


// Run a final cleanup at the end of the script
function appEnding() {
    cleanUpEntities();
    if (coinSpawnTimeout){
        Script.clearTimeout(coinSpawnTimeout);
        coinSpawnTimeout = false;
    }
    if (octreeInterval){
        Script.clearInterval(octreeInterval);
        octreeInterval = false;
    }
    Messages.unsubscribe(MONEY_TREE_CHANNEL);
    Messages.unsubscribe(OPERATOR_CHANNEL);
    Messages.unsubscribe(GIVER_CHANNEL);
    Messages.unsubscribe(RECIPIENT_CHANNEL);
    Messages.messageReceived.disconnect(messageHandler);
    Messages.messageReceived.disconnect(messageHandlerOperator);
    Messages.messageReceived.disconnect(messageHandlerRecipient);
    Messages.messageReceived.disconnect(messageHandlerGiver);
}


AvatarList.avatarRemovedEvent.connect(leftZone);
Script.scriptEnding.connect(appEnding);
startup();