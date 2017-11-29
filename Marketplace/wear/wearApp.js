//
//  wearApp.js
//
//  Created by Thijs Wenker on 11/17/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    var APP_NAME = "WEAR";
    var WEAR_TUTORIAL_CHANNEL = 'com.highfidelity.wear.tutorialChannel';
    var HTML_PATH = Script.resolvePath("html");
    var APP_URL = HTML_PATH + "/wearApp.html";
    var APP_ICON = HTML_PATH + "/img/WearAppIconWhite.svg";
    var ATTACHMENT_SEARCH_RADIUS = 100; // meters (just in case)

    var SETTING_STORE_ENTERED_FIRST_TIME = 'com.highfidelity.wear.storeEnteredFirstTime';
    var SETTING_FIRST_TIME_USE_APP = 'com.highfidelity.wear.firstTimeUseApp';

    var isAppActive = false;
    var selectedAvatarEntity = null;

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var button = tablet.addButton({
        text: APP_NAME,
        icon: APP_ICON
    });

    var isEntityBeingWorn = function(entityID) {
        return Entities.getEntityProperties(entityID, 'parentID').parentID === MyAvatar.sessionUUID;
    };

    var hasEnteredStoreForFirstTime = function() {
        return Settings.getValue(SETTING_STORE_ENTERED_FIRST_TIME, false);
    };

    var isFirstTimeUse = function() {
        return Settings.getValue(SETTING_FIRST_TIME_USE_APP, true);
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
        getAttachedModelEntities().forEach(function(entityID) {
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
        if (Object.keys(attachments).length > 0 && (selectedAvatarEntity === null || selectedAvatarEntity === '')) {
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

    var onAddingEntity = function(entityID) {
        if (isEntityBeingWorn(entityID)) {
            sendUpdate();
        }
    };

    var onWebEventReceived = function(data) {
        var dataObject = JSON.parse(data);
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

    var onTabletScreenChanged = function(type, url) {
        if (isAppActive && url !== APP_URL) {
            tablet.screenChanged.disconnect(onTabletScreenChanged);
            Entities.addingEntity.disconnect(onAddingEntity);
            isAppActive = false;
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
        }
    };

    var onMessageReceived = function(channel, message, sender) {
        if (channel === WEAR_TUTORIAL_CHANNEL && sender === MyAvatar.sessionUUID) {
            if (message === 'storeEnter' && !HMD.active) {
                // display tutorial
            } else if (message === 'checkoutEnter') {

            }
        }
    };

    Messages.subscribe(WEAR_TUTORIAL_CHANNEL);
    Messages.messageReceived.connect(onMessageReceived);

    HMD.displayModeChanged.connect(onHmdChanged);


    button.clicked.connect(function() {
        if (isAppActive) {
            // skipping, app is already active
            return;
        }
        tablet.screenChanged.connect(onTabletScreenChanged);
        tablet.gotoWebScreen(APP_URL);
        tablet.webEventReceived.connect(onWebEventReceived);
        Entities.addingEntity.connect(onAddingEntity);
        Entities.clickReleaseOnEntity.connect(onClickReleaseOnEntity);
        isAppActive = true;
    });

    Script.scriptEnding.connect(function() {
        tablet.removeButton(button);
        Messages.messageReceived.disconnect(onMessageReceived);
        HMD.displayModeChanged.disconnect(onHmdChanged);
        Messages.unsubscribe(WEAR_TUTORIAL_CHANNEL);
        if (isAppActive) {
            tablet.screenChanged.disconnect(onTabletScreenChanged);
            Entities.addingEntity.disconnect(onAddingEntity);
            Entities.clickReleaseOnEntity.disconnect(onClickReleaseOnEntity);
        }
    });
})();
