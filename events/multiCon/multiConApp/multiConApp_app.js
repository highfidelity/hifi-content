//
//  multiConApp_app.js
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
    var REQUEST_URL = "https://highfidelity.co/multiConVote";
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
                    myUsername: myUsername,
                    voteData: response.data,
                    activeTabName: Settings.getValue("multiCon/activeTabName", "info")
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


    // Handle EventBridge Web Events from App UI JS
    function onWebEventReceived(event) {
        if (event.app === 'multiConVote') {
            switch (event.type) {
                case "eventBridgeReady":
                    initializeUI();
                    break;

                case "vote":
                    vote(event.data.usernameToVoteFor);
                    break;

                case "changeActiveTabName":
                    Settings.setValue("multiCon/activeTabName", event.data);
                    break;

                default:
                    print("error in detecting event.type in MultiCon Vote app");
            }
        }
    }


    var UNLOAD_TIMESTAMP = Script.require(Script.resolvePath("../config/config.json?" + Date.now())).unloadTimestampUTC;
    function checkIfShouldUnload() {
        var now = new Date();

        if (now > UNLOAD_TIMESTAMP) {
            var scriptList = ScriptDiscoveryService.getRunning();
            scriptList.forEach(function (scriptInfo) {
                if (APP_NAME.toLowerCase.indexOf(scriptInfo.name.toLowerCase()) > -1) {
                    ScriptDiscoveryService.stopScript(scriptInfo.url);
                    return true;
                }
            });
        }
        return false;
    }
    

    // Setup AppUI module
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/multiConApp_ui.html?0');
    var APP_NAME = "VOTE";
    function startup() {
        checkIfShouldUnload();

        ui = new AppUi({
            buttonName: APP_NAME,
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived,
            onOpened: checkIfShouldUnload
        });
    }

    startup();
})();
