(function(){
    function onMessage(message) {
        if (message.app !== "tabstatus") {
            return;
        }

        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "tabstatus",
                    method: "updateUI",
                    emojiList: filteredEmojiList,
                    selectedEmoji: selectedEmoji,
                    emojiSequence: emojiSequence,
                    shouldWearMask: shouldWearMask,
                    oneShotMode: oneShotMode,
                    emojiSwitch_ms: emojiSwitch_ms,
                    isPlaying: isPlaying,
                    emojiScaler: emojiScaler
                });
                break;

            default:
                console.log("Unhandled message from tabstatus.js: " + JSON.stringify(message));
                break;
        }
    }
    
    function scriptEnding(){
    }

    var BUTTON_NAME = "tabstatus";
    var APP_UI_URL = Script.resolvePath('./tabstatus.html');
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




