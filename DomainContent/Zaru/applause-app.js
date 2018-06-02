(function() {

    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var appPage = Script.resolvePath("applause.html");
    var button = tablet.addButton({
        text: "Clap"
    });

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

    var LOCAL_CLAP_TIMEOUT = 250; // ms

    var localIntentCounter = 0;

    var canPlayLocalClap = true;
    var previousHandLocations = [];

    var individualClapSound; 

    var applauseListenerEntity;

    var open = false;

    function onClicked() {
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
        }
    }

    button.clicked.connect(onClicked);

    function midpoint( a, b ) {
        return {x: (a.x + b.x) / 2, 
            y: (a.y + b.y) / 2,
            z: (a.z + b.z) / 2};
    }

    function playParticleEffect(){
        var properties = { 
            type: "ParticleEffect",
            position: midpoint(MyAvatar.getJointPosition("RightHand"), MyAvatar.getJointPosition("LeftHand")),
            isEmitting:true,
            lifespan:2,
            maxParticles:1,
            textures:"https://hifi-content.s3-us-west-1.amazonaws.com/liv/Production/Rust/heart.png",
            emitRate:1,
            emitSpeed:0,
            emitDimensions:{x:0,y:0,z:0},
            particleRadius:0.1,
            radiusSpread:0.25,
            radiusStart:0,
            radiusFinish:0,
            color:{red:153,blue:35,green:14},
            colorSpread:{red:0,blue:0,green:0},
            colorStart:{red:235,blue:173,green:2},
            colorFinish:{red:179,blue:30,green:0},
            emitAcceleration:{x:-0.5,y:2.5,z:-0.5},
            accelerationSpread:{x:0.5,y:1,z:0.5},
            alpha:0.5,
            alphaSpread:0.5,
            alphaStart:0.5,
            alphaFinish:0,
            lifetime: 1
        };
        Entities.addEntity(properties, true);
    }

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

    var fingerKeys = ["pinky", "ring", "middle", "index", "thumb"];

    function getJointNames(side, finger, count) {
        // console.log("###1 In get joint Names");
        var names = [];
        for (var i = 1; i < count + 1; i++) {
            var name = side[0].toUpperCase() + side.substring(1) + "Hand" + finger[0].toUpperCase() + finger.substring(1) + (i);
            names.push(name);
        }
        return names;
    }

    function makeOpenPalm() {
        // console.log("###2 in Make open Palm");
        ["right", "left"].forEach(function(side) {

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
        // console.log("###3 in Clear Joints");
        ["right", "left"].forEach(function(side) {

            for (var i = 0; i < fingerKeys.length; i++) {
                var finger = fingerKeys[i];
                var jointSuffixes = 3; // We need to update rotation of the 0, 1 and 2 joints
                var names = getJointNames(side, finger, jointSuffixes);

                // update every finger joint

                for (var j = 0; j < names.length; j++) {
                    var index = MyAvatar.getJointIndex(names[j]);
                    // if no finger is touching restate the default poses
                    var quatRot = dataOpen[side][finger][j];
                    MyAvatar.clearJointData(index);
                }
            }
        });
    }

    function playIndividualClapSound() {
        localIntentCounter++;
        applauseListenerEntity = Entities.findEntitiesByName("Applause-Listener", MyAvatar.position, 10, true)[0]; 
        individualClapSound = SoundCache.getSound(INDIVIDUAL_CLAP_URLS[Math.round(Math.random() * INDIVIDUAL_CLAP_URLS.length - 1)]);

        if (localIntentCounter > 5) {
            Entities.callEntityServerMethod(applauseListenerEntity, 'queueApplauseIntent', [MyAvatar.position]);
            localIntentCounter = 0;
        }
        if (individualClapSound.downloaded) {
            Audio.playSound(individualClapSound, {
                volume: Math.random(),
                localOnly: true,
                position: MyAvatar.position,
                pitch: 1.0 + Math.random()
            });
        }
        if (HMD.active) {
            Controller.triggerHapticPulse(0.75, 100, 2);
            playParticleEffect();
        }
    }

    function onWebEventReceived(event) {
        if (typeof event === "string") {
            event = JSON.parse(event);
        }
        if (event.type === "clap") {
            playIndividualClapSound();
        }
    }

    tablet.webEventReceived.connect(onWebEventReceived);

    var handsStretched = false;

    function stretchHands() {
        MyAvatar.setJointTranslation("RightForeArm", { x: 0, y: 0, z: -05 });
        MyAvatar.setJointTranslation("LeftForeArm", { x: 0, y: 0, z: -05 });

    }

    function unStretchHands() {
        MyAvatar.clearJointData("RightForeArm");
        MyAvatar.clearJointData("LeftForeArm");
    }

    function checkHandsDistance() {
        // console.log("###4 In check Hand Distance");

        var handPositionR = MyAvatar.getJointPosition("RightHand");
        var handPositionL = MyAvatar.getJointPosition("LeftHand");

        var oldPositionR = previousHandLocations[0];
        var oldPositionL = previousHandLocations[1];

        // print("Old positions: " + JSON.stringify(oldPositionL) + "," + JSON.stringify(oldPositionR));
        // print("New positions: " + JSON.stringify(handPositionL) + "," + JSON.stringify(handPositionR));

        // console.log("Vec3.distance(handPositionL, handPositionR)", Vec3.distance(handPositionL, handPositionR));
        if (Vec3.distance(handPositionL, handPositionR) <= 0.2) {

            if (!handsStretched) {
                console.log("###5 About to call make Open Palm");
                makeOpenPalm();
                // stretchHands();
                handsStretched = true;
            }
        } else {
            if (handsStretched) {
                console.log("###6 About to call Clear Joints");
                clearJoints();
                // unStretchHands();
                handsStretched = false;
            }
        }

        if ((Vec3.distance(handPositionL, handPositionR) <= 0.2 && Vec3.distance(oldPositionL, handPositionL) >= 0.01 &&
                Vec3.distance(oldPositionR, handPositionR) >= 0.01 &&
                canPlayLocalClap)) {
            // console.log("###7 About to Play Clap");
            canPlayLocalClap = false;
            playIndividualClapSound();
            Script.setTimeout(function() {
                canPlayLocalClap = true;
            }, LOCAL_CLAP_TIMEOUT);

            previousHandLocations = [];

            previousHandLocations.push(handPositionR);
            previousHandLocations.push(handPositionL);


        }

    }
    var checkDistanceActive = false;

    function onScreenChanged(type, url) {
        open = (url === appPage);
        if (open) {
            print("You can clap now");

            if (HMD.active) {
                Script.update.connect(checkHandsDistance);
                checkDistanceActive = true;
            }
            previousHandLocations.push(MyAvatar.getJointPosition("RightHand"));
            previousHandLocations.push(MyAvatar.getJointPosition("LeftHand"));

        } else {
            print("You cannot clap now");
            if (checkDistanceActive === true) {
                Script.update.disconnect(checkHandsDistance);
                checkDistanceActive = false;
            }
        }
    }

    tablet.screenChanged.connect(onScreenChanged);

    function appEnding() {
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }

    Script.scriptEnding.connect(appEnding);
}());