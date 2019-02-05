
/*

    Filter for the spot
    filter_spot
    Created by Milad Nazeri on 2019-02-01
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Filter for the spot

*/

// *************************************
// START INIT
// *************************************
// #region INIT

var debug = true;

// Simple logger
function log(message, item) {
    if (!debug) {
        return;
    }
    arguments = Array.prototype.slice.call(arguments).map(function(item){
        return JSON.stringify(item, null, 4) + "\n";
    });
    print("\n$$$LOG$$$\n");
    print.apply(null, arguments);
}

log("V4");

// ENUMS for edit filter type
var ADD = 0;
var EDIT = 1;
var PHYSICS = 2;
var DELETE = 3;


// Properties we are asking for
var PROPERTIES_TO_FILTER = 
    ['name', 'dimensions', 'modelURL', 'script', 'serverScripts', 'textures'];

var DELETE_QUALIFIERS = ['-clone', '-temp'];


// #endregion
// *************************************
// END INIT
// *************************************


// *************************************
// START FILTER_PROPERTY_SETTINGS
// *************************************
// #region FILTER_PROPERTY_SETTINGS


filter.wantsOriginalProperties = PROPERTIES_TO_FILTER; // default: false
filter.wantsZoneProperties = false; // default: false
filter.wantsZoneBoundingBox = true; // default: true
filter.wantsToFilterAdd = true; // default: true
filter.wantsToFilterEdit = true; // default: true
filter.wantsToFilterPhysics = false; // default: true
filter.wantsToFilterDelete = true; // default: true
filter.rejectAll = false; // default: false


// #endregion
// *************************************
// END FILTER_PROPERTY_SETTINGS
// *************************************


// *************************************
// START HANDLERS
// *************************************
// #region HANDLERS


function filterAdd(properties, originalProperties){
    log("FILTER_ADD", "properties:", properties, "originalProperties", originalProperties);
    return false;
}


var MAX_DIMENSION = 3.0;
function filterEdit(properties, originalProperties){
    // log("FILTER_EDIT", "properties:", properties, "originalProperties", originalProperties);
    if (
        properties.name && properties.name !== originalProperties.name ||
        properties.modelURL && properties.modelURL !== originalProperties.modelURL ||
        properties.script && properties.script !== originalProperties.script ||
        properties.serverScripts && properties.serverScripts !== originalProperties.serverScripts ||
        properties.textures && properties.textures !== originalProperties.textures ||
        properties.dimensions && (
            properties.dimensions.x >= MAX_DIMENSION || 
            properties.dimensions.y >= MAX_DIMENSION || 
            properties.dimensions.z >= MAX_DIMENSION
        )
    ){
        // We had a violation.  Returning false
        log("filter edit issue");
        return false;
    }
    // No violation
    return properties;
}


function filterPhysics(properties, originalProperties){
    log("FILTER_PHYSICS", "properties:", properties, "originalProperties", originalProperties);
    return false;
}


function filterDelete(properties, originalProperties){
    // log("FILTER_DELETE", "properties:", properties, "originalProperties", originalProperties);
    var name = originalProperties.name;
    DELETE_QUALIFIERS.forEach(function(qualifier) {
        if (name.indexOf(qualifier) !== -1) {
            log("this is an allowed delete", name);
            return true;
        }
    });
    return false;
}


// #endregion
// *************************************
// END HANDLERS
// *************************************


// *************************************
// START MAIN_FILTER
// *************************************
// #region MAIN_FILTER


// A filter returns either false, true, or the properties to let into the edit
// return false; means you aren't allowing these edits
// return properties; means you are allowing the incoming changes
function filter(properties, filterType, originalProperties) {
    // make arguments an actual array
    switch (filterType) {
        case ADD:
            return filterAdd(properties, originalProperties);
        case EDIT:
            return filterEdit(properties, originalProperties);
        case PHYSICS:
            return filterPhysics(properties, originalProperties);
        case DELETE:
            return filterDelete(properties, originalProperties);
    }
}


// #endregion
// *************************************
// END MAIN_FILTER
// *************************************

