(function(){
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')

    var emojiList = Script.require("./emojiList.js?" + Date.now());
    var entityMaker = Script.require("./entityMaker.js");

    var imageURLBase = "https://hifi-content.s3.amazonaws.com/milad/ROLC/mnt/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/Prototyping/avimoji/images/emojis/"
    
    var MAX_EMOJIS = 3000;

    var filteredEmojiList = emojiList
        .slice(0, MAX_EMOJIS)
        .filter(function(emoji){
            if (emoji.code[0].slice(0,2) === "00") {
                return false;
            }

            if (emoji.shortName.slice(0,4) === "flag") {
                return false;
            }

            return true;
        });
    log("filteredEmojiList", filteredEmojiList.length)

    var currentEmoji = new entityMaker('avatar');

    var emojiSequence = [];
    var selectedEmoji = null;
    
    function handleShouldWearMask(newShouldWearMask){
        shouldWearMask = newShouldWearMask;
        if (currentEmoji && currentEmoji.id){
            addEmojiToUser(selectedEmoji)
        }
    }


    function updateEmojiScaler(newScaler){
        emojiScaler = newScaler;
        if (currentEmoji && currentEmoji.id){
            addEmojiToUser(selectedEmoji)
        }
    }

    var shouldWearMask = false;
    var emojiScaler = 0.27;
    var ALPHA_TIMEOUT_MS = 40;
    function addEmojiToUser(emoji) {
        if (currentEmoji && currentEmoji.id){
            currentEmoji.destroy();
            currentEmoji = new entityMaker('avatar');
        }
        if (shouldWearMask){
            currentEmoji.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
            // var neckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
            var neckPosition = [0, 0, 0.24]
            var avatarScale = MyAvatar.scale;
            var ABOVE_NECK = 0.13;
            var emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * ABOVE_NECK, 0]); 
        } else {
            var neckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
            var avatarScale = MyAvatar.scale;
            var ABOVE_NECK = 0.7;
            var emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * ABOVE_NECK * (1 + emojiScaler * 0.27), 0]); 
        }

        var IMAGE_SIZE = avatarScale * emojiScaler;
        var dimensions = {x: IMAGE_SIZE, y: IMAGE_SIZE, z: IMAGE_SIZE};
        var parentID = MyAvatar.sessionUUID;
        var imageURL = imageURLBase + emoji.code[0] + ".png";
        // log("currentEmoji", currentEmoji);
        currentEmoji
            .add('type', "Image")
            .add('name', 'milad emoji')
            .add('localPosition', emojiPosition)
            .add('dimensions', dimensions) 
            .add('parentID', parentID)
            .add('emissive', true)
            .add('imageURL', imageURL)
            .add('ignorePickIntersection', true)
            .add('alpha', 0)
            .add('userData', "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }")
            .create();


        Script.setTimeout(function(){
            currentEmoji.edit('alpha', 1.0);
        }, ALPHA_TIMEOUT_MS)
    }
    
    function keyPress(event) {
        if (event.key === 16777220 && event.isControl) {
            console.log("keypressmade")
            if (ui.isOpen) {
                ui.close();
            } else {
                ui.open();
            }
        }
    }
    
    oneShotModeMS = 4000;
    function emojiSelected(emoji){
        console.log("selected", JSON.stringify(emoji));
        if (oneShotMode){
            addEmojiToUser(emoji);
            Script.setTimeout(function(){
                if (currentEmoji && currentEmoji.id){
                    currentEmoji.destroy();
                    currentEmoji = new entityMaker('avatar');
                }
            }, oneShotModeMS)
            return;
        }

        selectedEmoji = emoji;
        emojiSequence.push(emoji);
        
        addEmojiToUser(selectedEmoji);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }

    // Update the play state 
    var isPlaying = false;
    var PLAY_VOLUME = 0.01;
    function updateIsPlaying(playState) {
        isPlaying = playState;
        if (playState) {
            playEmojiSequence();
        } else {
            stopEmojiSequence();
        }
    }

    function findValue(index, array, offset) {
        offset = offset || 0;
        return array[(index + offset) % array.length];
    }

    var currentIndex = 0;
    var playEmojiInterval = null;

    function onPlayEmojiInterval(){
        var emoji = findValue(currentIndex, emojiSequence);
        addEmojiToUser(emoji);
        ui.sendMessage({
            app: "avimoji",
            method: "updateCurrentEmoji",
            selectedEmoji: emoji
        });
        currentIndex++;
    }

    function maybeClearPlayEmojiInterval(){
        if (playEmojiInterval){
            Script.clearInterval(playEmojiInterval);
            playEmojiInterval = null;
        }
    }

    var emojiSwitch_ms = 1200;
    function playEmojiSequence(){
        console.log("about to play at the following ms:", emojiSwitch_ms)
        playEmojiInterval = Script.setInterval(onPlayEmojiInterval, emojiSwitch_ms)
    }


    function stopEmojiSequence(){
        maybeClearPlayEmojiInterval()
        isPlaying = false;
        currentIndex = 0;
    }

    function deleteEmojiInSequence(index){
        emojiSequence.splice(index, 1);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
        if (emojiSequence.length === 0) {
            maybeClearPlayEmojiInterval();
        }
    }

    function updateSwitchIntervalTime(newSwitchIntervalTime){
        console.log("in updateSwitchIntervalTime",newSwitchIntervalTime )
        emojiSwitch_ms = newSwitchIntervalTime;
        if (isPlaying){
            maybeClearPlayEmojiInterval();
            playEmojiSequence();
        }
    }


    function resetList(){
        if (currentEmoji && currentEmoji.id){
            currentEmoji.destroy();
            currentEmoji = new entityMaker('avatar');
        }
        stopEmojiSequence();
        emojiSequence = [];
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }
    
    var oneShotMode = false;
    function handleOneShotMode(newOneShot){
        oneShotMode = newOneShot;
    }

    function onMessage(message) {
        if (message.app !== "avimoji") {
            return;
        }

        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({
                    app: "avimoji",
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

            case "emojiSelected":
                emojiSelected(message.emoji);
                break;

            case "handleShouldWearMask":
                console.log("message.shouldWearMask", message.shouldWearMask)
                handleShouldWearMask(message.shouldWearMask)
                break;

            case "handleOneShotMode":
                console.log("message.oneShotMode", message.oneShotMode)
                handleOneShotMode(message.oneShotMode);
                break;

            case "updateIsPlaying":
                console.log("received is playing")
                updateIsPlaying(message.isPlaying);
                break;

            case "deleteEmojiInSequence":
                deleteEmojiInSequence(message.index)
                break;

            case "updateSwitchIntervalTime":
                updateSwitchIntervalTime(message.switchIntervalTime)
                break;

            case "resetList":
                resetList();
                break;
            
            case "updateEmojiScaler":
                updateEmojiScaler(message.emojiScaler);
                break;

            default:
                console.log("Unhandled message from avimoji.js: " + JSON.stringify(message));
                break;
        }
    }
    
    function scriptEnding(){
        Controller.keyPressEvent.disconnect(keyPress);
        if (currentEmoji && currentEmoji.id){
            currentEmoji.destroy();
        }
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




