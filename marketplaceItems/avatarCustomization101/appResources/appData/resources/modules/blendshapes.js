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