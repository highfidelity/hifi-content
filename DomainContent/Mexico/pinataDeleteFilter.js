// // pinataDeleteFilter.js
// 
// Created by Brad Hefta-Gaub to use Entities on Jan. 25, 2018
// Edited by Elisa Lupin-Jimenez for the pinata in hifi://Mexico
// Copyright 2018 High Fidelity, Inc.
//
// This entity edit filter script will get all edits, adds, physcis, and deletes, but will only block
// deletes, and will pass through all others.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// FIXME: FILTERS AREN'T WORKING AS OF 4-26-2018
// see https://github.com/highfidelity/hifi/pull/11997 for info on using filters 
//

function filter(properties, type, originalProperties) {

    var SAVED_ENTITY_NAMES = [
        "Pinata",
        "Invisible Pinata",
        "Pinata Pole",
        "Pinata Paddle"
    ];

    if (type === Entities.DELETE_FILTER_TYPE) {
        if (SAVED_ENTITY_NAMES.indexOf(originalProperties.name) !== -1) {
            return false;
        }
    }
    return properties;
}

filter.wantsToFilterAdd = false; // don't run on adds
filter.wantsToFilterEdit = false; // don't run on edits
filter.wantsToFilterPhysics = false; // don't run on physics
filter.wantsToFilterDelete = true; // do run on deletes
filter.wantsOriginalProperties = "name";
filter;