/*

    Avimoji
    avimoji_app.js
    Created by Milad Nazeri on 2019-04-25
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

*/

(function () {

    // *************************************
    // START dependencies
    // *************************************
    // #region dependencies

    var log = Script.require("./resources/modules/log.js?" + Date.now());
    var EntityMaker = Script.require("./resources/modules/entityMaker.js?" + Date.now());
    var EasingFunctions = Script.require("./resources/modules/easing.js");

    var emojiList = Script.require("./resources/node/emojiList.json?" + Date.now());
    var emojiCodeMap = emojiList.reduce(function(previous, current, index){
        if (current && current.code && current.code.length > 0 && current.code[0]) {
            previous[current.code[0]] = index;
            return previous;
        }
    }, {});
    // log("emojiCodeMap", emojiCodeMap, "PRINT")
    var CONFIG = Script.require("./resources/config.json?" + Date.now());
    var imageURLBase = CONFIG.baseImagesURL;

    // #endregion
    // *************************************
    // END dependencies
    // *************************************

    // *************************************
    // START variables
    // *************************************
    // #region variables


    var entityType = Settings.getValue("avimoji/entityType", "avatar");
    var currentEmoji = new EntityMaker(entityType);

    var selectedEmoji = null;

    // #endregion
    // *************************************
    // END variables
    // *************************************

    // *************************************
    // START utility
    // *************************************
    // #region utility


    // Make the emoji groups
    var MAX_PER_GROUP = 250;
    var emojiChunks = [];
    function makeEmojiChunks() {
        for (var i = 0, len = emojiList.length; i < len; i += MAX_PER_GROUP) {
            emojiChunks.push(emojiList.slice(i, i + MAX_PER_GROUP));
        }
    }


    // Borrowed from bingo app:
    // Plays the specified sound at the specified position, volume, and localOnly
    // Only plays a sound if it is downloaded.
    // Only plays one sound at a time.
    var soundUrl = Script.resolvePath('./resources/sounds/emojiPopSound.wav');
    var popSound = SoundCache.getSound(soundUrl);
    var injector;
    var DEFAULT_VOLUME = 0.0003;
    function playSound(sound, volume, position, localOnly) {
        // log("is in play sound", null, "off");
        sound = sound || popSound;
        volume = volume || DEFAULT_VOLUME;
        position = position || MyAvatar.position;
        localOnly = localOnly || isLocal;
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


    var shouldTimeoutDelete = Settings.getValue("avimoji/shouldTimeoutDelete", true);
    var DEFAULT_TIMEOUT_MS = 7000;
    var defaultTimeout = null;
    function startTimeoutDelete() {
        defaultTimeout = Script.setTimeout(function () {
            maybePlayPop("off");
            selectedEmoji = null;
        }, DEFAULT_TIMEOUT_MS);
    }


    // Open up on ctrl + enter
    function keyPress(event) {
        if (event.key === 16777220 && event.isControl) {
            // log("keypressmade");
            if (ui.isOpen) {
                ui.close();
            } else {
                ui.open();
            }
        }
    }


    var MAX_FAVORITES = 10;
    function makeFavoritesArray() {
        // log("in favorites array", null, "off")
        var i = 0, favoritesArray = [];
        for (var ob in favorites) {
            favoritesArray[i++] = favorites[ob];
        }

        favoritesArray.sort(function (a, b) {
            if (a.count > b.count) {
                return -1
            }

            if (a.count < b.count) {
                return 1;
            }

            return 0;
        });
        favoritesArray = favoritesArray.slice(0, MAX_FAVORITES);
        return favoritesArray;
    }


    function findValue(index, array, offset) {
        offset = offset || 0;
        return array[(index + offset) % array.length];
    }


    function pruneOldAvimojis() {
        MyAvatar.getAvatarEntitiesVariant().forEach(function (avatarEntity) {
            // log("avatarEntity length", avatarEntity.length);
            if (avatarEntity && avatarEntity.properties.name.toLowerCase().indexOf("avimoji") > -1) {
                // log("FOUND SOME OLD AVIMOJIS!!! \N\N DELETING!!! \N\N")
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }


    var INTERVAL = 200;
    var currentChunk = 0;
    function sendEmojiChunks() {
        // log('sending chunk', null, "off");
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


    // #endregion
    // *************************************
    // END utility
    // *************************************

    // *************************************
    // START ui_handlers
    // *************************************
    // #region ui_handlers


    var shouldWearMask = Settings.getValue("avimoji/shouldWearMask", false);
    function handleShouldWearMask(newShouldWearMask) {
        shouldWearMask = newShouldWearMask;
        if (currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }
        if (shouldWearMask) {
            shouldTimeoutDelete = false;
        } else {
            shouldTimeoutDelete = true;
        }
        Settings.setValue("avimoji/shouldWearMask", shouldWearMask);
        Settings.setValue("avimoji/shouldDefaultDelete", shouldTimeoutDelete);
    }


    var isLocal = Settings.getValue("avimoji/isLocal", false);
    function handleLocalChange(newLocal) {
        isLocal = newLocal;
        Settings.setValue("avimoji/isLocal", isLocal);

        if (isLocal) {
            entityType = "local";
            Settings.setValue("avimoji/entityType", "local");
        } else {
            entityType = "avatar";
            Settings.setValue("avimoji/entityType", "avatar");
        }

        if (!advancedModeOn && currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }

        maybeRedrawAnimation();
    }

    var editMode = Settings.getValue("avimoji/editMode", false);
    function handleEditMode(newEditMode) {
        editMode = newEditMode;
        Settings.setValue("avimoji/editMode", editMode);
    }


    var showEasyFavorite = Settings.getValue("avimoji/showEasyFavorite", false);
    function handleEasyFavorites(newEasyFavorite) {
        showEasyFavorite = newEasyFavorite;
        Settings.setValue("avimoji/showEasyFavorite", showEasyFavorite);
        log("SHOW EASY FAVORITE", showEasyFavorite, "PRINT");
        if (showEasyFavorite) {
            renderFavoriteOverlays();   
        } else {
            deleteFavoritesOverlays();
        }    
    }


    var isAllEmojis = Settings.getValue("avimoji/isAllEmojis", false);
    function handleAllEmojis(newAllEmojis) {
        isAllEmojis = newAllEmojis;
        Settings.setValue("avimoji/isAllEmojis", isAllEmojis);
    }


    var isSequenceMode = Settings.getValue("avimoji/sequenceMode", false);
    function handleSequenceModeChange(newIsSequenceMode) {
        isSequenceMode = newIsSequenceMode;
        Settings.setValue("avimoji/sequenceMode", isSequenceMode);
        if (!isSequenceMode) {
            maybeClearPlayEmojiInterval();
        }
        ui.sendMessage({
            app: "avimoji",
            method: "reRenderUI"
        });

    }


    var emojiSequence = Settings.getValue("avimoji/emojiSequence", []);
    function handleEmojiSelected(emoji) {
        log("in handle emoji selected", null, "PRINT");
        if (advancedModeOn) {
            if (!isSequenceMode) {
                selectedEmoji = emoji;
                maybeClearTimeoutDelete();
                addEmojiToUser(selectedEmoji);
            } else {
                emojiSequence.push(emoji);
                Settings.setValue("avimoji/emojiSequence", emojiSequence);
                // log("Adding to seqeuence", emojiSequence.length);
            }
        } else {
            // log("in simple mode", null, "on");
            if (selectedEmoji && selectedEmoji.code[0] === emoji.code[0]) {
                // log("same emoji picked, removing")
                maybePlayPop("off");
                selectedEmoji = null;
                return;
            } else {
                // log("sending to add emoji to user")
                selectedEmoji = emoji;
                maybeClearTimeoutDelete();
                addEmojiToUser(selectedEmoji);
            }
        }
        addToFavorites(emoji);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }


    var DEFAULT_EMOJI_SCALER = 0.27;
    var emojiScaler = Settings.getValue("avimoji/emojiScaler", DEFAULT_EMOJI_SCALER);
    function handleUpdateEmojiScaler(newScaler) {
        emojiScaler = newScaler;
        if (currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }
        Settings.setValue("avimoji/emojiScaler", emojiScaler);
    }


    var DEFAULT_ANIMATION_DISTANCE = 0.5;
    var animationDistance = Settings.getValue("avimoji/animationDistance", DEFAULT_ANIMATION_DISTANCE);
    function handleAnimationDistance(newDistance) {
        animationDistance = newDistance;
        Settings.setValue("avimoji/animationDistance", animationDistance);
        maybeRedrawAnimation();
    }


    var DEFAULT_ANIMATION_SPEED = 1.2;
    var animationSpeed = Settings.getValue("avimoji/animationSpeed", DEFAULT_ANIMATION_SPEED);
    function handleAnimationSpeed(newSpeed) {
        animationSpeed = newSpeed;
        Settings.setValue("avimoji/animationDistance", animationSpeed);
        maybeRedrawAnimation();

    }


    // Update the play state 
    var isPlaying = false;
    function handleUpdateIsPlaying(playState) {
        isPlaying = playState;
        if (playState) {
            playEmojiSequence();
        } else {
            stopEmojiSequence();
        }
    }


    function deleteEmojiInSequence(index) {
        // log("in deleteEmoji")
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


    var emojiSwitchMS = 2500
    function updateSwitchIntervalTime(newSwitchIntervalTime) {
        // log("in updateSwitchIntervalTime", newSwitchIntervalTime);
        emojiSwitchMS = newSwitchIntervalTime;
        if (isPlaying) {
            maybeClearPlayEmojiInterval();
            playEmojiSequence();
        }
    }


    var advancedModeOn = Settings.getValue("avimoji/advancedModeOn", false);
    function handleAdvancedMode(newAdvancedModeState) {
        advancedModeOn = newAdvancedModeState;
        Settings.setValue("avimoji/advancedModeOn", advancedModeOn);
        if (isPlaying) {
            maybeClearPlayEmojiInterval();
            isPlaying = false;
        }
    }


    function handleDeleteSelected() {
        maybePlayPop("off");
        selectedEmoji = null;
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }


    function handleResetList() {
        maybeClearPlayEmojiInterval();
        emojiSequence = [];
        Settings.setValue("avimoji/emojiSequence", emojiSequence);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }


    function handleResetFavorites() {
        // log("in handleResetFavorites")
        favorites = {};
        Settings.setValue("avimoji/favorites", {});
        ui.sendMessage({
            app: "avimoji",
            method: "updateFavorites",
            favorites: makeFavoritesArray(favorites)
        });
        deleteFavoritesOverlays();
    }


    function handleShouldTimeoutDelete(newShouldTimeoutDelete) {
        shouldTimeoutDelete = newShouldTimeoutDelete;
        Settings.setValue("avimoji/shouldTimeoutDelete", newShouldTimeoutDelete);
        maybeClearTimeoutDelete();
    }


    // #endregion
    // *************************************
    // END ui_handlers
    // *************************************

    // *************************************
    // START Overlays
    // *************************************
    // #region Overlays


    var DISTANCE_CHECK = 2.5;
    function shouldDrawOverlay() {
        var myAvatarHeadPosition = MyAvatar.getHeadPosition();
        var cameraPosition = Camera.position;
        var distance = Vec3.distance(myAvatarHeadPosition, cameraPosition);
        if (distance > DISTANCE_CHECK) {
            return false;
        }
        return true;
    }


    // Draw the emoji overlay so you know if you see it
    var emojiOverlay;
    var OVERLAY_PADDING_SCALER = 0.65;
    var ALPHA_OVERLAY_TIMEOUT_MS = 100;
    var lastOverlayWidth = 0;
    var lastOverlayHeight = 0;
    var lastOverlayImageURL = 0;
    var OVERLAY_SCALE_MULTIPLIER = 1.1;
    var OVERLAY_SIZE = 144;
    function drawEmojiOverlay(width, height, imageURL) {
        width = width || lastOverlayWidth;
        height = height || lastOverlayHeight;
        imageURL = imageURL || lastOverlayImageURL;
        var overlayPaddingX = width;
        var overlayPaddingY = height;
        var windowWidth = Window.innerWidth;
        var windowHeight = Window.innerHeight;
        var x = windowWidth - width - overlayPaddingX * OVERLAY_PADDING_SCALER;
        var y = windowHeight - height - overlayPaddingY * OVERLAY_PADDING_SCALER;

        var overlayProps = {
            x: x,
            y: y,
            width: width * OVERLAY_SCALE_MULTIPLIER,
            height: height * OVERLAY_SCALE_MULTIPLIER,
            imageURL: imageURL,
            alpha: 0.0
        };
        emojiOverlay = Overlays.addOverlay("image", overlayProps);
        if (shouldDrawOverlay()) {
            Script.setTimeout(function () {
                Overlays.editOverlay(emojiOverlay, { alpha: 1.0 });
            }, ALPHA_OVERLAY_TIMEOUT_MS);
        }
        overlayTimer = Script.setInterval(overlayTimerHandler, OVERLAY_TIMER_INTERVAL_MS);
    }

    var previousTopTenEmojis = null;
    function favoritesOverlayTimerHandler() {
        if (!previousTopTenEmojis === topTenEmojis) {
            renderFavoriteOverlays();
            previousTopTenEmojis = topTenEmojis; 
        }
    }


    // Draw the emoji overlay so you know if you see it
    var FAVORITE_OVERLAY_TIMER_INTERVAL_MS = 3000;
    var favoriteOverlays = null;
    favoriteOverlays = Script.setInterval(favoritesOverlayTimerHandler, FAVORITE_OVERLAY_TIMER_INTERVAL_MS);
    function drawFavoriteOverlays(width, height, imageURL, emoji, x, y) {
        width = width || lastOverlayWidth;
        height = height || lastOverlayHeight;
        imageURL = imageURL || lastOverlayImageURL;

        var overlayPaddingX = width;
        var overlayPaddingY = height;
        var windowWidth = Window.innerWidth;
        var windowHeight = Window.innerHeight;
        x = x || windowWidth - width - overlayPaddingX * OVERLAY_PADDING_SCALER ;
        y = y || windowHeight - height - overlayPaddingY * OVERLAY_PADDING_SCALER;

        var overlayProps = {
            x: x,
            y: y,
            width: width * OVERLAY_SCALE_MULTIPLIER,
            height: height * OVERLAY_SCALE_MULTIPLIER,
            imageURL: imageURL,
            alpha: 0.0
        };
        log("overlayprops", overlayProps, "PRINT")
        var favoriteEmojiOverlay = Overlays.addOverlay("image", overlayProps);

        return {
            favoriteOverlay: favoriteEmojiOverlay,
            code: emoji.code       
        };
    }
        

    // Delete clickable status overlay on desktop
    function deleteEmojiOverlay() {
        if (emojiOverlay) {
            Overlays.deleteOverlay(emojiOverlay);
            emojiOverlay = false;
            maybeClearOverlayTimer();
        }
    }

    function deleteFavoritesOverlays(){
        console.log("IN DELELTE FAVORITES")
        log("favoriteOverlays", favoriteOverlays.length, "PRINT")
        if (favoriteOverlays && favoriteOverlays.length > 0){
            favoriteOverlays.forEach(function(overlay){
                log("OVERLAY in 542", overlay, "PRINT");
                Overlays.deleteOverlay(overlay.favoriteOverlay);
            });
        }
        favoriteOverlays = [];
    }

    // When window resizes, redraw overKKays
    function onWindowResize() {
        deleteEmojiOverlay();
        drawEmojiOverlay();
    }


    function onMousePressEvent(event) {
        if (event.isLeftButton) {
            var overlayID = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });

            // is primary button
            if (overlayID && (overlayID === emojiOverlay)) {
                deleteEmojiOverlay();
                if (currentEmoji && currentEmoji.id) {
                    currentEmoji.destroy();
                    currentEmoji = new EntityMaker(entityType);
                }
            } 

            for (var i = 0; i < favoriteOverlays.length; i++){
                if (overlayID === favoriteOverlays[i].favoriteOverlay){
                    var emoji = emojiList[emojiCodeMap[favoriteOverlays[i].code]];
                    handleEmojiSelected(emoji);
                    break;
                }    
            }
        }   
    }


    function onDomainChanged() {
        maybeClearOverlayTimer();
        maybeClearPlayEmojiInterval();
        maybeClearPop();
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


    var overlayTimer = null;
    function maybeClearOverlayTimer() {
        if (overlayTimer) {
            Script.clearInterval(overlayTimer);
            overlayTimer = null;
        }
    }

    var overlayTimer = null;
    function maybeClearFavoriteTimer() {
        if (favoritesTimer) {
            Script.clearInterval(overlayTimer);
            overlayTimer = null;
        }
    }


    var OVERLAY_TIMER_INTERVAL_MS = 500;
    function overlayTimerHandler() {
        if (emojiOverlay) {
            if (shouldDrawOverlay()) {
                Overlays.editOverlay(emojiOverlay, { alpha: 1.0 });
            } else {
                Overlays.editOverlay(emojiOverlay, { alpha: 0.0 });
            }
        }
    }

    var TOP_MARGIN = 80;
    var BETWEEN_FAVORITES = 2;
    var TOTAL_FAVORITES = 10;
    var favoriteOverlays = [];
    var MARGIN = 0.2
    var OVERLAY_SIZE_SCALER = 0.30;
    var topTenEmojis = [];
    function renderFavoriteOverlays() {
        topTenEmojis = makeFavoritesArray(favorites);
        favoriteOverlays = topTenEmojis.map(function(emoji, index){
            if (emoji && emojiCodeMap && emojiCodeMap[emoji.code]){
                var favoriteEmoji = emojiList[emojiCodeMap[emoji.code]];
                var imageURL = imageURLBase + favoriteEmoji.code[0] + ".png";
                var lengthOfSegment = Window.innerWidth / TOTAL_FAVORITES;
                var segmentStart = lengthOfSegment * index; 
                
                var x = segmentStart + (Window.innerWidth * 0.055 * 0.5);

                var y = TOP_MARGIN;
                var overlay = drawFavoriteOverlays(favoriteEmoji.massive.frame.w * OVERLAY_SIZE_SCALER, favoriteEmoji.massive.frame.h * OVERLAY_SIZE_SCALER, imageURL, favoriteEmoji,x, y * OVERLAY_SIZE_SCALER);
                return overlay;
            } 
        });
    }

    function maybeRedrawFavoriteOverlays(){
        if (favoriteOverlays.length > 0){
            deleteFavoritesOverlays();
            renderFavoriteOverlays();
        }
    }


    // #endregion
    // *************************************
    // END Overlays
    // *************************************

    // *************************************
    // START avimoji
    // *************************************
    // #region avimoji


    var billboardMode = "none";
    var currentSelectedDimensions = null;
    function addEmojiToUser(emoji) {
        if (currentEmoji && currentEmoji.id) {
            maybePlayPop("offThenOn");
        } else {
            createEmoji(emoji);
        }
    }

    var MASK_ABOVE_NECK = 0.13;
    var ABOVE_HEAD = 0.60;
    var EMOJI_CONST_SCALER = 0.27;
    var MASK_DISTANCE_IN_FRONT_OF_AVATAR = 0.24;
    function createEmoji(emoji) {
        log("in create emoji", null, "PRINT");
        var neckPosition, avatarScale, aboveNeck, emojiPosition;
        avatarScale = MyAvatar.scale;
        if (shouldWearMask) {
            billboardMode = "none";
            currentEmoji.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
            neckPosition = [0, 0, MASK_DISTANCE_IN_FRONT_OF_AVATAR];
            aboveNeck = MASK_ABOVE_NECK;
            emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * aboveNeck, 0]);
        } else {
            billboardMode = "full";
            aboveNeck = ABOVE_HEAD;
            neckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
            emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * aboveNeck * (1 + emojiScaler * EMOJI_CONST_SCALER), 0]);
        }
        var IMAGE_SIZE = avatarScale * emojiScaler;
        var dimensions = { x: IMAGE_SIZE, y: IMAGE_SIZE, z: IMAGE_SIZE };
        currentSelectedDimensions = dimensions;

        var parentID = MyAvatar.sessionUUID;
        var imageURL = imageURLBase + emoji.code[0] + ".png";
        currentEmoji
            .add('type', "Image")
            .add('name', 'AVIMOJI')
            .add('localPosition', emojiPosition)
            .add('dimensions', [0, 0, 0])
            .add('parentID', parentID)
            .add('emissive', true)
            .add('collisionless', true)
            .add('imageURL', imageURL)
            .add('billboardMode', billboardMode)
            .add('ignorePickIntersection', true)
            .add('alpha', 1)
            .add('userData', "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }")
            .create();
        drawEmojiOverlay(OVERLAY_SIZE, OVERLAY_SIZE, imageURL);
        maybePlayPop("on");
    }


    function maybeClearTimeoutDelete() {
        if (defaultTimeout) {
            Script.clearTimeout(defaultTimeout);
            defaultTimeout = null;
        }
    }


    var favorites = Settings.getValue("avimoji/favorites", {});
    function addToFavorites(emoji) {
        if (!favorites[emoji.code[0]]) {
            favorites[emoji.code[0]] = { count: 1, code: emoji.code[0] };
        } else {
            favorites[emoji.code[0]].count++;
        }
        Settings.setValue("avimoji/favorites", favorites);
        ui.sendMessage({
            app: "avimoji",
            method: "updateFavorites",
            favorites: makeFavoritesArray(favorites)
        });
    }


    var MASK_NECK_POSITION_X_DEFAULT = 0;
    var MASK_NECK_POSITION_Y_DEFAULT = 0;
    var MASK_NECK_POSITION_Z_DEFAULT = 0.24;
    var MASK_ABOVE_NECK_DEFAULT = 0.13;
    var neckPositionX = MASK_NECK_POSITION_X_DEFAULT;
    var neckPositionY = MASK_NECK_POSITION_Y_DEFAULT;
    var neckPositionZ = MASK_NECK_POSITION_Z_DEFAULT;
    var setupNeckPosition, setupAvatarScale, setupAboveNeckMask, setupEmojiPosition1, setupEmojiPosition2;
    setupAboveNeckMask = MASK_ABOVE_NECK_DEFAULT;
    setupAvatarScale = MyAvatar.scale;
    var nextPostionXOffset = 0;
    var nextPostionYOffset = 0;
    var nextPostionZOffset = 0;
    function setupShouldWearMaskAnimationProperties() {
        billboardMode = "none";
        setupNeckPosition = Vec3.sum(
            [neckPositionX, neckPositionY, neckPositionZ],
            [nextPostionXOffset, nextPostionYOffset, nextPostionZOffset]);
        setupEmojiPosition1 = Vec3.sum(setupNeckPosition, [(END_X + START_X) / 2, setupAvatarScale * setupAboveNeckMask, 0]);
        setupEmojiPosition2 = Vec3.sum(setupNeckPosition, [START_X, setupAvatarScale * setupAboveNeckMask, 0]);
    }


    var ABOVE_NECK_DEFAULT = 0.2;
    var setupAboveNeck = ABOVE_NECK_DEFAULT;
    setupAvatarScale = MyAvatar.scale;
    function setupAboveHeadAnimationProperties() {
        billboardMode = "full";
        setupNeckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
        setupEmojiPosition1 = Vec3.sum(setupNeckPosition, [(END_X + START_X) / 2, setupAvatarScale * setupAboveNeck * (1 + emojiScaler * EMOJI_CONST_SCALER), 0])
        setupEmojiPosition1 = Vec3.sum(setupEmojiPosition1, [nextPostionXOffset, nextPostionYOffset, nextPostionZOffset]);
        setupEmojiPosition2 = Vec3.sum(setupNeckPosition, [START_X, setupAvatarScale * setupAboveNeck * (1 + emojiScaler * EMOJI_CONST_SCALER), 0]);
        setupEmojiPosition2 = Vec3.sum(setupEmojiPosition2, [nextPostionXOffset, nextPostionYOffset, nextPostionZOffset]);
    }


    // #endregion
    // *************************************
    // END avimoji
    // *************************************

    // *************************************
    // START animation
    // *************************************
    // #region animation


    var DURATION = POP_ANIMATION_DURATION_MS + 100;
    function maybePlayPop(type) {
        // log("type 0>", type);
        maybeClearPop();
        switch (type) {
            case "on":
                playPopInterval = Script.setInterval(playPopAnimationIn, POP_DURATION_PER_STEP);
                break;
            case "off":
                maybeClearTimeoutDelete();
                playPopInterval = Script.setInterval(playPopAnimationOut, POP_DURATION_PER_STEP);
                break;
            case "offThenOn":
                // log(" *** IN OFF THEN ON ***")
                maybeClearTimeoutDelete();
                playPopInterval = Script.setInterval(playPopAnimationInAndOut, POP_DURATION_PER_STEP);
                break;
            default:
            // log("type unrecognized in maybe play pop");
        }
    }


    var animationEmoji1 = new EntityMaker(entityType);
    var animationEmoji2 = new EntityMaker(entityType);
    var animationInitialDimensions = null;
    function playEmojiSequence()!   {
        setupAnimationVariables();
        if (animationEmoji1 && animationEmoji1.id) {
            animationEmoji1.destroy();
            animationEmoji1 = new EntityMaker(entityType);
        }
        if (animationEmoji2 && animationEmoji2.id) {
            animationEmoji2.destroy();
            animationEmoji2 = new EntityMaker(entityType);
        }

        maybeClearPlayEmojiInterval();
        // log("playing emoji sequence", null, "off");

        if (shouldWearMask) {
            setupShouldWearMaskAnimationProperties();
        } else {
            setupAboveHeadAnimationProperties();
        }
        animationEmoji1.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
        animationEmoji2.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
        var IMAGE_SIZE = setupAvatarScale * emojiScaler;
        var dimensions = { x: IMAGE_SIZE, y: IMAGE_SIZE, z: IMAGE_SIZE };
        animationInitialDimensions = dimensions;

        var parentID = MyAvatar.sessionUUID;
        var imageURL1 = "";
        var imageURL2 = "";
        animationEmoji1
            .add('type', "Image")
            .add('name', 'AVIMOJI')
            .add('localPosition', setupEmojiPosition1)
            .add('dimensions', dimensions)
            .add('parentID', parentID)
            .add('emissive', true)
            .add('imageURL', imageURL1)
            .add('ignorePickIntersection', true)
            .add('billboard', billboardMode)
            .add('alpha', 1)
            .add('userData', "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }")
            .create(true);
        animationEmoji2
            .add('type', "Image")
            .add('name', 'AVIMOJI')
            .add('localPosition', setupEmojiPosition2)
            .add('dimensions', dimensions)
            .add('parentID', parentID)
            .add('emissive', true)
            .add('imageURL', imageURL2)
            .add('billboard', billboardMode)
            .add('ignorePickIntersection', true)
            .add('alpha', 1)
            .add('userData', "{ \"grabbableKey\": { \"grabbable\": true, \"kinematic\": false } }")
            .create(true);
        playEmojiInterval = Script.setInterval(onPlayEmojiInterval, DURATION_PER_STEP);
        onPlayEmojiInterval();
        isPlaying = true;
    }


    function setupAnimationVariables() {
        ANIMATION_DURATION = DEFAULT_ANIMATION_SPEED * animationSpeed;
        DURATION_PER_STEP = ANIMATION_DURATION / (ANIMATION_STEPS + HOLD_STEPS * 2);
        START_X = -1 * animationDistance;
        END_X = 1 * animationDistance;
        POSITION_DISTANCE = END_X - START_X;
        POSITION_PER_STEP = POSITION_DISTANCE / ANIMATION_STEPS;
        currentPosition1 = START_X;
        currentPosition2 = (END_X + START_X) / 2;
    }
    var DEFAULT_ANIMATION_SPEED = 1750;
    var ANIMATION_DURATION = DEFAULT_ANIMATION_SPEED * animationSpeed;
    var HOLD_STEPS = 40;
    var ANIMATION_STEPS = 60;
    var DURATION_PER_STEP = ANIMATION_DURATION / (ANIMATION_STEPS + HOLD_STEPS * 2);
    var HALF_POINT = Math.ceil(ANIMATION_STEPS * 0.5);
    var currentStep = HALF_POINT;
    var MAX_SCALE = 1;
    var MIN_SCALE = 0.0;
    var SCALE_DISTANCE = MAX_SCALE - MIN_SCALE;
    var MAX_ALPHA = 1;
    var MIN_ALPHA = 0;
    var ALPHA_DISTANCE = MAX_ALPHA - MIN_ALPHA;
    var THRESHOLD_MIN_ALPHA = 0.001;
    var THRESHHOLD_MAX_ALPHA = 0.999;
    var DISTANCE_0_THRESHHOLD = 0.015;
    var currentScale1 = MIN_SCALE;
    var currentScale2 = MAX_SCALE;
    var currentIndex = 0;
    var playEmojiInterval = null;
    var currentAlpha1 = 1;
    var currentAlpha2 = 1;
    var middleHOLD = 0;
    var lastHOLD = 0;
    var SCALE_INCREASE_PER_STEP = SCALE_DISTANCE / HALF_POINT;
    var ALPHA_PER_STEP = ALPHA_DISTANCE / HALF_POINT;

    var START_X = -0.25 * animationDistance;
    var END_X = 0.25 * animationDistance;
    var POSITION_DISTANCE = END_X - START_X;
    var POSITION_PER_STEP = POSITION_DISTANCE / ANIMATION_STEPS;
    var currentPosition1 = START_X;
    var currentPosition2 = (END_X + START_X) / 2;
    var lastCurrent1Before0 = 0;
    var lastCurrent2Before0 = 0;
    setupAnimationVariables();
    function onPlayEmojiInterval() {
        var emoji, imageURL;
        if (currentStep === 1) {
            middleHOLD = 0;
            lastHOLD = 0;
            currentPosition1 = 0;
            currentScale1 = MAX_SCALE;
            currentAlpha1 = MAX_ALPHA;
        }

        if (currentStep < HALF_POINT) {
            currentScale1 += SCALE_INCREASE_PER_STEP;
            currentScale2 -= SCALE_INCREASE_PER_STEP;
            currentAlpha1 += ALPHA_PER_STEP;
            currentAlpha2 -= ALPHA_PER_STEP;
        }

        if (currentStep === HALF_POINT) {
            if (middleHOLD <= HOLD_STEPS) {
                middleHOLD++;
                return;
            }
            currentPosition2 = START_X;
            currentScale2 = MIN_SCALE;
            currentAlpha2 = MIN_ALPHA;
            emoji = findValue(currentIndex, emojiSequence);
            imageURL = imageURLBase + emoji.code[0] + ".png";
            animationEmoji2.edit("imageURL", imageURL);
            currentIndex++;
            ui.sendMessage({
                app: "avimoji",
                method: "updateCurrentEmoji",
                selectedEmoji: emoji
            });
            // log("hold1", null, "PRINT")
        }

        if (currentStep === ANIMATION_STEPS) {
            if (lastHOLD <= HOLD_STEPS) {
                lastHOLD++;
                return;
            }
            currentStep = 1;
            currentPosition1 = START_X;
            currentScale1 = MIN_SCALE;
            currentAlpha1 = MIN_ALPHA;
            middleHOLD = 0;
            lastHOLD = 0;
            emoji = findValue(currentIndex, emojiSequence);
            imageURL = imageURLBase + emoji.code[0] + ".png";
            animationEmoji1.edit("imageURL", imageURL);
            currentIndex++;
            ui.sendMessage({
                app: "avimoji",
                method: "updateCurrentEmoji",
                selectedEmoji: emoji
            });
            // log("hold2", null, "PRINT")
        }

        if (currentStep > HALF_POINT) {
            currentScale1 -= SCALE_INCREASE_PER_STEP;
            currentScale2 += SCALE_INCREASE_PER_STEP;
            currentAlpha1 -= ALPHA_PER_STEP;
            currentAlpha2 += ALPHA_PER_STEP;
        }

        var animationEmoji1Position = animationEmoji1.get("localPosition", true);
        if (currentPosition1 === 0) {
            currentPosition1 = lastCurrent1Before0;
        }
        if (currentPosition2 === 0) {
            currentPosition2 = lastCurrent2Before0;
        }
        currentPosition1 += POSITION_PER_STEP;
        currentPosition2 += POSITION_PER_STEP;
        if (Math.abs(currentPosition1) < DISTANCE_0_THRESHHOLD) {
            lastCurrent1Before0 = currentPosition1;
            currentPosition1 = 0;
        }
        if (Math.abs(currentPosition2) < DISTANCE_0_THRESHHOLD) {
            lastCurrent2Before0 = currentPosition2;
            currentPosition2 = 0;
        }
        animationEmoji1Position.x = currentPosition1;
        var animationEmoji2Position = animationEmoji2.get("localPosition", true);
        animationEmoji2Position.x = currentPosition2;
        var emojiPosition1 = animationEmoji1Position;
        var emojiPosition2 = animationEmoji2Position;
        var newDimensions1 = Vec3.multiply(animationInitialDimensions, EasingFunctions.easeInOutQuad(currentScale1));
        var newDimensions2 = Vec3.multiply(animationInitialDimensions, EasingFunctions.easeInOutQuad(currentScale2));
        var newAlpha1 = EasingFunctions.easeInOutQuint(currentAlpha1);
        var newAlpha2 = EasingFunctions.easeInOutQuint(currentAlpha2);

        if (newAlpha1 > THRESHHOLD_MAX_ALPHA) {
            newAlpha1 = 1.0;
        }

        if (newAlpha1 < THRESHOLD_MIN_ALPHA) {
            newAlpha1 = 0.0;
        }

        if (newAlpha2 > THRESHHOLD_MAX_ALPHA) {
            newAlpha2 = 1.0;
        }

        if (newAlpha2 < THRESHOLD_MIN_ALPHA) {
            newAlpha2 = 0.0;
        }

        animationEmoji1
            .add("localPosition", emojiPosition1)
            .add("dimensions", newDimensions1)
            .add("alpha", newAlpha1)
            .edit();

        animationEmoji2
            .add("localPosition", emojiPosition2)
            .add("dimensions", newDimensions2)
            .add("alpha", newAlpha2)
            .edit();
        currentStep++;

    }


    function maybeClearPlayEmojiInterval() {
        if (animationEmoji1 && animationEmoji1.id) {
            animationEmoji1.destroy();
        }
        if (animationEmoji2 && animationEmoji2.id) {
            animationEmoji2.destroy();
        }
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
            currentEmoji = new EntityMaker(entityType);
            deleteEmojiOverlay();
        }
        if (playEmojiInterval) {
            Script.clearInterval(playEmojiInterval);
            playEmojiInterval = null;
            currentIndex = 0;
            isPlaying = false;
        }
    }


    function maybeClearPop() {
        // log("in maybe clear pop")
        if (playPopInterval) {
            // log("Found interval, clearing")
            Script.clearTimeout(playPopInterval);
            playPopInterval = null;
            currentPopScale = null;
            currentPopStep = 1;
            isPopPlaying = false;
            popType = null;
        }
    }


    var currentPopStep = 1;
    var playPopInterval = null;
    var POP_ANIMATION_DURATION_MS = 170;
    var POP_ANIMATION_STEPS = 10;
    var POP_DURATION_PER_STEP = POP_ANIMATION_DURATION_MS / POP_ANIMATION_STEPS;
    var currentPopScale = null;
    var MAX_POP_SCALE = 1;
    var MIN_POP_SCALE = 0.0;
    var POP_SCALE_DISTANCE = MAX_POP_SCALE - MIN_POP_SCALE;
    var POP_PER_STEP = POP_SCALE_DISTANCE / POP_ANIMATION_STEPS;
    var isPopPlaying = false;
    var popType = null;
    function playPopAnimationIn() {
        var dimensions;
        if (currentPopStep === 1) {
            isPopPlaying = true;
            currentPopScale = MIN_POP_SCALE;
        }
        currentPopScale += POP_PER_STEP;

        dimensions = Vec3.multiply(currentSelectedDimensions, EasingFunctions.easeInCubic(currentPopScale));
        currentEmoji.edit("dimensions", dimensions);
        currentPopStep++;

        if (currentPopStep === POP_ANIMATION_STEPS) {
            playSound();
            if (shouldTimeoutDelete) {
                startTimeoutDelete();
            }
            maybeClearPop();
        }
    }

    function playPopAnimationOut() {
        var dimensions;
        if (currentPopStep === 1) {
            isPopPlaying = true;
            currentPopScale = MAX_POP_SCALE;
            playSound();
        }
        currentPopScale -= POP_PER_STEP;
        dimensions = Vec3.multiply(currentSelectedDimensions, EasingFunctions.easeOutCubic(currentPopScale));
        currentEmoji.edit("dimensions", dimensions);
        currentPopStep++;

        if (currentPopStep === POP_ANIMATION_STEPS) {
            if (currentEmoji && currentEmoji.id) {
                currentEmoji.destroy();
                currentEmoji = new EntityMaker(entityType);
                deleteEmojiOverlay();
                selectedEmoji = null;
                ui.sendMessage({
                    app: "avimoji",
                    method: "updateEmojiPicks",
                    selectedEmoji: selectedEmoji,
                    emojiSequence: emojiSequence
                });
            }
            maybeClearPop();
        }
    }

    function playPopAnimationInAndOut() {
        var dimensions;
        if (currentPopStep === 1) {
            isPopPlaying = true;
            currentPopScale = MAX_POP_SCALE;
            playSound();
        }

        currentPopScale -= POP_PER_STEP;
        dimensions = Vec3.multiply(currentSelectedDimensions, EasingFunctions.easeOutCubic(currentPopScale));
        currentEmoji.edit("dimensions", dimensions);
        currentPopStep++;

        if (currentPopStep === POP_ANIMATION_STEPS) {
            if (currentEmoji && currentEmoji.id) {
                currentEmoji.destroy();
                currentEmoji = new EntityMaker(entityType);
                deleteEmojiOverlay();
            }
            maybeClearPop();
            Script.setTimeout(function () {
                createEmoji(selectedEmoji);
            }, DURATION);
        }
    }

    // if (popType === "offThenOn") {
    //     log("now about to do createEmoji")
    //     createEmoji(selectedEmoji);
    // }

    function maybeRedrawAnimation() {
        log("in redraw Animation", isPlaying);
        if (isPlaying) {
            setupAnimationVariables();
            maybeClearPlayEmojiInterval();
            playEmojiSequence();
        }
    }


    function stopEmojiSequence() {
        maybeClearPlayEmojiInterval();
        isPlaying = false;
        currentIndex = 0;
    }


    // #endregion
    // *************************************
    // END animation
    // *************************************

    // *************************************
    // START messages
    // *************************************
    // #region messages


    function onMessage(message) {
        if (message.app !== "avimoji") {
            return;
        }

        // log("message from UI", message, "off");

        switch (message.method) {
            case "eventBridgeReady":
                // log("in eventbrdige ready");
                ui.sendMessage({
                    app: "avimoji",
                    method: "updateUI",
                    selectedEmoji: selectedEmoji,
                    emojiSequence: emojiSequence,
                    shouldWearMask: shouldWearMask,
                    emojiSwitchMS: emojiSwitchMS,
                    isPlaying: isPlaying,
                    emojiScaler: emojiScaler,
                    animationDistance: animationDistance,
                    animationSpeed: animationSpeed,
                    favorites: makeFavoritesArray(favorites),
                    advancedModeOn: advancedModeOn,
                    isLocal: isLocal,
                    isSequenceMode: isSequenceMode,
                    isAllEmojis: isAllEmojis,
                    shouldTimeoutDelete: shouldTimeoutDelete,
                    showEasyFavorite: showEasyFavorite
                });
                sendEmojiChunks();
                break;

            case "handleEmojiSelected":
                // log("got handle emoji selected");
                handleEmojiSelected(message.emoji);
                break;

            case "handleShouldWearMask":
                // log("message.shouldWearMask", message.shouldWearMask);
                handleShouldWearMask(message.shouldWearMask);
                maybeRedrawAnimation();
                break;

            case "handleUpdateIsPlaying":
                // log("received is playing");
                handleUpdateIsPlaying(message.isPlaying);
                break;

            case "deleteEmojiInSequence":
                deleteEmojiInSequence(message.index);
                break;

            case "updateSwitchIntervalTime":
                updateSwitchIntervalTime(message.switchIntervalTime);
                break;

            case "handleResetList":
                handleResetList();
                break;

            case "handleResetFavorites":
                handleResetFavorites();
                break;

            case "handleDeleteSelected":
                handleDeleteSelected();
                break;

            case "handleUpdateEmojiScaler":
                handleUpdateEmojiScaler(message.emojiScaler);
                maybeRedrawAnimation();
                break;

            case "handleAnimationDistance":
                handleAnimationDistance(message.animationDistance);
                // maybeRedrawAnimation();
                break;
            case "handleAnimationSpeed":
                handleAnimationSpeed(message.animationSpeed);
                // maybeRedrawAnimation();
                break;
            case "handleLocalChange":
                handleLocalChange(message.isLocal);
                break;

            case "handleEasyFavorites":
                log("go to handle easy favorites", null, "PRINT")
                handleEasyFavorites(message.showEasyFavorite);
                break;

            case "handleSequenceModeChange":
                handleSequenceModeChange(message.isSequenceMode);
                break;

            case "handleAllEmojis":
                handleAllEmojis(message.isAllEmojis);
                break;

            case "handleAdvancedMode":
                handleAdvancedMode(message.newAdvancedModeState);
                break;

            case "handleShouldTimeoutDelete":
                handleShouldTimeoutDelete(message.newTimeoutDeleteState);
                break;

            case "handleEditMode":
                handleEditMode(message.shouldShowEditMode);
                break;

            default:
                // log("Unhandled message from avimoji_ui.js", message);
                break;
        }
    }


    // #endregion
    // *************************************
    // END messages
    // *************************************

    // *************************************
    // START main
    // *************************************
    // #region main


    var BUTTON_NAME = "AVIMOJI";
    var APP_UI_URL = Script.resolvePath('./resources/avimoji_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            onMessage: onMessage,
            graphicsDirectory: Script.resolvePath("./resources/images/icons/")
        });

        pruneOldAvimojis();
        makeEmojiChunks();

        if (showEasyFavorite) {
            renderFavoriteOverlays();
        }

        Controller.keyPressEvent.connect(keyPress);
        Script.scriptEnding.connect(scriptEnding);

        Controller.mousePressEvent.connect(onMousePressEvent);
        Window.geometryChanged.connect(onWindowResize);
        HMD.displayModeChanged.connect(onDisplayModeChanged);
        Window.domainChanged.connect(onDomainChanged);
    }


    startup();


    // #endregion
    // *************************************
    // END main
    // *************************************

    // *************************************
    // START cleanup
    // *************************************
    // #region cleanup


    function scriptEnding() {
        deleteEmojiOverlay();
        console.log("CALLING DELETE FAVORITES")
        deleteFavoritesOverlays();
        Controller.mousePressEvent.disconnect(onMousePressEvent);
        Window.geometryChanged.disconnect(onWindowResize);
        Controller.keyPressEvent.disconnect(keyPress);
        HMD.displayModeChanged.disconnect(onDisplayModeChanged);
        Window.domainChanged.disconnect(onDomainChanged);
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
        }
        if (animationEmoji1 && animationEmoji1.id) {
            animationEmoji1.destroy();
        }
        if (animationEmoji2 && animationEmoji2.id) {
            animationEmoji2.destroy();
        }
        maybeClearOverlayTimer();
        maybeClearPlayEmojiInterval();
        maybeClearPop();
        pruneOldAvimojis();
    }


    // #endregion
    // *************************************
    // END cleanup
    // *************************************

})();