/*

    Name Tag
    Created by Milad Nazeri on 2019-02-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    
*/

(function () {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************
    // #region Utilty


    // The following two functions are a modified version of what's found in scripts/system/libraries/controllers.js
    // Utility function for the ControllerWorldLocation offset 
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
    }


    // controllerWorldLocation is where the controller would be, in-world, with an added offset
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
    }


    // #endregion
    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    // *************************************
    // START MAPPING FUNCTIONS
    // *************************************
    // #region Mapping


    // Handle the interaction when in desktop and a mouse is pressed
    function mousePressEvent(event) {
        if (HMD.active || !event.isLeftButton) {
            return;
        }

        var pickRay = Camera.computePickRay(event.x, event.y);
        var avatarIntersection = AvatarList.findRayIntersection(pickRay, [], [MyAvatar.sessionUUID]);

        var uuid = avatarIntersection.avatarID;

        if (uuid) {
            selectAvatar(uuid);
        }
    }


    // Returns the right UUID based on hand triggered
    function getUUIDFromLaser(hand){
        hand = hand === Controller.Standard.LeftHand 
            ? Controller.Standard.LeftHand
            : Controller.Standard.RightHand;
        
        var pose = getControllerWorldLocation(hand);
        var start = pose.position;
        var direction = Vec3.multiplyQbyV(pose.orientation, [0, 1, 0]);

        var avatarIntersection = AvatarList.findRayIntersection({origin:start, direction:direction}, [], [MyAvatar.sessionUUID]);
        
        var uuid = avatarIntersection.avatarID;

        return uuid;
    }


    var MAPPING_NAME = "NAME_TAG";
    var mapping = Controller.newMapping(MAPPING_NAME);

    mapping.from(Controller.Standard.LTClick).to(function (value) {
        if (value === 0) {
            return;
        }
        
        var uuid = getUUIDFromLaser(Controller.Standard.LeftHand);

        if (uuid) {
            selectAvatar(uuid);
        }
    });


    mapping.from(Controller.Standard.RTClick).to(function (value) {
        if (value === 0) {
            return;
        }
        
        var uuid = getUUIDFromLaser(Controller.Standard.RightHand);

        if (uuid) {
            selectAvatar(uuid);
        }
    });

    
    // Enables mouse press and trigger events 
    function enable(){
        Controller.mousePressEvent.connect(mousePressEvent);
        Controller.enableMapping(MAPPING_NAME);
    }


    // Disables mouse press and trigger events   
    function disable(){
        Controller.mousePressEvent.disconnect(mousePressEvent);
        Controller.disableMapping(MAPPING_NAME);
    }


    // #endregion
    // *************************************
    // STOP MAPPING FUNCTIONS
    // *************************************

    // *************************************
    // START AVATAR FUNCTIONS
    // *************************************
    // #region Solo


    // Handles avatar being solo'd
    var avatars = {};
    var MAXIMUM_ALLOWED_OTHER_AVATAR_DISTANCE_FROM_USER = 25;
    function selectAvatar(avatarUUID) {
        var clickedAvatarObject = AvatarList.getAvatar(avatarUUID);
        var displayUsername = clickedAvatarObject.sessionDisplayName;
        var otherAvatarPosition = clickedAvatarObject.position;
        var vectorBetweenAvatars = Vec3.subtract(MyAvatar.position, otherAvatarPosition);

        var distance = Vec3.length(vectorBetweenAvatars);
        if (distance > MAXIMUM_ALLOWED_OTHER_AVATAR_DISTANCE_FROM_USER) {
            ui.sendToHtml({
                type: "DISPLAY_ERROR"
            });
            return;
        }

        if (avatars[avatarUUID]) {
            removeAvatarFromList(avatarUUID);
        } else {
            addAvatarToList(avatarUUID, displayUsername);
        }
    }


    // #endregion
    // *************************************
    // STOP SOLO FUNCTIONS
    // *************************************

    // *************************************
    // START OVERLAY FUNCTIONS
    // *************************************
    // #region Overlay


    // Adds a speaker overlay above a user solo'd
    function addOverlayToUser(uuid) {
        var user = avatars[uuid];
        var avatar = AvatarList.getAvatar(uuid);
        var neckPosition = avatar.getNeckPosition();
        var avatarScale = avatar.scale;
        var ABOVE_NECK = 0.75;
        var overlayPosition = Vec3.sum(neckPosition, [0, avatarScale * ABOVE_NECK, 0]); 
        var IMAGE_SIZE = avatarScale * 0.3;

        var overlayProperties = {
            position: overlayPosition,
            dimensions: {x: IMAGE_SIZE, y: IMAGE_SIZE, z: IMAGE_SIZE},
            alpha: 1.0,
            color: [255, 255, 255],
            parentID: uuid,
            isFacingAvatar: true,
            url: Script.resolvePath("./resources/images/speaker.png")
        };

        var overlayID = Overlays.addOverlay("image3d", overlayProperties);
        user.overlayID = overlayID;
    }


    // Removes the overlay from a uuid
    function removeOverlay(uuid) {
        var user = avatars[uuid];

        Overlays.deleteOverlay(user.overlayID);

        user.overlayID = null;
    }


    // Removes all overlays from a user
    function removeAllOverlays() {
        // remove previous overlays
        for (var uuid in avatars) {
            removeOverlay(uuid);
        }
    }


    // #endregion
    // *************************************
    // STOP OVERLAY FUNCTIONS
    // *************************************

    // *************************************
    // START TABLET FUNCTIONS
    // *************************************
    // #region Tablet


    var BUTTON_NAME = "NAME_TAG";
    var URL = Script.resolvePath('./resources/nametag_ui.html');
    var appUi = Script.require('appUi');

    var ui = new appUi({
        buttonName: BUTTON_NAME,
        home: URL,
        graphicsDirectory: Script.resolvePath("./resources/images/icons/"),
        onOpened: onOpened,
        onClosed: onClosed,
        onMessage: onMessage
    });

    // Function for appUi to call when opened
    function onOpened() {
        enable();
    }


    // Function for appUi to call when closed    
    function onClosed() {
        disable();
        resetTags();
    }


    // Handles incoming tablet messages
    function onMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                updateUI();
                break;
            case "CLEAR_LIST":
                resetTags();
                break;
            case "REMOVE_USER":
                removeUser(data.value);
                break;
            default:
        }
    }


    // Handles how the UI gets updated
    function updateUI() {
        var avatarNames = [];
        for (var key in avatars) {
            avatarNames.push(avatars[key].name);
        }
        ui.sendToHtml({
            type: "UPDATE_TAGS",
            value: avatarNames
        });
    }

    // #endregion 
    // *************************************
    // STOP TABLET FUNCTIONS
    // *************************************

    // *************************************
    // START CLEANUP
    // *************************************
    // #region Cleanup 


    // Handles reset of list if you change domains
    function onDomainChange() {
        resetTags();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(sessionUUID) {
        if (sessionUUID in avatars) {
            removeAvatarFromList(sessionUUID);
        }
    }


    Window.domainChanged.connect(onDomainChange);

    AvatarManager.avatarRemovedEvent.connect(onAvatarRemoved);

    // Called when the script is closing
    function scriptFinished() {
        disable();
        Window.domainChanged.disconnect(onDomainChange);
        AvatarManager.avatarRemovedEvent.disconnect(onAvatarRemoved);
        resetTags();
    }


    Script.scriptEnding.connect(scriptFinished);


    // #endregion
    // *************************************
    // STOP CLEANUP
    // *************************************

})();


// Adds avatar to the solo list
function addSolo(targetUUID) {
    Audio.addToSoloList([targetUUID]);
    updateUI();
}


// Remove Avatar from the solo list
function removeSolo(targetUUID) {
    Audio.removeFromSoloList([targetUUID]);
    updateUI();
}


// Remove all avatars from the solo list
function resetTags() {
    Audio.resetSoloList();
    removeAllOverlays();
    avatars = {};
    updateUI();
}


// Add an avatar to the list and give them an overlay
function addAvatarToList(avatarUUID, displayUsername) {
    avatars[avatarUUID] = {
        name: displayUsername
    };

    addSolo(avatarUUID);
    addOverlayToUser(avatarUUID);
}


// Remove an avatar from the list and remove their overlay
function removeAvatarFromList(avatarUUID) {
    removeOverlay(avatarUUID);
    delete avatars[avatarUUID];
    removeSolo(avatarUUID);
}


// helper to match the UUID with the name in avatars Object
function removeUser(avatarName) {
    for (var key in avatars) {
        if (avatars[key].name === avatarName) {
            removeAvatarFromList(key);
        }
    }
}