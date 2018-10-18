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
        print("AC script running");
        var messageHandler = Messages.messageReceived.connect(function(channel, message, senderUUID, localOnly) {
            if (channel !== TRIVIA_CHANNEL) {
                print("not on channel");
                return;
            } else {
                message = JSON.parse(message);
                print("message contents ",JSON.stringify(message));
            }
            if (message.type === 'winner') {
                print("message type is winner");
                prizeMoney = message.winningPayout;
                triviaMaster = message.triviaMaster;
                winnerID = JSON.stringify(message.winnerID);
                print("winnerID is:::", winnerID);
                senderID = senderUUID;
                Users.requestUsernameFromID(JSON.stringify(message.winnerID));
            } else {
                print("message type isn't winner");
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

        print("sendInput is", JSON.stringify(paramString));

        var request = new XMLHttpRequest();
        request.open('GET', url + "?" + paramString);
        request.timeout = 10000;
        request.send();
    }

    function setUserName(nodeID, userName, machineFingerprint, isAdmin) {     
        console.log("setUserName Args: 1 ",JSON.stringify(machineFingerprint));
        console.log("setUserName Args: 2 ",JSON.stringify(userName));
        console.log("setUserName Args: 3 ",JSON.stringify(nodeID));
        console.log("setUserName Args: 4 ",JSON.stringify(isAdmin));
        console.log("setUserName Args: 5 ",JSON.stringify(arguments));
        sendInput(JSON.stringify(userName));
        print("the winning user is: ", JSON.stringify(userName));
    }

    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    function appEnding() {
        print("app ending");
        Messages.unsubscribe(TRIVIA_CHANNEL);
        Messages.messageReceived.disconnect(messageHandler);
        Users.usernameFromIDReply.disconnect(setUserName);
    }
    
    Messages.subscribe(TRIVIA_CHANNEL);
    Users.usernameFromIDReply.connect(setUserName);
    Script.scriptEnding.connect(appEnding);
}());