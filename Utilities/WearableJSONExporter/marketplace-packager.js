//
//  marketplace-packager.js
//
//  A utility script for packaging up an item to generate a properly-configured JSON
//  for releasing to Marketplace as a wearable item.
// 
//  Created by Liv Erickson on 11/16/17
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Selection */

(function() {
    var APP_NAME = "WEARPKGR";
    var APP_URL = Script.resolvePath("wearableJSON.html");
    var APP_ICON = Script.resolvePath("icon.png");

    var TIMEOUT = 2000;
    var RETURN_DISTANCE = 1;

    var previousID = 0;
    var listName = "contextOverlayHighlightList";
    var listType = "entity";

    var entityIDToExport = "";

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');  

    function handleMousePress(entityID) {
        if (previousID !== entityID) {
            Selection.addToSelectedItemsList(listName, listType, entityID);
            previousID = entityID;
        }
        tablet.emitScriptEvent(entityID);
    }

    function handleMouseLeave(entityID) {
        if (previousID !== 0) {
            Selection.removeFromSelectedItemsList("contextOverlayHighlightList", listType, previousID);
            previousID = 0;
        }
    }

    var baseUserdata = {
        Attachment: {
            action: "attach",
            joint: "Hips",
            attached: false,
            options: {
                translation: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                scale: 1
            }
        },
        grabbableKey: {
            cloneable: false,
            grabbable: true
        }
    };

    var exportProperties = {
        type: "Model",
        parentID: "{00000000-0000-0000-0000-000000000001}",
        owningAvatarID: "{00000000-0000-0000-0000-000000000000}",
        visible: true,
        shapeType: "box",
        collidesWith: "",
        collisionMask: 0
    };

    var button = tablet.addButton({
        text: APP_NAME,
        icon: APP_ICON
    });

    
    function maybeExited() {
        Entities.clickReleaseOnEntity.disconnect(handleMousePress);
        Entities.hoverLeaveEntity.disconnect(handleMouseLeave);
        tablet.screenChanged.disconnect(maybeExited);
    }

    function clicked() {
        tablet.gotoWebScreen(APP_URL);
        Entities.clickReleaseOnEntity.connect(handleMousePress);
        Entities.hoverLeaveEntity.connect(handleMouseLeave);
        Script.setTimeout(function() {
            tablet.screenChanged.connect(maybeExited); 
        }, TIMEOUT);
    }
    button.clicked.connect(clicked);

    function onFileSaveChanged(filename) {
        Window.saveFileChanged.disconnect(onFileSaveChanged);
        if (filename !== "") {
            var success = Clipboard.exportEntities(filename, [entityIDToExport]);
            if (!success) {
                // No luck, failed
                print("Failed to export json");
            }
        }
    }

    function onWebEventReceived(event) {
        if (typeof(event) === "string") {
            event = JSON.parse(event);
        }
        if (event.type === "move-entity") {
            Entities.editEntity(event.entityID, {
                "parentID" : MyAvatar.sessionUUID,
                "parentJointIndex" : MyAvatar.getJointIndex(event.joint),
                "position" : MyAvatar.getJointPosition(event.joint)
            });
        }
        if (event.type === "submit" && event.app === "JSON") {
            tablet.emitScriptEvent("hide-warning");
            var entityID = event.entityID;
            // Collect the rest of the properties we want
            var newExportProperties = exportProperties;
            var newUserDataProperties = baseUserdata;
            
            // Confirm we have a valid joint 
            var joint = event.joint;
            if (joint === null) {
                tablet.emitScriptEvent("display-warning-joint-selection");
                return;
            }
            if (joint.indexOf("Left") !== -1) {
                newUserDataProperties.Attachment.joint = "[LR]" + joint.substring(4);
            } else if (joint.indexOf("Right") !== -1) {
                newUserDataProperties.Attachment.joint = "[LR]" + joint.substring(5);
            } else {
                newUserDataProperties.Attachment.joint = joint;
            }
            

            var properties = Entities.getEntityProperties(entityID, ['modelURL', 'dimensions', 'script', 'localPosition', 'localRotation']);
            newExportProperties.modelURL = properties.modelURL;

            if ( newExportProperties.modelURL === undefined || newExportProperties.modelURL.indexOf("mpassets") === -1 ) {
                tablet.emitScriptEvent("display-warning-modelURL");
            } else {

                newExportProperties.dimensions = properties.dimensions;
                newExportProperties.localDimensions = properties.localDimensions;
                newExportProperties.parentJointIndex = MyAvatar.jointNames.indexOf(joint);
                newExportProperties.script = properties.script;
                newExportProperties.localPosition = properties.localPosition;
                newExportProperties.localRotation = properties.localRotation;

                newExportProperties.userData = JSON.stringify(newUserDataProperties);
    
                entityIDToExport = Entities.addEntity(newExportProperties, true);
                Window.saveFileChanged.connect(onFileSaveChanged);
                Window.saveAsync("Select Where to Save", "", "*.json");
                Window.saveFileChanged.connect(function() {
                    Entities.deleteEntity(entityIDToExport);
                    Entities.editEntity(entityID, {
                        'parentID': "{00000000-0000-0000-0000-000000000000}",
                        'position' : Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), RETURN_DISTANCE))
                    });
                });
            } 
        }
    }
    tablet.webEventReceived.connect(onWebEventReceived);

    function cleanup() {
        tablet.removeButton(button);
        Entities.clickReleaseOnEntity.disconnect(handleMousePress);
        Entities.hoverLeaveEntity.disconnect(handleMouseLeave);
        tablet.screenChanged.disconnect(maybeExited);
    }

    Script.scriptEnding.connect(cleanup);
}());
