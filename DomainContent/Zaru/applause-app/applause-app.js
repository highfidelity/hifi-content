//
//  Created by Liv Erickson on 6/4/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
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
    var ONGOING_APPLAUSE_URL = Script.resolvePath('sounds/small-clap.wav');
    var CHIME_SOUND = Script.resolvePath('sounds/bell-chime-alert.wav');
    var HEART_MODEL_URL = Script.resolvePath('heart.fbx');

    var SERVER_ENTITY_NAME = 'Applause Generator';

    var APPLAUSE_BUTTON_IMAGE = Script.resolvePath('./resources/button.png');
    var APPLAUSE_BUTTON_PRESSED = Script.resolvePath('./resources/button-pressed.png');
    var WINDOW_Y_OFFSET = 24;
    var BUTTON_DIMENSIONS = {x: 221, y: 69};

    var INCREASE_SCALE_FACTOR = 0.025;
    var INCREASE_SCALE_VECTOR = {x: 0.00884, y: 0.00764, z: 0.004};
    var HAND_PROXIMITY_DISTANCE = 0.25;

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('applause.html');
    var button = tablet.addButton({
        text: 'Clap'
    });
    var open = false;

    var shouldUseChimeSound = false;
    var continuousApplauseIntensity = 0;
    var continuousApplauseSound;
    var intensityScaleFunction;
    var currentHeart;
    var applauseOverlay;
    var previousHandLocations = [];
    var previousHandOrientations = [];
    var individualClapSound; 
    var isHoldingTrigger = false;
    var handsStretched = false;
    var needsCleanup = false;
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
            position.y += 3 * DISTANCE;
            return position;
        } else {
            return midpoint(MyAvatar.getJointPosition("RightHand"),
                MyAvatar.getJointPosition("LeftHand"));
        }

    }

    function getRotation() {
        if (!HMD.active) {
            return Quat.fromVec3Degrees({x: 0, y: MyAvatar.bodyYaw - 180, z: 0});
        } else {
            var jointIndex = MyAvatar.getJointIndex("RightForeArm");
            var jointRotation = MyAvatar.getAbsoluteJointRotationInObjectFrame(jointIndex);
            var adjustedRotation = Quat.multiply(jointRotation, Quat.angleAxis(180, Vec3.Z_AXIS));

            return MyAvatar.jointToWorldRotation(jointRotation, jointIndex);
        }
    }

    // Avatar Helper Functions

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

    function checkHandsDistance() {

        var handPositionR = MyAvatar.getJointPosition('RightHand');
        var handPositionL = MyAvatar.getJointPosition('LeftHand');

        var handRotationR = MyAvatar.getRightPalmRotation();
        var handRotationL = MyAvatar.getLeftPalmRotation();

        var oldRotationR = previousHandOrientations[0];
        var oldRotationL = previousHandOrientations[1];

        if (Vec3.distance(handPositionL, handPositionR) <= HAND_PROXIMITY_DISTANCE) {
            if (!handsStretched) {
                makeOpenPalm();
                handsStretched = true;
                Script.update.connect(update);
            }

        } else {
            if (handsStretched) {
                clearJoints();
                handsStretched = false;
                Script.update.disconnect(update);
            }
        }

        if ((Vec3.distance(handPositionL, handPositionR) <= HAND_PROXIMITY_DISTANCE) 
            && (compareRotations(oldRotationR, handRotationR) 
            || compareRotations(oldRotationL, handRotationL)) && applauseEnabled) {
            playIndividualClapSound();
            previousHandOrientations = [];
            previousHandOrientations.push(handRotationR);
            previousHandOrientations.push(handRotationL);

        }

    }
    var checkDistanceActive = false;

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
            print (event);
            event = JSON.parse(event);
        }
    
        if (event.type === 'applause-app-ready' && HMD.active){
            tablet.emitScriptEvent(JSON.stringify({ type : 'applause-hmd' }));
        }

        if (event.type === 'clap') {
            if (applauseEnabled) {
                playIndividualClapSound();
            }
        }
        if (event.type === 'applause-enabled') {
            applauseEnabled = event.value;
            if (!HMD.active && applauseEnabled) {
                needsCleanup = true;
                Controller.mousePressEvent.connect(mousePressEvent);
                addDesktopOverlay();
            }

            if (HMD.active && applauseEnabled) {
                Script.update.connect(checkHandsDistance);
                checkDistanceActive = true;
                
                previousHandLocations.push(MyAvatar.getJointPosition('RightHand'));
                previousHandLocations.push(MyAvatar.getJointPosition('LeftHand'));
    
                previousHandOrientations.push(MyAvatar.getRightPalmRotation());
                previousHandOrientations.push(MyAvatar.getLeftPalmRotation());
            }

            if (!applauseEnabled) {
                if (checkDistanceActive === true) {
                    Script.update.disconnect(checkHandsDistance);
                    checkDistanceActive = false;
                }
                if (needsCleanup) {
                    Controller.mousePressEvent.disconnect(mousePressEvent);
                    removeDesktopOverlay();
                }
                if (handsStretched) {
                    clearJoints();
                    handsStretched = false;
                    Script.update.disconnect(update);
                }
            }
        }
    }

    var mousePressEvent = function (event) {
        if (!event.isLeftButton) {
            return;
        }
        var selectedResult = Overlays.getOverlayAtPoint({x: event.x, y: event.y});
        if (selectedResult === applauseOverlay) {
            Overlays.editOverlay(applauseOverlay, { imageURL : APPLAUSE_BUTTON_PRESSED});
            Script.setTimeout(function(){ 
                Overlays.editOverlay(applauseOverlay, { imageURL: APPLAUSE_BUTTON_IMAGE});
            }, 150);
            playIndividualClapSound();
        }
    };

    function onScreenChanged(type, url) {
        open = (url === appPage);
        if (!open) {
            if (checkDistanceActive === true) {
                Script.update.disconnect(checkHandsDistance);
                checkDistanceActive = false;
            }
            if (needsCleanup) {
                Controller.mousePressEvent.disconnect(mousePressEvent);
                removeDesktopOverlay();
            }
            if (handsStretched) {
                clearJoints();
                handsStretched = false;
                Script.update.disconnect(update);
            }
        }
    }

    function appEnding() {
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        Controller.mousePressEvent.disconnect(mousePressEvent);
        removeDesktopOverlay();
    }

    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    Script.scriptEnding.connect(appEnding);

    function playSoundAndTriggerHaptics() {
        if (applauseInjector !== undefined && applauseInjector.isPlaying()) {
            return;
        }

        individualClapSound = shouldUseChimeSound ? SoundCache.getSound(CHIME_SOUND) :
            SoundCache.getSound(INDIVIDUAL_CLAP_URLS[Math.round(Math.random() * INDIVIDUAL_CLAP_URLS.length - 1)]);

        if (individualClapSound.downloaded) {
            applauseInjector = Audio.playSound(
                individualClapSound,
                {
                    volume: 0.25,
                    localOnly: false,
                    position: MyAvatar.position,
                    pitch: 1 
                }
            );
        }

        if (HMD.active) {
            Controller.triggerHapticPulse(0.75, 25, 2);
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
            alpha:0.0,
            alphaSpread:0.25,
            alphaStart:1,
            alphaFinish:0,
            lifetime: 1
        };
        Entities.addEntity(properties);
    }

    function playIndividualClapSound() {
        playSoundAndTriggerHaptics();
        playParticleEffect();
     
    }

    function startContinuousApplause() {
        var maxIntensity = 1;
        var continuousApplause = SoundCache.getSound(ONGOING_APPLAUSE_URL);
        if (continuousApplause.downloaded) {
            continuousApplauseSound = Audio.playSound(continuousApplause, {
                position: MyAvatar.position,
                looping: true
            });
        }
        currentHeart = null; 
        currentHeart = Entities.addEntity(
            {
                type: 'Model',
                modelURL: HEART_MODEL_URL,
                name: 'Heart',
                position: createPosition(),
                collidesWith: 'static,dynamic,kinematic,',
                collisionMask: 3,
                shapeType: 'Box'

            }
        );
        intensityScaleFunction = Script.setInterval(function(){
            continuousApplauseIntensity += INCREASE_SCALE_FACTOR;
            var previousDimensions = Entities.getEntityProperties(currentHeart, 'dimensions').dimensions;
            Entities.editEntity(currentHeart, { 
                dimensions : {x: previousDimensions.x + INCREASE_SCALE_VECTOR.x, 
                    y: previousDimensions.y + INCREASE_SCALE_VECTOR.y, 
                    z: previousDimensions.z + INCREASE_SCALE_VECTOR.z } });
            if (continuousApplauseIntensity >= maxIntensity) {
                stopContinuousApplause();
            }
        }, 125);
    }

    function stopContinuousApplause() {
        Script.setTimeout(function() {
            continuousApplauseSound.stop();
        }, 500);
        Script.clearInterval(intensityScaleFunction);
        Entities.editEntity(currentHeart, {
            dynamic: true, 
            velocity: {x: 0, y: Math.round(Math.random() * 3), z: 0}, 
            angularVelocity: {x: 0, y: -1 * (Math.round(Math.random() * 10)), z: 0}, 
            angularDamping : {x: 0, y: 0, z: 0},
            lifetime: 45
        });
        currentHeart = null;
        continuousApplauseIntensity = 0;
    }

    function update() {
        var TRIGGER_CONTROLS = [Controller.Standard.LS, Controller.Standard.RS];
        var TRIGGER_THRESHOLD = 0.85;
        var triggerValueL = Controller.getValue(TRIGGER_CONTROLS[0]);
        var triggerValueR = Controller.getValue(TRIGGER_CONTROLS[1]);

        if (triggerValueL >= TRIGGER_THRESHOLD && triggerValueR >= TRIGGER_THRESHOLD) {
            if (!isHoldingTrigger) {
                isHoldingTrigger = true;
                startContinuousApplause();
            }
        } else {
            if (isHoldingTrigger) {
                isHoldingTrigger = false;
                stopContinuousApplause();
            }
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