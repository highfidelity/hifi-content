// ACmoneyTree.js

//  Created by Mark Brosche on 10-18-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

var SECRETS = Script.require(Script.resolvePath('../moneyTreeURLs.json')),
    request = Script.require('request'),
    GOOGLE_URL = SECRETS.googleURL,
    BANNED_URL = SECRETS.bannedURL,
    MONEY_TREE_CHANNEL = SECRETS.MONEY_TREE_CHANNEL,
    GIVER_CHANNEL = SECRETS.GIVER_CHANNEL,
    OPERATOR_CHANNEL = SECRETS.OPERATOR_CHANNEL,
    RECIPIENT_CHANNEL = SECRETS.RECIPIENT_CHANNEL,
    hiFiStaff = SECRETS.hiFiStaff,
    treeOperators = SECRETS.treeOperators;

// The AC Script needs to have an avatar to access avatar information
Agent.isAvatar = true;   
Avatar.skeletonModelURL = Script.resolvePath('../resources/models/invisible_avatar/invisible_avatar.fst');
Avatar.displayName = "Money Tree Agent";
Avatar.position = {"x":-19.109256744384766,"y":-20.8349714279174805,"z":-11.181184768676758}; // Tree Position


var AVERAGE_INTERVAL = 2, // Two minutes
    AVERAGE_HFC_AMOUNT = 10,
    HFC_MAX = 50,
    HFC_MIN = 5,
    STANDARD_DEVIATION = 5,
    SHOW_TIME_LENGTH = 60000, // One minute
    RECIPIENT_MAX = 3, 
    ONE_SECOND = 1000,
    AC_SCRIPT_RUN = true,
    PPS = 6000,
    TEN_SECONDS = 10000,
    FIVE_SECONDS = 5000,
    SEARCH_CENTER = {x: -18.1834, y: -7.7738, z: -11.8755},
    SEARCH_AREA= 1000;

var populationID,
    marquisID,
    marquisMessage = "",
    targetGiver = [],
    targetRecipients = [],
    amount = null,
    payOnce = false,
    recipient,
    userList= [],
    coinSpawner = [],
    coinSpawnTimeout = null,
    userListGiverIndex = null,
    operatorsPresent = [],
    treePower = true,
    tempList = [],
    powerButtonSpawner = [],
    powerButtonMaterial = [],
    octreeInterval = null,
    responseTimeout = Number.MAX_VALUE,
    bannedUsers = [],
    randomIntervals = [SHOW_TIME_LENGTH],
    noOneGave = false;


// Get the latest list of banned users from Google.
function getBannedUsers() {
    try {
        request(BANNED_URL, function (error, data) {
            if (!error) {
                console.log("google data", JSON.stringify(data));
                bannedUsers = data;
                console.log("processed into ", bannedUsers);
            }
        });
    } catch (err) {
        console.log("err:", err);
        print("Could not get domain data using userData domainAPIURL");
    }
}

// These 4 functions handle the different message channels used to communicate 
// with entities and clients.  Multiple functions are used to decrease the likelihood
// that bad actors successfully send or receive messages.
var messageHandler = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== MONEY_TREE_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'entering' && message.nodeID === senderUUID ) { 
        getBannedUsers();
        var avatarsInDomain = AvatarList.getAvatarIdentifiers();   
        var nameOnList = false;
        var isBanned = false;
        avatarsInDomain.forEach(function(nodeID){
            if (treeOperators.indexOf(message.username) !== -1 && 
            !operatorsPresent[operatorsPresent.map(function(e) { 
                return e.username; 
            }).indexOf(message.username)]) {
                operatorsPresent.push({
                    username: message.username,
                    nodeID: message.nodeID
                });
                console.log(JSON.stringify("operators ", operatorsPresent));
                bankerOverlay(message.nodeID, false);
                updateMarquis();                                        
            }
            // If the username or UUID is already on the list, do not add it to the list!
            userList.forEach(function(index){
                if (message.username.toLowerCase() === index.username || 
                Uuid.isEqual(message.nodeID, index.nodeID)) {
                    nameOnList = true;
                    console.log(nameOnList, "is on the list already");
                }
            });              
            // if username is banned do not add them to the list.
            bannedUsers.forEach(function(username){
                if (message.username.toLowerCase() === username){
                    isBanned = true;
                }
            });  
            console.log(message.username, "is already here?", nameOnList, " is banned? ", isBanned);
            if (!nameOnList && !isBanned) {
                // Add name and nodeID to list
                userList.push({
                    username: message.username.toLowerCase(),
                    nodeID: message.nodeID,
                    staff: false
                });
                // If user is staff, mark [].staff 'true'
                hiFiStaff.forEach(function(username){
                    if (message.username === username){
                        userList[userList.map(function(e) { 
                            return e.username; 
                        }).indexOf(message.username)].staff = true;
                    }
                });
                // Update Signs
                console.log("userslist", JSON.stringify(userList));
                updateMarquis();
            }         
        });
    // Someone left the zone, remove them from the lists
    } else if (message.type === 'leaving' && message.nodeID === senderUUID) {
        leftZone(message.nodeID);
    }            
}; 
var messageHandlerOperator = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== OPERATOR_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'tree power' && senderUUID !== Avatar.sessionUUID ) {
        if (operatorsPresent.length > 0){
            treePower = message.state;
            if (treePower === true) {
                if (coinSpawnTimeout){
                    Script.clearTimeout(coinSpawnTimeout);
                    coinSpawnTimeout = false;
                }
                startTree();
                updateMarquis("STARTING...");
            } else {
                if (coinSpawnTimeout){
                    Script.clearTimeout(coinSpawnTimeout);
                    coinSpawnTimeout = false;
                }            
                updateMarquis("OUT OF ORDER");
            }
        }
    // Someone entered the zone, add them to a list
    }        
}; 
var messageHandlerRecipient = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== RECIPIENT_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'accept' && senderUUID === recipient.nodeID) {
        console.log("money accepted", JSON.stringify(recipient));
        if (new Date().getTime() - responseTimeout < SHOW_TIME_LENGTH) {
            sendInput(message.username, amount); 
            recipient = null; 
            targetRecipients = [];
            responseTimeout = Number.MAX_VALUE;
        }
    // Receiver declines
    } else if (message.type === 'decline' && senderUUID === recipient.nodeID) {
        console.log("money declined");
        recipient = null;
        targetRecipients = [];
        responseTimeout = Number.MAX_VALUE;
    // Someone entered the zone, add them to a list
    }
}; 
var messageHandlerGiver = function(channel, message, senderUUID, localOnly) {
    // Setup
    if (channel !== GIVER_CHANNEL) {
        return;
    } else {
        message = JSON.parse(message);
    }
    // Notify the chosen recipient
    if (message.type === 'moneyGiven' && senderUUID === targetGiver.nodeID) {
        console.log("money given");
        recipient = targetRecipients[targetRecipients.map(function(e) { 
            return e.nodeID; 
        }).indexOf(message.recipientID)];
        amount = randomizeHFC();
        if (recipient && amount !== 0){
            spawnReceiverMessage(amount);  
            updateMarquis("PLZ WAIT 4 $");  
            responseTimeout = new Date().getTime();  
            Script.clearTimeout(noOneGave);
            noOneGave = false;
            startTree();
        }
    // Receiver accepts
    }          
}; 


// This function updates the money tree sign status and count.  Providing a string as 
// an argument overrides sign logic and displays the string.
function updateMarquis(displayText){
    Entities.editEntity(populationID, {text: userList.length});
    marquisMessage = Entities.getEntityProperties(marquisID, ['text']);
    if (!displayText){
        if ((marquisMessage.text === "OUT OF ORDER" || marquisMessage.text === "BANKRUPT!") && !treePower){
            return;
        } else if (marquisMessage.text !== "OOH SHINY!" && userList.length < RECIPIENT_MAX) {
            Entities.editEntity(marquisID, {text: "MOAR PPL PLZ"});
        } else if (marquisMessage.text !== "OOH SHINY!" && userList.length >= RECIPIENT_MAX){
            Entities.editEntity(marquisID, {text: "PREPARE 4 $"});
        }
    } else {
        Entities.editEntity(marquisID, {text: displayText});
    }
}


// This function is used to allow the AC script to see and change entities
// in the domain.
function allowEntityAccess() {
    Entities.setPacketsPerSecond(PPS);
    EntityViewer.setPosition(SEARCH_CENTER);
    EntityViewer.setCenterRadius(SEARCH_AREA);
    // This should allow us to see nano-scale entities from great distances
    EntityViewer.setVoxelSizeScale(Number.MAX_VALUE);
    if (!octreeInterval) {
        octreeInterval = Script.setInterval(function() {
            EntityViewer.queryOctree();
        }, ONE_SECOND);
    }
    Script.setTimeout(function(){
        try {
            if (Entities.getEntityProperties(
                Entities.findEntitiesByName("Money Tree Counter", SEARCH_CENTER, SEARCH_AREA)[0], ["id"]).id !== undefined) {
                populationID = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Money Tree Counter", SEARCH_CENTER, SEARCH_AREA)[0], ["id"]).id;
                Entities.editEntity(populationID, {text: "--"});
                marquisID = Entities.getEntityProperties(
                    Entities.findEntitiesByName("Money Tree Status", SEARCH_CENTER, SEARCH_AREA)[0], ["id"]).id;
                updateMarquis("BOOTING UP");
                powerButtonSpawner = Entities.findEntitiesByName("Power Button Spawner", SEARCH_CENTER, SEARCH_AREA);
                powerButtonSpawner.forEach(function(entityID){
                    Entities.deleteEntity(entityID);
                });
                powerButtonMaterial = Entities.findEntitiesByName("Power Button Material", SEARCH_CENTER, SEARCH_AREA);
                powerButtonMaterial.forEach(function(entityID){
                    Entities.deleteEntity(entityID);
                });
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
        } catch (e) {
            print("[MONEY TREE] could not find or create anything", e);
        }           
        Messages.subscribe(MONEY_TREE_CHANNEL);
        Messages.subscribe(OPERATOR_CHANNEL);
        Messages.subscribe(GIVER_CHANNEL);
        Messages.subscribe(RECIPIENT_CHANNEL);
        Messages.messageReceived.connect(messageHandler);
        Messages.messageReceived.connect(messageHandlerOperator);
        Messages.messageReceived.connect(messageHandlerRecipient);
        Messages.messageReceived.connect(messageHandlerGiver);
        startTree();
    }, TEN_SECONDS);
}


// This function checks to make sure that the entity server exists
// and that the AC script has Rez permissions.
// If one or both of those things is false, we'll check again in 5 seconds.
function maybeAllowEntityAccess() {
    if (Entities.serversExist() && Entities.canRez()) {
        allowEntityAccess();
    } else {
        Script.setTimeout(maybeAllowEntityAccess, FIVE_SECONDS);
    }
}


// This function will be called on startup.
function startup() {
    maybeAllowEntityAccess();
}


// This function loads an invisible entity that creates a tree power button overlay
// and makes announcements to tree operators regarding the tree activity.
function bankerOverlay(uuid, remove){
    if (remove) {
        try {
            var powerButtonSpawner = Entities.findEntitiesByName("Power Button Spawner", SEARCH_CENTER, SEARCH_AREA);
            powerButtonSpawner.forEach(function(entityID){
                var entityData = Entities.getEntityProperties(entityID, ['userData']);
                userData = JSON.parse(entityData.userData);
                var validID = userData.bankerID;
                if (validID === uuid) {
                    Entities.deleteEntity(entityID);
                }
            });
            var powerButtonMaterial = Entities.findEntitiesByName("Power Button Material", SEARCH_CENTER, SEARCH_AREA);
            powerButtonMaterial.forEach(function(entityID){
                var entityData2 = Entities.getEntityProperties(entityID, ['userData']);
                userData = JSON.parse(entityData2.userData);
                var validID2 = userData.bankerID;
                if (validID2 === uuid) {
                    Entities.deleteEntity(entityID);
                }
            });
        } catch (e){
            print("error removing overlay", e);
        }
    } else {
        var userData = { bankerID: uuid, power: treePower };
        powerButtonSpawner = Entities.addEntity({
            type: "Box",
            dimensions: { x: 0.5, y: 0.5, z: 0.5 },
            name: "Power Button Spawner",
            script: Script.resolvePath("../entityScripts/moneyTreeBankerClient.js"),
            userData: JSON.stringify(userData),
            position: { x: -16.9779, y: -9.132, z: -10.7944 },
            visible: false,
            collisionless: true
        });    
    }
}


// If someone leaves the zone or the domain, remove them from any lists they were on.
function leftZone(uuid){
    var isOperator = operatorsPresent[operatorsPresent.map(function(e) { 
        return e.nodeID; 
    }).indexOf(uuid)];
    var isUser = userList[userList.map(function(e) { 
        return e.nodeID; 
    }).indexOf(uuid)];
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
function spawnReceiverMessage(amount){
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
            script: Script.resolvePath("../entityScripts/moneyTreeReceiverClient.js"),
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
function randomizeHFC(){
    var funds = true;
    var rand = gaussian(AVERAGE_HFC_AMOUNT, STANDARD_DEVIATION);
    var listLength =Math.sqrt(userList.length);
    var amount = Math.ceil(rand*listLength) - Math.ceil(rand*listLength) % STANDARD_DEVIATION;
    if (!funds){
        updateMarquis("BANKRUPT!");
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
function generateRandomIntervals(){
    for (var i = 0; i < HFC_MAX; i++){
        var interval = gaussian(AVERAGE_INTERVAL, 1) * SHOW_TIME_LENGTH;
        randomIntervals.push(            
            interval > SHOW_TIME_LENGTH ? interval : SHOW_TIME_LENGTH
        );
    }
}


// This function loads an invisible entity that creates overlays for the giver to click on
// over the heads of 2 or 3 users.
function createCoinSpawner() {
    if (targetRecipients[0] === null){
        return;
    } else if (targetRecipients.length < RECIPIENT_MAX-1){
        return;
    } else {            
        Messages.sendMessage(OPERATOR_CHANNEL, JSON.stringify({
            type: "coins",
            giver: targetGiver.username
        }));
        updateMarquis("OOH SHINY!");
        for (var i = 0; i < targetRecipients.length; i++){
            var avatar = AvatarList.getAvatar(targetRecipients[i].nodeID);
            var sum = Vec3.sum(avatar.position, Vec3.UP);
            var userData = {
                giverID: targetGiver.nodeID
            };
            coinSpawner[i] = Entities.addEntity({
                type: "Box",
                dimensions: { x: 0.5, y: 0.5, z: 0.5 },
                name: "Money Tree Gift",
                script: Script.resolvePath("../entityScripts/moneyTreeGiverClient.js"),
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
function pickAGiver(){   
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
function pickRecipients(){
    targetRecipients = [];
    tempList = [];
    tempList = userList.slice();// Make a copy of the user list to whittle down.
    tempList.splice(userListGiverIndex, 1)[0]; // Do not include the giver on this list.
    for (var i = 0; i < tempList.length; i++) {
        if (tempList[i].staff === true) { // Remove all staff as they are not qualified to receive.
            tempList.splice(i,1)[0];
            i--;
        }
    }
    if (tempList.length < RECIPIENT_MAX-1) { // If the list is less than 2 qualified receivers, then you don't have enough!
        Entities.editEntity(marquisID, {text: "MOAR PPL PLZ"});
        return;
    }
    var recipientCount = (tempList.length > RECIPIENT_MAX) ? RECIPIENT_MAX : tempList.length;
    for (var j = 0; j < recipientCount; j++){ 
        var index = randInt(0, tempList.length-1);
        targetRecipients.push(tempList.splice(index-j, 1)[0]);// Add two or three recipients to the final list.     
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
function cleanUpEntities(){
    try {
        var avatarsInDomain = AvatarList.getAvatarIdentifiers();        
        operatorsPresent.forEach(function(index){
            var count = 0;
            avatarsInDomain.forEach(function(nodeID){
                if (index.nodeID === nodeID){
                    count += 1;
                }
            });
            if (count < 1) {
                bankerOverlay(index, true);
                operatorsPresent.splice(operatorsPresent.indexOf(index),1)[0];
            }
        });
        userList.forEach(function(index){
            var count = 0;
            avatarsInDomain.forEach(function(nodeID){
                if (index.nodeID === nodeID){
                    count += 1;
                }
            });
            if (count < 1) {
                userList.splice(userList.indexOf(index),1)[0];
            }
        });
        var extraCoins = Entities.findEntitiesByName("Money Tree Gift", SEARCH_CENTER, SEARCH_AREA);
        if (extraCoins.length > 0){
            extraCoins.forEach(function(entityID){
                Entities.deleteEntity(entityID);
            });
            extraCoins = [];
        }
        var extraButtons = Entities.findEntitiesByName("Power Button Spawner", SEARCH_CENTER, SEARCH_AREA);
        if (extraButtons.length > 0 && operatorsPresent.length === 0){
            extraButtons.forEach(function(entityID){
                Entities.deleteEntity(entityID);
            });
            extraButtons = [];
        }
        extraButtons = Entities.findEntitiesByName("Power Button Material", SEARCH_CENTER, SEARCH_AREA);
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
function startTree(){
    var message = JSON.stringify("The next selection begins in " + 
        (randomIntervals[randomIntervals.length-1]/ONE_SECOND).toFixed(0) + " seconds");
    Messages.sendMessage(OPERATOR_CHANNEL, JSON.stringify({
        type: "time",
        message: message
    }));
    coinSpawnTimeout = Script.setTimeout(function(){
        cleanUpEntities();
        if (randomIntervals.length < 1){
            generateRandomIntervals();
        }
        if (userList.length >= RECIPIENT_MAX){
            pickAGiver();
            pickRecipients();    
            if (targetRecipients.length > 1) {
                createCoinSpawner();
                noOneGave = Script.setTimeout(function(){
                    startTree();
                }, SHOW_TIME_LENGTH);
            } 
        } else {
            updateMarquis("MOAR PPL PLZ");
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