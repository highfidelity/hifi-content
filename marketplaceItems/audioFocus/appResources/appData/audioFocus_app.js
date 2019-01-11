/*
    Audio Focus
    Created by Milad Nazeri on 2019-01-07
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
        // these values must match what's in scripts/system/libraries/controllers.js
        var GRAB_POINT_SPHERE_OFFSET = { x: 0.04, y: 0.13, z: 0.039 };  // x = upward, y = forward, z = lateral
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


    // Record the last mousePressEvent
    function mousePressEvent(event) {
        if (HMD.active) {
            return;
        }

        var pickRay = Camera.computePickRay(event.x, event.y);
        var avatarIntersection = AvatarList.findRayIntersection(pickRay, [], [MyAvatar.sessionUUID]);

        var uuid = avatarIntersection.avatarID;

        if (uuid) {
            soloAvatar(avatarIntersection.avatarID);
        }
    }


    // Returns the right UUID based on hand triggered
    function getUUIDFromLaser(hand){
        hand = hand === Controller.Standard.LeftHand 
            ? Controller.Standard.LeftHand
            : Controller.Standard.RightHand;
        
        var pose = getControllerWorldLocation(hand);
        var start = pose.position;
        var direction = Vec3.multiplyQbyV(pose.orientation, {x: 0, y: 1, z: 0});

        var avatarIntersection = AvatarList.findRayIntersection({origin:start, direction:direction}, [], [MyAvatar.sessionUUID]);
        
        var uuid = avatarIntersection.avatarID;

        return uuid;
    }


    var MAPPING_NAME = "SOLO_POINTER";
    var mapping = Controller.newMapping(MAPPING_NAME);

    mapping.from(Controller.Standard.LTClick).to(function (value) {
        if (value === 0) {
            return;
        }
        
        var uuid = getUUIDFromLaser(Controller.Standard.LeftHand);

        if (uuid) {
            soloAvatar(uuid);
        }
    });


    mapping.from(Controller.Standard.RTClick).to(function (value) {
        if (value === 0) {
            return;
        }
        
        var uuid = getUUIDFromLaser(Controller.Standard.RightHand);

        if (uuid) {
            soloAvatar(uuid);
        }
    });

    
    // Enables mouse press and trigger events 
    function enable(){
        Controller.mousePressEvent.connect(mousePressEvent);
        Controller.enableMapping(MAPPING_NAME);
    }


    function disable(){
        Controller.mousePressEvent.disconnect(mousePressEvent);
        Controller.disableMapping(MAPPING_NAME);
    }

    // #endregion
    // *************************************
    // STOP MAPPING FUNCTIONS
    // *************************************


    // *************************************
    // START SOLO FUNCTIONS
    // *************************************
    // #region Solo


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
    function resetSolo() {
        Audio.resetSoloList();
        removeAllOverlays();
        soloAvatars = {};
        updateUI();
    }

    
    // Add an avatar to the list and give them an overlay
    function addAvatarToList(avatarUUID, displayUsername) {
        soloAvatars[avatarUUID] = {
            id: avatarUUID,
            name: displayUsername
        };

        addSolo(avatarUUID);
        addOverlayToUser(avatarUUID);
    }


    // Remove an avatar from the list and remove their overlay
    function removeAvatarFromList(avatarUUID) {
        removeOverlay(avatarUUID);
        delete soloAvatars[avatarUUID];
        removeSolo(avatarUUID);
    }


    // helper to match the UUID with the name in soloAvatars Object
    function removeUser(avatarName) {
        for (var key in soloAvatars) {
            if (soloAvatars[key].name === avatarName) {
                removeAvatarFromList(key);
            }
        }
    }


    // Handles avatar being solo'd
    var soloAvatars = {};
    var MAXIMUM_ALLOWED_AVATAR_DISTANCE_FROM_USER = 5;
    function soloAvatar(avatarUUID) {
        var clickedAvatarObject = AvatarList.getAvatar(avatarUUID);
        var displayUsername = clickedAvatarObject.sessionDisplayName;
        var avatarPosition = clickedAvatarObject.position;

        var distance = Vec3.length(Vec3.subtract(MyAvatar.position, avatarPosition));
        if (distance > MAXIMUM_ALLOWED_AVATAR_DISTANCE_FROM_USER) {
            return;
        }

        if (soloAvatars[avatarUUID]) {
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
        var user = soloAvatars[uuid];
        var overlayPosition = Vec3.sum(AvatarList.getAvatar(uuid).getNeckPosition(), [0, 0.75, 0]); 

        var overlayProperties = {
            position: overlayPosition,
            dimensions: { x: 0.3, y: 0.3, z: 0.3 },
            alpha: 1.0,
            color: [255, 255, 255],
            parentID: uuid,
            drawInFront: true,
            url: Script.resolvePath("./resources/images/speaker.png")
        };

        var overlayID = Overlays.addOverlay("image3d", overlayProperties);
        user.overlayID = overlayID;
    }


    // Removes the overlay from a uuid
    function removeOverlay(uuid) {
        var user = soloAvatars[uuid];

        Overlays.deleteOverlay(user.overlayID);

        user.overlayID = null;
    }


    // Removes all overlays from a user
    function removeAllOverlays() {
        // remove previous overlays
        for (var uuid in soloAvatars) {
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

    var BUTTON_NAME = "FOCUS";
    var URL = Script.resolvePath('./resources/audioFocus_ui.html');
    var appUi = Script.require('appUi');

    var ui = new appUi({
        buttonName: BUTTON_NAME,
        home: URL,
        graphicsDirectory: Script.resolvePath("./icons/tablet-icons/"),
        onOpened: onOpened,
        onClosed: onClosed,
        onMessage: onMessage
    });

    // function for appUi to call when opened
    function onOpened() {
        enable();
    }


    // function for appUi to call when closed    
    function onClosed() {
        disable();
        resetSolo();
    }


    // Handles incoming tablet messages
    function onMessage(data) {
        switch (data.type) {
            case "EVENT_BRIDGE_OPEN_MESSAGE":
                updateUI();
                break;
            case "CLEAR_LIST":
                resetSolo();
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
        for (var key in soloAvatars) {
            avatarNames.push(soloAvatars[key].name);
        }
        ui.sendToHtml({
            type: "UPDATE_SOLO",
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
        resetSolo();
    }


    // Handles removing an avatar from the list if they leave the domain
    function onAvatarRemoved(sessionUUID) {
        if (sessionUUID in soloAvatars) {
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
        resetSolo();
    }


    Script.scriptEnding.connect(scriptFinished);

    // #endregion
    // *************************************
    // STOP CLEANUP
    // *************************************

})();
