(function(){
    var username = AccountServices.username;
    var displayName = MyAvatar.displayName;
    var teamname = Settings.getValue("tabStatus/teamname", "");
    var currentSearch = Settings.getValue("tabStatus/currentSearch", "");
    var sortSettings = Settings.getValue("tabStatus/sortSettings", {});
    function onChange(newName){
        teamname = newName;
        Settings.setValue("tabStatus/teamname", newName);
        var teamnameTest = Settings.getValue("tabStatus/teamname", "");
    }

    function onSearchChange(newSearch){
        currentSearch = newSearch;
        Settings.setValue("tabStatus/currentSearch", newSearch);
    }

    function onSortSettingsChange(newSortSettings){
        sortSettings = newSortSettings;
        Settings.setValue("tabStatus/sortSettings", {});
    }


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
                    sortSettings: sortSettings
                });
                break;
            case "onChange":
                onChange(message.data.teamname);
                break;
            case "onSearchChange":
                onSearchChange(message.data.currentSearch);
                break;
            case "onSortSettingsChange":
                onSortSettingsChange(message.data.sortSettings);
                break;
            default:
                console.log("Unhandled message from tabStatus.js: " + JSON.stringify(message));
                break;
        }
    }
    
    function scriptEnding(){
    }

    var BUTTON_NAME = "TAB STATUS";
    var APP_UI_URL = Script.resolvePath('./tabStatus.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            onMessage: onMessage
        });

        Script.scriptEnding.connect(scriptEnding);
    }


  
    startup();

})();




