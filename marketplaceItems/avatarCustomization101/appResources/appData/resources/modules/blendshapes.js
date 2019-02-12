/* global module */

var BLENDSHAPES = {
    awe: {
        "EyeBlink_L": 0,
        "EyeBlink_R": 0,
        "BrowsU_L": 1,
        "BrowsU_R": 1,
        "JawOpen": 3
    },
    defaults: {
        "EyeBlink_L": 0.00,
        "EyeBlink_R": 0.00,
        "BrowsU_L": 0.00,
        "BrowsU_C": 0.00,
        "JawOpen": 0.00
    },
    angry: {
        "EyeBlink_L": 0.6,
        "EyeBlink_R": 0.6,
        "BrowsU_L": 0,
        "BrowsU_R": 0,
        "JawOpen": 2
    },
    laugh: {
        "EyeBlink_L": 0,
        "EyeBlink_R": 0,
        "BrowsU_L": 1,
        "BrowsU_R": 1,
        "JawOpen": 1.5
    }
};

if (module) {
    module.exports = BLENDSHAPES;
}