(function () {
    // logging function for the browser
    var PREPEND = "\n##Logger:Avimoji:App::\n";
    var DEBUG = false;
    function l(label, data, overrideDebug, i){
        if (!overrideDebug === "temp") {
            if (!DEBUG) {
                if (overrideDebug !== true) {
                    return;
                }
            }
        }

        if (overrideDebug === "off") {
            return;
        }

        data = typeof data === "undefined" ? "" : data;
        data = typeof data === "string" ? data :  (JSON.stringify(data, null, 4) || "");
        data = data + " " || "";
        if (typeof(i) === "number"){
            i = i;
        } else {
            i = "";
        }
        console.log(PREPEND + label + ": " + data + i +"\n");
    }
    Script.require("./objectAssign.js");
    var emojiList = Script.require("./emojiList.json?" + Date.now());
    var EntityMaker = Script.require("./entityMaker.js");
    var imageURLBase = "https://hifi-content.s3.amazonaws.com/milad/ROLC/mnt/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/Prototyping/avimoji/images/emojis2/png1024/";


    var MAX_PER_GROUP = 260;
    var emojiChunks = [];
    for (var i = 0, len = emojiList.length; i < len; i += MAX_PER_GROUP) {
        emojiChunks.push(emojiList.slice(i, i + MAX_PER_GROUP));
    }

    var currentEmoji = new EntityMaker('avatar');

    var emojiSequence = [];
    var selectedEmoji = null;

    var shouldWearMask = Settings.getValue("avimoji/shouldWearMask", false);
    function handleShouldWearMask(newShouldWearMask) {
        shouldWearMask = newShouldWearMask;
        if (currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }
        Settings.setValue("avimoji/shouldWearMask", shouldWearMask);
    }

    var DEFAULT_EMOJI_SCALER = 0.27;
    var emojiScaler = Settings.getValue("avimoji/emojiScaler", DEFAULT_EMOJI_SCALER);
    function updateEmojiScaler(newScaler) {
        emojiScaler = newScaler;
        if (currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }
        Settings.setValue("avimoji/emojiScaler", emojiScaler);
    }

    // *************************************
    // START Overlays
    // *************************************
    // #region Overlays
    
    var DISTANCE_CHECK = 1;
    function shouldDrawOverlay(){
        var myAvatarHeadPosition = MyAvatar.getHeadPosition();
        var cameraPosition = Camera.position;
        var distance = Vec3.distance(myAvatarHeadPosition, cameraPosition);
        if (distance > DISTANCE_CHECK) {
            return false;
        }
        return true;
    }

    var emojiOverlay;
    var OVERLAY_PADDING_SCALER = 0.65;
    var ALPHA_OVERLAY_TIMEOUT_MS = 100;
    function drawEmojiOverlay(width, height, imageURL) {
        l("in draw emoji overlay")
        var overlayPaddingX = width;
        var overlayPaddingY = height;
        var windowWidth = Window.innerWidth;
        var windowHeight = Window.innerHeight;
        var x = windowWidth - width - overlayPaddingX * OVERLAY_PADDING_SCALER;
        var y = windowHeight - height - overlayPaddingY * OVERLAY_PADDING_SCALER;

        var overlayProps = {
            x: x,
            y: y,
            // x: windowWidth - width + overlayPaddingX,
            // y: windowHeight + overlayPaddingY,   
            width: width, 
            height: height, 
            imageURL: imageURL,
            alpha: 0.0
        };
        l('overlayProps', overlayProps);
        emojiOverlay = Overlays.addOverlay("image", overlayProps);
        if (shouldDrawOverlay()){
            Script.setTimeout(function () {
                Overlays.editOverlay(emojiOverlay, {alpha: 1.0});
            }, ALPHA_OVERLAY_TIMEOUT_MS);
        }
        overlayTimer = Script.setInterval(overlayTimerHandler, OVERLAY_TIMER_INTERVAL_MS);
    }

    // Delete clickable status overlay on desktop
    function deleteEmojiOverlay() {
        if (emojiOverlay) {
            l("delting overlay")
            Overlays.deleteOverlay(emojiOverlay);
            emojiOverlay = false;
            maybeClearOverlayTimer();
        }
    }

    // When window resizes, redraw overlays
    function onWindowResize() {
        deleteEmojiOverlay();
        drawEmojiOverlay();
    }

    function onMousePressEvent(event) {
        // is primary button
        var overlayID = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });
        if (event.isLeftButton && overlayID && (overlayID === emojiOverlay)) {
            deleteEmojiOverlay();
            if (currentEmoji && currentEmoji.id) {
                currentEmoji.destroy();
                currentEmoji = new EntityMaker('avatar');
            }
        }
    }

    function onDomainChanged(){
        // do something
    }


    // Delete overlays when display mode changes to HMD mode
    // Draw overlays when mode is in desktop
    function onDisplayModeChanged(isHMDMode) {
        if (isHMDMode) {
            deleteEmojiOverlay();
        } else {
            drawEmojiOverlay();
        }
    }



    
    // #endregion
    // *************************************
    // END Overlays
    // *************************************

    function maybeClearOverlayTimer(){
        if (overlayTimer) {
            Script.clearInterval(overlayTimer);
            overlayTimer = null;
        }
    }

    function overlayTimerHandler(){
        if (emojiOverlay){ 
            if (shouldDrawOverlay()){
                Overlays.editOverlay(emojiOverlay, {alpha: 1.0});
            } else {
                Overlays.editOverlay(emojiOverlay, {alpha: 0.0});
            }

        }

    }
    var overlayTimer = null;
    var OVERLAY_TIMER_INTERVAL_MS = 500;

    var ALPHA_TIMEOUT_MS = 40;
    var OVERLAY_SIZE = 144;
    function addEmojiToUser(emoji) {
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
            currentEmoji = new EntityMaker('avatar');
            deleteEmojiOverlay();
        }
        var neckPosition, avatarScale, aboveNeck, emojiPosition;
        if (shouldWearMask) {
            currentEmoji.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
            // var neckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
            neckPosition = [0, 0, 0.24];
            avatarScale = MyAvatar.scale;
            aboveNeck = 0.13;
            emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * aboveNeck, 0]);
        } else {
            neckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
            avatarScale = MyAvatar.scale;
            aboveNeck = 0.7;
            emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * aboveNeck * (1 + emojiScaler * 0.27), 0]);
        }

        var IMAGE_SIZE = avatarScale * emojiScaler;
        var dimensions = { x: IMAGE_SIZE, y: IMAGE_SIZE, z: IMAGE_SIZE };
        var parentID = MyAvatar.sessionUUID;
        var imageURL = imageURLBase + emoji.code[0] + ".png";
        currentEmoji
            .add('type', "Image")
            .add('name', 'AVIMOJI')
            .add('localPosition', emojiPosition)
            .add('dimensions', dimensions)
            .add('parentID', parentID)
            .add('emissive', true)
            .add('imageURL', imageURL)
            // .add("subImage", subImage)
            .add('ignorePickIntersection', true)
            .add('alpha', 0)
            .add('userData', "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }")
            .create();

        drawEmojiOverlay(OVERLAY_SIZE, OVERLAY_SIZE, imageURL);

        Script.setTimeout(function () {
            currentEmoji.edit('alpha', 1.0);
        }, ALPHA_TIMEOUT_MS);
    }

    function keyPress(event) {
        if (event.key === 16777220 && event.isControl) {
            l("keypressmade");
            if (ui.isOpen) {
                ui.close();
            } else {
                ui.open();
            }
        }
    }

    oneShotMode = false;
    var ONE_SHOT_MODE_MS = 3000;
    function emojiSelected(emoji) {
        l("advancedModeOn", advancedModeOn);
        if (!advancedModeOn) {
            l("in advanced mode off");
            if (selectedEmoji && selectedEmoji.code[0] === emoji.code[0]) {
                currentEmoji.destroy();
                currentEmoji = new EntityMaker('avatar');
                selectedEmoji = null;
                return;
            }
        } else {
            if (oneShotMode) {
                addEmojiToUser(emoji);
                Script.setTimeout(function () {
                    if (currentEmoji && currentEmoji.id) {
                        currentEmoji.destroy();
                        currentEmoji = new EntityMaker('avatar');
                    }
                }, ONE_SHOT_MODE_MS);
                return;
            }
            emojiSequence.push(emoji);
        }
        selectedEmoji = emoji;
        addEmojiToUser(selectedEmoji);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
        addToFavorites(emoji);
    }

    // Update the play state 
    var isPlaying = false;
    function updateIsPlaying(playState) {
        isPlaying = playState;
        if (playState) {
            playEmojiSequence();
        } else {
            stopEmojiSequence();
        }
    }

    var favorites = Settings.getValue("avimoji/favorites", {});
    function addToFavorites(emoji){
        if (!favorites[emoji.code[0]]){
            favorites[emoji.code[0]] = {count: 1, code: emoji.code[0]};
        } else {
            favorites[emoji.code[0]].count++;
        }
        Settings.setValue("avimoji/favorites", favorites);
        ui.sendMessage({
            app: "avimoji",
            method: "updateFavorites",
            favorites: favorites
        });
    }

    function findValue(index, array, offset) {
        offset = offset || 0;
        return array[(index + offset) % array.length];
    }

    var currentIndex = 0;
    var playEmojiInterval = null;

    function onPlayEmojiInterval() {
        var emoji = findValue(currentIndex, emojiSequence);
        addEmojiToUser(emoji);
        ui.sendMessage({
            app: "avimoji",
            method: "updateCurrentEmoji",
            selectedEmoji: emoji
        });
        currentIndex++;
    }

    function maybeClearPlayEmojiInterval() {
        if (playEmojiInterval) {
            Script.clearInterval(playEmojiInterval);
            playEmojiInterval = null;
        }
    }

    var emojiSwitchMS = 1200;
    function playEmojiSequence() {
        l("about to play at the following ms:", emojiSwitchMS);
        playEmojiInterval = Script.setInterval(onPlayEmojiInterval, emojiSwitchMS);
    }


    function stopEmojiSequence() {
        maybeClearPlayEmojiInterval();
        isPlaying = false;
        currentIndex = 0;
    }

    function deleteEmojiInSequence(index) {
        l("in deleteEmoji")
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

    function updateSwitchIntervalTime(newSwitchIntervalTime) {
        l("in updateSwitchIntervalTime", newSwitchIntervalTime);
        emojiSwitchMS = newSwitchIntervalTime;
        if (isPlaying) {
            maybeClearPlayEmojiInterval();
            playEmojiSequence();
        }
    }

    var advancedModeOn = Settings.getValue("avimoji/advancedModeOn", false);
    function handleAdvancedMode(newAdvancedModeState){
        advancedModeOn = newAdvancedModeState;
        Settings.setValue("avimoji/advancedModeOn", advancedModeOn);
    }

    function pruneOldAvimojis(){
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            if (avatarEntity.name.toLowerCase().indexOf("avimoji") > -1){
                l("FOUND SOME OLD AVIMOJIS!!! \N\N DELETING!!! \N\N")
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }

    function resetList() {
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
            currentEmoji = new EntityMaker('avatar');
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
    function handleOneShotMode(newOneShot) {
        oneShotMode = newOneShot;
    }


    var INTERVAL = 200;
    var currentChunk = 0;
    function sendEmojiChunks() {
        l('sending chunk', null, "off");
        if (currentChunk >= emojiChunks.length) {
            currentChunk = 0;
            return;
        } else {
            var chunk = emojiChunks[currentChunk];
            ui.sendMessage({
                app: "avimoji",
                method: "sendChunk",
                chunkNumber: currentChunk,
                totalChunks: emojiChunks.length,
                chunk: chunk
            });
            currentChunk++;
            Script.setTimeout(function () {
                sendEmojiChunks();
            }, INTERVAL);
        }
    }

    function onMessage(message) {
        if (message.app !== "avimoji") {
            return;
        }

        switch (message.method) {
            case "eventBridgeReady":
                l("in eventbrdige ready");
                ui.sendMessage({
                    app: "avimoji",
                    method: "updateUI",
                    selectedEmoji: selectedEmoji,
                    emojiSequence: emojiSequence,
                    shouldWearMask: shouldWearMask,
                    oneShotMode: oneShotMode,
                    emojiSwitchMS: emojiSwitchMS,
                    isPlaying: isPlaying,
                    emojiScaler: emojiScaler,
                    favorites: favorites,
                    advancedModeOn: advancedModeOn
                });
                sendEmojiChunks();
                break;

            case "emojiSelected":
                emojiSelected(message.emoji);
                break;

            case "handleShouldWearMask":
                l("message.shouldWearMask", message.shouldWearMask);
                handleShouldWearMask(message.shouldWearMask);
                break;

            case "handleOneShotMode":
                l("message.oneShotMode", message.oneShotMode);
                handleOneShotMode(message.oneShotMode);
                break;

            case "updateIsPlaying":
                l("received is playing");
                updateIsPlaying(message.isPlaying);
                break;

            case "deleteEmojiInSequence":
                deleteEmojiInSequence(message.index);
                break;

            case "updateSwitchIntervalTime":
                updateSwitchIntervalTime(message.switchIntervalTime);
                break;

            case "resetList":
                resetList();
                break;

            case "updateEmojiScaler":
                updateEmojiScaler(message.emojiScaler);
                break;
            case "handleAdvancedMode":
                handleAdvancedMode(message.newAdvancedModeState);
                break;
            default:
                l("Unhandled message from avimoji.js", message);
                break;
        }
    }

    function scriptEnding() {
        deleteEmojiOverlay();
        Controller.mousePressEvent.disconnect(onMousePressEvent);
        Window.geometryChanged.disconnect(onWindowResize);
        Controller.keyPressEvent.disconnect(keyPress);
        HMD.displayModeChanged.disconnect(onDisplayModeChanged);
        Window.domainChanged.disconnect(onDomainChanged);
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
        }
        maybeClearOverlayTimer();
        maybeClearPlayEmojiInterval();
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

        pruneOldAvimojis();

        Controller.keyPressEvent.connect(keyPress);
        Script.scriptEnding.connect(scriptEnding);

        Controller.mousePressEvent.connect(onMousePressEvent);
        Window.geometryChanged.connect(onWindowResize);
        HMD.displayModeChanged.connect(onDisplayModeChanged);
        Window.domainChanged.connect(onDomainChanged);
    }


    startup();

})();