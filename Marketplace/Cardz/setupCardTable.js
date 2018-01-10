//
//  setupCardTable.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 9/14/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for card table
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals utils,SHOPPING_ENTITIES, TEMPLATES:true */
Script.include(Script.resolvePath("./spawnCardTable.js") + "?" + Date.now());
Script.include(Script.resolvePath("./utils.js") + "?" + Date.now());
TEMPLATES = CARD_ENTITIES.Entities;
//holds temporary templates and position values
var templates;
var objectPosition;
//These variables will be used to store the ids of the objects being spawned
var entityIDs = [];

// Merge two objects into a new object. If a key name appears in both a and b, the value in a will be used.
function mergeObjects(a, b) {
    var objects = {};
    var key;
    for (key in b) {
        objects[key] = b[key];
    }
    for (key in a) {
        objects[key] = a[key];
    }
    return objects;
}

// Spawn an entity from a template.
//
// The overrides can be used to override or add properties in the template. For instance,
// it's common to override the `position` property so that you can set the position
// of the entity to be spawned.
//
// @param {string} templateName The name of the template to spawn
// @param {object} overrides An object containing properties that will override
//                           any properties set in the template.
function spawnTemplate(templateName, overrides) {
    var template = getTemplate(templateName);
    if (template === null) {
        print("ERROR, unknown template name:", templateName);
        return null;
    }
    print("Spawning: ", templateName);
    var properties = mergeObjects(overrides, template);
    return Entities.addEntity(properties);
}

// TEMPLATES contains a dictionary of different named entity templates. An entity
// template is just a list of properties.
//
// @param name Name of the template to get
// @return {object} The matching template, or null if not found
function getTemplate(name) {
    for (var i = 0; i < TEMPLATES.length; ++i) {
        if (TEMPLATES[i].name === name) {
            return TEMPLATES[i];
        }
    }
    return null;
}

function createCardTable() {
    //finds position below your avatar
    var rootPosition = utils.findSurfaceBelowPosition(MyAvatar.position);
    rootPosition.y += .5;

    for (i = 0; i < CARD_ENTITIES.Entities.length; i++) {
        //adds rootPosition to position saved in js file "spawnSetupScriptShopping" to figure out placement of objects
        templates = getTemplate(CARD_ENTITIES.Entities[i].name);
        objectPosition = Vec3.sum(rootPosition, templates.position);
        entityIDs[i] = spawnTemplate(CARD_ENTITIES.Entities[i].name, {
            position: objectPosition
        });
        entityIDs.push(entityIDs[i]);
    }
}

createCardTable();
Script.stop();
