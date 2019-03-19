//
// bingoWinnerApp.js
// Created by Zach Fox on 2019-03-18
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    // Two main cases here:
    // 1. The user has previously filled their `userCardNumbers` array with a result from the backend.
    //     Send a message to the UI with those numbers, the selectedNumberIDs, and the cardColor
    // 2. The user doesn't have a cached `userCardNumbers` array. In that case:
    //     i. Request card numbers and card color from the server
    //     ii. If the response indicates success, send that data to the UI
    //         a. If the server indicates that the user is new, tell the player counter text to
    //             add one to its count.
    var REQUEST_BASE_URL = Script.require(Script.resolvePath('../config/config.json?' + Date.now())).requestURL;
    var request = Script.require('request').request;
    var tableName = "";
    function updateEmail(email) {
        if (tableName.length <= 1) {
            ui.sendMessage({
                app: APP_NAME,
                method: "error",
                errorText: "We couldn't update your email address. Please contact High Fidelity. Error code: 1"
            });
            return;
        }

        if (AccountServices.username === "Unknown user") {
            ui.sendMessage({
                app: APP_NAME,
                method: "emailUpdateError",
                errorText: "Please log in before attempting to update your username!"
            });
            return;
        }

        var requestBody = {
            "type": "setEmail",
            "tableName": tableName,
            "username": AccountServices.username,
            "email": email
        };
        request({
            uri: REQUEST_BASE_URL,
            method: "POST",
            json: true,
            body: requestBody
        }, function (error, response) {
            if (error || !response || !response.status || response.status !== "success") {
                ui.sendMessage({
                    app: APP_NAME,
                    method: "emailUpdateError",
                    errorText: "We couldn't update your email address. " +
                        "Please contact support@highfidelity.com and include your High Fidelity username, " +
                        "the prize you won, the current date, and \"Error Code: 2\"."
                });
                return;
            }
            if (response.status && response.status === "success") {
                ui.sendMessage({
                    app: APP_NAME,
                    method: "emailUpdateSuccess",
                    successText: "Your email address has been recorded. " +
                        "A member of High Fidelity staff will be in touch with you soon to discuss your winnings. Thank you!"
                });
            }
        });         
    }


    function onEventBridgeReady() {
        if (AccountServices.username === "Unknown user") {
            ui.sendMessage({
                app: APP_NAME,
                method: "emailUpdateError",
                errorText: "Please log in before attempting to update your username!"
            });
            return;
        }

        request({
            uri: REQUEST_BASE_URL + "?type=getWinnerInfo&username=" + AccountServices.username
        }, function (error, response) {
            // Last two clauses of this conditional is anti-error protection
            if (response.status &&
                response.status === "success" &&
                response.currentTableName &&
                response.currentTableName.length > 1 &&
                response.prizeWon) {
                tableName = response.currentTableName;
                ui.sendMessage({
                    app: APP_NAME,
                    method: "initializeUI",
                    prizeWon: response.prizeWon
                });
            } else {
                ui.sendMessage({
                    app: APP_NAME,
                    method: "error",
                    errorText: "We couldn't update your email address. " +
                        "Please contact support@highfidelity.com and include your High Fidelity username, " +
                        "the prize you won, the current date, and \"Error Code: 3\"."
                });
            }
        });
    }


    function finishAndClose() {
        var scriptList = ScriptDiscoveryService.getRunning();
        scriptList.forEach(function (scriptInfo) {
            if (scriptInfo.name.toLowerCase().indexOf("bingowinner") > -1) {
                ScriptDiscoveryService.stopScript(scriptInfo.url);
                return true;
            }
        });
    }

   
    // Handle EventBridge messages from UI JavaScript.
    function onWebEventReceived(event) {
        if (event.app !== 'bingoWinnerApp') {
            return;
        }
        
        switch (event.method) {
            case "eventBridgeReady":
                onEventBridgeReady();
                break;


            case "updateEmail":
                updateEmail(event.data);
                break;


            case "finishAndClose":
                finishAndClose();
                break;


            default:
                console.log("Unrecognized event method supplied to Bingo Winner App JS: " + event.method);
                break;
        }
    }

    // Clear any previously-saved `tableName` variable value when opening the app
    function onOpened() {
        tableName = "";
    }


    // When the script starts up, setup AppUI and call `cacheSounds()`.
    // Also hook up necessary signals and open the app's UI.
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/bingoWinner_ui.html?0');
    var APP_NAME = "bingoWinnerApp";
    function startup() {
        ui = new AppUi({
            buttonName: "WINNER",
            home: appPage,
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            buttonPrefix: "bingo-",
            onMessage: onWebEventReceived,
            onOpened: onOpened,
            sortOrder: 1
        });
        ui.open();
    }

    startup();
})();
