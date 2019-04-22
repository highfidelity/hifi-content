/*

    tab status
    tabstatus.js
    Created by Milad Nazeri on 2019-04-19
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/


(function(){
    

    // *************************************
    // START utility
    // *************************************
    // #region utility
    

    var APP_NAME = "tabStatus";
    function signal(method, data){
        ui.sendMessage({
            app: APP_NAME,
            method: method,
            data: data
        });
    }
    
    
    // #endregion
    // *************************************
    // END utility
    // *************************************

    // *************************************
    // START handlers
    // *************************************
    // #region handlers
    
    
    function onChange(newName){
        teamname = newName;
        Settings.setValue("tabStatus/teamname", newName);
    }


    // Handle someone updating the search term
    function onSearchChange(newSearch){
        currentSearch = newSearch;
        Settings.setValue("tabStatus/currentSearch", newSearch);
    }


    // Handle any changes in the sorting
    function onSortSettingsChange(newSortSettings){
        sortSettings = newSortSettings;
        Settings.setValue("tabStatus/sortSettings", sortSettings);
    }    
    
    
    // #endregion
    // *************************************
    // END handlers
    // *************************************
    // Handle someone changing the team name


    // Update the UI
    var username = AccountServices.username;
    var displayName = MyAvatar.displayName;
    var teamname = Settings.getValue("tabStatus/teamname", "");
    var currentSearch = Settings.getValue("tabStatus/currentSearch", "");
    var sortSettings = Settings.getValue("tabStatus/sortSettings", {
        currentlySearching: false,
        currentlySorted: false,
        sortType: null,
        previousSortType: null
    });
    function onMessage(message) {
        if (message.app !== "tabStatus") {
            return;
        }

        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "tabStatus",
                    method: "updateUI",
                    username: username,
                    displayName: displayName,
                    teamname: teamname,
                    currentSearch: currentSearch,
                    sortSettings: sortSettings,
                    isFirstRun: Settings.getValue("tabStatus/firstRun", true),
                });
                break;

            case "onChange":
                onChange(message.data.teamname);
                break;

            case "onSearchChange":
                onSearchChange(message.data.currentSearch);
                break;

            case "onSortSettingsChange":
                onSortSettingsChange(message.data);
                break;
            
            case "onGotItClicked":
                Settings.setValue("tabStatus/firstRun", false);
                signal("gotItClicked");
                break;
    
            default:
                console.log("Unhandled message from tabStatus.js: " + JSON.stringify(message));
                break;
        }
    }
    

    // main
    function scriptEnding(){
    }

    var BUTTON_NAME = "TAB-STATUS";
    var APP_UI_URL = Script.resolvePath('./resources/tabStatus.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            onMessage: onMessage,
            graphicsDirectory: Script.resolvePath("./resources/images/icons/")
        });

        Script.scriptEnding.connect(scriptEnding);
    }
  
    startup();

})();