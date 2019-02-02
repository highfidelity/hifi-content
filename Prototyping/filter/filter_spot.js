
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


// Simple logger
function l(message, item) {
    print("\n$$$LOG$$$\n")
    print(message);
    print(JSON.stringify(item));
}

l("V1");

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
filter.wantsToFilterPhysics = true; // default: true
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

function argLog(){
    arguments = Array.prototype.slice.call(arguments);
    arguments.forEach(function(arg, index){
        l(index, arg);
    });
}

function filterAdd(properties, filterType, originalProperties){
    argLog(properties, filterType, originalProperties);
    return false;
}


var MAX_DIMENSION = 3.0;
function filterEdit(properties, filterType, originalProperties){
    argLog(properties, filterType, originalProperties);
    if (
        properties.name !== originalProperties.name ||
        properties.modelURL !== originalProperties.modelURL ||
        properties.script !== originalProperties.script ||
        properties.serverScripts !== originalProperties.serverScripts ||
        properties.textures !== originalProperties.textures ||
        properties.dimensions.x >= MAX_DIMENSION || 
        properties.dimensions.y >= MAX_DIMENSION || 
        properties.dimensions.z >= MAX_DIMENSION
    ){
        // We had a violation.  Returning false
        return false;
    }
    // No violation
    return properties;
}


function filterPhysics(properties, filterType, originalProperties){
    argLog(properties, filterType, originalProperties);
    return false;

}


function filterDelete(properties, filterType, originalProperties){
    argLog(properties, filterType, originalProperties);
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
    arguments = Array.prototype.slice.call(arguments);
    switch (filterType) {
        case ADD:
            return filterAdd.apply(this, arguments);
        case EDIT:
            return filterEdit.apply(this, arguments);
        case PHYSICS:
            return filterPhysics.apply(this, arguments);
        case DELETE:
            return filterDelete.apply(this, arguments);
    }
}


// #endregion
// *************************************
// END MAIN_FILTER
// *************************************

