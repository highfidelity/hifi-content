//
//  question_app.js
//
//  Created by Rebecca Stankus on 02/21/19
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global  Audio, Camera, Controller, Entities, HMD, Messages, MyAvatar, Quat, Script, Settings, SoundCache, 
Tablet, Users, Vec3, Window */

(function() {

    // *************************************
    // START UTILITY FUNCTIONS
    // *************************************

    var PickRayController = Script.require('./resources/modules/pickRayController.js?' + Date.now());
    var pickRayController = new PickRayController();

    /* PLAY A SOUND: Plays the specified sound at the specified position using the volume and playback 
    modes requested. */
    var injector;
    function playSound(sound, volume, position, localOnly, loop){
        if (sound.downloaded) {
            if (injector) {
                injector.stop();
                injector = null;
            }
            injector = Audio.playSound(sound, {
                position: position,
                volume: volume,
                localOnly: localOnly,
                loop: loop
            });
        }
    }

    /* RGB VALUE TO FLOAT VALUE: Convert RGB value to float */
    var RGB_MAX = 255;
    function rgbValueToFloat(rgbValue) {
        return rgbValue/RGB_MAX;
    }

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* CREATE A QUESTION MARK: Checks that question Mark does not already exist, then calculates position above 
    avatar's head and creates a question mark entity there */
    var GROWTH_INTERVAL_MS = 500; // takes 4 min 38 sec to reach height of 0.8 from 0.2 at ratio:1.005, interval: 1000
    var MAX_HEIGHT_M = 0.8;
    var GROWTH_RATIO = 1.005;
    var QUESTION_MARK_PROPERTY_NAME = "Question App Mark";
    var QUESTION_MARK_START_DIMENSIONS_M = { x: 0.1, y: 0.2, z: 0.02 };
    var HIFI_CYAN = { red: 0, green: 158, blue: 224 };
    var HIFI_YELLOW = { red: 255, green: 237, blue: 0 };
    var HIFI_RED = { red: 255, green: 0, blue: 16 };
    var HALF = 0.5;
    var Y_OFFSET_HEAD_TOP_TO_ENTITY_M = 0.1;
    var OFFSET_RATIO_HEADTOP_M = 0.1;
    var OFFSET_RATIO_HEAD_M = 0.2;
    var OFFSET_RATIO_HIPS_M = 0.5;
    var questionMark;
    var questionMarkMaterial;
    var changingInterval;
    var parentJointIndex;
    var yOffsetParentJointToHeadTop;
    var offsetRatio;
    var lastDimensions = QUESTION_MARK_START_DIMENSIONS_M;
    function createQuestionMark() {
        if (questionMark) {
            return;
        }
        var avatarHeight = MyAvatar.getHeight();
        parentJointIndex = MyAvatar.getJointIndex("HeadTop_End");
        print("HEAD_TOP_END");
        offsetRatio = OFFSET_RATIO_HEADTOP_M;
        if (parentJointIndex === -1) {
            print("NOPE...HEAD");
            parentJointIndex = MyAvatar.getJointIndex("Head");
            offsetRatio = OFFSET_RATIO_HEAD_M;
        }
        if (parentJointIndex === -1) {
            print("NOPE...HIPS");
            parentJointIndex = MyAvatar.getJointIndex("Hips");
            offsetRatio = OFFSET_RATIO_HIPS_M;
        }
        yOffsetParentJointToHeadTop = offsetRatio * avatarHeight;
        var questionMarkLocalYPosition = yOffsetParentJointToHeadTop + HALF * QUESTION_MARK_START_DIMENSIONS_M.y;
        var questionMarkProperties = {
            name: QUESTION_MARK_PROPERTY_NAME,
            type: "Model",
            modelURL: Script.resolvePath("resources/models/questionMark.fbx"),
            lifetime: 360000,
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: parentJointIndex,
            localRotation: Quat.fromVec3Degrees({ x: 0, y: 180, z: 0 }),
            localPosition: { x: 0, y: questionMarkLocalYPosition, z: 0 },
            dimensions: QUESTION_MARK_START_DIMENSIONS_M,
            grab: { grabbable: false },
            collisionless: true
        };
        questionMark = Entities.addEntity(questionMarkProperties, 'avatar');
        var questionMarkMaterialProperties = {
            type: "Material",
            name: "Question App Material",
            materialURL: "materialData",
            priority: 1,
            parentID: questionMark,
            materialData: JSON.stringify({
                materials: {
                    albedo: HIFI_CYAN,
                    emissive: { red: 0, green: rgbValueToFloat(HIFI_CYAN.green), blue: rgbValueToFloat(HIFI_CYAN.blue) }
                }
            })
        };
        questionMarkMaterial = Entities.addEntity(questionMarkMaterialProperties, 'avatar');
        var toYellowPhase = true;
        var colorChanging = true;
        var growing = true;
        changingInterval = Script.setInterval(function() {
            if (changingInterval && !growing && !colorChanging) {
                Script.clearInterval(changingInterval);
                changingInterval = null;
            }
            try {
                var materialData = JSON.parse(Entities.getEntityProperties(questionMarkMaterial, 'materialData').materialData);
            } catch (err) {
                print("ERROR:could not get material data");
                return;
            }
            if (colorChanging && toYellowPhase) {
                if (materialData.materials.albedo.green < HIFI_YELLOW.green) {
                    materialData.materials.albedo.green++;
                }
                if (materialData.materials.albedo.blue > HIFI_YELLOW.blue) {
                    materialData.materials.albedo.blue--;
                }
                if (materialData.materials.albedo.red < RGB_MAX) {
                    materialData.materials.albedo.red++;
                } else {
                    toYellowPhase = false;
                }
            } else if (colorChanging) {
                if (materialData.materials.albedo.blue < HIFI_RED.blue) {
                    materialData.materials.albedo.blue++;
                }
                if (materialData.materials.albedo.green > HIFI_RED.green) {
                    materialData.materials.albedo.green--;
                } else {
                    colorChanging = false;
                }
            }
            materialData.materials.emissive.red = rgbValueToFloat(materialData.materials.albedo.red);
            materialData.materials.emissive.green = rgbValueToFloat(materialData.materials.albedo.green);
            materialData.materials.emissive.blue = rgbValueToFloat(materialData.materials.albedo.blue);
            Entities.editEntity(questionMarkMaterial, { materialData: JSON.stringify(materialData)});
            if (changingInterval && growing) {
                avatarHeight = MyAvatar.getHeight();
                var questionMarkDimensions = Entities.getEntityProperties(questionMark, 'dimensions').dimensions;
                if (questionMarkDimensions.y < MAX_HEIGHT_M) {
                    questionMarkDimensions = Vec3.multiply(questionMarkDimensions, GROWTH_RATIO);
                    print("yOffsetParentJointToHeadTop: ", yOffsetParentJointToHeadTop);
                    print("Y_OFFSET_HEAD_TOP_TO_ENTITY_M: ", Y_OFFSET_HEAD_TOP_TO_ENTITY_M);
                    print("HALF * questionMarkDimensions.y: ", HALF * questionMarkDimensions.y);
                    var newLocalPositionY = yOffsetParentJointToHeadTop + Y_OFFSET_HEAD_TOP_TO_ENTITY_M + (HALF * questionMarkDimensions.y);
                    print("newLocalPositionY: ", newLocalPositionY);
                    Entities.editEntity(questionMark, { 
                        dimensions: questionMarkDimensions,
                        localPosition: { x: 0, y: newLocalPositionY, z: 0 }
                    });
                } else {
                    growing = false;
                }
                lastDimensions = questionMarkDimensions;
            }
        }, GROWTH_INTERVAL_MS);
    }

    /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the question mark.
    If we are closing the app, remove the question mark and play a different sound */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('resources/sounds/open.mp3'));
    var OPEN_SOUND_VOLUME = 0.2;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('resources/sounds/close.mp3'));
    var CLOSE_SOUND_VOLUME = 0.3;
    var QUESTION_CHANNEL = "QuestionChannel";
    var messagesReceivedConnected;
    var scaleChangedConnected;
    var skeletonChangedConnected;
    function onClicked() {
        if (questionMark) {
            cleanUp();
            if (messagesReceivedConnected) {
                Messages.messageReceived.disconnect(checkMessage);
                messagesReceivedConnected = false;
            }
            if (scaleChangedConnected) {
                MyAvatar.scaleChanged.disconnect(avatarScaleChanged);
                scaleChangedConnected = false;
            }
            if (skeletonChangedConnected) {
                MyAvatar.skeletonModelURLChanged.disconnect(skeletonChanged);
                skeletonChangedConnected = false;
            }
            playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
        } else {
            button.editProperties({ isActive: true });
            playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true, false);
            createQuestionMark();
            if (!messagesReceivedConnected) {
                Messages.messageReceived.connect(checkMessage);
                messagesReceivedConnected = true;
            }
            if (!scaleChangedConnected) {
                MyAvatar.scaleChanged.connect(avatarScaleChanged);
                scaleChangedConnected = true;
            }
            if (!skeletonChangedConnected) {
                MyAvatar.skeletonModelURLChanged.connect(skeletonChanged);
                skeletonChangedConnected = true;
            }
        }
    }

    /* Handles avatar being selected */
    pickRayController
        .registerEventHandler(selectAvatar)
        .setType("avatar")
        .setMapName("hifi_question")
        .create();

    /* SELECT AVATAR: When an admin clicks/triggers on an avatar, they are selected to speak next and their UUID 
    is sent out via message */
    function selectAvatar(uuid, intersection) {
        Messages.sendMessage(QUESTION_CHANNEL, JSON.stringify({
            UUID: uuid
        }));
    }

    /* AVATAR SELECTED: When a user is selected, the question mark disappears and a sound 
    plays for the selected user as their app toggles off. */
    var SELECTED_SOUND = SoundCache.getSound(Script.resolvePath('resources/sounds/selected.mp3'));
    var SELECTED_SOUND_VOLUME = 0.3;
    function avatarSelected() {
        if (questionMark) {
            cleanUp();
            if (messagesReceivedConnected) {
                Messages.messageReceived.disconnect(checkMessage);
                messagesReceivedConnected = false;
            }
            if (scaleChangedConnected) {
                MyAvatar.scaleChanged.disconnect(avatarScaleChanged);
                scaleChangedConnected = false;
            }
            if (skeletonChangedConnected) {
                MyAvatar.skeletonModelURLChanged.disconnect(skeletonChanged);
                skeletonChangedConnected = false;
            }
            playSound(SELECTED_SOUND, SELECTED_SOUND_VOLUME, MyAvatar.position, true, false);
        }
    }

    /* ON STOPPING THE SCRIPT: Disconnect signals and clean up */
    function appEnding() {
        cleanUp();
        Messages.unsubscribe(QUESTION_CHANNEL);
        Users.canKickChanged.disconnect(adminStatusCheck);
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        pickRayController.destroy();
        Window.domainChanged.disconnect(domainChanged);
    }

    /* REMOVE QUESTION MARK: Remove referenced question mark if it exists and any other strays */
    function removeQuestionMarkEntities() {
        if (questionMark) {
            Entities.deleteEntity(questionMark);
            questionMark = null;
        }
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
            if (name === QUESTION_MARK_PROPERTY_NAME) {
                Entities.deleteEntity(avatarEntity.id);
                questionMark = null;
            }
        });
    }

    /* CLEANUP: Remove question mark, search for any unreferenced question marks to clean up */
    function cleanUp() {
        removeQuestionMarkEntities();
        if (changingInterval) {
            Script.clearInterval(changingInterval);
            changingInterval = null;
        }
        if (injector) {
            injector.stop();
            injector = null;
        }
        button.editProperties({ isActive: false }); 
    }

    /* WHEN USER DOMAIN CHANGES: Close app to remove question mark when leaving the domain */
    var WAIT_TO_CLEAN_UP_MS = 2000;
    function domainChanged() {
        Script.setTimeout(function() {
            cleanUp();
        }, WAIT_TO_CLEAN_UP_MS);
    }

    /* CHECK MESSAGE RECEIVED: If uuid that was broadcast matches, this user has been selected to speak next */
    function checkMessage(channel, message, sender) {
        if (channel === QUESTION_CHANNEL) {
            try {
                message = JSON.parse(message);
            } catch (error) {
                print("Couldn't parse message: " + error);
                return;
            }
            if (message.UUID === MyAvatar.sessionUUID && questionMark) {
                avatarSelected();
            }
        }
    }

    /* ADMIN STATUS CHANGED: User permissions have changed, set adminStatus */
    var adminStatus;
    function adminStatusCheck() {
        adminStatus = Users.getCanKick() ? true : false;
        if (adminStatus) {
            pickRayController.enable();
        } else {
            pickRayController.disable();
        }
    }

    /* AVATAR SCALE CHANGED: Reset question mark entity back to appropriate size */
    function avatarScaleChanged() {
        var avatarHeight = MyAvatar.getHeight();
        yOffsetParentJointToHeadTop = offsetRatio * avatarHeight;
        var questionMarkHeight = Entities.getEntityProperties(questionMark, 'dimensions').dimensions.y;
        var newLocalPosition = yOffsetParentJointToHeadTop + Y_OFFSET_HEAD_TOP_TO_ENTITY_M + HALF * questionMarkHeight;
        Entities.editEntity(questionMark, { 
            dimensions: lastDimensions,
            localPosition: { x: 0, y: newLocalPosition, z: 0 }
        });
    }

    /* AVATAR SKELETON CHANGED: Close the app if it is open */
    function skeletonChanged() {
        if (changingInterval) {
            Script.clearInterval(changingInterval);
            changingInterval = null;
        }
        if (injector) {
            injector.stop();
            injector = null;
        }
        button.editProperties({ isActive: false }); 
        questionMark = null;
        if (messagesReceivedConnected) {
            Messages.messageReceived.disconnect(checkMessage);
            messagesReceivedConnected = false;
        }
        if (scaleChangedConnected) {
            MyAvatar.scaleChanged.disconnect(avatarScaleChanged);
            scaleChangedConnected = false;
        }
        if (skeletonChangedConnected) {
            MyAvatar.skeletonModelURLChanged.disconnect(skeletonChanged);
            skeletonChangedConnected = false;
        }
        playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
    }

    Messages.subscribe(QUESTION_CHANNEL);
    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button = tablet.addButton({
        text: 'QUESTION',
        icon: Script.resolvePath('resources/icons/question-i.png'),
        activeIcon: Script.resolvePath('resources/icons/question-a.png')
    });
    adminStatusCheck();
    Users.canKickChanged.connect(adminStatusCheck);
    button.clicked.connect(onClicked);
    Window.domainChanged.connect(domainChanged);
    Script.scriptEnding.connect(appEnding);
}());