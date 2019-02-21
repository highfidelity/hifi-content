//
//  bingoTestApp_app.js
//
//  Created by Zach Fox on 2019-02-14
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    // *************************************
    // START UTILITY INCLUDES
    // *************************************
    var request = Script.require(Script.resolvePath('../modules/request.js')).request;
    var REQUEST_URL = Script.require(Script.resolvePath('../config/config.json?' + Date.now())).requestURL;
    var NUMBER_WHEEL_ENTITY_ID = "{57e5e385-3968-4ebf-8048-a7650423d83b}";
    // *************************************
    // END UTILITY INCLUDES
    // *************************************


    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    
    // Takes a JSON object and turns that object into URL query parameters
    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }


    // Returns a 8-character string that can be used as a username
    var NUM_CHARS_IN_USERNAME = 8;
    function generateRandomValidUsername() {
        var username = "";
        var possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (var i = 0; i < NUM_CHARS_IN_USERNAME; i++) {
            username += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
        }

        return username;
    }
    

    function testTimedOut(startTimestamp, timeoutMS) {
        if (Date.now() - startTimestamp > timeoutMS) {
            return true;
        }

        return false;
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    function requestNewRound() {
        Entities.callEntityServerMethod(NUMBER_WHEEL_ENTITY_ID, 'newRound');
        ui.sendMessage({
            app: 'bingoTestApp',
            method: 'requestNewRound',
            status: "newRoundRequested"
        });
    }


    function maybeClearAddManyUsersCheckInterval() {
        if (addManyUsersCheckInterval) {
            Script.clearInterval(addManyUsersCheckInterval);
            addManyUsersCheckInterval = false;
        }
    }

    // Makes a request to the Bingo Database to quickly add many unique users to the game DB.
    var NUM_USERS_TO_ADD = 100;
    var ADD_MANY_USERS_CHECK_INTERVAL_MS = 500;
    var ADD_MANY_USERS_TIMEOUT_MS = 15000;
    var addManyUsersCheckInterval = false;
    var currentlyTestingAddManyUsers = false;
    function addManyUsers() {
        if (currentlyTestingAddManyUsers) {
            return;
        }

        currentlyTestingAddManyUsers = true;

        var testUsernames = [];
        var currentUsername = '';

        for (var i = 0; i < NUM_USERS_TO_ADD; i++) {
            currentUsername = generateRandomValidUsername();
            if (testUsernames.indexOf(currentUsername) < 0) {
                testUsernames.push(currentUsername);
            }
        }

        var testResults = {
            "numResponses": 0,
            "numUsersAdded": 0,
            "numUsersNotAdded": 0,
            "numUsersNotLoggedIn": 0,
            "numErrors": 0
        };
        var testStartTimestamp = Date.now();

        var requestURLParams;
        for (i = 0; i < NUM_USERS_TO_ADD; i++) {
            requestURLParams = encodeURLParams({
                app: 'bingoTestApp',
                type: "searchOrAdd",
                username: testUsernames[i]
            });
            request({
                uri: REQUEST_URL + "?" + requestURLParams
            }, function (error, response) {
                testResults.numResponses++;

                if (error || !response) {
                    testResults.numErrors++;
                    return;
                }

                if (response.status && response.status === "success") {
                    if (response.userCardNumbers) {        
                        if (response.newUser) {
                            testResults.numUsersAdded++;
                        } else {
                            testResults.numUsersNotAdded++;
                        }
                    } else {
                        testResults.numUsersNotLoggedIn++;
                    }
                } else {
                    testResults.numErrors++;
                }
            });
        }

        addManyUsersCheckInterval = Script.setInterval(function() {
            if (testResults.numResponses >= NUM_USERS_TO_ADD ||
                testTimedOut(testStartTimestamp, ADD_MANY_USERS_TIMEOUT_MS)) {
                ui.sendMessage({
                    app: 'bingoTestApp',
                    method: 'addManyUsers',
                    status: "testComplete",
                    results: testResults
                });

                currentlyTestingAddManyUsers = false;
                maybeClearAddManyUsersCheckInterval();
            }
        }, ADD_MANY_USERS_CHECK_INTERVAL_MS);
    }

    function callAllNumbers() {
        Entities.callEntityServerMethod(NUMBER_WHEEL_ENTITY_ID, 'callAllNumbers', [AccountServices.username]);
        ui.sendMessage({
            app: 'bingoTestApp',
            method: 'callAllNumbers',
            status: "allNumbersRequested"
        });
    }

    // When a message is received from the app's UI,
    // handle that message.
    function onWebEventReceived(event) {
        if (event.app === 'bingo') {
            switch (event.method) {
                case "eventBridgeReady":
                    ui.sendMessage({
                        app: 'bingoTestApp',
                        method: "initializeUI"
                    });
                    break;

                case 'requestNewRound':
                    requestNewRound();
                    break;

                case 'addManyUsers':
                    addManyUsers();
                    break;

                case 'callAllNumbers':
                    callAllNumbers();
                    break;

                default:
                    print("Unhandled event.method received by bingoTestApp: " + JSON.stringify(event));
            }
        }
    }


    function onScriptEnding() {
        maybeClearAddManyUsersCheckInterval();
    }


    // When the app starts up, setup the App with AppUI
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/bingoTestApp_ui.html');
    function startup() {
        ui = new AppUi({
            buttonName: "BINGOTEST",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived
        });
    }


    Script.scriptEnding.connect(onScriptEnding);
    startup();
}());
