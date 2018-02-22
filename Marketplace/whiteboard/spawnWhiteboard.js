//  Created by Daniela Fontes (Mimicry) 17/01/2018
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//
var utils = Script.require('./utils.js');
var whiteboardEntities = Script.require('./whiteboardEntities.js');

var WHITEBOARD_FWD_OFFSET = 4;
var WHITEBOARD_UP_OFFSET = 1.28;

var TEMPLATES = whiteboardEntities.WHITEBOARD_ENTITIES.Entities;

/// Spawn an entity from a template.
/// 
/// The overrides can be used to override or add properties in the template. For instance,
/// it's common to override the `position` property so that you can set the position
/// of the entity to be spawned.
/// 
/// @param {string} templateName The name of the template to spawn
/// @param {object} overrides An object containing properties that will override
///                           any properties set in the template.
function spawnTemplate(templateName, overrides) {
    var template = getTemplate(templateName);
    if (template === null) {
        print("ERROR, unknown template name:", templateName);
        return null;
    }
    print("Spawning: ", templateName);
    var properties = utils.mergeObjects(template, overrides);
    return Entities.addEntity(properties);
}

function spawnTemplates(templateName, overrides) {
    var templates = getTemplates(templateName);
    if (template.length === 0) {
        print("ERROR, unknown template name:", templateName);
        return [];
    }

    var spawnedEntities = [];
    for (var i = 0; i < templates.length; ++i) {
        print("Spawning: ", templateName);
        var properties = utils.mergeObjects(templates[i], overrides);
        spawnedEntities.push(Entities.addEntity(properties));
    }
    return spawnedEntities;
}

/// TEMPLATES contains a dictionary of different named entity templates. An entity
/// template is just a list of properties.
/// 
/// @param name Name of the template to get
/// @return {object} The matching template, or null if not found
function getTemplate(name) {
    for (var i = 0; i < TEMPLATES.length; ++i) {
        if (TEMPLATES[i].name === name) {
            return TEMPLATES[i];
        }
    }
    return null;
}
function getTemplates(name) {
    var templates = [];
    for (var i = 0; i < TEMPLATES.length; ++i) {
        if (TEMPLATES[i].name === name) {
            templates.push(TEMPLATES[i]);
        }
    }
    return templates;
}

// Cleanup Whiteboard template data
for (var i = 0; i < TEMPLATES.length; ++i) {
    var template = TEMPLATES[i];

    // Fixup model url
    if (template.type === "Model") {
        var urlParts = template.modelURL.split("/");
        var filename = urlParts[urlParts.length - 1];
        var newURL = Script.resolvePath("models/" + filename);
        print("Updated url", template.modelURL, "to", newURL);
        template.modelURL = newURL;
    }
}

var entityIDs = [];

var whiteboardFrameID = null;
var drawingSurfaceID = null;
var resetButtonID = null;

function createWhiteboard() {
    var rootPosition = utils.utils.findSurfaceBelowPosition(MyAvatar.position);
    rootPosition = Vec3.sum(
        rootPosition, 
        Vec3.multiply(
            WHITEBOARD_UP_OFFSET, 
            Quat.getUp(MyAvatar.orientation)
        )
    );
    rootPosition = Vec3.sum(
        rootPosition, 
        Vec3.multiply(
            WHITEBOARD_FWD_OFFSET, 
            Quat.getFront(MyAvatar.orientation)
        )
    );
    var rootRotation = MyAvatar.orientation;
    // Spawn Whiteboard Frame
    whiteboardFrameID = spawnTemplate("Whiteboard", {
        position: rootPosition,
        rotation: rootRotation,
        compoundShapeURL: Script.resolvePath("models/whiteBoard_collider.obj"),
        script: "",
        serverScripts: Script.resolvePath("whiteboardManagerServer.js")
    });
    entityIDs.push(whiteboardFrameID);


    // Spawn drawing surface
    drawingSurfaceID = spawnTemplate("Whiteboard - Drawing Surface", {
        parentID: whiteboardFrameID
    });
    entityIDs.push(drawingSurfaceID);
    
    var newProperties = {
        rotation: Quat.multiply(rootRotation, Entities.getEntityProperties(drawingSurfaceID, "rotation").rotation)
    };
    Entities.editEntity(drawingSurfaceID, newProperties);

    // Spawn Reset Button
    resetButtonID = spawnTemplate("Whiteboard - Reset Button", {
        parentID: whiteboardFrameID,
        script: Script.resolvePath("resetWhiteBoard.js"),
        userData: JSON.stringify({
            grabbableKey: {
                grabbable: false,
                wantsTrigger: true
            }
        })
    });
    entityIDs.push(resetButtonID);

    newProperties = {
        rotation: Quat.multiply(rootRotation, Entities.getEntityProperties(resetButtonID, "rotation").rotation)
    };
    Entities.editEntity(resetButtonID, newProperties);

}

createWhiteboard();
Script.stop();