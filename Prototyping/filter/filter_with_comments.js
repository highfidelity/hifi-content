
/*

    filter
    filter.js
    Created by Milad Nazeri on 2019-01-31
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    File to help make future filters

*/

// If a function is given, but no found, it will reject all edits for those without lock rights

// Filters are a just a function that takes 3 parameters, 
// properties: the properties coming in for the edit
// filtertype: What kind of event is being filtered.  This is an enumeration, see the types below
// originalProperties: if the original properties were given(see notes below), then these are in this value

// Filter Types
var ADD = 0;
var EDIT = 1;
var PHYSICS = 2;
var DELETE = 3;

/*
    Common properties

    dimensions
    velocity
    visible
    rotation
    gravity
    acceleration
    damping
    color
    modelURL
    text
    lifespan
    isEmitting
    emitRate
    userData
    textures
    locked
    script
    serverScripts
*/

// c++ args :: inputValues, filterType, currentValues
// aka properties, filterType, originalProperties

// A filter returns either false, true, or the properties to let into the edit
// return false; means you aren't allowing these edits
// return properties; means you are allowing the incoming changes
function filter(properties, filterType, originalProperties) {
    switch(filterType){
        case ADD:
            return filterAdd(properties, filterType, originalProperties);
        case EDIT:
            return filterEdit(properties, filterType, originalProperties);
        case PHYSICS:
            return filterPhysics(properties, filterType, originalProperties);
        case DELETE:
            return filterDelete(properties, filterType, originalProperties);
    }
}

// PROPERTIES
// Besides creating the filter, there are some properties that define what gets filtered, and what properties get passed in

// Includes the properties before a change in the callback
// true will include all original properties
// false includes no properties at all
// empty string includes no properties at all
// a valid property in a string includes just that property
// an array of property strings will include those properties
// Note, if this is an Add or Delete, there will be no originalProperties
filter.wantsOriginalProperties = false; // default: false

// Same as the above but specific to zones
filter.wantsZoneProperties = false; // defaul: false

// Gets bounding box info.  Assuming this is to see if an entity is within a zone's volume?
filter.wantsZoneBoundingBox = true; // defaul: true


// The different types of filters
// Add - You are creating a new entity
// Edit - you are editing an entity that exists
// Physics - you are transforming the entity in world
// Delete - you are removing the entity
filter.wantsToFilterAdd = true; // defaul: true
filter.wantsToFilterEdit = true; // defaul: true
filter.wantsToFilterPhysics = true; // defaul: true
filter.wantsToFilterDelete = true; // defaul: true

// If reject all is true.  Any of the filterType changes won't go through
filter.rejectAll = false; // defaul: false
