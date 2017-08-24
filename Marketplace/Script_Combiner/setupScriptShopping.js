//
//  setupScriptShopping.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/21/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Sets up objects for script combiner
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals utils,SHOPPING_ENTITIES, TEMPLATES:true */
Script.include('https://hifi-content.s3.amazonaws.com/jedon/Script_Combiner/spawnSetupScriptShopping.js');
Script.include('https://raw.githubusercontent.com/highfidelity/hifi/5b599391952198a2d57b74e78e58450891ef0692/unpublishedScripts/marketplace/shortbow/utils.js');
TEMPLATES = SHOPPING_ENTITIES.Entities;
//holds temporary position values
var tem;
var pos;
//These variables will be used to store the ids of the objects being spawned
var entityIDs = [];

// Merge two objects into a new object. If a key name appears in both a and b, the value in a will be used.
function mergeObjects(a, b) {
    var obj = {};
    var key;
    for (key in b) {
        obj[key] = b[key];
    }
    for (key in a) {
        obj[key] = a[key];
    }
    return obj;
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

function createScriptStand() {
    //finds position below your avatar
    var rootPosition = utils.findSurfaceBelowPosition(MyAvatar.position);
    rootPosition.y += .5;
    
    print(SHOPPING_ENTITIES.Entities[0].name);

    for (i = 0; i < SHOPPING_ENTITIES.Entities.length; i++) {
        //adds rootPosition to position saved in js file "spawnSetupScriptShopping" to figure out placement of objects
        tem = getTemplate(SHOPPING_ENTITIES.Entities[i].name);
        pos = Vec3.sum(rootPosition, tem.position);
        entityIDs[i] = spawnTemplate(SHOPPING_ENTITIES.Entities[i].name, {
            position: pos
        });
        entityIDs.push(entityIDs[i]);
    }
}

createScriptStand();
Script.stop();