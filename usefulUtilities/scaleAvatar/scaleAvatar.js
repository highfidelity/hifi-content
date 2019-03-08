(function () {
    var CONTROLLER_MAPPING_LEFT = "com.highfidelity.scaleAvatarLeft",
        CONTROLLER_MAPPING_RIGHT = "com.highfidelity.scaleAvatarRight";

    var isRightPressed = false;
    var isLeftPressed = false;
    var PRESSED_MIN_VALUE = 0.8;

    var DEBUG = true;

    function rightOnGripPress(value) {
        if (!isRightPressed && value >= PRESSED_MIN_VALUE) { // not already pressed and value > 0.8
            
            if (isNearGrabbingObject(STRING_RIGHT)) {
                return;
            }
            
            isRightPressed = true;
            if (DEBUG) {
                print("right pressed!");
            }
        } else if (isRightPressed && value < PRESSED_MIN_VALUE) {
            isRightPressed = false;
        }
        handleBothGripPressed();
    }

    var STRING_LEFT = "left";
    var STRING_RIGHT = "right";
    function isNearGrabbingObject(handString) {

        var controller = handString === STRING_LEFT ? Controller.Standard.LeftHand : Controller.Standard.RightHand;
        var handPosition = Controller.getPoseValue(controller).translation / MyAvatar.sensorToWorldScale;
        var entityList = Entities.findEntities(handPosition, NEAR_GRAB_RADIUS_M);

        for (var i = 0; i < entityList.length; i++) {
            var parentID = Entities.getEntityProperties(entityList[i], "parentID").parentID;
            if (MyAvatar.sessionUUID === parentID) {
                return true;
            }
        }
        return false;
    }

    var NEAR_GRAB_RADIUS_M = 1.0;
    function leftOnGripPress(value) {
        if (!isLeftPressed && value >= PRESSED_MIN_VALUE) { // not already pressed and value > 0.8
            
            if (isNearGrabbingObject(STRING_LEFT)) {
                return;
            }

            isLeftPressed = true;
            if (DEBUG) {
                print("left pressed!");
            }
        } else if (isLeftPressed && value < PRESSED_MIN_VALUE) {
            isLeftPressed = false;
        }
        handleBothGripPressed();
    }


    var SCALE_BUFFER = 1; // increase/decrease the sensitivity of scaling
    var PRESSED_INTERVAL_MS = 25; 
    var isPressed = false; // both grips pressed
    var initialDistance = null;
    var initialScale = null;
    var pressedInterval = null;
    function handleBothGripPressed() {
        if (isRightPressed && isLeftPressed && isPressed) {
            // setup done, do not need to continue
            // or either left or right is not pressed
            return;
        }

        if (isRightPressed && isLeftPressed) {
            if (!isPressed) {
                // Both pressed initially
                initialDistance = distanceBetweenHands();
                isPressed = true;
                initialScale = MyAvatar.scale;

                // Setup pressed interval
                pressedInterval = Script.setInterval(function() {
                    if (isPressed) {
                        if (DEBUG) {
                            print("init" + JSON.stringify(initialDistance));
                            print("distance" + JSON.stringify(distanceBetweenHands()));
                        }
                        var currentDistance = distanceBetweenHands();
                        var deltaDistance = currentDistance - initialDistance;
                        MyAvatar.scale = initialScale + deltaDistance * SCALE_BUFFER;
                    }
                }, PRESSED_INTERVAL_MS);
            }
        } else {
            // remove pressed interval
            if (pressedInterval) {
                if (DEBUG) {
                    print("CLEAR INTERVAL");
                }
                Script.clearInterval(pressedInterval);
                pressedInterval = null;
                isPressed = false;
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


    function setupScaleAvatarWithGrip() {
        var controllerMapping = Controller.newMapping(CONTROLLER_MAPPING_LEFT);
        controllerMapping.from(Controller.Standard.LeftGrip).to(leftOnGripPress);
        Controller.enableMapping(CONTROLLER_MAPPING_LEFT);

        controllerMapping = Controller.newMapping(CONTROLLER_MAPPING_RIGHT);
        controllerMapping.from(Controller.Standard.RightGrip).to(rightOnGripPress);
        Controller.enableMapping(CONTROLLER_MAPPING_RIGHT);
    }


    function unload() {
        Controller.disableMapping(CONTROLLER_MAPPING_LEFT);
        Controller.disableMapping(CONTROLLER_MAPPING_RIGHT);

        if (pressedInterval) {
            Script.clearInterval(pressedInterval);
        }
    }

    setupScaleAvatarWithGrip();
    Script.scriptEnding.connect(unload);
})();
