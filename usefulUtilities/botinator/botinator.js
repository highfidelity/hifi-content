//
//    Botinator
//    Created by Milad Nazeri on 2019-02-16
//    Copyright 2019 High Fidelity, Inc.
//
//    Distributed under the Apache License, Version 2.0.
//    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//    Keeping the bot type plumbing commented out for the meantime


(function () {
    
    // *************************************
    // START CONSTS_AND_VARS
    // *************************************
    // #region CONSTS_AND_VARS
    
    
    var ASSIGNMENT_CLIENT_MESSANGER_CHANNEL = "ASSIGNMENT_CLIENT_MESSANGER_CHANNEL";

    var X = 0;
    var Y = 1;
    var Z = 2;

    var volume = 1.0;
    var contentBoundaryCorners = [[0,0,0], [[1,1,1]]];
    var totalNumberOfBotsNeeded = 0;
    var availableACs = 0;
    // var botType = "MARK";


    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************

    // *************************************
    // START UTILITY
    // *************************************
    // #region UTILITY
    

    // Convert object to array to make sure we are compatable with the other function, also format it to 2 decimal places
    var FIXED_DIGITS = 2;
    function convertPositionToArray(position){
        return [ 
            +position.x.toFixed(FIXED_DIGITS), 
            +position.y.toFixed(FIXED_DIGITS), 
            +position.z.toFixed(FIXED_DIGITS)
        ];
    }


    // Called when the script is closing
    function scriptEnding() {
        Messages.messageReceived.disconnect(onTabletChannelMessageReceived);
        Messages.unsubscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, JSON.stringify({
            action: "STOP"
        }));
    }

    
    // Updates the bot player volume
    function updateVolume(newVolume){
        volume = newVolume;
    }


    // Update the content boundry to be used for the random location
    function updateContentBoundaryCorners(cornerType){
        contentBoundaryCorners[cornerType] = convertPositionToArray(MyAvatar.position);
        ui.sendMessage({
            app: "botinator",
            method: "UPDATE_CONTENT_BOUNDARY_CORNERS",
            contentBoundaryCorners: contentBoundaryCorners
        });
    }


    // Update the total number of bots needed for the test
    function updateTotalNumberOfBotsNeeded(newTotalNumberOfBotsNeeded){
        totalNumberOfBotsNeeded = newTotalNumberOfBotsNeeded;
    }

    
    // Change which bot type you would like to use :: Currently Flow and Mark
    // function updateBotType(newBotType){
    //     botType = newBotType;
    // }


    // Update the tablet app with the number of ACs currently online
    function updateAvailableACs(newAvailableACs){
        console.log("IN UPDATE AVAILABLE AC");
        availableACs = newAvailableACs;
        ui.sendMessage({
            app: "botinator",
            method: "UPDATE_AVAILABLE_ACS",
            availableACs: availableACs
        });
    }


    // Request how many ACs are available
    function getManagerStatus(){
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, JSON.stringify({
            action: "GET_MANAGER_STATUS"
        }));
    }
    

    // Send the new data to the messanger
    function sendData() {
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, JSON.stringify({
            action: "SEND_DATA",
            contentBoundaryCorners: contentBoundaryCorners,
            volume: volume,
            totalNumberOfBotsNeeded: totalNumberOfBotsNeeded
        }));
    }


    // Update the play state 
    var playState = false;
    function updatePlayState(isPlaying) {
        playState = isPlaying;
        var controlType = playState ? "PLAY" : "STOP";
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, JSON.stringify({
            action: controlType
        }));
    }


    // Update the play state 
    function updateCurrentServerPlayStatus(isPlaying) {
        playState = isPlaying;
        ui.sendMessage({
            app: "botinator",
            method: "UPDATE_CURRENT_SERVER_PLAY_STATUS",
            availableACs: availableACs
        });

    }

    
    // #endregion
    // *************************************
    // END UTILITY
    // *************************************

    // *************************************
    // START MESSAGES
    // *************************************
    // #region MESSAGES
    
    
    function onTabletChannelMessageReceived(channel, message, sender){
        try {
            message = JSON.parse(message);
        } catch (error) {
            console.log("MESSAGE:", message);
            console.log("invalid object");
            return;
        }

        if (channel !== ASSIGNMENT_CLIENT_MESSANGER_CHANNEL || sender === MyAvatar.sessionUUID) {
            return;
        }

        console.log("MESSAGE IN INTERFACE SCRIPT FROM TABLET", JSON.stringify(message));

        switch (message.action) {
            case "AC_AVAILABLE_UPDATE":
                console.log("in AC_AVAILABLE_UPDATE");
                console.log("message.newAvailableACs", message.newAvailableACs);
                updateAvailableACs(message.newAvailableACs);
                break;
            case "GET_MANAGER_STATUS":
                console.log("in GET_MANAGER_STATUS");
                updateAvailableACs(message.newAvailableACs);
                updateCurrentServerPlayStatus(message.currentlyRunningBots);
                break;
            default:
                console.log("unrecongized action in assignmentClientManger.js");
                break;
        }
    }
    
    
    // #endregion
    // *************************************
    // END MESSAGES
    // *************************************

    // *************************************
    // START TABLET
    // *************************************
    // #region TABLET
    

    // Run when the tablet is opened
    function onOpened() {
    }


    function onMessage(message) {
        if (message.app !== "botinator") {
            return;
        }
        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "botinator",
                    method: "UPDATE_UI",
                    volume: volume,
                    contentBoundaryCorners: contentBoundaryCorners,
                    totalNumberOfBotsNeeded: totalNumberOfBotsNeeded,
                    availableACs: availableACs,
                    playState: playState
                    // botType: botType,
                });
                break;
            case "updateVolume":
                updateVolume(message.volume);
                break;
            case "updateContentBoundaryCorners":
                updateContentBoundaryCorners(message.cornerType);
                break;
            case "updateTotalNumberOfBotsNeeded":
                updateTotalNumberOfBotsNeeded(message.totalNumberOfBotsNeeded);
                break;
            case "updatePlayState":
                console.log(message.playState);
                updatePlayState(message.playState);
                break;
            // case "updateBotType":
            //     updateBotType(message.botType);
            //     break;
            case "sendData":
                sendData();
                break;
            default:
                console.log("Unhandled message from userInspector_ui.js: " + JSON.stringify(message));
                break;
        }
    }

    
    var BUTTON_NAME = "BOTINATOR";
    var APP_UI_URL = Script.resolvePath('tabletApp/botinator_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    
    
    // #endregion
    // *************************************
    // END TABLET
    // *************************************

    // *************************************
    // START MAIN
    // *************************************
    // #region MAIN
    
    
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            // User by Craig from the Noun Project
            graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
            onOpened: onOpened,
            onMessage: onMessage
        });
        Messages.messageReceived.connect(onTabletChannelMessageReceived);
        Messages.subscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Script.scriptEnding.connect(scriptEnding);

        getManagerStatus();
    }


    startup();
    
    
    // #endregion
    // *************************************
    // END MAIN
    // *************************************

})();