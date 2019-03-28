//
// ping_app.js
// Created by Zach Fox on 2019-03-26
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function () {
    function onEventBridgeReady() {
        ui.sendMessage({
            app: APP_NAME,
            method: "initializeUI"
        });
    }


    function sendMessageToTarget(targetUUID) {
        var message = {
            "method": "requestNotification",
            "intendedRecipient": targetUUID,
            "senderDisplayName": MyAvatar.displayName,
            "senderHref": location.href
        };
        Messages.sendMessage(MESSAGE_CHANNEL_NAME, JSON.stringify(message));
    }


    var request = Script.require("request").request;
    var REQUEST_URL = Script.require(Script.resolvePath("./config/config.json?" + Date.now())).pushApiEndpoint;
    function onMessageReceived(channel, message, sender) {
        if (channel !== MESSAGE_CHANNEL_NAME) {
            return;
        }

        var parsedMessage;
        try {
            parsedMessage = JSON.parse(message);
        } catch (error) {
            console.log("Couldn't parse message! Error: " + error);
            return;
        }

        if (parsedMessage.intendedRecipient !== MyAvatar.sessionUUID) {
            return;
        }

        switch (parsedMessage.method) {
            case "requestNotification":
                var requestBody = {
                    "targetUsername": AccountServices.username,
                    "senderDisplayName": parsedMessage.senderDisplayName,
                    "senderHref": parsedMessage.senderHref
                };
    
                request({
                    uri: REQUEST_URL,
                    json: true,
                    body: requestBody,
                    method: "POST"
                }, function (error, response) {
                    var message = {
                        "intendedRecipient": sender,
                        "method": "notificationStatus",
                        "data": {
                            "status": "error",
                            "pingReceiverDisplayName": MyAvatar.displayName
                        }
                    };

                    if (error || !response || response.status !== "success") {
                        print("ERROR when requesting push notification: ", error, JSON.stringify(response));
                    } else if (response.status === "success") {
                        message.data.status = "success";
                    }

                    Messages.sendMessage(MESSAGE_CHANNEL_NAME, JSON.stringify(message));
                });
                break;
            

            case "notificationStatus":
                ui.sendMessage({
                    app: APP_NAME,
                    method: "notificationStatus",
                    data: {
                        status: parsedMessage.data.status,
                        pingReceiverDisplayName: parsedMessage.data.pingReceiverDisplayName
                    }
                });
                break;
        }
    }


    function onMousePressEvent(event) {
        if (!event.isLeftButton) {
            return;
        }

        var pickRay = Camera.computePickRay(event.x, event.y);
        var avatarIntersection = AvatarList.findRayIntersection(pickRay, [], [MyAvatar.sessionUUID]);
        if (avatarIntersection && avatarIntersection.avatarID) {
            ui.sendMessage({
                app: APP_NAME,
                method: "updateDisplayName",
                data: {
                    "displayName": AvatarManager.getAvatar(avatarIntersection.avatarID).displayName,
                    "targetUUID": avatarIntersection.avatarID
                }
            });
        }
    }


    // Handle EventBridge messages from UI JavaScript.
    function onWebEventReceived(event) {
        if (event.app !== APP_NAME) {
            return;
        }

        switch (event.method) {
            case "eventBridgeReady":
                onEventBridgeReady();
                break;


            case "sendMessageToTarget":
                sendMessageToTarget(event.data.targetUUID);
                break;


            default:
                console.log("Unrecognized event method supplied to App JS: " + event.method);
                break;
        }
    }


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
                orientation = Quat.multiply(MyAvatar.orientation,
                    MyAvatar.getAbsoluteJointRotationInObjectFrame(controllerJointIndex));
                position = Vec3.sum(MyAvatar.position,
                    Vec3.multiplyQbyV(MyAvatar.orientation,
                        MyAvatar.getAbsoluteJointTranslationInObjectFrame(controllerJointIndex)));
    
                // add to the real position so the grab-point is out in front of the hand, a bit
                if (doOffset) {
                    var offset = getGrabPointSphereOffset(handController);
                    position = Vec3.sum(position, Vec3.multiplyQbyV(orientation, offset));
                }
    
            } else if (!HMD.isHandControllerAvailable()) {
                // NOTE: keep _this offset in sync with scripts/system/controllers/handControllerPointer.js:493
                // eslint-disable-next-line no-magic-numbers
                var VERTICAL_HEAD_LASER_OFFSET = 0.1 * MyAvatar.sensorToWorldScale;
                position = Vec3.sum(Camera.position,
                    Vec3.multiplyQbyV(Camera.orientation, { x: 0, y: VERTICAL_HEAD_LASER_OFFSET, z: 0 }));
                // eslint-disable-next-line no-magic-numbers
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


    // Update displayName and targetUUID based on hand controller raypicks
    function handleControllerRaypick(hand) {
        hand = hand === Controller.Standard.LeftHand
            ? Controller.Standard.LeftHand
            : Controller.Standard.RightHand;

        var pose = getControllerWorldLocation(hand);
        var start = pose.position;
        // Get the direction that the hand is facing in the world
        var direction = Vec3.multiplyQbyV(pose.orientation, [0, 1, 0]);

        var pickRay = { origin: start, direction: direction };
        var avatarIntersection = AvatarList.findRayIntersection(pickRay, [], [MyAvatar.sessionUUID]);
        if (avatarIntersection && avatarIntersection.avatarID) {
            ui.sendMessage({
                app: APP_NAME,
                method: "updateDisplayName",
                data: {
                    "displayName": AvatarManager.getAvatar(avatarIntersection.avatarID).displayName,
                    "targetUUID": avatarIntersection.avatarID
                }
            });
        }
    }


    var CONTROLLER_MAPPING_NAME = "pingControllerMapping";
    var controllerMapping = false;
    function createControllerMapping() {

        controllerMapping = Controller.newMapping(CONTROLLER_MAPPING_NAME);

        controllerMapping.from(Controller.Standard.LTClick).to(function (value) {
            if (value === 0) {
                return;
            }

            handleControllerRaypick(Controller.Standard.LeftHand);
        });


        controllerMapping.from(Controller.Standard.RTClick).to(function (value) {
            if (value === 0) {
                return;
            }

            handleControllerRaypick(Controller.Standard.RightHand);
        });
    }


    var signalsWired = false;
    function onOpened() {
        if (!signalsWired) {
            Controller.mousePressEvent.connect(onMousePressEvent);
            Controller.disableMapping(CONTROLLER_MAPPING_NAME);
        }
    }


    function onClosed() {
        if (signalsWired) {
            Controller.enableMapping(CONTROLLER_MAPPING_NAME);
            Controller.mousePressEvent.disconnect(onMousePressEvent);
        }
    }


    function onScriptEnding() {
        if (ui.isOpen) {
            onClosed();
        }

        Messages.unsubscribe(MESSAGE_CHANNEL_NAME);
        Messages.messageReceived.disconnect(onMessageReceived);
    }


    // When the script starts up, setup AppUI and call `cacheSounds()`.
    // Also hook up necessary signals and open the app's UI.
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/ping_ui.html?1');
    var APP_NAME = "PING";
    var MESSAGE_CHANNEL_NAME = "com.highfidelity.ping";
    function startup() {
        ui = new AppUi({
            buttonName: APP_NAME,
            home: appPage,
            //Bell by Thomas Le Bas from the Noun Project
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived,
            onOpened: onOpened,
            onClosed: onClosed
        });

        createControllerMapping();

        Script.scriptEnding.connect(onScriptEnding);
        Messages.subscribe(MESSAGE_CHANNEL_NAME);
        Messages.messageReceived.connect(onMessageReceived);
    }
    startup();
})();
