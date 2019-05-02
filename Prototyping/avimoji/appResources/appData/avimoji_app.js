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

    var EntityMaker = Script.require("./resources/modules/entityMaker.js?" + Date.now());
    var EasingFunctions = Script.require("./resources/modules/easing.js");

    var emojiList = Script.require("./resources/node/emojiList.json?" + Date.now());
    var emojiCodeMap = emojiList.reduce(function(previous, current, index){
        if (current && current.code && current.code.length > 0 && current.code[0]) {
            previous[current.code[0]] = index;
            return previous;
        }
    }, {});
    var CONFIG = Script.require("./resources/config.json?" + Date.now());
    var imageURLBase = CONFIG.baseImagesURL;

    // #endregion
    // *************************************
    // END dependencies
    // *************************************

    // *************************************
    // START utility
    // *************************************
    // #region utility


    // custom logging function
    var PREPEND = "\n##Logger:Avimoji:Web::\n";
    var DEBUG = false;
    var OFF = "off";
    var ON = "on";
    var PRINT = "PRINT";
    function log(label, data, overrideDebug){
        if (!DEBUG) {
            if (overrideDebug !== "PRINT") {
                return;
            }
        } else {
            if (overrideDebug === "off") {
                return;
            }
        }

        data = typeof data === "undefined" ? "" : data;
        data = typeof data === "string" ? data : (JSON.stringify(data, null, 4) || "");
        data = data + " " || "";
        console.log(PREPEND + label + ": " + data +"\n");
    }

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
        sound = sound || popSound;
        volume = volume || DEFAULT_VOLUME;
        position = position || MyAvatar.position;
        localOnly = localOnly || local;
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


    var DEFAULT_TIMEOUT_MS = 7000;
    var defaultTimeout = null;
    function startTimeoutDelete() {
        defaultTimeout = Script.setTimeout(function () {
            maybePlayPop("off");
            selectedEmoji = null;
        }, DEFAULT_TIMEOUT_MS);
    }


    // Open up on ctrl + enter
    var SEMI_COLON_KEY = 59;
    function keyPress(event) {
        if (event.key === 16777220 && event.isControl) {
            if (ui.isOpen) {
                ui.close();
            } else {
                ui.open();
            }
        } if (event.key === SEMI_COLON_KEY) {
            playEmojiAgain();
        }
    }


    var MAX_FAVORITES = 10;
    function makeFavoritesArray() {
        var i = 0, favoritesArray = [];
        for (var emoji in favorites ) {
            favoritesArray[i++] = favorites[emoji];
        }

        favoritesArray.sort(function (a, b) {
            if (a.count > b.count) {
                return -1;
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
            if (avatarEntity && avatarEntity.properties.name.toLowerCase().indexOf("avimoji") > -1) {
                Entities.deleteEntity(avatarEntity.id);
            }
        });
    }


    var INTERVAL = 200;
    var currentChunk = 0;
    function sendEmojiChunks() {
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


    // choose to wear a mask or above their head
    var mask = Settings.getValue("avimoji/mask", false);
    function handleMask(data) {
        mask = data.mask;
        if (currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }
        if (mask) {
            shouldTimeoutDelete = false;
        } else {
            shouldTimeoutDelete = true;
        }
        Settings.setValue("avimoji/mask", mask);
        Settings.setValue("avimoji/shouldDefaultDelete", shouldTimeoutDelete);
    }


    // don't render the emojis for anyone else
    var local = Settings.getValue("avimoji/local", false);
    var entityType = Settings.getValue("avimoji/entityType", "avatar");
    function handleLocal(data) {
        local = data.local;
        Settings.setValue("avimoji/local", local);

        if (local) {
            entityType = "local";
            Settings.setValue("avimoji/entityType", "local");
        } else {
            entityType = "avatar";
            Settings.setValue("avimoji/entityType", "avatar");
        }

        if (!advanced && currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }

        maybeRedrawAnimation();
    }


    // show the favorite emojis as overlays
    var ezFavorites = Settings.getValue("avimoji/ezFavorites", false);
    function handleEZFavorites(data) {
        ezFavorites = data.ezFavorites;
        Settings.setValue("avimoji/ezFavorites", ezFavorites);
        if (ezFavorites) {
            maybeClearEZFavoritesTimer();
            renderEZFavoritesOverlays();   
        } else {
            deleteEZFavoritesOverlays();
            maybeClearEZFavoritesTimer();
        }    
    }


    // show all of the emojis instead of just the basic set
    var allEmojis = Settings.getValue("avimoji/allEmojis", false);
    function handleAllEmojis(data) {
        allEmojis = data.allEmojis;
        Settings.setValue("avimoji/allEmojis", allEmojis);
    }


    var sequenceMode = Settings.getValue("avimoji/sequenceMode", false);
    function handleSequenceMode(data) {
        sequenceMode = data.sequenceMode;
        Settings.setValue("avimoji/sequenceMode", sequenceMode);
        if (!sequenceMode) {
            maybeClearPlayEmojiSequenceInterval();
        }
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }


    var MAX_EMOJI_SEQUENCE = 40;
    var emojiSequence = Settings.getValue("avimoji/emojiSequence", []);
    var selectedEmoji = null;
    function handleSelectedEmoji(data) {
        var emoji = data.emoji;
        log("in handle emoji selected", null, "");
        if (advanced) {
            if (!sequenceMode) {
                selectedEmoji = emoji;
                lastEmoji = emoji;
                maybeClearTimeoutDelete();
                addEmojiToUser(selectedEmoji);
            } else {
                emojiSequence.push(emoji);
                emojiSequence = emojiSequence.slice(0, MAX_EMOJI_SEQUENCE);

                Settings.setValue("avimoji/emojiSequence", emojiSequence);
            }
        } else {
            if (selectedEmoji && selectedEmoji.code[0] === emoji.code[0]) {
                maybePlayPop("off");
                selectedEmoji = null;
                return;
            } else {
                selectedEmoji = emoji;
                lastEmoji = emoji;
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


    // dynamically update the emoji size
    var DEFAULT_EMOJI_SIZE = 0.27;
    var emojiSize = Settings.getValue("avimoji/emojiSize", DEFAULT_EMOJI_SIZE);
    function handleEmojiSize(data) {
        emojiSize = data.emojiSize;
        if (currentEmoji && currentEmoji.id) {
            addEmojiToUser(selectedEmoji);
        }
        Settings.setValue("avimoji/emojiSize", emojiSize);
        maybeRedrawAnimation();
    }


    // handle a user changing the start and end distance of an emoji animation
    var DEFAULT_ANIMATION_DISTANCE = 0.5;
    var animationDistance = Settings.getValue("avimoji/animationDistance", DEFAULT_ANIMATION_DISTANCE);
    function handleAnimationDistance(data) {
        animationDistance = data.animationDistance;
        Settings.setValue("avimoji/animationDistance", animationDistance);
        maybeRedrawAnimation();
    }


    // handle a user changing the speed of the emoji sequence animation
    var DEFAULT_ANIMATION_SPEED = 1.2;
    var animationSpeed = Settings.getValue("avimoji/animationSpeed", DEFAULT_ANIMATION_SPEED);
    function handleAnimationSpeed(data) {
        animationSpeed = data.animationSpeed;
        Settings.setValue("avimoji/animationDistance", animationSpeed);
        maybeRedrawAnimation();
    }


    // Update the play state 
    var isPlaying = false;
    function handleUpdateIsPlaying(data) {
        isPlaying = data.isPlaying;
        if (isPlaying) {
            playEmojiSequence();
        } else {
            stopEmojiSequence();
        }
        ui.sendMessage({
            app: "avimoji",
            method: "updatePlay",
            isPlaying: isPlaying
        });
    }


    // remove an emoji from the sequence
    function deleteSequenceEmoji(data) {
        emojiSequence.splice(data.index, 1);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
        if (emojiSequence.length === 0) {
            maybeClearPlayEmojiSequenceInterval();
        }
    }


    var advanced = Settings.getValue("avimoji/advanced", false);
    function handleAdvanced(data) {
        advanced = data.advanced;
        Settings.setValue("avimoji/advanced", advanced);
        if (isPlaying) {
            maybeClearPlayEmojiSequenceInterval();
            isPlaying = false;
        }
    }


    function handleSelectedRemoved() {
        maybePlayPop("off");
        selectedEmoji = null;
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
    }


    function handleResetSequenceList() {
        maybeClearPlayEmojiSequenceInterval();
        emojiSequence = [];
        Settings.setValue("avimoji/emojiSequence", emojiSequence);
        ui.sendMessage({
            app: "avimoji",
            method: "updateEmojiPicks",
            selectedEmoji: selectedEmoji,
            emojiSequence: emojiSequence
        });
        ui.sendMessage({
            app: "avimoji",
            method: "updatePlay",
            isPlaying: isPlaying
        });
    }


    // empty out the favorites object to start tracking them again
    var resetFavorites = false;
    function handleResetFavoritesList() {
        favorites = {};

        Settings.setValue("avimoji/favorites", {});
        
        ui.sendMessage({
            app: "avimoji",
            method: "updateFavorites",
            favorites: makeFavoritesArray(favorites)
        });
        deleteEZFavoritesOverlays();
        resetFavorites = true;
    }


    // toggles the emoji deleting by default
    var shouldTimeoutDelete = Settings.getValue("avimoji/shouldTimeoutDelete", true);
    function handleShouldTimeoutDelete(data) {
        shouldTimeoutDelete = data.shouldTimeoutDelete;
        Settings.setValue("avimoji/shouldTimeoutDelete", shouldTimeoutDelete);
        if (shouldTimeoutDelete && currentEmoji) {
            startTimeoutDelete();
        } else {
            maybeClearTimeoutDelete();
        }
    }


    // #endregion
    // *************************************
    // END ui_handlers
    // *************************************

    // *************************************
    // START Overlays
    // *************************************
    // #region Overlays


    // Check to se if you are close up to know if you should draw the preview overlay
    var DISTANCE_CHECK = 1.0;
    function shouldDrawPreviewOverlay() {
        var myAvatarHeadPosition = MyAvatar.getHeadPosition();
        var cameraPosition = Camera.position;
        var distance = Vec3.distance(myAvatarHeadPosition, cameraPosition);
        if (distance > DISTANCE_CHECK) {
            return false;
        }
        return true;
    }


    // Draw the emoji preview overlay
    var emojiPreviewOverlay;
    var OVERLAY_PADDING_SCALER = 0.65;
    var ALPHA_OVERLAY_TIMEOUT_MS = 350;
    var lastOverlayWidth = 0;
    var lastOverlayHeight = 0;
    var lastOverlayImageURL = 0;
    var OVERLAY_SCALE_MULTIPLIER = 1.1;
    var OVERLAY_SIZE = 144;
    function drawEmojiPreviewOverlay(width, height, imageURL) {
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
        emojiPreviewOverlay = Overlays.addOverlay("image", overlayProps);
        if (shouldDrawPreviewOverlay()) {
            Script.setTimeout(function () {
                Overlays.editOverlay(emojiPreviewOverlay, { alpha: 1.0 });
            }, ALPHA_OVERLAY_TIMEOUT_MS);
        }
        previewOverlayTimer = Script.setInterval(previewOverlayTimerHandler, PREVIEW_OVERLAY_TIMER_INTERVAL_MS);
    }


    // Check to see if our top ten favorites has changed to know if we should redraw
    var previousTopTenEmojis = null;
    function ezFavoritesOverlayTimerHandler() {
        if (JSON.stringify(previousTopTenEmojis) === JSON.stringify(topTenEmojis)) {
            topTenEmojis = makeFavoritesArray();
            return;
        } else {
            maybeRedrawEZFavoritesOverlays();
            previousTopTenEmojis = topTenEmojis; 
        }
    }


    // Draw the emoji overlay so you know if you see it
    function drawEZfavoritesOverlays(width, height, imageURL, emoji, x, y) {
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
            renderLayer: "front",
            alpha: 0.0
        };
        var ezFavoriteOverlay = Overlays.addOverlay("image", overlayProps);
        Script.setTimeout(function () {
            Overlays.editOverlay(ezFavoriteOverlay, { alpha: 1.0 });
        }, ALPHA_OVERLAY_TIMEOUT_MS);
        return {
            ezFavoriteOverlay: ezFavoriteOverlay,
            code: emoji.code       
        };
    }

    
    // Delete clickable status overlay on desktop
    function deleteEmojiPreviewOverlay() {
        if (emojiPreviewOverlay) {
            Overlays.deleteOverlay(emojiPreviewOverlay);
            emojiPreviewOverlay = false;
            maybeClearPreviewOverlayTimer();
        }
    }


    function deleteEZFavoritesOverlays(){
        log("ezFavoritesOverlays", ezFavoritesOverlays, "PRINT")
        if (ezFavoritesOverlays && ezFavoritesOverlays.length > 0){
            ezFavoritesOverlays.forEach(function(overlay){
                Overlays.deleteOverlay(overlay.ezFavoriteOverlay);
            });
        }
        
        ezFavoritesOverlays = [];
        maybeClearEZFavoritesTimer();
    }


    // When window resizes, redraw overKKays
    function onWindowResize() {
        deleteEmojiPreviewOverlay();
        drawEmojiPreviewOverlay();
        if (ezFavorites) {
            renderEZFavoritesOverlays();
        }
    }


    function onMousePressEvent(event) {
        if (event.isLeftButton) {
            var overlayID = Overlays.getOverlayAtPoint({ x: event.x, y: event.y });

            // is primary button
            if (overlayID && (overlayID === emojiPreviewOverlay)) {
                deleteEmojiPreviewOverlay();
                if (currentEmoji && currentEmoji.id) {
                    currentEmoji.destroy();
                    currentEmoji = new EntityMaker(entityType);
                }
            } 

            for (var i = 0; i < ezFavoritesOverlays.length; i++){
                if (overlayID === ezFavoritesOverlays[i].ezFavoriteOverlay){
                    var emoji = emojiList[emojiCodeMap[ezFavoritesOverlays[i].code]];
                    var data = {emoji: emoji};
                    handleSelectedEmoji(data);
                    break;
                }    
            }
        }   
    }


    function onDomainChanged() {
        deleteEmojiPreviewOverlay();
        maybeClearPreviewOverlayTimer();
        maybeClearEZFavoritesTimer();
        maybeClearPlayEmojiSequenceInterval();
        maybeClearPop();
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
            selectedEmoji = null;
        }
        maybeClearPop();
        ui.close();
    }


    // Delete overlays when display mode changes to HMD mode
    // Draw overlays when mode is in desktop
    function onDisplayModeChanged(isHMDMode) {
        if (isHMDMode) {
            deleteEmojiPreviewOverlay();
            deleteEZFavoritesOverlays();
        } else {
            drawEmojiPreviewOverlay();
            drawEZfavoritesOverlays();
        }
    }


    var previewOverlayTimer = null;
    function maybeClearPreviewOverlayTimer() {
        if (previewOverlayTimer) {
            Script.clearInterval(previewOverlayTimer);
            previewOverlayTimer = null;
        }
    }


    function maybeClearEZFavoritesTimer() {
        if (ezFavoritesTimer) {
            Script.clearInterval(ezFavoritesTimer);
            ezFavoritesTimer = null;
        }
    }


    // edit the alpha to help avoid the black box effect
    var PREVIEW_OVERLAY_TIMER_INTERVAL_MS = 500;
    function previewOverlayTimerHandler() {
        if (emojiPreviewOverlay) {
            if (shouldDrawPreviewOverlay()) {
                Overlays.editOverlay(emojiPreviewOverlay, { alpha: 1.0 });
            } else {
                Overlays.editOverlay(emojiPreviewOverlay, { alpha: 0.0 });
            }
        }
    }


    // handle rendering the interface ez overlays
    var TOP_MARGIN = 80;
    var TOTAL_FAVORITES = 10;
    var OVERLAY_SIZE_SCALER = 0.15;
    var WIDTH_BETWEEN_SCALER = 0.0055;
    var WIDTH_TOTAL_SCALER = 0.30;
    var LENGTH_OF_SEGMENT = Window.innerWidth / TOTAL_FAVORITES;
    var WINDOW_WIDTH_SCALER = 0.67;
    var OFFSET = -Window.innerWidth * WINDOW_WIDTH_SCALER + LENGTH_OF_SEGMENT * TOTAL_FAVORITES;
    var EZFAVORITES_OVERLAY_TIMER_INTERVAL_MS = 10000;    
    var ezFavoritesOverlays = null;
    var ezFavoritesTimer = null;
    var topTenEmojis = [];
    function renderEZFavoritesOverlays() {
        topTenEmojis = makeFavoritesArray(favorites);
        ezFavoritesOverlays = topTenEmojis.map(function(emoji, index){
            if (emoji && emojiCodeMap && emojiCodeMap[emoji.code]){
                var favoriteEmoji = emojiList[emojiCodeMap[emoji.code]];
                var imageURL = imageURLBase + favoriteEmoji.code[0] + ".png";
                
                var segmentStart = LENGTH_OF_SEGMENT * index * WIDTH_TOTAL_SCALER; 
                
                var x = OFFSET + segmentStart + (Window.innerWidth * WIDTH_TOTAL_SCALER * WIDTH_BETWEEN_SCALER);

                var y = TOP_MARGIN;
                var overlay = drawEZfavoritesOverlays(
                    favoriteEmoji.massive.frame.w * OVERLAY_SIZE_SCALER, 
                    favoriteEmoji.massive.frame.h * OVERLAY_SIZE_SCALER, 
                    imageURL, favoriteEmoji,x, y * OVERLAY_SIZE_SCALER);
                return overlay;
            } 
        });
        ezFavoritesTimer = Script.setInterval(ezFavoritesOverlayTimerHandler, EZFAVORITES_OVERLAY_TIMER_INTERVAL_MS);

    }

    function maybeRedrawEZFavoritesOverlays(){
        if (ezFavoritesOverlays.length > 0){
            deleteEZFavoritesOverlays();
            renderEZFavoritesOverlays();
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


    var lastEmoji = null;
    function playEmojiAgain(){
        if (currentEmoji && currentEmoji.id) {
            maybePlayPop("offThenOn");
        } else {
            createEmoji(lastEmoji);
        }
    }


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
    var currentEmoji = new EntityMaker(entityType);
    function createEmoji(emoji) {
        var neckPosition, avatarScale, aboveNeck, emojiPosition;
        avatarScale = MyAvatar.scale;
        if (mask) {
            billboardMode = "none";
            currentEmoji.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
            neckPosition = [0, 0, MASK_DISTANCE_IN_FRONT_OF_AVATAR];
            aboveNeck = MASK_ABOVE_NECK;
            emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * aboveNeck, 0]);
        } else {
            billboardMode = "full";
            aboveNeck = ABOVE_HEAD;
            neckPosition = Vec3.subtract(MyAvatar.getNeckPosition(), MyAvatar.position);
            emojiPosition = Vec3.sum(neckPosition, [0, avatarScale * aboveNeck * (1 + emojiSize * EMOJI_CONST_SCALER), 0]);
        }
        var IMAGE_SIZE = avatarScale * emojiSize;
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
        drawEmojiPreviewOverlay(OVERLAY_SIZE, OVERLAY_SIZE, imageURL);
        maybePlayPop("on");
    }


    function maybeClearTimeoutDelete() {
        if (defaultTimeout) {
            Script.clearTimeout(defaultTimeout);
            defaultTimeout = null;
        }
    }


    // #TODO CHECK WITH ORIGINAL CODE ON THIS FUNCTION
    var favorites = Settings.getValue("avimoji/favorites", {});
    function addToFavorites(emoji) {
        if (!favorites[emoji.code[0]]) {
            favorites[emoji.code[0]] = { count: 1, code: emoji.code[0] };
        } else {
            favorites[emoji.code[0]].count++;
        }
        var newFavoritesArray = makeFavoritesArray(favorites);
        Settings.setValue("avimoji/favorites", favorites);
        ui.sendMessage({
            app: "avimoji",
            method: "updateFavorites",
            favorites: newFavoritesArray
        });
        if (resetFavorites && newFavoritesArray.length === 1 && ezFavorites) {
            handleEZFavorites(true);
            resetFavorites = false;
            renderEZFavoritesOverlays();
        }
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
    function setupMaskAnimationProperties() {
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
        setupEmojiPosition1 = 
            Vec3.sum(setupNeckPosition, [(END_X + START_X) / 2,
            setupAvatarScale * setupAboveNeck * (1 + emojiSize * EMOJI_CONST_SCALER), 0]);
        setupEmojiPosition1 = Vec3.sum(setupEmojiPosition1, [nextPostionXOffset, nextPostionYOffset, nextPostionZOffset]);
        setupEmojiPosition2 = 
        Vec3.sum(setupNeckPosition, 
            [START_X, setupAvatarScale * setupAboveNeck * (1 + emojiSize * EMOJI_CONST_SCALER), 0]);
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
                maybeClearTimeoutDelete();
                playPopInterval = Script.setInterval(playPopAnimationInAndOut, POP_DURATION_PER_STEP);
                break;
            default:
                log("type unrecognized in maybe play pop");
        }
    }


    var animationEmoji1 = new EntityMaker(entityType);
    var animationEmoji2 = new EntityMaker(entityType);
    var animationInitialDimensions = null;
    function playEmojiSequence(){
        setupAnimationVariables();
        if (animationEmoji1 && animationEmoji1.id) {
            animationEmoji1.destroy();
            animationEmoji1 = new EntityMaker(entityType);
        }
        if (animationEmoji2 && animationEmoji2.id) {
            animationEmoji2.destroy();
            animationEmoji2 = new EntityMaker(entityType);
        }

        maybeClearPlayEmojiSequenceInterval();

        if (mask) {
            setupMaskAnimationProperties();
        } else {
            setupAboveHeadAnimationProperties();
        }
        animationEmoji1.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
        animationEmoji2.add("parentJointIndex", MyAvatar.getJointIndex("Head"));
        var IMAGE_SIZE = setupAvatarScale * emojiSize;
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
        ANIMATION_DURATION = DEFAULT_ANIMATION_DURATION * animationSpeed;
        DURATION_PER_STEP = ANIMATION_DURATION / (ANIMATION_STEPS + HOLD_STEPS * 2);
        START_X = -1 * animationDistance;
        END_X = 1 * animationDistance;
        POSITION_DISTANCE = END_X - START_X;
        POSITION_PER_STEP = POSITION_DISTANCE / ANIMATION_STEPS;
        currentPosition1 = START_X;
        currentPosition2 = (END_X + START_X) / 2;
    }
    var DEFAULT_ANIMATION_DURATION = 1750;
    var ANIMATION_DURATION = DEFAULT_ANIMATION_DURATION * animationSpeed;
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


    function maybeClearPlayEmojiSequenceInterval() {
        if (animationEmoji1 && animationEmoji1.id) {
            animationEmoji1.destroy();
        }
        if (animationEmoji2 && animationEmoji2.id) {
            animationEmoji2.destroy();
        }
        if (currentEmoji && currentEmoji.id) {
            currentEmoji.destroy();
            currentEmoji = new EntityMaker(entityType);
            deleteEmojiPreviewOverlay();
        }
        if (playEmojiInterval) {
            Script.clearInterval(playEmojiInterval);
            playEmojiInterval = null;
            currentIndex = 0;
            isPlaying = false;
        }
    }


    function maybeClearPop() {
        if (playPopInterval) {
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
                deleteEmojiPreviewOverlay();
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
                deleteEmojiPreviewOverlay();
            }
            maybeClearPop();
            Script.setTimeout(function () {
                createEmoji(selectedEmoji);
            }, DURATION);
        }
    }


    function maybeRedrawAnimation() {
        log("in redraw Animation", isPlaying);
        if (isPlaying) {
            setupAnimationVariables();
            maybeClearPlayEmojiSequenceInterval();
            playEmojiSequence();
        }
    }


    function stopEmojiSequence() {
        maybeClearPlayEmojiSequenceInterval();
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

        switch (message.method) {
            case "eventBridgeReady":
                // log("in eventbrdige ready");
                ui.sendMessage({
                    app: "avimoji",
                    method: "updateUI",
                    selectedEmoji: selectedEmoji,
                    emojiSequence: emojiSequence,
                    mask: mask,
                    isPlaying: isPlaying,
                    emojiSize: emojiSize,
                    animationDistance: animationDistance,
                    animationSpeed: animationSpeed,
                    favorites: makeFavoritesArray(favorites),
                    advanced: advanced,
                    local: local,
                    sequenceMode: sequenceMode,
                    allEmojis: allEmojis,
                    shouldTimeoutDelete: shouldTimeoutDelete,
                    ezFavorites: ezFavorites,
                    firstRun: Settings.getValue("avimoji/firstRun", true)
                });
                sendEmojiChunks();
                break;

            case "handleSelectedEmoji":
                handleSelectedEmoji(message.data);
                break;

            case "handleMask":
                handleMask(message.data);
                maybeRedrawAnimation();
                break;

            case "handleUpdateIsPlaying":
                handleUpdateIsPlaying(message.data);
                break;

            case "deleteSequenceEmoji":
                deleteSequenceEmoji(message.data);
                break;

            case "handleResetSequenceList":
                handleResetSequenceList();
                break;

            case "handleResetFavoritesList":
                handleResetFavoritesList();
                break;

            case "handleSelectedRemoved":
                handleSelectedRemoved();
                break;

            case "handleEmojiSize":
                handleEmojiSize(message.data);
                break;

            case "handleAnimationDistance":
                handleAnimationDistance(message.data);
                break;
            case "handleAnimationSpeed":
                handleAnimationSpeed(message.data);
                break;
            case "handleLocal":
                handleLocal(message.data);
                break;

            case "handleEZFavorites":
                handleEZFavorites(message.data);
                break;

            case "handleSequenceMode":
                handleSequenceMode(message.data);
                break;

            case "handleAllEmojis":
                handleAllEmojis(message.data);
                break;

            case "handleAdvanced":
                handleAdvanced(message.data);
                break;

            case "handleShouldTimeoutDelete":
                handleShouldTimeoutDelete(message.data);
                break;
            
            case "closeIntroScreen":
                Settings.setValue("avimoji/firstRun", false);
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

        if (ezFavorites) {
            renderEZFavoritesOverlays();
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
        deleteEmojiPreviewOverlay();
        deleteEZFavoritesOverlays();
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
        maybeClearPreviewOverlayTimer();
        maybeClearEZFavoritesTimer();
        maybeClearPlayEmojiSequenceInterval();
        maybeClearPop();
        pruneOldAvimojis();
    }


    // #endregion
    // *************************************
    // END cleanup
    // *************************************

})();