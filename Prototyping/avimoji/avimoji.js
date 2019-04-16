(function(){

    var avimojiHTML = Script.resolvePath('./avimoji_ui.html');
    var entityMaker = Script.require("./entityMaker.js");

    var aviWindowRaised = false;
    var aviWindow = new OverlayWebWindow({
        title: "avimoji",
        width: 750,
        height: 300,
        visible: false
    });
    aviWindow.setURL(avimojiHTML);
    // aviWindow.setVisible(true);
    // aviWindow.raise();

    function keyPress(event) {
        if (event.key === 16777220 && event.isControl) {
            console.log("keypressmade")
            if (aviWindowRaised) {
                ui.close();
            } else {
                ui.open();
            }
        }
    }
    

    function emojiSelected(emoji){
        console.log(JSON.stringify(emoji));
    }


    var selectedEmoji = null;
    function onMessage(message) {
        if (message.app !== "avimoji") {
            return;
        }

        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    method: "updateUI",
                });
                break;

            case "emojiSelected":
                emojiSelected(message.emoji);
                break;

            default:
                console.log("Unhandled message from avimoji.js: " + JSON.stringify(message));
                break;
        }
    }
    
    function scriptEnding(){
        Controller.keyPressEvent.disconnect(keyPress);
    }

    var BUTTON_NAME = "AVIMOJI";
    var APP_UI_URL = Script.resolvePath('avimoji_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            onMessage: onMessage
        });

        Controller.keyPressEvent.connect(keyPress);
        Script.scriptEnding.connect(scriptEnding);
    }


  
    startup();

})();


function addEmojiToUser(emoji) {
    var neckPosition = MyAvatar.getNeckPosition();
    var avatarScale = MyAvatar.scale;
    var ABOVE_NECK = 0.75;
    var overlayPosition = Vec3.sum(neckPosition, [0, avatarScale * ABOVE_NECK, 0]); 
    var IMAGE_SIZE = avatarScale * 0.3;

    var imageProperties = {
        position: overlayPosition,
        dimensions: {x: IMAGE_SIZE, y: IMAGE_SIZE, z: IMAGE_SIZE},
        alpha: 1.0,
        color: [255, 255, 255],
        parentID: MyAvatar.sessionUUID,
        // isFacingAvatar: true,
        url: Script.resolvePath("./resources/images/speaker.png")
    };

    var overlayID = Overlays.addOverlay("image3d", overlayProperties);
    user.overlayID = overlayID;
}

