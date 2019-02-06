/*
    Appreciate
    Created by Zach Fox on 2019-01-30
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

(function () {
    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region Utilities
    var MS_PER_S = 1000;
    var CM_PER_M = 100;

    function updateCurrentIntensityUI() {
        ui.sendMessage({method: "updateCurrentIntensityUI", currentIntensity: currentIntensity});
    }
    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // Function that AppUI calls when the App's UI opens
    function onOpened() {
        updateCurrentIntensityUI();
    }

    var NUM_CLAP_SOUNDS = 21;
    var NUM_WHISTLE_SOUNDS = 17;
    var clapSounds = [];
    var whistleSounds = [];
    function getSounds() {
        for (var i = 1; i < NUM_CLAP_SOUNDS + 1; i++) {
            clapSounds.push(SoundCache.getSound(Script.resolvePath(
                "resources/sounds/claps/" + ("0" + i).slice(-2) + ".wav")));
        }
        for (i = 1; i < NUM_WHISTLE_SOUNDS + 1; i++) {
            whistleSounds.push(SoundCache.getSound(Script.resolvePath(
                "resources/sounds/whistles/" + ("0" + i).slice(-2) + ".wav")));
        }
    }

    var whistlingAnimation = false;
    var clappingAnimation = false;
    function getAnimations() {
        var animationURL = Script.resolvePath("resources/animations/Cheering.fbx");
        var resource = AnimationCache.prefetch(animationURL);
        var animation = AnimationCache.getAnimation(animationURL);
        whistlingAnimation = { url: animationURL, animation: animation, resource: resource};

        animationURL = Script.resolvePath("resources/animations/Clapping.fbx");
        resource = AnimationCache.prefetch(animationURL);
        animation = AnimationCache.getAnimation(animationURL);
        clappingAnimation = { url: animationURL, animation: animation, resource: resource};
    }

    function maybeClearSoundFadeInterval() {
        if (soundFadeInterval) {
            Script.clearInterval(soundFadeInterval);
            soundFadeInterval = false;
        }
    }

    var soundFadeInterval = false;
    var FADE_INTERVAL_MS = 20;
    var FADE_OUT_STEP_SIZE = 0.05; // unitless
    function fadeOutAndStopSound() {
        maybeClearSoundFadeInterval();

        soundFadeInterval = Script.setInterval(function() {
            currentIntensity -= FADE_OUT_STEP_SIZE;

            if (currentIntensity <= 0) {
                if (soundInjector) {
                    soundInjector.stop();
                }

                updateCurrentIntensityUI();

                maybeClearSoundFadeInterval();
            } else {
                fadeIntensity(currentIntensity, VOLUME_MAX_STEP_SIZE_DESKTOP);
            }
        }, FADE_INTERVAL_MS);
    }

    var MIN_VOLUME_CLAP = 0.05;
    var MAX_VOLUME_CLAP = 1.0;
    var MIN_VOLUME_WHISTLE = 0.1;
    var MAX_VOLUME_WHISTLE = 0.2;
    function calculateInjectorVolume() {
        var minInputVolume = 0;
        var maxInputVolume = MAX_CLAP_INTENSITY;
        var minOutputVolume = MIN_VOLUME_CLAP;
        var maxOutputVolume = MAX_VOLUME_CLAP;

        if (currentSound === "whistle") {
            minInputVolume = MAX_CLAP_INTENSITY;
            maxInputVolume = MAX_WHISTLE_INTENSITY;
            minOutputVolume = MIN_VOLUME_WHISTLE;
            maxOutputVolume = MAX_VOLUME_WHISTLE;
        }

        var vol = minOutputVolume + (maxOutputVolume - minOutputVolume) *
            (currentIntensity - minInputVolume) / (maxInputVolume - minInputVolume);
        return vol;
    }

    var currentIntensity = 0;
    var VOLUME_MAX_STEP_SIZE = 0.003; // unitless, determined empirically
    var VOLUME_MAX_STEP_SIZE_DESKTOP = 1; // unitless, determined empirically
    var MAX_CLAP_INTENSITY = 0.55; // Unitless, determined empirically
    var MAX_WHISTLE_INTENSITY = 1.0; // Unitless, determined empirically
    function fadeIntensity(targetVolume, maxStepSize) {
        if (!maxStepSize) {
            maxStepSize = VOLUME_MAX_STEP_SIZE;
        }

        var volumeDelta = targetVolume - currentIntensity;
        volumeDelta = Math.min(Math.abs(volumeDelta), maxStepSize);

        if (targetVolume < currentIntensity) {
            volumeDelta *= -1;
        }

        currentIntensity += volumeDelta;

        currentIntensity = Math.max(0.0, Math.min(1.0, currentIntensity));

        updateCurrentIntensityUI();

        if (!soundInjector) {
            return;
        }

        var injectorOptions = {
            position: MyAvatar.position,
            volume: calculateInjectorVolume()
        };

        soundInjector.setOptions(injectorOptions);
    }

    var soundInjector = false;
    function playSound(sound) {
        if (soundInjector.isPlaying) {
            return;
        }

        soundInjector = Audio.playSound(sound, {
            position: MyAvatar.position,
            volume: calculateInjectorVolume()
        });

        soundInjector.finished.connect(function() {
            soundInjector = false;
        });
    }

    function shouldClap() {
        return currentIntensity > 0.0 &&
            currentIntensity <= MAX_CLAP_INTENSITY;
    }

    function shouldWhistle() {
        return currentIntensity > MAX_CLAP_INTENSITY &&
            currentIntensity <= MAX_WHISTLE_INTENSITY;
    }

    var currentSound;
    function selectAndPlaySound() {
        if (shouldClap()) {
            currentSound = "clap";
            playSound(clapSounds[Math.floor(Math.random() * clapSounds.length)]);
        } else if (shouldWhistle()) {
            currentSound = "whistle";
            playSound(whistleSounds[Math.floor(Math.random() * whistleSounds.length)]);
        }
    }

    function maybeClearVRDebounceTimer() {
        if (vrDebounceTimer) {
            Script.clearTimeout(vrDebounceTimer);
            vrDebounceTimer = false;
        }
    }

    var MAX_VELOCITY_CM_PER_SEC = 110; // determined empirically
    var MAX_ANGULAR_VELOCITY_LENGTH = 1.5; // determined empirically
    var LINEAR_VELOCITY_WEIGHT = 0.7; // This and the line below must add up to 1.0
    var ANGULAR_VELOCITY_LENGTH_WEIGHT = 0.3; // This and the line below must add up to 1.0
    var vrDebounceTimer = false;
    var VR_DEBOUNCE_TIMER_TIMEOUT_MIN_MS = 20; // determined empirically
    var VR_DEBOUNCE_TIMER_TIMEOUT_MAX_MS = 400; // determined empirically
    function calculateHandEffect(linearVelocity, angularVelocity){
        var leftHandLinearVelocityCMPerSec = linearVelocity.left;
        var rightHandLinearVelocityCMPerSec = linearVelocity.right;
        var averageLinearVelocity = (leftHandLinearVelocityCMPerSec + rightHandLinearVelocityCMPerSec) / 2;
        averageLinearVelocity = Math.min(averageLinearVelocity, MAX_VELOCITY_CM_PER_SEC);

        var leftHandAngularVelocityLength = Vec3.length(angularVelocity.left);
        var rightHandAngularVelocityLength = Vec3.length(angularVelocity.right);
        var averageAngularVelocityIntensity = (leftHandAngularVelocityLength + rightHandAngularVelocityLength) / 2;
        averageAngularVelocityIntensity = Math.min(averageAngularVelocityIntensity, MAX_ANGULAR_VELOCITY_LENGTH);

        var cheerIntensity =
            averageLinearVelocity / MAX_VELOCITY_CM_PER_SEC * LINEAR_VELOCITY_WEIGHT +
            averageAngularVelocityIntensity / MAX_ANGULAR_VELOCITY_LENGTH * ANGULAR_VELOCITY_LENGTH_WEIGHT;

        fadeIntensity(cheerIntensity);
        
        var vrDebounceTimeout = VR_DEBOUNCE_TIMER_TIMEOUT_MIN_MS +
            (VR_DEBOUNCE_TIMER_TIMEOUT_MAX_MS - VR_DEBOUNCE_TIMER_TIMEOUT_MIN_MS) * (1.0 - cheerIntensity);
        // This timer forces a minimum tail duration for all sound clips
        if (!vrDebounceTimer) {
            selectAndPlaySound();
            vrDebounceTimer = Script.setTimeout(function() {
                vrDebounceTimer = false;
            }, vrDebounceTimeout);
        }
    }

    var lastLeftHandPosition = false;
    var lastRightHandPosition = false;
    function getHandsLinearVelocity() {
        var returnObject = {
            left: 0,
            right: 0
        };

        var leftHandPosition = MyAvatar.getJointPosition("LeftHand");
        var rightHandPosition = MyAvatar.getJointPosition("RightHand");

        if (!lastLeftHandPosition || !lastRightHandPosition) {
            lastLeftHandPosition = leftHandPosition;
            lastRightHandPosition = rightHandPosition;
            return returnObject;
        }

        var leftHandDistanceCM = Vec3.distance(leftHandPosition, lastLeftHandPosition) * CM_PER_M;
        var rightHandDistanceCM = Vec3.distance(rightHandPosition, lastRightHandPosition) * CM_PER_M;

        returnObject.left = leftHandDistanceCM / HAND_VELOCITY_CHECK_INTERVAL_MS * MS_PER_S;
        returnObject.right = rightHandDistanceCM / HAND_VELOCITY_CHECK_INTERVAL_MS * MS_PER_S;
        
        lastLeftHandPosition = leftHandPosition;
        lastRightHandPosition = rightHandPosition;

        return returnObject;
    }

    var lastLeftHandRotation = false;
    var lastRightHandRotation = false;
    function getHandsAngularVelocity() {
        var returnObject = {
            left: {x: 0, y: 0, z: 0},
            right: {x: 0, y: 0, z: 0}
        };

        var leftHandRotation = MyAvatar.getJointRotation(MyAvatar.getJointIndex("LeftHand"));
        var rightHandRotation = MyAvatar.getJointRotation(MyAvatar.getJointIndex("RightHand"));

        if (!lastLeftHandRotation || !lastRightHandRotation) {
            lastLeftHandRotation = leftHandRotation;
            lastRightHandRotation = rightHandRotation;
            return returnObject;
        }

        var leftHandAngleDelta = Quat.multiply(leftHandRotation, Quat.inverse(lastLeftHandRotation)); 
        var rightHandAngleDelta = Quat.multiply(rightHandRotation, Quat.inverse(lastRightHandRotation));

        leftHandAngleDelta = Quat.safeEulerAngles(leftHandAngleDelta);
        rightHandAngleDelta = Quat.safeEulerAngles(rightHandAngleDelta);

        returnObject.left = Vec3.multiply(leftHandAngleDelta, 1 / HAND_VELOCITY_CHECK_INTERVAL_MS);
        returnObject.right = Vec3.multiply(rightHandAngleDelta, 1 / HAND_VELOCITY_CHECK_INTERVAL_MS);

        lastLeftHandRotation = leftHandRotation;
        lastRightHandRotation = rightHandRotation;

        return returnObject;
    }

    function handVelocityCheck() {
        if (!handsAreAboveHead) {
            return;
        }

        var handsLinearVelocity = getHandsLinearVelocity();
        var handsAngularVelocity = getHandsAngularVelocity();

        calculateHandEffect(handsLinearVelocity, handsAngularVelocity);
    }

    // If handVelocityCheckInterval is set up, clear it.
    function maybeClearHandVelocityCheck() {
        if (handVelocityCheckInterval) {
            Script.clearInterval(handVelocityCheckInterval);
            handVelocityCheckInterval = false;
        }
    }

    // If handVelocityCheckInterval is set up, clear it.
    // Also stop the sound injector and set currentIntensity to 0.
    function maybeClearHandVelocityCheckIntervalAndStopSound() {
        maybeClearHandVelocityCheck();

        if (soundInjector) {
            soundInjector.stop();
        }
        
        currentIntensity = 0.0;
    }

    // Sets up an interval that'll check the avatar's hand's velocities.
    // This is used for calculating the effect.
    var handVelocityCheckInterval = false;
    var HAND_VELOCITY_CHECK_INTERVAL_MS = 10;
    function maybeSetupHandVelocityCheckInterval() {
        // `!HMD.active` clause isn't really necessary, just extra protection
        if (handVelocityCheckInterval || !HMD.active) {
            return;
        }

        handVelocityCheckInterval = Script.setInterval(handVelocityCheck, HAND_VELOCITY_CHECK_INTERVAL_MS);
    }

    var handsAreAboveHead = false;
    function handPositionCheck() {
        var leftHandPosition = MyAvatar.getJointPosition("LeftHand");
        var rightHandPosition = MyAvatar.getJointPosition("RightHand");
        var headJointPosition = MyAvatar.getJointPosition("Head");

        var headY = headJointPosition.y;

        handsAreAboveHead = (rightHandPosition.y > headY && leftHandPosition.y > headY);

        if (handsAreAboveHead) {
            maybeSetupHandVelocityCheckInterval();
        } else {
            maybeClearHandVelocityCheck();
            fadeOutAndStopSound();
        }
    }

    // If handPositionCheckInterval is set up, clear it.
    function maybeClearHandPositionCheckInterval() {
        if (handPositionCheckInterval) {
            Script.clearInterval(handPositionCheckInterval);
            handPositionCheckInterval = false;
        }
    }

    // If the app is enabled, sets up an interval that'll check if the avatar's hands are above their head
    var handPositionCheckInterval = false;
    var HAND_POSITION_CHECK_INTERVAL_MS = 200;
    function maybeSetupHandPositionCheckInterval() {
        if (!appreciateEnabled || !HMD.active) {
            return;
        }

        maybeClearHandPositionCheckInterval();

        handPositionCheckInterval = Script.setInterval(handPositionCheck, HAND_POSITION_CHECK_INTERVAL_MS);
    }

    function maybeClearLowerCheeringVolumeInterval() {
        if (lowerCheeringVolumeInterval) {
            Script.clearInterval(lowerCheeringVolumeInterval);
            lowerCheeringVolumeInterval = false;
        }
    }

    function stopCheering() {
        maybeClearStopCheeringTimeout();
        maybeClearLowerCheeringVolumeInterval();
        MyAvatar.restoreAnimation();
        currentAnimationFPS = INITIAL_ANIMATION_FPS;
        currentlyPlayingFrame = 0;
        currentAnimationTimestamp = 0;
    }

    function maybeClearStopCheeringTimeout() {
        if (stopCheeringTimeout) {
            Script.clearTimeout(stopCheeringTimeout);
            stopCheeringTimeout = false;
        }
    }

    var VOLUME_STEP_DOWN_DESKTOP = 0.01; // unitless, determined empirically
    function slowCheeringAndLowerCheeringVolume() {
        currentIntensity -= VOLUME_STEP_DOWN_DESKTOP;
        fadeIntensity(currentIntensity, VOLUME_MAX_STEP_SIZE_DESKTOP);

        currentAnimation = selectAnimation();

        if (!currentAnimation) {
            stopCheering();
            return;
        }

        var frameCount = currentAnimation.animation.frames.length;

        var animationTimestampDeltaMS = Date.now() - currentAnimationTimestamp;
        var frameDelta = animationTimestampDeltaMS / MS_PER_S * currentAnimationFPS;

        currentlyPlayingFrame = (currentlyPlayingFrame + frameDelta) % frameCount;

        currentAnimationFPS = currentIntensity * CHEERING_FPS_MAX + INITIAL_ANIMATION_FPS;

        currentAnimationFPS = Math.min(currentAnimationFPS, CHEERING_FPS_MAX);

        MyAvatar.overrideAnimation(currentAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);

        currentAnimationTimestamp = Date.now();
    }

    function selectAnimation() {
        if (shouldClap()) {
            if (currentAnimation === whistlingAnimation) {
                currentAnimationTimestamp = 0;
            }
            return clappingAnimation;
        } else if (shouldWhistle()) {
            if (currentAnimation === clappingAnimation) {
                currentAnimationTimestamp = 0;
            }
            return whistlingAnimation;
        } else {
            return false;
        }
    }

    var currentAnimation = false;
    var INITIAL_ANIMATION_FPS = 7;
    var currentAnimationFPS = INITIAL_ANIMATION_FPS;
    var lowerCheeringVolumeInterval = false;
    var SLOW_CHEERING_INTERVAL_MS = 100;
    var currentlyPlayingFrame = 0;
    var currentAnimationTimestamp;
    var CHEERING_FPS_MAX = 80;
    var VOLUME_STEP_UP_DESKTOP = 0.035; // unitless, determined empirically
    function keyPressed() {
        if (!whistlingAnimation || !clappingAnimation) {
            return;
        }

        maybeClearSoundFadeInterval();
        maybeClearStopCheeringTimeout();

        currentIntensity += VOLUME_STEP_UP_DESKTOP;
        fadeIntensity(currentIntensity, VOLUME_MAX_STEP_SIZE_DESKTOP);
        selectAndPlaySound();

        if (!lowerCheeringVolumeInterval) {
            lowerCheeringVolumeInterval = Script.setInterval(slowCheeringAndLowerCheeringVolume, SLOW_CHEERING_INTERVAL_MS);
        }

        currentAnimation = selectAnimation();

        if (!currentAnimation) {
            stopCheering();
            return;
        }

        var frameCount = currentAnimation.animation.frames.length;

        if (currentAnimationTimestamp > 0) {
            var animationTimestampDeltaMS = Date.now() - currentAnimationTimestamp;
            var frameDelta = animationTimestampDeltaMS / MS_PER_S * currentAnimationFPS;
    
            currentlyPlayingFrame = (currentlyPlayingFrame + frameDelta) % frameCount;
    
            currentAnimationFPS = currentIntensity * CHEERING_FPS_MAX + INITIAL_ANIMATION_FPS;

            currentAnimationFPS = Math.min(currentAnimationFPS, CHEERING_FPS_MAX);
        } else {
            currentlyPlayingFrame = 0;
        }

        MyAvatar.overrideAnimation(currentAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);
        currentAnimationTimestamp = Date.now();
    }
    
    var desktopDebounceTimer = false;
    var DESKTOP_DEBOUNCE_TIMEOUT_MS = 30;
    function keyPressEvent(event) {
        if ((event.text.toUpperCase() === "Z") &&
            !event.isShifted &&
            !desktopDebounceTimer &&
            !event.isMeta &&
            !event.isControl &&
            !event.isAlt &&
            !HMD.active) {

            if (event.isAutoRepeat) {
                desktopDebounceTimer = Script.setTimeout(function() {
                    desktopDebounceTimer = false;
                }, DESKTOP_DEBOUNCE_TIMEOUT_MS);
            }

            keyPressed();
        }
    }
    
    // Clear the "cheering" animation if it's running
    var stopCheeringTimeout = false;
    var STOP_CHEERING_TIMEOUT_MS = 500;
    function stopSoundSoon() {
        maybeClearStopCheeringTimeout();

        if (currentIntensity > 0) {
            stopCheeringTimeout = Script.setTimeout(fadeOutAndStopSound, STOP_CHEERING_TIMEOUT_MS);
        }
    }
    
    function keyReleaseEvent(event) {
        if ((event.text.toUpperCase() === "Z") &&
            !event.isAutoRepeat) {
            stopSoundSoon();
        }
    }

    // Enables or disables the app's main functionality
    var appreciateEnabled = Settings.getValue("appreciate/enabled", false);
    var keyEventsWired = false;
    function enableOrDisableAppreciate() {
        if (appreciateEnabled) {
            maybeSetupHandPositionCheckInterval();
            
            if (!keyEventsWired && !HMD.active) {
                Controller.keyPressEvent.connect(keyPressEvent);
                Controller.keyReleaseEvent.connect(keyReleaseEvent);
                keyEventsWired = true;
            }
        } else {
            maybeClearHandPositionCheckInterval();
            maybeClearHandVelocityCheckIntervalAndStopSound();
            maybeClearStopCheeringTimeout();
            stopCheering();

            if (keyEventsWired) {         
                Controller.keyPressEvent.disconnect(keyPressEvent);
                Controller.keyReleaseEvent.disconnect(keyReleaseEvent);
                keyEventsWired = false;
            }
        }
    }


    // Handles incoming messages from the UI
    function onMessage(message) {
        switch (message.method) {
            case "eventBridgeReady":
                ui.sendMessage({method: "updateUI", appreciateEnabled: appreciateEnabled});
                break;

            case "appreciateSwitchClicked":
                appreciateEnabled = message.appreciateEnabled;
                Settings.setValue("appreciate/enabled", appreciateEnabled);
                enableOrDisableAppreciate();
                break;

            default:
                console.log("Unhandled message in appreciate_app.js");
                break;
        }
    }
    
    // Called when the script is stopped
    function onScriptEnding() {
        maybeClearHandPositionCheckInterval();
        maybeClearHandVelocityCheckIntervalAndStopSound();
        maybeClearSoundFadeInterval();
        maybeClearVRDebounceTimer();

        maybeClearStopCheeringTimeout();
        stopCheering();

        if (desktopDebounceTimer) {
            Script.clearTimeout(desktopDebounceTimer);
            desktopDebounceTimer = false;
        }

        if (keyEventsWired) {            
            Controller.keyPressEvent.disconnect(keyPressEvent);
            Controller.keyReleaseEvent.disconnect(keyReleaseEvent);
            keyEventsWired = false;
        }

        HMD.displayModeChanged.disconnect(enableOrDisableAppreciate);
    }

    // Called when the script starts up
    var BUTTON_NAME = "APPRECIATE";
    var APP_UI_URL = Script.resolvePath('resources/appreciate_ui.html');
    var AppUI = Script.require('appUi');
    var ui;
    function startup() {
        ui = new AppUI({
            buttonName: BUTTON_NAME,
            home: APP_UI_URL,
            graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
            onOpened: onOpened,
            onMessage: onMessage
        });
        
        enableOrDisableAppreciate();
        getSounds();
        getAnimations();
        HMD.displayModeChanged.connect(enableOrDisableAppreciate);
    }

    Script.scriptEnding.connect(onScriptEnding);
    startup();
})();

