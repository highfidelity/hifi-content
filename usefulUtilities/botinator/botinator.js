//
//
//    Botinator
//    Created by Milad Nazeri on 2019-02-16
//    Copyright 2019 High Fidelity, Inc.
//
//    Distributed under the Apache License, Version 2.0.
//    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//    Keeping the bot type plumbing commented out for the meantime
//
//


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

    // Clips for the start and stop feedback
    var audioClips = Script.require("./wavs.js?" + Date.now());
    var playClips = audioClips.play.map(function(sound){
        var soundUrl = Script.resolvePath(sound);
        return SoundCache.getSound(soundUrl);
    });
    var stopClips = audioClips.stop.map(function(sound){
        return SoundCache.getSound(Script.resolvePath(sound));
    });


    // #endregion
    // *************************************
    // END CONSTS_AND_VARS
    // *************************************

    // *************************************
    // START UTILITY
    // *************************************
    // #region UTILITY
    

    // Convert object to array to make sure we are compatable with the other functions, 
    // and to also format it for 2 decimal places
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
        ui.close();

        Messages.messageReceived.disconnect(onTabletChannelMessageReceived);
        Messages.unsubscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, JSON.stringify({
            action: "STOP"
        }));

        Window.domainChanged.disconnect(onDomainChanged);
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


    // Update the tablet app with the number of ACs currently online
    function updateAvailableACs(newAvailableACs){
        availableACs = newAvailableACs;
        ui.sendMessage({
            app: "botinator",
            method: "UPDATE_AVAILABLE_ACS",
            availableACs: availableACs
        });
    }


    // Request information about the player
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

        if (isPlaying) {
            isPlaying = !isPlaying;
            ui.sendMessage({
                app: "botinator",
                method: "UPDATE_CURRENT_SERVER_PLAY_STATUS",
                availableACs: availableACs,
                isPlaying: isPlaying
            });
        }
    }


    // Update the play state 
    var isPlaying = false;
    var PLAY_VOLUME = 0.01;
    function updateIsPlaying(playState) {
        isPlaying = playState;
        var controlType = isPlaying ? "PLAY" : "STOP";
        Messages.sendMessage(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL, JSON.stringify({
            action: controlType
        }));

        if (controlType === "PLAY") {
            var randomPlay = playClips[randIndex(0, playClips.length)];
            playSound(randomPlay, PLAY_VOLUME, MyAvatar.position, false);
        } else {
            var randomStop = stopClips[randIndex(0, stopClips.length)];
            playSound(randomStop, PLAY_VOLUME, MyAvatar.position, false);
        }
    }


    // Update the play state 
    function updateCurrentServerPlayStatus(playState) {
        isPlaying = playState;
        ui.sendMessage({
            app: "botinator",
            method: "UPDATE_CURRENT_SERVER_PLAY_STATUS",
            isPlaying: isPlaying
        });
    }


    // Run when you are changing domains to make sure the tablet updates
    var TIME_TO_WAIT_BEFORE_REQUESTING_MANAGER_STATUS_MS = 5000;
    function onDomainChanged(){
        updateAvailableACs(0);
        Script.setTimeout(function(){
            getManagerStatus();
        }, TIME_TO_WAIT_BEFORE_REQUESTING_MANAGER_STATUS_MS);
    }

    
    // Borrowed from bingo app:
    // Plays the specified sound at the specified position, volume, and localOnly
    // Only plays a sound if it is downloaded.
    // Only plays one sound at a time.
    var injector;
    function playSound(sound, volume, position, localOnly){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly
            });
        }
    }


    // Get a random index with a low and high
    function randIndex(low, high) {
        return Math.floor(low + Math.random() * (high - low));
    }


    // #endregion
    // *************************************
    // END UTILITY
    // *************************************

    // *************************************
    // START MESSAGES
    // *************************************
    // #region MESSAGES
    
    
    var IGNORE_MANAGER_MESSAGES = ["REGISTER_ME", "ARE_YOU_THERE_MANAGER"];
    function onTabletChannelMessageReceived(channel, message, sender){
        if (channel !== ASSIGNMENT_CLIENT_MESSANGER_CHANNEL || 
            sender === MyAvatar.sessionUUID || 
            IGNORE_MANAGER_MESSAGES.indexOf(message.action) > -1) {
            return;
        }

        try {
            message = JSON.parse(message);
        } catch (error) {
            console.log("invalid object", error);
            return;
        }

        switch (message.action) {


            case "AC_AVAILABLE_UPDATE":
                updateAvailableACs(message.newAvailableACs);
                break;


            case "GET_MANAGER_STATUS":
                updateAvailableACs(message.newAvailableACs);
                updateCurrentServerPlayStatus(message.isPlaying);
                if (message.closeTablet) {
                    ui.close();
                }
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
                    isPlaying: isPlaying
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


            case "updateIsPlaying":
                sendData();
                updateIsPlaying(message.isPlaying);
                break;


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
            // Robot by Oksana Latysheva from the Noun Project
            graphicsDirectory: Script.resolvePath("./tabletApp/images/icons/"),
            onMessage: onMessage
        });
        Messages.messageReceived.connect(onTabletChannelMessageReceived);
        Messages.subscribe(ASSIGNMENT_CLIENT_MESSANGER_CHANNEL);
        Window.domainChanged.connect(onDomainChanged);
        Script.scriptEnding.connect(scriptEnding);

        getManagerStatus();
    }


    startup();
    
    
    // #endregion
    // *************************************
    // END MAIN
    // *************************************

})();