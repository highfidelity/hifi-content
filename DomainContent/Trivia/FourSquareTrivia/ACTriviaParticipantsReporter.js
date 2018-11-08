// ACTriviaParticipantsReporter.js

//  Created by Mark Brosche on 10-16-2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* global EventBridge Users AccountServices Agent Avatar */

(function() {
    // Agent.isAvatar = true;
    // Avatar.skeletonModelURL = 'http://hifi-content.s3.amazonaws.com/ozan/dev/avatars/invisible_avatar/invisible_avatar.fst';

    var url="put_google_script_URL_here";
    
    var TRIVIA_CHANNEL = "TriviaChannel",
        HOST_PERCENTAGE = 0.1,
        IS_AC_SCRIPT = true;

    var triviaMaster,
        prizeMoney,
        winnerID,
        senderID;

    if (IS_AC_SCRIPT) {
        var messageHandler = Messages.messageReceived.connect(function(channel, message, senderUUID, localOnly) {
            if (channel !== TRIVIA_CHANNEL) {
                return;
            } else {
                message = JSON.parse(message);
            }
            if (message.type === 'winner') {
                prizeMoney = message.winningPayout;
                triviaMaster = message.triviaMaster;
                winnerID = message.winnerID;
                senderID = senderUUID;
                Users.requestUsernameFromID(winnerID);
            } 
        });
    
        Messages.subscribe(TRIVIA_CHANNEL);
    } 

    function sendInput(winningUserName) {     
        var hostPayout = prizeMoney * HOST_PERCENTAGE;    
        var paramString = encodeURLParams({
            date: new Date(),
            triviaMasterUserName: triviaMaster,
            triviaMasterPayout: hostPayout,
            winnerUserName: winningUserName,
            winnings: prizeMoney,
            senderID: senderID
        });

        var request = new XMLHttpRequest();
        request.open('GET', url + "?" + paramString);
        request.timeout = 10000;
        request.send();
    }

    function setUserName(nodeID, userName, machineFingerprint, isAdmin) {     
        sendInput(JSON.stringify(userName));
    }

    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    function appEnding() {
        Messages.unsubscribe(TRIVIA_CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
        Users.usernameFromIDReply.disconnect(setUserName);
    }
    
    Messages.subscribe(TRIVIA_CHANNEL);
    Users.usernameFromIDReply.connect(setUserName);
    Script.scriptEnding.connect(appEnding);
})();