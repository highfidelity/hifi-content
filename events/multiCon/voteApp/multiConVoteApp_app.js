//
//  multiConVoteApp_app.js
//
//  Created by Robin Wilson and Zach Fox on 2019-03-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global */

(function() {
    // Initialize the app's UI:
    // 1. Get vote app data from the server
    // 2. Send a message to the App's UI to add that data to the UI.
    var request = Script.require('request').request;
    var REQUEST_URL = "http://localhost:3002";
    function initializeUI() {
        // get information from the backend
        var myUsername = AccountServices.username;
        var queryParamString = "type=getParticipants";
        if (myUsername !== "Unknown user") {
            queryParamString += "&voterUsername=" + myUsername;
        }

        request({
            uri: REQUEST_URL + "?" + queryParamString
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.error("Error retrieving participants from server: " + JSON.stringify(response));
                return;
            }
            if (response.status && response.status === "success") {
                ui.sendMessage({
                    app: 'multiConVote',
                    method: "initializeUI",
                    // [{username: <participant username>, votedFor: <true || undefined>, imageURL: <path to image> }] 
                    voteData: response.data 
                });
            }
        });
    }


    function vote(usernameToVoteFor) {
        var myUsername = AccountServices.username;
        if (myUsername === "Unknown user") {
            console.log("User tried to vote, but is not logged in!");
            return;
        }
        var queryParamString = "type=vote&voterUsername=" + myUsername + "&votedFor=" + usernameToVoteFor;
        request({
            uri: REQUEST_URL + "?" + queryParamString
        }, function (error, response) {
            if (error || !response || response.status !== "success") {
                console.error("Error voting: " + JSON.stringify(response));
                ui.sendMessage({
                    app: 'multiConVote',
                    method: "voteError"
                });
                return;
            }
            if (response.status && response.status === "success") {
                ui.sendMessage({
                    app: 'multiConVote',
                    method: "voteSuccess",
                    usernameVotedFor: usernameToVoteFor
                });
            }
        });
    }


    // Handle EventBridge Web Events from multiConVoteApp_ui.html
    function onWebEventReceived(event) {
        if (event.app === 'multiConVote') {
            switch (event.type) {
                case "eventBridgeReady":
                    initializeUI();
                    break;

                case "vote":
                    vote(event.data.usernameToVoteFor);
                    break;

                default:
                    print("error in detecting event.type in MultiCon Vote app");
            }
        }
    }
    

    // Setup AppUI module
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/multiConVoteApp_ui.html?0');
    function startup() {
        ui = new AppUi({
            buttonName: "MULTICON",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived
        });
    }

    startup();
})();
