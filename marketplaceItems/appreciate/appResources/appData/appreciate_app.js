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

    var soundFadeInterval = false;
    var FADE_INTERVAL_MS = 50;
    var FADE_STEP_SIZE = 0.1; // unitless
    function fadeOutAndStopSound() {

        maybeClearSoundFadeInterval();

        soundFadeInterval = Script.setInterval(function() {
            fadeSoundVolume(0, FADE_STEP_SIZE);

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
    var VOLUME_MAX_STEP_SIZE = 0.035; // unitless, determined empirically
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
    var MAX_VELOCITY_CM_PER_SEC = 150;
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
    var MS_PER_S = 1000;
    var CM_PER_M = 100;
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

    var raiseHandsAnimationData = {};
    function updateAnimationData() {
        function getRandomArbitrary(min, max) {
            return Math.random() * (max - min) + min;
        }

        // Right hand animation data
        var randomX = getRandomArbitrary(-1.2, -0.4);
        var randomZ = getRandomArbitrary(-0.1, 0.35);
        raiseHandsAnimationData.rightHandPosition = {x: randomX, y: 1.8, z: randomZ};
        raiseHandsAnimationData.rightHandRotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
        raiseHandsAnimationData.rightHandType = 0; // RotationAndPosition, see IKTargets.h
        raiseHandsAnimationData.isRightHandGrasp = false;
        raiseHandsAnimationData.isRightIndexPoint = false;
        raiseHandsAnimationData.isRightThumbRaise = false;
        raiseHandsAnimationData.isRightIndexPointAndThumbRaise = false;

        // Left hand animation data
        randomX = getRandomArbitrary(0.4, 1.2);
        randomZ = getRandomArbitrary(-0.1, 0.35);
        raiseHandsAnimationData.leftHandPosition = {x: randomX, y: 1.8, z: randomZ};
        raiseHandsAnimationData.leftHandRotation = Quat.fromPitchYawRollDegrees(0, 0, 0);
        raiseHandsAnimationData.leftHandType = 0; // RotationAndPosition, see IKTargets.h
        raiseHandsAnimationData.isLeftHandGrasp = false;
        raiseHandsAnimationData.isLeftIndexPoint = false;
        raiseHandsAnimationData.isLeftThumbRaise = false;
        raiseHandsAnimationData.isLeftIndexPointAndThumbRaise = false;
    }

    function getRaiseHandsAnimation() {
        return raiseHandsAnimationData;
    }
    
    // Clears the raise hands animation handler (which lowers the hands)
    function maybeLowerHands() {
        if (raiseHandsAnimationHandler) {
            raiseHandsAnimationHandler = MyAvatar.removeAnimationStateHandler(raiseHandsAnimationHandler);
        }
    }

    var raiseHandsAnimationHandler = false;
    var cooldownTimer = false;
    var COOLDOWN_TIMER_MS = HAND_VELOCITY_CHECK_INTERVAL_MS;
    var lowerHandsTimeout = false;
    var LOWER_HANDS_TIMEOUT_MS = 1000;
    function raiseHands() {
        if (cooldownTimer) {
            return;
        }

        updateAnimationData();

        maybeLowerHands();

        raiseHandsAnimationHandler = MyAvatar.addAnimationStateHandler(getRaiseHandsAnimation, []);

        if (lowerHandsTimeout) {
            Script.clearTimeout(lowerHandsTimeout);
            lowerHandsTimeout = false;
        }
        lowerHandsTimeout = Script.setTimeout(maybeLowerHands, LOWER_HANDS_TIMEOUT_MS);

        cooldownTimer = Script.setTimeout(function() {
            cooldownTimer = false;
        }, COOLDOWN_TIMER_MS);
    }
    
    function keyPressEvent(event) {
        if ((event.text.toUpperCase() === "Z") &&
            !event.isShifted &&
            !event.isMeta &&
            !event.isControl &&
            !event.isAlt) {
            raiseHands();
        }
    }

    // Enables or disables the app's main functionality
    var appreciateEnabled = Settings.getValue("appreciate/enabled", false);
    var keyEventsWired = false;
    function enableAppreciate() {
        if (appreciateEnabled) {
            maybeSetupHandPositionCheckInterval();
            
            if (!keyEventsWired) {
                Controller.keyPressEvent.connect(keyPressEvent);
                keyEventsWired = true;
            }
        } else {
            maybeClearHandPositionCheckInterval();
            maybeClearHandVelocityCheckIntervalAndStopSound();

            if (keyEventsWired) {         
                Controller.keyPressEvent.disconnect(keyPressEvent);
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
                enableAppreciate();
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

        maybeLowerHands();        
        if (lowerHandsTimeout) {
            Script.clearTimeout(lowerHandsTimeout);
            lowerHandsTimeout = false;
        }

        if (keyEventsWired) {            
            Controller.keyPressEvent.disconnect(keyPressEvent);
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
        
        enableAppreciate();
        getSounds();
    }

    Script.scriptEnding.connect(onScriptEnding);
    startup();
})();

