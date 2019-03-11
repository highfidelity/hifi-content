/*

*/

(function () {
    var DEBUG = true;

    // Returns boolean that all buttons are pressed
    var isPressed = {
        rightGrip: false,
        leftGrip: false,
        rightTrigger: false,
        leftTrigger: false
    };
    function areAllPressed() {
        return isPressed.rightGrip && isPressed.leftGrip && isPressed.rightTrigger && isPressed.leftTrigger;
    }


    // Sets up the scaling functionality if all buttons are pressed
    var SCALE_BUFFER = 1, // increase/decrease the sensitivity of scaling
        PRESSED_INTERVAL_MS = 25, 
        isScaling = false, // the avatar is scaling after triggers and grips are pressed
        initialDistance = null,
        initialScale = null,
        scalingInterval = null;
    function handleAllPressed() {
        if (areAllPressed() && isScaling) {
            // setup was completed already, do not need to continue
            return;
        } else if (areAllPressed() && !isScaling) {
            // Initial time isScaling called
            initialDistance = distanceBetweenHands();
            isScaling = true;
            initialScale = MyAvatar.scale;

            // Setup pressed interval
            scalingInterval = Script.setInterval(function() {
                if (isScaling) {
                    if (DEBUG) {
                        print("init" + JSON.stringify(initialDistance));
                        print("distance" + JSON.stringify(distanceBetweenHands()));
                    }
                    var currentDistance = distanceBetweenHands();
                    var deltaDistance = currentDistance - initialDistance;
                    MyAvatar.scale = initialScale + deltaDistance * SCALE_BUFFER;
                }
            }, PRESSED_INTERVAL_MS);
        } else {
            // areAllPressed is false 
            // we need to stop scaling and remove the scalingInterval
            if (scalingInterval) {
                if (DEBUG) {
                    print("CLEAR INTERVAL");
                }
                Script.clearInterval(scalingInterval);
                scalingInterval = null;
                isScaling = false;
                initialDistance = null;
            }
        }
    }


    // Get the distance between the avatar's hands
    function distanceBetweenHands() {
        var rightHand = Controller.getPoseValue(Controller.Standard.RightHand).translation;
        var leftHand = Controller.getPoseValue(Controller.Standard.LeftHand).translation;
        return Vec3.distance(rightHand, leftHand) / MyAvatar.sensorToWorldScale;
    }


    // With specific controller button, sets up controller pressed callback
    var PRESSED_MIN_VALUE = 0.8;
    function setupButtonPressListener(isPressedKey, controllerReference, mappingName) {
        var isPressedKeyName = isPressedKey;
        var MAPPING_NAME = mappingName;

        function pressedCallback(value) {
            if (!isPressed[isPressedKeyName] && value >= PRESSED_MIN_VALUE) { 
                // not already pressed and value > 0.8
                if (DEBUG) {
                    print(isPressedKeyName + " pressed!");
                }
                isPressed[isPressedKeyName] = true;
            } else if (isPressed[isPressedKeyName] && value < PRESSED_MIN_VALUE) {
                // stop pressing button
                isPressed[isPressedKeyName] = false;
            }
            handleAllPressed();
        }

        var controllerMapping = Controller.newMapping(MAPPING_NAME);
        controllerMapping.from(controllerReference).to(pressedCallback);
        Controller.enableMapping(MAPPING_NAME);
    }


    // Sets up action listeners for the buttons
    var CONTROLLER_MAPPING_GRIP_LEFT = "com.highfidelity.scaleAvatarGripLeft",
        CONTROLLER_MAPPING_GRIP_RIGHT = "com.highfidelity.scaleAvatarGripRight",
        CONTROLLER_MAPPING_TRIGGER_LEFT = "com.highfidelity.scaleAvatarTriggerLeft",
        CONTROLLER_MAPPING_TRIGGER_RIGHT = "com.highfidelity.scaleAvatarTriggerRight";
    function setupScaleAvatarWithGrip() {
        setupButtonPressListener("rightGrip", Controller.Standard.RightGrip, CONTROLLER_MAPPING_GRIP_RIGHT);
        setupButtonPressListener("leftGrip", Controller.Standard.LeftGrip, CONTROLLER_MAPPING_GRIP_LEFT);
        setupButtonPressListener("rightTrigger", Controller.Standard.RT, CONTROLLER_MAPPING_TRIGGER_RIGHT);
        setupButtonPressListener("leftTrigger", Controller.Standard.LT, CONTROLLER_MAPPING_TRIGGER_LEFT);
    }


    // Removes controller mappings and stops the interval if it is running
    function unload() {
        Controller.disableMapping(CONTROLLER_MAPPING_GRIP_RIGHT);
        Controller.disableMapping(CONTROLLER_MAPPING_GRIP_LEFT);
        Controller.disableMapping(CONTROLLER_MAPPING_TRIGGER_RIGHT);
        Controller.disableMapping(CONTROLLER_MAPPING_TRIGGER_LEFT);

        if (scalingInterval) {
            Script.clearInterval(scalingInterval);
        }
    }

    setupScaleAvatarWithGrip();
    Script.scriptEnding.connect(unload);
})();
