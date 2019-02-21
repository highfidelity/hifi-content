Script.require('./bind.js');
var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
var _this;
function PickRayController(){
    this.eventHandler = null;
    this.rayType = 'local';
    this.intersection = null;
    this.lastPick = null;
    this.currentPick = null;
    this.mappingName = null;
    this.mapping = null;
    this._boundMousePressHandler = null;
    _this = this;
}

PickRayController.prototype.create =
    function(){
        this.mapping = Controller.newMapping(this.mappingName);

        this.mapping.from(Controller.Standard.LTClick).to(function (value) {
            if (value === 0) {
                return;
            }

            this.getUUIDFromLaser(Controller.Standard.LeftHand);
        });


        this.mapping.from(Controller.Standard.RTClick).to(function (value) {
            if (value === 0) {
                return;
            }

            this.getUUIDFromLaser(Controller.Standard.RightHand);
        });

        this._boundMousePressHandler = this.mousePressHandler.bind(this);
        return this;
    };
// The following two functions are a modified version of what's found in scripts/system/libraries/controllers.js

PickRayController.prototype.handleUUID = 
    function(uuid){
        if (!this.lastPick && !this.currentPick) {
            this.currentPick = uuid;
            this.lastPick = uuid;
        } else {
            this.lastPick = this.currentPick;
            this.currentPick = uuid;
        }
    };
PickRayController.prototype.setType =
    function(type){
        this.rayType = type;

        return this;
    };
PickRayController.prototype.setMapName =
    function (name) {
        this.mappingName = name;

        return this;
    };
PickRayController.prototype.pickRayTypeHandler = 
    function (pickRay){
        console.log("\n\n#1\n\n")
        if (arguments.length === 2) {
            pickRay = { origin: arguments[0], direction: arguments[1] };
        }
        switch (this.rayType) {
            case 'avatar':
                var avatarIntersection = AvatarList.findRayIntersection(pickRay, [], [MyAvatar.sessionUUID]);
                console.log("\n\n#3\n\n")
                this.intersection = avatarIntersection;
                this.handleUUID(avatarIntersection.avatarID);
                break;
            case 'local':
                var overlayIntersection = Overlays.findRayIntersection(pickRay, [], []);
                this.intersection = overlayIntersection;
                this.handleUUID(overlayIntersection.overlayID);
                break;
            case 'entity':
                var entityIntersection = Entities.findRayIntersection(pickRay, [], []);
                this.intersection = entityIntersection;
                this.handleUUID(entityIntersection.avatarID);
                break;
            default:
                console.log("ray type not handled");
        }
    }

// Handle the interaction when in desktop and a mouse is pressed
PickRayController.prototype.mousePressHandler = 
    function mousePressHandler(event) {
        if (HMD.active || !event.isLeftButton) {
            return;
        }
        log("event", event)
        var pickRay = Camera.computePickRay(event.x, event.y);
        log("pickRay", pickRay)
        _this.pickRayTypeHandler(pickRay);
        if (_this.currentPick) {
            log("intersection", _this.intersection.intersection)
            _this.eventHandler(_this.currentPick, _this.intersection);
        }
    };
// Returns the right UUID based on hand triggered
PickRayController.prototype.getUUIDFromLaser = 
    function (hand) {
        hand = hand === Controller.Standard.LeftHand
            ? Controller.Standard.LeftHand
            : Controller.Standard.RightHand;

        var pose = this.getControllerWorldLocation(hand);
        var start = pose.position;
        var direction = Vec3.multiplyQbyV(pose.orientation, [0, 1, 0]);

        this.pickRayTypeHandler(start, direction);

        if (this.currentPick) {
            this.eventHandler(this.currentPick, this.intersection);
        }
    };
// Utility function for the ControllerWorldLocation offset 
PickRayController.prototype.getGrabPointSphereOffset =
    function getGrabPointSphereOffset(handController) {
        // These values must match what's in scripts/system/libraries/controllers.js
        // x = upward, y = forward, z = lateral
        var GRAB_POINT_SPHERE_OFFSET = { x: 0.04, y: 0.13, z: 0.039 };
        var offset = GRAB_POINT_SPHERE_OFFSET;
        if (handController === Controller.Standard.LeftHand) {
            offset = {
                x: -GRAB_POINT_SPHERE_OFFSET.x,
                y: GRAB_POINT_SPHERE_OFFSET.y,
                z: GRAB_POINT_SPHERE_OFFSET.z
            };
        }

        return Vec3.multiply(MyAvatar.sensorToWorldScale, offset);
    };

// controllerWorldLocation is where the controller would be, in-world, with an added offset
PickRayController.prototype.getControllerWorldLocation =
    function getControllerWorldLocation(handController, doOffset) {
        var orientation;
        var position;
        var valid = false;

        if (handController >= 0) {
            var pose = Controller.getPoseValue(handController);
            valid = pose.valid;
            var controllerJointIndex;
            if (pose.valid) {
                if (handController === Controller.Standard.RightHand) {
                    controllerJointIndex = MyAvatar.getJointIndex("_CAMERA_RELATIVE_CONTROLLER_RIGHTHAND");
                } else {
                    controllerJointIndex = MyAvatar.getJointIndex("_CAMERA_RELATIVE_CONTROLLER_LEFTHAND");
                }
                orientation = Quat.multiply(MyAvatar.orientation, MyAvatar.getAbsoluteJointRotationInObjectFrame(controllerJointIndex));
                position = Vec3.sum(MyAvatar.position, Vec3.multiplyQbyV(MyAvatar.orientation, MyAvatar.getAbsoluteJointTranslationInObjectFrame(controllerJointIndex)));

                // add to the real position so the grab-point is out in front of the hand, a bit
                if (doOffset) {
                    var offset = getGrabPointSphereOffset(handController);
                    position = Vec3.sum(position, Vec3.multiplyQbyV(orientation, offset));
                }

            } else if (!HMD.isHandControllerAvailable()) {
                // NOTE: keep this offset in sync with scripts/system/controllers/handControllerPointer.js:493
                var VERTICAL_HEAD_LASER_OFFSET = 0.1 * MyAvatar.sensorToWorldScale;
                position = Vec3.sum(Camera.position, Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: VERTICAL_HEAD_LASER_OFFSET, z: 0 }));
                orientation = Quat.multiply(Camera.orientation, Quat.angleAxis(-90, { x: 1, y: 0, z: 0 }));
                valid = true;
            }
        }

        return {
            position: position,
            translation: position,
            orientation: orientation,
            rotation: orientation,
            valid: valid
        };
    };

// Enables mouse press and trigger events 
PickRayController.prototype.enable = 
    function(){
        Controller.mousePressEvent.connect(this.mousePressHandler);
        Controller.enableMapping(this.mappingName);

        return this;
    };
PickRayController.prototype.disable = 
    function(){
        Controller.mousePressEvent.disconnect(this._boundMousePressHandler);
        Controller.disableMapping(this.mappingName);

        return this;
    };
PickRayController.prototype.destroy =
    function(){
        this.disable();
    }
PickRayController.prototype.registerEventHandler = 
    function(fn){
        this.eventHandler = fn;

        return this;
    };

module.exports = PickRayController;