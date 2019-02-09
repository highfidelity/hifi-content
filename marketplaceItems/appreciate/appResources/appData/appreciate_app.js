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
    var HALF = 0.5;

    function halfwayBetweenHands() {
        var leftHandPosition = MyAvatar.getJointPosition("LeftHandMiddle2");
        if (!leftHandPosition) {
            leftHandPosition = MyAvatar.getJointPosition("LeftHand");
        }
        var rightHandPosition = MyAvatar.getJointPosition("RightHandMiddle2");
        if (!rightHandPosition) {
            rightHandPosition = MyAvatar.getJointPosition("RightHand");
        }

        var centerPosition = Vec3.sum(leftHandPosition, rightHandPosition);
        centerPosition = Vec3.multiply(centerPosition, HALF);

        return centerPosition;
    }

    function linearScale(factor, minInput, maxInput, minOutput, maxOutput) {
        return minOutput + (maxOutput - minOutput) *
        (factor - minInput) / (maxInput - minInput);
    }

    function linearScaleColor(intensity, min, max) {
        var output = {
            "red": 0,
            "green": 0,
            "blue": 0
        };

        output.red = linearScale(intensity, 0, 1, min.red, max.red);
        output.green = linearScale(intensity, 0, 1, min.green, max.green);
        output.blue = linearScale(intensity, 0, 1, min.blue, max.blue);

        return output;
    }

    function updateCurrentIntensityUI() {
        ui.sendMessage({method: "updateCurrentIntensityUI", currentIntensity: currentIntensity});
    }
    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    var updateIntensityEntityInterval = false;
    var UPDATE_INTENSITY_ENTITY_INTERVAL_MS = 65;
    function maybeClearUpdateIntensityEntityInterval() {
        if (updateIntensityEntityInterval) {
            Script.clearInterval(updateIntensityEntityInterval);
            updateIntensityEntityInterval = false;
        }
    }

    var intensityEntity = false;
    var intensityMaterialEntity = false;
    var INTENSITY_ENTITY_MAX_DIMENSIONS = {
        "x": 0.24,
        "y": 0.24,
        "z": 0.24
    };
    var INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY = {
        "x": -0.21,
        "y": -0.21,
        "z": -0.21
    };
    var INTENSITY_ENTITY_MAX_ANGULAR_VELOCITY = {
        "x": 0.21,
        "y": 0.21,
        "z": 0.21
    };
    var intensityEntityColorMin = {
        "red": 82,
        "green": 196,
        "blue": 145
    };
    var INTENSITY_ENTITY_COLOR_MAX_DEFAULT = {
        "red": 5,
        "green": 255,
        "blue": 5
    };
    var intensityEntityColorMax = JSON.parse(Settings.getValue("appreciate/entityColor",
        JSON.stringify(INTENSITY_ENTITY_COLOR_MAX_DEFAULT)));
    var ANGVEL_ENTITY_MULTIPLY_FACTOR = 62;
    var INTENSITY_ENTITY_PROPERTIES = {
        "type": "Shape",
        "shape": "Dodecahedron",
        "dimensions": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "angularVelocity": {
            "x": 0,
            "y": 0,
            "z": 0
        },
        "angularDamping": 0,
        "grab": {
            "grabbable": false,
            "equippableLeftRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            },
            "equippableRightRotation": {
                "x": -0.0000152587890625,
                "y": -0.0000152587890625,
                "z": -0.0000152587890625,
                "w": 1
            }
        },
        "collisionless": true,
        "ignoreForCollisions": true,
        "queryAACube": {
            "x": -0.17320507764816284,
            "y": -0.17320507764816284,
            "z": -0.17320507764816284,
            "scale": 0.3464101552963257
        },
        "damping": 0,
        "color": intensityEntityColorMin,
        "clientOnly": false,
        "avatarEntity": true,
        "localEntity": false,
        "faceCamera": false,
        "isFacingAvatar": false
    };
    var INTENSITY_MATERIAL_ENTITY_PROPS = {
        "name": "Intensity Entity Material",
        "type": "Material",
        "materialURL": "materialData"
    };
    var currentInitialAngularVelocity = {
        "x": 0,
        "y": 0,
        "z": 0
    };
    function updateIntensityEntity() {
        if (currentIntensity > 0) {
            if (intensityEntity) {
                intensityEntityColorMin.red = intensityEntityColorMax.red * 0.4;
                intensityEntityColorMin.green = intensityEntityColorMax.green * 0.4;
                intensityEntityColorMin.blue = intensityEntityColorMax.blue * 0.4;

                var color = linearScaleColor(currentIntensity, intensityEntityColorMin, intensityEntityColorMax);

                if (intensityMaterialEntity) {
                    Entities.editEntity(intensityMaterialEntity, {
                        materialData: JSON.stringify({"materialVersion": 1,
                            "materials": [
                                {
                                    "roughness": 0.0,
                                    "metallic": 0.4,
                                    "albedo": [color.red/255, color.green/255, color.blue/255],
                                }
                            ]
                        })
                    });
                }

                Entities.editEntity(intensityEntity, {
                    position: halfwayBetweenHands(),
                    dimensions: Vec3.multiply(INTENSITY_ENTITY_MAX_DIMENSIONS, currentIntensity),
                    angularVelocity: Vec3.multiply(currentInitialAngularVelocity,
                        currentIntensity * ANGVEL_ENTITY_MULTIPLY_FACTOR),
                    color: color
                });
            } else {
                var props = INTENSITY_ENTITY_PROPERTIES;
                props.position = halfwayBetweenHands();

                currentInitialAngularVelocity.x = Math.random() *
                    (INTENSITY_ENTITY_MAX_ANGULAR_VELOCITY.x -
                    INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY.x) + INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY.x;
                currentInitialAngularVelocity.y = Math.random() *
                    (INTENSITY_ENTITY_MAX_ANGULAR_VELOCITY.y -
                    INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY.y) + INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY.y;
                currentInitialAngularVelocity.z = Math.random() *
                    (INTENSITY_ENTITY_MAX_ANGULAR_VELOCITY.z -
                    INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY.z) + INTENSITY_ENTITY_MIN_ANGULAR_VELOCITY.z;
                props.angularVelocity = currentInitialAngularVelocity;

                intensityEntity = Entities.addEntity(props, "avatar");
                
                var materialProps = INTENSITY_MATERIAL_ENTITY_PROPS;
                materialProps.parentID = intensityEntity;
                intensityMaterialEntity = Entities.addEntity(materialProps, "avatar");
            }
        } else {
            if (intensityEntity) {
                Entities.deleteEntity(intensityEntity);
                intensityEntity = false;
            }
            if (intensityMaterialEntity) {
                Entities.deleteEntity(intensityMaterialEntity);
                intensityMaterialEntity = false;
            }
            
            maybeClearUpdateIntensityEntityInterval();
        }
    }

    // Function that AppUI calls when the App's UI opens
    function onOpened() {
        updateCurrentIntensityUI();
    }

    var NUM_CLAP_SOUNDS = 20;
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
                    soundInjector = false;
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

        var vol = linearScale(currentIntensity, minInputVolume,
            maxInputVolume, minOutputVolume, maxOutputVolume);
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

        currentIntensity = Math.max(0.0, Math.min(
            neverWhistleEnabled ? MAX_CLAP_INTENSITY : MAX_WHISTLE_INTENSITY, currentIntensity));

        updateCurrentIntensityUI();

        if (!soundInjector || soundInjector.isPlaying()) {
            return;
        }

        var injectorOptions = {
            position: halfwayBetweenHands(),
            volume: calculateInjectorVolume()
        };

        soundInjector.setOptions(injectorOptions);
    }

    var soundInjector = false;
    var MINIMUM_PITCH = 0.85;
    var MAXIMUM_PITCH = 1.15;
    function playSound(sound) {
        if (soundInjector && soundInjector.isPlaying() && currentSound === "whistle") {
            return;
        }

        if (soundInjector) {
            soundInjector.stop();
            soundInjector = false;
        }

        soundInjector = Audio.playSound(sound, {
            position: halfwayBetweenHands(),
            volume: calculateInjectorVolume(),
            pitch: Math.random() * (MAXIMUM_PITCH - MINIMUM_PITCH) + MINIMUM_PITCH
        });
    }

    function shouldClap() {
        return (currentIntensity > 0.0 && neverWhistleEnabled) ||
            (currentIntensity > 0.0 && currentIntensity <= MAX_CLAP_INTENSITY);
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

        if (!updateIntensityEntityInterval) {
            updateIntensityEntityInterval = Script.setInterval(updateIntensityEntity, UPDATE_INTENSITY_ENTITY_INTERVAL_MS);
        }
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
            soundInjector = false;
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

        if (currentAnimation === clappingAnimation) {
            currentAnimationFPS += CLAP_ANIMATION_FPS_BOOST;
        }

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
    var CLAP_ANIMATION_FPS_BOOST = 15;
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

            if (currentAnimation === clappingAnimation) {
                currentAnimationFPS += CLAP_ANIMATION_FPS_BOOST;
            }
        } else {
            currentlyPlayingFrame = 0;
        }

        MyAvatar.overrideAnimation(currentAnimation.url, currentAnimationFPS, true, currentlyPlayingFrame, frameCount);
        currentAnimationTimestamp = Date.now();
        
        if (!updateIntensityEntityInterval) {
            updateIntensityEntityInterval = Script.setInterval(updateIntensityEntity, UPDATE_INTENSITY_ENTITY_INTERVAL_MS);
        }
    }
    
    var desktopDebounceTimer = false;
    var DESKTOP_DEBOUNCE_TIMEOUT_MS = 160;
    function keyPressEvent(event) {
        if ((event.text.toUpperCase() === "Z") &&
            !event.isShifted &&
            !event.isMeta &&
            !event.isControl &&
            !event.isAlt &&
            !HMD.active) {

            if (event.isAutoRepeat) {
                if (!desktopDebounceTimer) {
                    keyPressed();

                    desktopDebounceTimer = Script.setTimeout(function() {
                        desktopDebounceTimer = false;
                    }, DESKTOP_DEBOUNCE_TIMEOUT_MS);
                }
            } else {
                keyPressed();
            }
        }
    }
    
    // Clear the "cheering" animation if it's running
    var stopCheeringTimeout = false;
    var STOP_CHEERING_TIMEOUT_MS = 1000;
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
    var neverWhistleEnabled = Settings.getValue("appreciate/neverWhistle", false);
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
                ui.sendMessage({
                    method: "updateUI",
                    appreciateEnabled: appreciateEnabled,
                    neverWhistleEnabled: neverWhistleEnabled,
                    isFirstRun: Settings.getValue("appreciate/firstRun", true),
                    entityColor: intensityEntityColorMax
                });
                break;

            case "appreciateSwitchClicked":
                Settings.setValue("appreciate/firstRun", false);
                appreciateEnabled = message.appreciateEnabled;
                Settings.setValue("appreciate/enabled", appreciateEnabled);
                enableOrDisableAppreciate();
                break;

            case "neverWhistleCheckboxClicked":
                neverWhistleEnabled = message.neverWhistle;
                Settings.setValue("appreciate/neverWhistle", neverWhistleEnabled);
                break;

            case "setEntityColor":
                intensityEntityColorMax = message.entityColor;
                Settings.setValue("appreciate/entityColor", JSON.stringify(intensityEntityColorMax));
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
        maybeClearUpdateIntensityEntityInterval();

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

        if (intensityMaterialEntity) {
            Entities.deleteEntity(intensityMaterialEntity);
            intensityMaterialEntity = false;
        }
        if (intensityEntity) {
            Entities.deleteEntity(intensityEntity);
            intensityEntity = false;
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
            // clap by Rena from the Noun Project
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

