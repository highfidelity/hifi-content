//
//  wearApp.js
//
//  Created by Thijs Wenker on 11/17/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

module.exports = (function() {
    var APP_NAME = 'WEAR';
    var WEAR_TUTORIAL_CHANNEL = 'com.highfidelity.wear.tutorialChannel';
    var HTML_PATH = Script.resolvePath('html');
    var APP_URL = HTML_PATH + '/wearApp.html';
    var APP_ICON_INACTIVE = HTML_PATH + '/img/WearAppIconWhite.svg';
    var APP_ICON_ACTIVE = HTML_PATH + '/img/WearAppIconBlack.svg';
    var ATTACHMENT_SEARCH_RADIUS = 100; // meters (just in case)
    var TUTORIAL_URLS = {
        ADJUST: HTML_PATH + '/wearTutorialAdjust.html',
        ADJUST_VR: HTML_PATH + '/wearTutorialAdjustVR.html',
        ATTACH: HTML_PATH + '/wearTutorialAttach.html',
        BUY: HTML_PATH + '/wearTutorialBuy.html'
    };

    var SETTING_RESET_FIRST_TIME_SETTINGS = 'com.highfidelity.wear.resetFirstTimeSettings';
    var SETTING_STORE_ENTERED_FIRST_TIME = 'com.highfidelity.wear.storeEnteredFirstTime';
    var SETTING_FIRST_TIME_USE_APP_DESKTOP = 'com.highfidelity.wear.firstTimeUseAppDesktop';
    var SETTING_FIRST_TIME_USE_APP_VR = 'com.highfidelity.wear.firstTimeUseAppVR';

    var isAppActive = false;
    var isTutorialActive = false;
    var activeTutorialURL = null;
    var selectedAvatarEntity = null;
    var lastAttachedEntities = [];

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button = tablet.addButton({
        text: APP_NAME,
        icon: APP_ICON_INACTIVE,
        activeIcon: APP_ICON_ACTIVE
    });

    // Check for first time settings being reset
    // Console command for testing first time settings:
    //     Settings.setValue('com.highfidelity.wear.firstTimeUseApp', true);
    if (Settings.getValue(SETTING_RESET_FIRST_TIME_SETTINGS, false)) {
        Settings.setValue(SETTING_STORE_ENTERED_FIRST_TIME, false);
        Settings.setValue(SETTING_FIRST_TIME_USE_APP_DESKTOP, true);
        Settings.setValue(SETTING_FIRST_TIME_USE_APP_VR, true);
        // Switch the reset option back off
        Settings.setValue(SETTING_RESET_FIRST_TIME_SETTINGS, false);
    }

    var isEntityBeingWorn = function(entityID) {
        return Entities.getEntityProperties(entityID, 'parentID').parentID === MyAvatar.sessionUUID;
    };

    var hasEnteredStoreForFirstTime = function() {
        return Settings.getValue(SETTING_STORE_ENTERED_FIRST_TIME, false);
    };

    var isFirstTimeUseDesktop = function() {
        return Settings.getValue(SETTING_FIRST_TIME_USE_APP_DESKTOP, true);
    };

    var isFirstTimeUseVR = function() {
        return Settings.getValue(SETTING_FIRST_TIME_USE_APP_VR, true);
    };

    var getAttachedModelEntities = function() {
        var resultEntities = [];
        Entities.findEntitiesByType('Model', MyAvatar.position, ATTACHMENT_SEARCH_RADIUS).forEach(function(entityID) {
            if (isEntityBeingWorn(entityID)) {
                resultEntities.push(entityID);
            }
        });
        return resultEntities;
    };

    var sendUpdate = function() {
        var attachments = {};

        lastAttachedEntities = getAttachedModelEntities();

        lastAttachedEntities.forEach(function(entityID) {
            var properties = Entities.getEntityProperties(entityID, ['name', 'modelURL', 'parentJointIndex']);

            var label;
            if (properties.name.length > 0) {
                label = properties.name;
            } else {
                label = properties.modelURL.split('/').pop();
            }

            attachments[entityID] = label + ' [' + MyAvatar.jointNames[properties.parentJointIndex] + ']';
        });

        var properties = null;
        var attachmentsCount = Object.keys(attachments).length;
        if (attachmentsCount === 0) {
            selectedAvatarEntity = null;
        } else if (attachmentsCount > 0 && (selectedAvatarEntity === null || selectedAvatarEntity === '' ||
                                            lastAttachedEntities.indexOf(selectedAvatarEntity) === -1)) {

            selectedAvatarEntity = Object.keys(attachments)[0];
        }

        if (selectedAvatarEntity) {
            var entityProperties = Entities.getEntityProperties(selectedAvatarEntity, [
                'localPosition', 'localRotation', 'dimensions', 'naturalDimensions']);
            properties = {
                position: entityProperties.localPosition,
                rotation: Quat.safeEulerAngles(entityProperties.localRotation),
                scale: entityProperties.dimensions.x / entityProperties.naturalDimensions.x
            };
        }

        tablet.emitScriptEvent(JSON.stringify({
            action: 'update',
            attachments: attachments,
            selectedAvatarEntity: selectedAvatarEntity,
            properties: properties,
            hmdActive: HMD.active
        }));
    };

    var makeClientEntitiesGrabbable = function(grabbable) {
        getAttachedModelEntities().forEach(function(entityID) {
            var properties = Entities.getEntityProperties(entityID, ['clientOnly', 'userData']);
            if (properties.clientOnly) {
                var userData;
                try {
                    userData = JSON.parse(properties.userData);
                } catch (e) {
                    userData = {};
                }

                if (userData.grabbableKey === undefined) {
                    userData.grabbableKey = {};
                }
                userData.grabbableKey.grabbable = grabbable;
                Entities.editEntity(entityID, {userData: JSON.stringify(userData)});
            }
        });        
    };

    var onAddingEntity = function(entityID) {
        if (isEntityBeingWorn(entityID)) {
            sendUpdate();
        }
    };

    var onDeletingEntity = function(entityID) {
        if (lastAttachedEntities.indexOf(entityID) !== -1) {
            sendUpdate();
        }
    };

    var onWebEventReceived = function(data) {
        if (!isAppActive && !isTutorialActive) {
            // ignore web-events when the app and tutorial are inactive
            return;
        }
        var dataObject = JSON.parse(data);
        if (dataObject.action === 'gotIt') {
            switch (activeTutorialURL) {
                case TUTORIAL_URLS.ADJUST:
                    Settings.setValue(SETTING_FIRST_TIME_USE_APP_DESKTOP, false);
                    activateWearApp();
                    break;
                case TUTORIAL_URLS.ADJUST_VR:
                    Settings.setValue(SETTING_FIRST_TIME_USE_APP_VR, false);
                    activateWearApp();
                    break;
                case TUTORIAL_URLS.ATTACH:
                    Settings.setValue(SETTING_STORE_ENTERED_FIRST_TIME, true);
                    tablet.gotoHomeScreen();
                    HMD.closeTablet();
                    break;
                case TUTORIAL_URLS.BUY:
                    tablet.gotoHomeScreen();
                    HMD.closeTablet();
                    break;
            }
            return;
        }
        if (dataObject.action === 'selectedAvatarEntityChanged') {
            selectedAvatarEntity = dataObject.selectedAvatarEntity;
            sendUpdate();
        } else if (dataObject.action === 'appReady') {
            sendUpdate();
        } else if (dataObject.action === 'deleteEntity') {
            Entities.deleteEntity(dataObject.selectedAvatarEntity);
            sendUpdate();
        } else if (dataObject.action === 'propertyUpdate') {
            if (dataObject.position !== undefined) {
                Entities.editEntity(selectedAvatarEntity, {
                    localPosition: dataObject.position
                });
            } else if (dataObject.rotation !== undefined) {
                Entities.editEntity(selectedAvatarEntity, {
                    localRotation: Quat.fromVec3Degrees(dataObject.rotation)
                });
            } else if (dataObject.scale !== undefined) {
                var naturalDimensions = Entities.getEntityProperties(selectedAvatarEntity,
                    'naturalDimensions').naturalDimensions;
                Entities.editEntity(selectedAvatarEntity, {
                    dimensions: Vec3.multiply(naturalDimensions, dataObject.scale)
                });
            }
        }
    };

    var activateWearApp = function() {
        if (isAppActive) {
            // skipping, app is already active
            return;
        }
        tablet.gotoWebScreen(APP_URL);
        button.editProperties({ isActive: true });
        Entities.addingEntity.connect(onAddingEntity);
        Entities.deletingEntity.connect(onDeletingEntity);
        Entities.clickReleaseOnEntity.connect(onClickReleaseOnEntity);
        isAppActive = true;
        if (HMD.active) {
            makeClientEntitiesGrabbable(true);
        }
    };

    var loadTutorial = function(tutorialURL) {
        activeTutorialURL = tutorialURL;
        tablet.gotoWebScreen(activeTutorialURL);
        isTutorialActive = true;
    };

    var onTabletScreenChanged = function(type, url) {
        if (isAppActive && url !== APP_URL) {
            Entities.addingEntity.disconnect(onAddingEntity);
            button.editProperties({ isActive: false });
            isAppActive = false;
            if (HMD.active) {
                makeClientEntitiesGrabbable(false);
            }
        }
        if (isTutorialActive && url !== activeTutorialURL) {
            isTutorialActive = false;
            activeTutorialURL = null;
        }
    };

    var onClickReleaseOnEntity = function(entityID) {
        if (isEntityBeingWorn(entityID)) {
            selectedAvatarEntity = entityID;
            sendUpdate();
        }
    };

    var onHmdChanged = function() {
        if (isAppActive) {
            sendUpdate();
            makeClientEntitiesGrabbable(HMD.active);
        }
    };

    var onMessageReceived = function(channel, message, sender) {
        if (channel === WEAR_TUTORIAL_CHANNEL && sender === MyAvatar.sessionUUID) {
            if (message === 'storeEnter' && !HMD.active && !hasEnteredStoreForFirstTime()) {
                loadTutorial(TUTORIAL_URLS.ATTACH);
            } else if (message === 'checkoutEnter' && !HMD.active) {
                loadTutorial(TUTORIAL_URLS.BUY);
            }
        }
    };

    Messages.subscribe(WEAR_TUTORIAL_CHANNEL);
    Messages.messageReceived.connect(onMessageReceived);

    HMD.displayModeChanged.connect(onHmdChanged);
    tablet.webEventReceived.connect(onWebEventReceived);
    tablet.screenChanged.connect(onTabletScreenChanged);

    button.clicked.connect(function() {
        if (isAppActive) {
            // skipping, app is already active
            return;
        }

        if (HMD.active && isFirstTimeUseVR()) {
            loadTutorial(TUTORIAL_URLS.ADJUST_VR);
            return;
        }

        if (!HMD.active && isFirstTimeUseDesktop()) {
            loadTutorial(TUTORIAL_URLS.ADJUST);
            return;
        }
        
        activateWearApp();
    });

    var cleanUp = function() {
        tablet.removeButton(button);
        Messages.messageReceived.disconnect(onMessageReceived);
        HMD.displayModeChanged.disconnect(onHmdChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
        tablet.screenChanged.disconnect(onTabletScreenChanged);
        Messages.unsubscribe(WEAR_TUTORIAL_CHANNEL);
        if (isAppActive) {
            if (HMD.active) {
                makeClientEntitiesGrabbable(false);
            }
            Entities.addingEntity.disconnect(onAddingEntity);
            Entities.deletingEntity.disconnect(onDeletingEntity);
            Entities.clickReleaseOnEntity.disconnect(onClickReleaseOnEntity);
        }
    };

    return {
        cleanUp: cleanUp
    };
});
