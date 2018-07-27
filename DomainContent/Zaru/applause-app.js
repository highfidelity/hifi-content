(function () {

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
    var GROUP_CLAP_URL = Script.resolvePath("sounds/small-clap.wav");

    var LOCAL_CLAP_TIMEOUT = 250; //ms

    var localIntentCounter = 0;

    var canPlayLocalClap = true;
    var previousHandLocations = [];

    var individualClapSound;
    var groupClapSound;

    var open = false;

    function onClicked() {
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
        }
    }

    button.clicked.connect(onClicked);

    console.log("### test");

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
        console.log("###1 test");
        var names = [];
        for (var i = 1; i < count + 1; i++) {
            var name = side[0].toUpperCase() + side.substring(1) + "Hand" + finger[0].toUpperCase() + finger.substring(1) + (i);
            names.push(name);
        }
        return names;
    }

    function makeOpenPalm() {
        console.log("###2 test");
        ["right", "left"].forEach(function (side) {

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

    function clearJoints(){
        console.log("###3 test");
        ["right", "left"].forEach(function (side) {

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

    function returnPalm() {

    }

    function playIndividualClapSound() {
        localIntentCounter++;

        individualClapSound = SoundCache.getSound(INDIVIDUAL_CLAP_URLS[Math.round(Math.random() * INDIVIDUAL_CLAP_URLS.length - 1)]);
        groupClapSound = SoundCache.getSound(GROUP_CLAP_URL);

        if (localIntentCounter > 5) {
            if (groupClapSound.downloaded) {
                Audio.playSound(groupClapSound, {
                    volume: 0.8,
                    localOnly: false,
                    position: MyAvatar.position
                });
            }
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

    function checkHandsDistance() {
        console.log("###4 test");
        // makeOpenPalm();
        var handPositionR = MyAvatar.getJointPosition("RightHand");
        var handPositionL = MyAvatar.getJointPosition("LeftHand");

        var oldPositionR = previousHandLocations[0];
        var oldPositionL = previousHandLocations[1];

        print("Old positions: " + JSON.stringify(oldPositionL) + "," + JSON.stringify(oldPositionR));
        print("New positions: " + JSON.stringify(handPositionL) + "," + JSON.stringify(handPositionR));


        if ((Vec3.distance(handPositionL, handPositionR) <= 0.2 && Vec3.distance(oldPositionL, handPositionL) >= 0.01 &&
            Vec3.distance(oldPositionR, handPositionR) >= 0.01 &&
            canPlayLocalClap)) {
            // makeOpenPalm();
            canPlayLocalClap = true;
            playIndividualClapSound();
            Script.setTimeout(function () {
                canPlayLocalClap = true;
            }, LOCAL_CLAP_TIMEOUT);

            previousHandLocations = [];

            previousHandLocations.push(handPositionR);
            previousHandLocations.push(handPositionL);


        }
            // clearJoints();
        // }

    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        if (open) {
            print("You can clap now");
            console.log("###9 test");
            
            if (HMD.active) {
                console.log("###7 test");
                Script.update.connect(checkHandsDistance);
            }
            previousHandLocations.push(MyAvatar.getJointPosition("RightHand"));
            previousHandLocations.push(MyAvatar.getJointPosition("LeftHand"));

        } else {
            print("You cannot clap now");
            // Script.update.disconnect(checkHandsDistance);
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