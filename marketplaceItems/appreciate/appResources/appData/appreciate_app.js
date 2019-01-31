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

    function updateFPSUI() {
        ui.sendMessage({method: "updateFPSUI", FPS: currentAnimationFPS});
    }
    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // Function that AppUI calls when the App's UI opens
    function onOpened() {
    }


    // Function that AppUI calls when the App's UI closes    
    function onClosed() {
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
    var FADE_INTERVAL_MS = 50;
    var FADE_OUT_STEP_SIZE = 0.02; // unitless
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
    var VOLUME_MAX_STEP_SIZE = 0.015; // unitless, determined empirically
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
    var MAX_VELOCITY_CM_PER_SEC = 350; // determined empirically
    function calculateHandEffect(leftHandVelocityCMPerSec, rightHandVelocityCMPerSec){
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

        fadeSoundVolume(newVolumeTarget);
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
    var HAND_VELOCITY_CHECK_INTERVAL_MS = 125;
    function maybeSetupHandVelocityCheckInterval() {
        if (handVelocityCheckInterval) {
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
        if (!appreciateEnabled) {
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
        updateFPSUI();
        isCheering = false;
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
    
    // Clear the "cheering" animation if it's running
    var stopCheeringTimeout = false;
    var STOP_CHEERING_TIMEOUT_MS = 3500;
    function stopCheeringSoon() {
        maybeClearStopCheeringTimeout();

        if (isCheering) {
            stopCheeringTimeout = Script.setTimeout(stopCheering, STOP_CHEERING_TIMEOUT_MS);
        }
    }

    var CHEERING_FPS_STEP_DOWN_SIZE = 2;
    function slowCheering() {
        var frameCount = cheeringAnimation.animation.frames.length;

        var animationTimestampDeltaMS = Date.now() - currentAnimationTimestamp;
        var frameDelta = animationTimestampDeltaMS / MS_PER_S * currentAnimationFPS;

        currentlyPlayingFrame = (currentlyPlayingFrame + frameDelta) % frameCount;

        currentAnimationFPS -= CHEERING_FPS_STEP_DOWN_SIZE;

        MyAvatar.overrideAnimation(cheeringAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);

        updateFPSUI();

        if (currentAnimationFPS < 0) {
            stopCheering();
            return;
        }

        currentAnimationTimestamp = Date.now();
    }

    var isCheering = false;
    var INITIAL_ANIMATION_FPS = 7;
    var currentAnimationFPS = INITIAL_ANIMATION_FPS;
    var slowCheeringInterval = false;
    var SLOW_CHEERING_INTERVAL_MS = 100;
    var currentlyPlayingFrame = 0;
    var currentAnimationTimestamp;
    var CHEERING_FPS_STEP_UP_SIZE = 5;
    var CHEERING_FPS_MAX = 80;
    function startCheering() {
        if (!cheeringAnimation) {
            return;
        }

        maybeClearStopCheeringTimeout();

        if (!slowCheeringInterval) {
            slowCheeringInterval = Script.setInterval(slowCheering, SLOW_CHEERING_INTERVAL_MS);
        }

        var frameCount = cheeringAnimation.animation.frames.length;

        if (currentAnimationTimestamp > 0) {
            var animationTimestampDeltaMS = Date.now() - currentAnimationTimestamp;
            var frameDelta = animationTimestampDeltaMS / MS_PER_S * currentAnimationFPS;
    
            currentlyPlayingFrame = (currentlyPlayingFrame + frameDelta) % frameCount;
    
            currentAnimationFPS += CHEERING_FPS_STEP_UP_SIZE;

            currentAnimationFPS = Math.min(currentAnimationFPS, CHEERING_FPS_MAX);
        } else {
            currentlyPlayingFrame = 0;
        }

        MyAvatar.overrideAnimation(cheeringAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);
        updateFPSUI();
        isCheering = true;
        currentAnimationTimestamp = Date.now();
    }
    
    var debounceTimer = false;
    var DEBOUNCE_TIMEOUT_MS = 30;
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

            startCheering();
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
            
            if (!keyEventsWired) {
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

        if (debounceTimer) {
            Script.clearTimeout(debounceTimer);
            debounceTimer = false;
        }

        if (keyEventsWired) {            
            Controller.keyPressEvent.disconnect(keyPressEvent);
            Controller.keyReleaseEvent.disconnect(keyReleaseEvent);
            keyEventsWired = false;
        }
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
    }

    Script.scriptEnding.connect(onScriptEnding);
    startup();
})();

