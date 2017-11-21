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

(function(){
    var APP_NAME = "WEARPKGR";
    var APP_URL = Script.resolvePath("app.html");
    var APP_ICON = Script.resolvePath("icon.png");

    var prevID = 0;
    var listName = "contextOverlayHighlightList";
    var listType = "entity";

    var entityIDToExport = "";

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');    

    function handleMousePress(entityID) {
        if (prevID !== entityID) {
            Selection.addToSelectedItemsList(listName, listType, entityID);
            prevID = entityID;
        }
        tablet.emitScriptEvent(entityID);
    }

    function handleMouseLeave(entityID) {
        if (prevID !== 0) {
            Selection.removeFromSelectedItemsList("contextOverlayHighlightList", listType, prevID);
            prevID = 0;
        }
    }

    var baseUserdata = {
        "Attachment": {
            "action": "attach",
            "joint": "Hips",
            "attached" : false,
            "options": {
                "translation": {
                    "x": 0,
                    "y": 0,
                    "z": 0
                },
                "scale": 1
            }
        },
        "grabbableKey": {
            "cloneable": false,
            "grabbable": true
        }
    };

    var exportProperties = {
        type: "Model",
        clientOnly: 1,
        parentID: "{00000000-0000-0000-0000-000000000001}",
        owningAvatarID: "{00000000-0000-0000-0000-000000000000}",
        visible: 1,
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

    function clicked(){
        tablet.gotoWebScreen(APP_URL);
        Entities.clickReleaseOnEntity.connect(handleMousePress);
        Entities.hoverLeaveEntity.connect(handleMouseLeave);
        Script.setTimeout(function(){
            tablet.screenChanged.connect(maybeExited); 
        }, 2000);
    }
    button.clicked.connect(clicked);

    function onFileSaveChanged(filename){
        Window.saveFileChanged.disconnect(onFileSaveChanged);
        if (filename !== "") {
            var success = Clipboard.exportEntities(filename, [entityIDToExport]);
            if (!success) {
                // No luck, failed
            }
        }
        Entities.deleteEntity(entityIDToExport);                        
    }

    function onWebEventReceived(event){
        if (typeof(event) === "string") {
            event = JSON.parse(event);
        }
        if (event.type === "submit") {
            var entityID = event.entityID;
            var joint = event.joint;

            var newExportProperties = exportProperties;
            var newUserDataProperties = baseUserdata;
    
            var properties = Entities.getEntityProperties(entityID, ['modelURL', 'dimensions', 'script']);

            newUserDataProperties["Attachment"].joint = joint;
            
            newExportProperties.modelURL = properties.modelURL;
            newExportProperties.dimensions = properties.dimensions;
            newExportProperties.parentJointIndex = MyAvatar.jointNames.indexOf(joint);
            newExportProperties.script = properties.script;
            newExportProperties.userData = JSON.stringify(newUserDataProperties);

            entityIDToExport = Entities.addEntity(newExportProperties, 1);
            Window.saveFileChanged.connect(onFileSaveChanged);
            Window.saveAsync("Select Where to Save", "", "*.json");
            Script.setTimeout(function(){
                Entities.deleteEntity(entityIDToExport);
            }, 20000); 
        }
    }

    tablet.webEventReceived.connect(onWebEventReceived);

    function cleanup(){
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(cleanup);
}());