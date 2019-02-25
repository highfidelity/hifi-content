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

    /* PLAY A SOUND: Plays the specified sound at the position of the user's Avatar using the volume and playback 
    mode requested. */
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

    // *************************************
    // END UTILITY FUNCTIONS
    // *************************************

    /* CREATE A QUESTION MARK: Checks that question Mark does not already exist, then calculates position above 
    avatar's head and creates a question mark entity there */
    var QUESTION_MARK_Y_OFFSET_RATIO_FROM_HEAD_TOP = 0.3;
    var QUESTION_MARK_Y_OFFSET_RATIO_FROM_HEAD = 0.4;
    var QUESTION_MARK_Y_OFFSET_RATIO_FROM_HIPS = 0.6;
    var GROWTH_INTERVAL_MS = 1000; // takes 4 min 38 sec to reach height of 0.8 from 0.2 at ratio:1.005, interval: 1000
    var MAX_HEIGHT_M = 0.8;
    var GROWTH_RATIO = 1.1;
    var questionMark;
    var questionMarkMaterial;
    var growingInterval;
    function createQuestionMark() {
        if (questionMark) {
            return;
        }
        var avatarHeight = MyAvatar.getHeight();
        var parentJointIndex = MyAvatar.getJointIndex("HeadTop_End");
        var offsetRatio = QUESTION_MARK_Y_OFFSET_RATIO_FROM_HEAD_TOP;
        print("USING HEAD TOP JOINT");
        if (parentJointIndex === -1) {
            print("NOPE>>>USING HEAD JOINT");
            parentJointIndex = MyAvatar.getJointIndex("Head");
            offsetRatio = QUESTION_MARK_Y_OFFSET_RATIO_FROM_HEAD;
        }
        if (parentJointIndex === -1) {
            parentJointIndex = MyAvatar.getJointIndex("Hips");
            offsetRatio = QUESTION_MARK_Y_OFFSET_RATIO_FROM_HIPS;
            print("ERROR: Falling back to hips joint as head could not be found");
        }
        var questionMarkLocalYPosition = avatarHeight * offsetRatio;
        questionMark = Entities.addEntity({
            name: "Question App Mark",
            type: "Model",
            modelURL: Script.resolvePath("resources/models/sphere-white-emissive.fbx"),
            lifetime: 360000,
            parentID: MyAvatar.sessionUUID,
            parentJointIndex: parentJointIndex,
            localPosition: { x: 0, y: questionMarkLocalYPosition, z: 0 },
            dimensions: { x: 0.2, y: 0.2, z: 0.2 },
            grab: { grabbable: false },
            collisionless: true
        }, 'avatar');
        questionMarkMaterial = Entities.addEntity({
            type: "Material",
            name: "Question App Material",
            materialURL: "materialData",
            priority: 1,
            parentID: questionMark,
            materialData: JSON.stringify({
                materials: {
                    albedo: { red: 0, green: 255, blue: 0 },
                    emissive: { red: 0, green: 1, blue: 0 }
                }
            })
        }, 'avatar');
        print("start growing");
        growingInterval = Script.setInterval(function() {
            var questionMarkDimensions = Entities.getEntityProperties(questionMark, 'dimensions').dimensions;
            questionMarkDimensions = Vec3.multiply(questionMarkDimensions, GROWTH_RATIO);
            Entities.editEntity(questionMark, { dimensions: questionMarkDimensions });
            if (questionMarkDimensions.y > MAX_HEIGHT_M) {
                print("stop growing");
                Script.clearInterval(growingInterval);
            }
        }, GROWTH_INTERVAL_MS);
    }

    /* ON CLICKING APP BUTTON: (on the toolbar or tablet) if we are opening the app, play a sound and get the question mark.
    If we are closing the app, remove the question mark and play a different sound */
    var OPEN_SOUND = SoundCache.getSound(Script.resolvePath('resources/sounds/open.mp3'));
    var OPEN_SOUND_VOLUME = 0.2;
    var CLOSE_SOUND = SoundCache.getSound(Script.resolvePath('resources/sounds/close.mp3?0'));
    var CLOSE_SOUND_VOLUME = 0.3;
    var QUESTION_CHANNEL = "TriviaChannel";
    function onClicked() {
        if (questionMark) {
            cleanUp();
            playSound(CLOSE_SOUND, CLOSE_SOUND_VOLUME, MyAvatar.position, true, false);
            Messages.messageReceived.disconnect(checkMessage);
        } else {
            button.editProperties({ isActive: true });
            playSound(OPEN_SOUND, OPEN_SOUND_VOLUME, MyAvatar.position, true, false);
            createQuestionMark();
            Messages.messageReceived.connect(checkMessage);\
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
        print("SELECTED AVATAR: ", uuid);
        Messages.sendMessage(QUESTION_CHANNEL, JSON.stringify({
            UUID: uuid
        }));
    }

    /* AVATAR SELECTED: When a user is selected, the question mark disappears in a partible burst and a sound 
    plays for the selected user as their app toggles off. */
    var SELECTED_SOUND = SoundCache.getSound(Script.resolvePath('resources/sounds/close.mp3'));
    var SELECTED_SOUND_VOLUME = 0.3;
    function avatarSelected() {
        print("I AM THE CHOSEN AVATAR!");
        if (questionMark) {
            onClicked();
            playSound(SELECTED_SOUND, SELECTED_SOUND_VOLUME, MyAvatar.position, true, false);
        }
    }

    /* ON STOPPING THE SCRIPT: Disconnect signals and clean up */
    function appEnding() {
        cleanUp();
        Messages.unsubscribe(QUESTION_CHANNEL);
        Users.canKickChanged.disconnect(adminStatusCheck);
        pickRayController.destroy();
        button.clicked.disconnect(onClicked);
        Window.domainChanged.disconnect(domainChanged);
        tablet.removeButton(button);
    }

    /* CLEANUP: Remove question mark, search for any unreferenced question marks to clean up */
    function cleanUp() {
        if (growingInterval) {
            Script.clearInterval(growingInterval);
        }
        if (injector) {
            injector.stop();
            injector = null;
        }
        if (questionMark) {
            Entities.deleteEntity(questionMark);
            questionMark = null;
        }
        button.editProperties({ isActive: false });
        MyAvatar.getAvatarEntitiesVariant().forEach(function(avatarEntity) {
            var name = Entities.getEntityProperties(avatarEntity.id, 'name').name;
            if (name === "Question App Mark") {
                Entities.deleteEntity(avatarEntity.id);
                questionMark = null;
            }
        });
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
            print("MESSAGE: ", message);
            message = JSON.parse(message);
            print("MESSAGE UUID: ",message.UUID);
            print("MY ID: ", MyAvatar.sessionUUID);
            if (message.UUID === MyAvatar.sessionUUID) {
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