// filter-spot.js
// A domain filter for The Spot domain
//
// Created by Liv Erickson on 05/14/2018
// Copyright 2018 High Fidelity, Inc.
// 
// Distributed under the Apache License, Version 2.0
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

function l(item) {
    print("\n\n$$$LOG$$$\n\n")
    print(JSON.stringify(item));
}
l("### TEST FILTER 002")

function filter(properties, filterType, originalProperties) {
    l(arguments);
    l("properties")
    l(properties)
    l("filterType")
    l(filterType)
    l("originalProperties")
    l(originalProperties)


    var WANT_DEBUG = true;
    var DELETE_QUALIFIERS = ['-clone', '-temp'];

    var SCRIPT_WHITE_LIST = ["https://cdn.highfidelity.com/DomainContent/production/rust/scripts/swallowFXPill.js"];

    if (filterType === Entities.DELETE_FILTER_TYPE) {
        var name = originalProperties.name;
        var allowDelete = false;
        if (WANT_DEBUG) {
            print ("Filter: The name of the property being deleted is: " + name);
        }
        DELETE_QUALIFIERS.forEach(function(qualifier) {
            if (name.indexOf(qualifier) !== -1) {
                if (WANT_DEBUG) {
                    print ("Filter: This is an allowed removal");
                }
                allowDelete = true;
            }
        });
        
        if (!allowDelete) {
            return false;
        }
        return properties; // do not delete anything without clone or temp in the name
    }
    if (filterType === Entities.EDIT_FILTER_TYPE) {
        if (properties.name && properties.name !== originalProperties.name ||
            properties.modelURL && properties.modelURL!== originalProperties.modelURL ||
            properties.script && properties.script !== originalProperties.script ||
            properties.serverScripts && properties.serverScripts !== originalProperties.serverScripts ||
            properties.textures && properties.textures !== originalProperties.textures || 
            properties.dimensions && (properties.dimensions.x >= 3.0 || 
                                      properties.dimensions.y >= 3.0 || 
                                      properties.dimensions.z >= 3.0)) {
            if (WANT_DEBUG) {
                print("Filter violation: " + JSON.stringify(properties) + " contains an invalid property change");
            }
            return false;
        }
    }
    return properties;
}

filter.wantsToFilterAdd = true;
filter.wantsToFilterEdit = true;
filter.wantsToFilterPhysics = false;
filter.wantsToFilterDelete = true;
filter.wantsOriginalProperties = ['name', 'dimensions', 'modelURL', 'script', 'serverScripts', 'textures'];
filter;
