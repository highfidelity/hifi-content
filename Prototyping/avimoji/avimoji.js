(function(){

    var avimojiHTML = Script.resolvePath('./avimoji_ui.html');
    // var entityMaker = Script.require("./entityMaker.js");

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
                aviWindow.setVisible(false);
                aviWindowRaised = false;
            } else {
                aviWindow.raise();
                aviWindow.setVisible(true);
                aviWindowRaised = true;
            }
        }
    }
    

    function emojiSelected()
    var selectedEmoji = null;
    function handleOverlayEvent(message) {
        try {
            message = JSON.parse(message);
        } catch (e) {
            console.log("couldn't parse anvimoji message")
            return;
        }

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

    aviWindow.webEventReceived.connect(handleOverlayEvent)
    Controller.keyPressEvent.connect(keyPress);

    Script.scriptEnding.connect(function(){
        aviWindow.close();
        Controller.keyPressEvent.disconnect(keyPress);
    })


})();


function addEmojiToUser(emoji) {
    var neckPosition = MyAvatar.getNeckPosition();
    var avatarScale = MyAvatar.scale;
    var ABOVE_NECK = 0.75;
    var overlayPosition = Vec3.sum(neckPosition, [0, avatarScale * ABOVE_NECK, 0]); 
    var IMAGE_SIZE = avatarScale * 0.3;

    var overlayProperties = {
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

