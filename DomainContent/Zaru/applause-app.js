(function(){

    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var appPage = Script.resolvePath("applause.html");
    var button = tablet.addButton({
        text: "Clap"
    });

    var INDIVIDUAL_CLAP_URLS = [Script.resolvePath("sounds/clap-single-4.wav"),
                                Script.resolvePath("sounds/clap-single-3.wav"),
                                Script.resolvePath("sounds/clap-single-5.wav"),
                                Script.resolvePath("sounds/clap-single-6.wav")];
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

    function playIndividualClapSound() {
        localIntentCounter++;

        individualClapSound = SoundCache.getSound(INDIVIDUAL_CLAP_URLS[Math.round(Math.random()*4)]);
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
        var handPositionR = MyAvatar.getJointPosition("RightHand");
        var handPositionL = MyAvatar.getJointPosition("LeftHand");

        var oldPositionR = previousHandLocations[0];
        var oldPositionL = previousHandLocations[1];

        print ("Old positions: " + JSON.stringify(oldPositionL) + "," + JSON.stringify(oldPositionR));
        print ("New positions: " + JSON.stringify(handPositionL) + "," + JSON.stringify(handPositionR));

        
        if ((Vec3.distance(handPositionL, handPositionR) <= 0.2 && Vec3.distance(oldPositionL, handPositionL) >= 0.01
                                                                && Vec3.distance(oldPositionR, handPositionR) >= 0.01 
        && canPlayLocalClap)) {
            canPlayLocalClap = true;
            playIndividualClapSound();
            Script.setTimeout(function(){ 
                canPlayLocalClap = true;
            }, LOCAL_CLAP_TIMEOUT);

            previousHandLocations = [];

            previousHandLocations.push(handPositionR);
            previousHandLocations.push(handPositionL);
        }

    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        if (open) {
            print("You can clap now");
            if (HMD.active) {
                Script.update.connect(checkHandsDistance);
            }
            previousHandLocations.push(MyAvatar.getJointPosition("RightHand"));
            previousHandLocations.push(MyAvatar.getJointPosition("LeftHand"));
            
        } else {
            print ("You cannot clap now");
            Script.update.disconnect(checkHandsDistance);
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