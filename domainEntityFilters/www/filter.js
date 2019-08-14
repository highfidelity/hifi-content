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


function filterAdd(properties) {
    if (properties.name.indexOf("Whiteboard") > -1) {
        return properties;
    }

    return false;
}


function filterEdit(properties, originalProperties) {
    if (originalProperties.name.indexOf("Whiteboard") > -1) {
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
    // Somehow, the entity server can get here in the filter logic and not have a defined
    // `originalProperties` argument.
    // To be safe, let's return the target properties IF EITHER:
    //     1. The `originalProperties` argument is falsey AND the `properties` argument is valid.
    //     OR
    //     2. The `originalProperties.name` string contains "Whiteboard".
    if ((!originalProperties && properties) || originalProperties.name.indexOf("Whiteboard") > -1) {
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
        case FILTER_TYPE_ADD:
            return filterAdd(properties);
        case FILTER_TYPE_EDIT:
            return filterEdit(properties, originalProperties);
        case FILTER_TYPE_PHYSICS:
            return false;
        case FILTER_TYPE_DELETE:
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
