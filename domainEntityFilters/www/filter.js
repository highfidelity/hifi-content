//
//  filter.js
//
//  Created by Zach Fox on 2019-06-07
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


function filterAdd(properties, originalProperties) {
    if (originalProperties.name.indexOf("Whiteboard") > -1) {
        return properties;
    }

    return false;
}


function filterEdit(properties, originalProperties) {
    if (originalProperties.name.indexOf("Whiteboard") && properties.name === originalProperties.name) {
        return properties;
    } else if (properties.privateUserData) {
        var retProps = {
            privateUserData: properties.privateUserData
        }
        return retProps;
    }

    return false;
}


function filterDelete(properties, originalProperties) {
    if (originalProperties.name.indexOf("Whiteboard") > -1) {
        return properties;
    }

    return false;
}


var FILTER_TYPE_ADD = 0;
var FILTER_TYPE_EDIT = 1;
var FILTER_TYPE_PHYSICS = 2;
var FILTER_TYPE_DELETE = 3;
function filter(properties, filterType, originalProperties) {
    switch (filterType) {
        case ADD:
            return filterAdd(properties, originalProperties);
        case EDIT:
            return filterEdit(properties, originalProperties);
        case PHYSICS:
            return false;
        case DELETE:
            return filterDelete(properties, originalProperties);
    }

    return properties;
}


var ORIGINAL_PROPERTIES_TO_GET = ['name'];
filter.wantsOriginalProperties = ORIGINAL_PROPERTIES_TO_GET;
filter.wantsZoneProperties = false; // For this filter, we don't need any zone properties.
filter.wantsZoneBoundingBox = false;
filter.wantsToFilterAdd = true;
filter.wantsToFilterEdit = true;
filter.wantsToFilterPhysics = true;
filter.wantsToFilterDelete = true;
// If `filter.rejectAll` is `true`, all changes that correspond to a `filterType` will be rejected by the Entity Server.
filter.rejectAll = false;
