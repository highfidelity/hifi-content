//
//  blendshapes.js
//
//  Holds blendshape data for Avatar Customization 101 App
// 
//  Created by Robin Wilson and Mark Brosche 2/20/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


/* global module */

var BLENDSHAPES = {
    awe: {
        "EyeBlink_L": 0,
        "EyeBlink_R": 0,
        "BrowsU_L": 1,
        "BrowsU_R": 1,
        "JawOpen": 3,
        "Sneer": 0
    },
    defaults: {
        "EyeBlink_L": 0.00,
        "EyeBlink_R": 0.00,
        "BrowsU_L": 0.00,
        "BrowsU_R": 0.00,
        "JawOpen": 0.00,
        "Sneer": 0
    },
    angry: {
        "EyeBlink_L": 0,
        "EyeBlink_R": 0,
        "BrowsU_L": 0,
        "BrowsU_R": 0,
        "JawOpen": 0,
        "Sneer": 1
    },
    laugh: {
        "EyeBlink_L": 0,
        "EyeBlink_R": 0,
        "BrowsU_L": 1,
        "BrowsU_R": 1,
        "JawOpen": 1.5,
        "Sneer": 0
    }
};

if (module) {
    module.exports = BLENDSHAPES;
}