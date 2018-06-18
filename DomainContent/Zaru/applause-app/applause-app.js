//  applause-app.js
// 
//  Created by Liv Erickson on 6/4/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  App Icon made by Freepick from www.flaticon.com 
//
(function() {

    var INDIVIDUAL_CLAP_URLS = [
        Script.resolvePath("sounds/Claps/clap-3.wav"),
        Script.resolvePath("sounds/Claps/clap-4.wav"),
        Script.resolvePath("sounds/Claps/clap-5.wav"),
        Script.resolvePath("sounds/Claps/clap-6.wav"),
        Script.resolvePath("sounds/Claps/clap-7.wav"),
        Script.resolvePath("sounds/Claps/clap-8.wav"),
        Script.resolvePath("sounds/Claps/clap-9.wav"),
        Script.resolvePath("sounds/Claps/clap-10.wav")
    ];

    var CAN_APPLAUD_SETTING = 'io.highfidelity.applauseEnabled';
    var SHOULD_DISPLAY_PARTICLES_APPLAUSE = 'io.highfidelity.applauseEnabled.useParticles';
    var HAS_APPLAUSE_APP_SETTING = 'io.highfidelity.applauseEnabled.appPresent';

    var APPLAUSE_BUTTON_IMAGE = Script.resolvePath('./resources/button.png');
    var APPLAUSE_BUTTON_PRESSED = Script.resolvePath('./resources/button-pressed.png');
    var WINDOW_Y_OFFSET = 24;
    var BUTTON_DIMENSIONS = {x: 221, y: 69};
    var BUTTON_PRESS_TIMEOUT = 150; //ms
    var HAND_PROXIMITY_SCALE = 6;
    var handProximityDistance = MyAvatar.getEyeHeight() / HAND_PROXIMITY_SCALE;
    var APP_ICON = Script.resolvePath('./resources/hand-icon-by-freepik.png');
    var APPLAUSE_KEY = 't';
    var APPLAUSE_VOLUME = 0.25;
    var HAPTICS = {
        strength: 0.75,
        duration: 25,
        hands: 2
    };

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('applause.html');
    var button = tablet.addButton({
        text: 'Clap',
        icon: APP_ICON
    });
    var open = false;

    var shouldUseParticles = true;
    var applauseOverlay = "";
    var previousHandLocations = [];
    var previousHandOrientations = [];
    var individualClapSound; 
    var handsStretched = false;
    var applauseInjector;

    var applauseEnabled = false;
    
    var dataOpen = {
        left: {
            pinky: [{ x: -0.0066, y: -0.0224, z: -0.2174, w: 0.9758 }, { x: 0.0112, y: 0.0001, z: 0.0093, w: 0.9999 }, { x: -0.0346, y: 0.0003, z: -0.0073, w: 0.9994 }],
            ring: [{ x: -0.0029, y: -0.0094, z: -0.1413, w: 0.9899 }, { x: 0.0112, y: 0.0001, z: 0.0059, w: 0.9999 }, { x: -0.0346, y: 0.0002, z: -0.006, w: 0.9994 }],
            middle: [{ x: -0.0016, y: 0, z: -0.0286, w: 0.9996 }, { x: 0.0112, y: -0.0001, z: -0.0063, w: 0.9999 }, { x: -0.0346, y: -0.0003, z: 0.0073, w: 0.9994 }],
            index: [{ x: -0.0016, y: 0.0001, z: 0.0199, w: 0.9998 }, { x: 0.0112, y: 0, z: 0.0081, w: 0.9999 }, { x: -0.0346, y: 0.0008, z: -0.023, w: 0.9991 }],
            thumb: [{ x: 0.0354, y: 0.0363, z: 0.3275, w: 0.9435 }, { x: -0.0945, y: 0.0938, z: 0.0995, w: 0.9861 }, { x: -0.0952, y: 0.0718, z: 0.1382, w: 0.9832 }]
        },
        right: {
            pinky: [{ x: -0.0034, y: 0.023, z: 0.1051, w: 0.9942 }, { x: 0.0106, y: -0.0001, z: -0.0091, w: 0.9999 }, { x: -0.0346, y: -0.0003, z: 0.0075, w: 0.9994 }],
            ring: [{ x: -0.0013, y: 0.0097, z: 0.0311, w: 0.9995 }, { x: 0.0106, y: -0.0001, z: -0.0056, w: 0.9999 }, { x: -0.0346, y: -0.0002, z: 0.0061, w: 0.9994 }],
            middle: [{ x: -0.001, y: 0, z: 0.0285, w: 0.9996 }, { x: 0.0106, y: 0.0001, z: 0.0062, w: 0.9999 }, { x: -0.0346, y: 0.0003, z: -0.0074, w: 0.9994 }],
            index: [{ x: -0.001, y: 0, z: -0.0199, w: 0.9998 }, { x: 0.0106, y: -0.0001, z: -0.0079, w: 0.9999 }, { x: -0.0346, y: -0.0008, z: 0.0229, w: 0.9991 }],
            thumb: [{ x: 0.0355, y: -0.0363, z: -0.3263, w: 0.9439 }, { x: -0.0946, y: -0.0938, z: -0.0996, w: 0.9861 }, { x: -0.0952, y: -0.0719, z: -0.1376, w: 0.9833 }]
        }
    };

    var fingerKeys = ['pinky', 'ring', 'middle', 'index', 'thumb'];

    // Position Helper Functions 

    function midpoint( a, b ) {
        return {x: (a.x + b.x) / 2, 
            y: (a.y + b.y) / 2,
            z: (a.z + b.z) / 2};
    }

    function createPosition() {
        if (!HMD.active) {
            var DISTANCE = 0.25;
            var direction = Quat.getFront(MyAvatar.orientation);
            var distance = DISTANCE;
            var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
            position.y += 3 * DISTANCE * MyAvatar.scale;
            return position;
        } else {
            return midpoint(MyAvatar.getJointPosition("RightHand"),
                MyAvatar.getJointPosition("LeftHand"));
        }

    }

    function getRotation() {
        return Quat.fromVec3Degrees({x: 0, y: MyAvatar.bodyYaw - 180, z: 0});
    }

    // Avatar Helper Functions

    function adjustApplauseScale() {
        handProximityDistance = MyAvatar.getEyeHeight() / HAND_PROXIMITY_SCALE;
    }

    MyAvatar.scaleChanged.connect(adjustApplauseScale);

    function getJointNames(side, finger, count) {
        var names = [];
        for (var i = 1; i < count + 1; i++) {
            var name = side[0].toUpperCase() + side.substring(1) + 'Hand' + finger[0].toUpperCase() + finger.substring(1) + (i);
            names.push(name);
        }
        return names;
    }

    function makeOpenPalm() {
        ['right', 'left'].forEach(function(side) {

            for (var i = 0; i < fingerKeys.length; i++) {
                var finger = fingerKeys[i];
                var jointSuffixes = 3; // We need to update rotation of the 0, 1 and 2 joints
                var names = getJointNames(side, finger, jointSuffixes);

                // update every finger joint

                for (var j = 0; j < names.length; j++) {
                    var index = MyAvatar.getJointIndex(names[j]);
                    // if no finger is touching restate the default poses
                    var quatRot = dataOpen[side][finger][j];
                    MyAvatar.setJointRotation(index, quatRot);
                }
            }
        });
    }

    function clearJoints() {
        ['right', 'left'].forEach(function(side) {

            for (var i = 0; i < fingerKeys.length; i++) {
                var finger = fingerKeys[i];
                var jointSuffixes = 3; // We need to update rotation of the 0, 1 and 2 joints
                var names = getJointNames(side, finger, jointSuffixes);

                // update every finger joint

                for (var j = 0; j < names.length; j++) {
                    var index = MyAvatar.getJointIndex(names[j]);
                    // if no finger is touching restate the default poses
                    MyAvatar.clearJointData(index);
                }
            }
        });
    }

    function compareRotations(q1, q2) {
        var threshold = 0.85;
        return (Quat.dot(q1, q2) <= threshold);
    }

    function getRandomApplauseSound() {
        return INDIVIDUAL_CLAP_URLS[Math.round(Math.random() * INDIVIDUAL_CLAP_URLS.length - 1)];
    }

    function checkHandsDistance() {

        var handPositionR = MyAvatar.getJointPosition('RightHand');
        var handPositionL = MyAvatar.getJointPosition('LeftHand');
        var handRotationR = MyAvatar.getRightPalmRotation();
        var handRotationL = MyAvatar.getLeftPalmRotation();
        var oldRotationR = previousHandOrientations[0];
        var oldRotationL = previousHandOrientations[1];

        if (Vec3.distance(handPositionL, handPositionR) <= handProximityDistance) {
            if (!handsStretched) {
                makeOpenPalm();
                handsStretched = true;
            }
        } else {
            if (handsStretched) {
                clearJoints();
                handsStretched = false;
            }
        }
        if ((Vec3.distance(handPositionL, handPositionR) <= handProximityDistance) 
            && (compareRotations(oldRotationR, handRotationR) 
            || compareRotations(oldRotationL, handRotationL)) && applauseEnabled) {
            playSingleClap();
            previousHandOrientations = [];
            previousHandOrientations.push(handRotationR);
            previousHandOrientations.push(handRotationL);
        }
    }
    // Tablet Handlers
    function onClicked() {
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
        }
    }
    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
        }
        switch (event.type) {
            case 'applause-app-ready':
                var webEvent = {
                    type: 'setup',
                    enabled : Settings.getValue(CAN_APPLAUD_SETTING),
                    particles: Settings.getValue(SHOULD_DISPLAY_PARTICLES_APPLAUSE, true),
                    HMD : HMD.active
                };
                tablet.emitScriptEvent(JSON.stringify(webEvent));
                break;
            
            case 'clap':
                if (applauseEnabled) {
                    playSingleClap();
                }
                break;

            case 'applause-enabled':
                applauseEnabled = event.value;
                Settings.setValue(CAN_APPLAUD_SETTING, applauseEnabled);
                if (applauseEnabled) {
                    setup();
                } else {
                    disableApplause();
                }
                break;

            case 'change-particles':
                shouldUseParticles = event.value;
                Settings.setValue(SHOULD_DISPLAY_PARTICLES_APPLAUSE, event.value);
                break;
            
            default: 
                break;
        }
    }

    var setup = function() {
        if (HMD.active) {
            removeDesktopOverlay();
            Script.update.connect(checkHandsDistance);
            previousHandLocations.push(MyAvatar.getJointPosition('RightHand'));
            previousHandLocations.push(MyAvatar.getJointPosition('LeftHand'));
            previousHandOrientations.push(MyAvatar.getRightPalmRotation());
            previousHandOrientations.push(MyAvatar.getLeftPalmRotation());
        } else {
            addDesktopOverlay();
            Controller.mousePressEvent.connect(mousePressEvent);
        }
    };

    var disableApplause = function() {
        if (HMD.active) {
            Script.update.disconnect(checkHandsDistance);
            clearJoints();
            handsStretched = false;
        } else {
            Controller.mousePressEvent.disconnect(mousePressEvent);
            removeDesktopOverlay();
        }
    };

    var toggleOnHMDSwap = function() {
        if (Settings.getValue(CAN_APPLAUD_SETTING)) {
            setup();
        } 
    };

    var mousePressEvent = function(event) {
        if (!event.isLeftButton) {
            return;
        }
        var selectedResult = Overlays.getOverlayAtPoint({x: event.x, y: event.y});
        if (selectedResult === applauseOverlay) {
            Overlays.editOverlay(applauseOverlay, { imageURL : APPLAUSE_BUTTON_PRESSED});
            Script.setTimeout(function(){ 
                Overlays.editOverlay(applauseOverlay, { imageURL: APPLAUSE_BUTTON_IMAGE});
            }, BUTTON_PRESS_TIMEOUT);
            playSingleClap();
        }
    };

    function keyPressEvent(event) {
        if (event.text === APPLAUSE_KEY && applauseEnabled) {
            playSingleClap();
        }
    }

    function appEnding() {
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        Controller.mousePressEvent.disconnect(mousePressEvent);
        Controller.keyPressEvent.disconnect(keyPressEvent);
        removeDesktopOverlay();
        Settings.setValue(CAN_APPLAUD_SETTING, false);
        Settings.setValue(HAS_APPLAUSE_APP_SETTING, false);
        HMD.displayModeChanged.disconnect(toggleOnHMDSwap);
        MyAvatar.disconnect(adjustApplauseScale);
    }

    button.clicked.connect(onClicked);
    Settings.setValue(HAS_APPLAUSE_APP_SETTING, true);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);
    HMD.displayModeChanged.connect(toggleOnHMDSwap);
    Controller.keyPressEvent.connect(keyPressEvent);
    prefetchAudio();

    function prefetchAudio() {
        for (var i = 0; i < INDIVIDUAL_CLAP_URLS.length; i++) {
            SoundCache.prefetch(INDIVIDUAL_CLAP_URLS[i]);
        }
    }

    function playSoundAndTriggerHaptics() {
        if (applauseInjector !== undefined && applauseInjector.isPlaying()) {
            return;
        }
        individualClapSound = SoundCache.getSound(getRandomApplauseSound());
        if (individualClapSound.downloaded) {
            applauseInjector = Audio.playSound(
                individualClapSound,
                {
                    volume: APPLAUSE_VOLUME,
                    localOnly: false,
                    position: MyAvatar.position
                }
            );
        }
        if (HMD.active) {
            Controller.triggerHapticPulse(HAPTICS.strength, HAPTICS.duration, HAPTICS.hands);
        } 
    }

    // Applause Functions
    function playParticleEffect() {
        var properties = { 
            type: 'ParticleEffect',
            position: createPosition(),
            rotation : getRotation(),
            isEmitting:true,
            lifespan:10,
            maxParticles:1,
            textures:'http://hifi-content.s3.amazonaws.com/alan/dev/Particles/heart-2.png',
            emitRate:1,
            emitSpeed:3,
            emitOrientation: Quat.fromVec3Degrees({x: 0, y: 0, z: 0}),
            particleRadius:0.25,
            radiusSpread:0.25,
            radiusStart:0.01,
            radiusFinish:0.15,
            color:{red:255,blue:85,green:0},
            colorSpread:{red:0,blue:0,green:0},
            colorStart:{red:245,blue:245,green:0},
            colorFinish:{red:255,blue:0,green:85},
            emitAcceleration: {x: 0, y: 0, z: 0},
            accelerationSpread: {x:0.01, y: 0.01, z: 0.01},
            alpha:1.0,
            alphaSpread:0.25,
            alphaStart:1,
            alphaFinish:0,
            lifetime: 1,
            polarStart: 0,
            polarFinish: 0.0523599
        };
        Entities.addEntity(properties, true);
    }

    function playSingleClap() {
        playSoundAndTriggerHaptics();
        if (shouldUseParticles) {
            playParticleEffect();
        }
    }
   
    function removeDesktopOverlay(){
        Overlays.deleteOverlay(applauseOverlay);
    }

    function addDesktopOverlay() {
        removeDesktopOverlay();
        var windowHeight = Controller.getViewportDimensions().y;
        applauseOverlay = Overlays.addOverlay('image', {
            imageURL: APPLAUSE_BUTTON_IMAGE,
            x: 0,
            y: windowHeight - BUTTON_DIMENSIONS.y - WINDOW_Y_OFFSET,
            width: BUTTON_DIMENSIONS.x,
            height: BUTTON_DIMENSIONS.y,
            alpha: 1.0,
            visible: true
        });
    }
}());