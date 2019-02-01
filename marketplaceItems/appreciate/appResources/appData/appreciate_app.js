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

    function updateCurrentVolume() {
        ui.sendMessage({method: "updateCurrentVolume", currentVolume: currentVolume});
    }
    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    function maybeClearUpdateUIInterval() {
        if (updateUIInterval) {
            Script.clearInterval(updateUIInterval);
            updateUIInterval = false;
        }
    }

    // Function that AppUI calls when the App's UI opens
    var updateUIInterval = false;
    var UPDATE_UI_INTERVAL_MS = 50;
    function onOpened() {
        maybeClearUpdateUIInterval();
        updateUIInterval = Script.setInterval(updateCurrentVolume, UPDATE_UI_INTERVAL_MS);
    }


    // Function that AppUI calls when the App's UI closes    
    function onClosed() {
        maybeClearUpdateUIInterval();
    }

    var applauseSound;
    function getSounds() {
        applauseSound = SoundCache.getSound(Script.resolvePath("resources/sounds/applause.wav"));
    }

    var cheeringAnimation = false;
    function getAnimations() {
        var animationURL = Script.resolvePath("resources/animations/Cheering.fbx");
        var resource = AnimationCache.prefetch(animationURL);
        var animation = AnimationCache.getAnimation(animationURL);
        cheeringAnimation = { url: animationURL, animation: animation, resource: resource};
    }

    var soundFadeInterval = false;
    var FADE_INTERVAL_MS = 20;
    var FADE_OUT_STEP_SIZE = 0.05; // unitless
    function fadeOutAndStopSound() {
        maybeClearSoundFadeInterval();

        soundFadeInterval = Script.setInterval(function() {
            fadeSoundVolume(0, FADE_OUT_STEP_SIZE);

            if (currentVolume === 0) {
                if (soundInjector) {
                    soundInjector.stop();
                    soundInjector = false;
                }

                maybeClearSoundFadeInterval();
            }
        }, FADE_INTERVAL_MS);
    }

    function maybeClearSoundFadeInterval() {
        if (soundFadeInterval) {
            Script.clearInterval(soundFadeInterval);
            soundFadeInterval = false;
        }
    }

    var currentVolume = 0;
    var VOLUME_MAX_STEP_SIZE = 0.008; // unitless, determined empirically
    var VOLUME_MAX_STEP_SIZE_DESKTOP = 1; // unitless, determined empirically
    function fadeSoundVolume(targetVolume, maxStepSize) {
        if (!soundInjector) {
            return;
        }

        if (!maxStepSize) {
            maxStepSize = VOLUME_MAX_STEP_SIZE;
        }

        var volumeDelta = targetVolume - currentVolume;
        volumeDelta = Math.min(Math.abs(volumeDelta), maxStepSize);

        if (targetVolume < currentVolume) {
            volumeDelta *= -1;
        }

        currentVolume += volumeDelta;

        currentVolume = Math.max(0.0, Math.min(1.0, currentVolume));

        var injectorOptions = {
            position: MyAvatar.position,
            volume: currentVolume
        };

        soundInjector.setOptions(injectorOptions);
    }

    function playSound(sound) {
        return Audio.playSound(sound, {
            position: MyAvatar.position,
            volume: currentVolume
        });
    }

    var soundInjector = false;
    var MIN_VELOCITY_THRESHOLD_CM_PER_SEC = 10;
    var MAX_VELOCITY_CM_PER_SEC = 120; // determined empirically
    function calculateHandEffect(leftHandVelocityCMPerSec, rightHandVelocityCMPerSec, isFaked){
        var averageVelocity = (leftHandVelocityCMPerSec + rightHandVelocityCMPerSec) / 2;
        if (averageVelocity >= MIN_VELOCITY_THRESHOLD_CM_PER_SEC && !soundInjector) {
            soundInjector = playSound(applauseSound);
            soundInjector.finished.connect(function() {
                soundInjector = false;
            });
        }

        // Clamp to max reasonable velocity
        averageVelocity = Math.min(averageVelocity, MAX_VELOCITY_CM_PER_SEC);

        var newVolumeTarget = averageVelocity / MAX_VELOCITY_CM_PER_SEC;

        fadeSoundVolume(newVolumeTarget, isFaked && VOLUME_MAX_STEP_SIZE_DESKTOP);
    }

    var lastLeftHandPosition = false;
    var lastRightHandPosition = false;
    function handVelocityCheck() {
        if (!handsAreAboveHead) {
            return;
        }

        var leftHandPosition = MyAvatar.getJointPosition("LeftHand");
        var rightHandPosition = MyAvatar.getJointPosition("RightHand");

        if (!lastLeftHandPosition || !lastRightHandPosition) {
            lastLeftHandPosition = leftHandPosition;
            lastRightHandPosition = rightHandPosition;
            return;
        }

        var leftHandDistanceCM = Vec3.distance(leftHandPosition, lastLeftHandPosition) * CM_PER_M;
        var rightHandDistanceCM = Vec3.distance(rightHandPosition, lastRightHandPosition) * CM_PER_M;

        var leftHandVelocityCMPerSec = leftHandDistanceCM / HAND_VELOCITY_CHECK_INTERVAL_MS * MS_PER_S;
        var rightHandVelocityCMPerSec = rightHandDistanceCM / HAND_VELOCITY_CHECK_INTERVAL_MS * MS_PER_S;

        calculateHandEffect(leftHandVelocityCMPerSec, rightHandVelocityCMPerSec);
        
        lastLeftHandPosition = leftHandPosition;
        lastRightHandPosition = rightHandPosition;
    }

    // If handVelocityCheckInterval is set up, clear it.
    function maybeClearHandVelocityCheck() {
        if (handVelocityCheckInterval) {
            Script.clearInterval(handVelocityCheckInterval);
            handVelocityCheckInterval = false;
        }
    }

    // If handVelocityCheckInterval is set up, clear it.
    // Also stop the sound injector and set currentVolume to 0.
    function maybeClearHandVelocityCheckIntervalAndStopSound() {
        maybeClearHandVelocityCheck();

        if (soundInjector) {
            soundInjector.stop();
            soundInjector = false;
        }
        
        currentVolume = 0.0;
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

    function maybeClearSlowCheeringInterval() {
        if (slowCheeringInterval) {
            Script.clearInterval(slowCheeringInterval);
            slowCheeringInterval = false;
        }
    }

    function stopCheering() {
        maybeClearStopCheeringTimeout();
        maybeClearSlowCheeringInterval();
        MyAvatar.restoreAnimation();
        isCheering = false;
        currentAnimationFPS = INITIAL_ANIMATION_FPS;
        currentlyPlayingFrame = 0;
        currentAnimationTimestamp = 0;
        fadeOutAndStopSound();
        fakeLeftHandVelocity = FAKE_HAND_VELOCITY_CM_PER_SEC_INITIAL;
        fakeRightHandVelocity = FAKE_HAND_VELOCITY_CM_PER_SEC_INITIAL;
    }

    function maybeClearStopCheeringTimeout() {
        if (stopCheeringTimeout) {
            Script.clearTimeout(stopCheeringTimeout);
            stopCheeringTimeout = false;
        }
    }
    
    // Clear the "cheering" animation if it's running
    var stopCheeringTimeout = false;
    var STOP_CHEERING_TIMEOUT_MS = 2000;
    function stopCheeringSoon() {
        maybeClearStopCheeringTimeout();

        if (isCheering) {
            stopCheeringTimeout = Script.setTimeout(stopCheering, STOP_CHEERING_TIMEOUT_MS);
        }
    }

    function slowCheering() {
        var frameCount = cheeringAnimation.animation.frames.length;

        var animationTimestampDeltaMS = Date.now() - currentAnimationTimestamp;
        var frameDelta = animationTimestampDeltaMS / MS_PER_S * currentAnimationFPS;

        currentlyPlayingFrame = (currentlyPlayingFrame + frameDelta) % frameCount;

        currentAnimationFPS = currentVolume * CHEERING_FPS_MAX + INITIAL_ANIMATION_FPS;

        currentAnimationFPS = Math.min(currentAnimationFPS, CHEERING_FPS_MAX);

        MyAvatar.overrideAnimation(cheeringAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);

        if (currentAnimationFPS <= INITIAL_ANIMATION_FPS) {
            stopCheering();
            return;
        }

        currentAnimationTimestamp = Date.now();

        fakeLeftHandVelocity -= FAKE_HAND_VELOCITY_STEP_DOWN_CM_PER_SEC;
        fakeRightHandVelocity -= FAKE_HAND_VELOCITY_STEP_DOWN_CM_PER_SEC;
        calculateHandEffect(fakeLeftHandVelocity, fakeRightHandVelocity, true);
    }

    var isCheering = false;
    var INITIAL_ANIMATION_FPS = 7;
    var currentAnimationFPS = INITIAL_ANIMATION_FPS;
    var slowCheeringInterval = false;
    var SLOW_CHEERING_INTERVAL_MS = 150;
    var currentlyPlayingFrame = 0;
    var currentAnimationTimestamp;
    var CHEERING_FPS_MAX = 80;
    function startCheering() {
        if (!cheeringAnimation) {
            return;
        }

        maybeClearSoundFadeInterval();
        maybeClearStopCheeringTimeout();

        if (!slowCheeringInterval) {
            slowCheeringInterval = Script.setInterval(slowCheering, SLOW_CHEERING_INTERVAL_MS);
        }

        var frameCount = cheeringAnimation.animation.frames.length;

        if (currentAnimationTimestamp > 0) {
            var animationTimestampDeltaMS = Date.now() - currentAnimationTimestamp;
            var frameDelta = animationTimestampDeltaMS / MS_PER_S * currentAnimationFPS;
    
            currentlyPlayingFrame = (currentlyPlayingFrame + frameDelta) % frameCount;
    
            currentAnimationFPS = currentVolume * CHEERING_FPS_MAX + INITIAL_ANIMATION_FPS;

            currentAnimationFPS = Math.min(currentAnimationFPS, CHEERING_FPS_MAX);
        } else {
            currentlyPlayingFrame = 0;
        }

        MyAvatar.overrideAnimation(cheeringAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);
        isCheering = true;
        currentAnimationTimestamp = Date.now();
    }
    
    var debounceTimer = false;
    var DEBOUNCE_TIMEOUT_MS = 30;
    var FAKE_HAND_VELOCITY_STEP_UP_CM_PER_SEC = 5;
    var FAKE_HAND_VELOCITY_STEP_DOWN_CM_PER_SEC = 3;
    var FAKE_HAND_VELOCITY_CM_PER_SEC_INITIAL = MIN_VELOCITY_THRESHOLD_CM_PER_SEC - FAKE_HAND_VELOCITY_STEP_UP_CM_PER_SEC;
    var fakeLeftHandVelocity = FAKE_HAND_VELOCITY_CM_PER_SEC_INITIAL;
    var fakeRightHandVelocity = FAKE_HAND_VELOCITY_CM_PER_SEC_INITIAL;
    function keyPressEvent(event) {
        if ((event.text.toUpperCase() === "Z") &&
            !event.isShifted &&
            !debounceTimer &&
            !event.isMeta &&
            !event.isControl &&
            !event.isAlt) {

            if (event.isAutoRepeat) {
                debounceTimer = Script.setTimeout(function() {
                    debounceTimer = false;
                }, DEBOUNCE_TIMEOUT_MS);
            }

            fakeLeftHandVelocity += FAKE_HAND_VELOCITY_STEP_UP_CM_PER_SEC;
            fakeLeftHandVelocity = Math.min(MAX_VELOCITY_CM_PER_SEC, fakeLeftHandVelocity);

            fakeRightHandVelocity += FAKE_HAND_VELOCITY_STEP_UP_CM_PER_SEC;
            fakeRightHandVelocity = Math.min(MAX_VELOCITY_CM_PER_SEC, fakeRightHandVelocity);

            startCheering();
            calculateHandEffect(fakeLeftHandVelocity, fakeRightHandVelocity, true);
        }
    }
    
    function keyReleaseEvent(event) {
        if ((event.text.toUpperCase() === "Z") &&
            !event.isAutoRepeat) {
            stopCheeringSoon();
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

        maybeClearStopCheeringTimeout();
        stopCheering();

        if (ui.isOpen) {
            ui.onClosed();
        }

        if (debounceTimer) {
            Script.clearTimeout(debounceTimer);
            debounceTimer = false;
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
            onClosed: onClosed,
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

