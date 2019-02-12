/* global module */

var BLENDSHAPES = {
    awe: {
        "EyeBlink_L": 0.30,
        "EyeBlink_R": 0.30,
        "BrowsU_L": 0.00,
        "BrowsU_C": 0.00,
        "JawOpen": 0.00
    },
    defaults: {
        "EyeBlink_L": 0.00,
        "EyeBlink_R": 0.00,
        "BrowsU_L": 0.00,
        "BrowsU_C": 0.00,
        "JawOpen": 0.00
    },
    angry: {
        "EyeBlink_L": 0.00,
        "EyeBlink_R": 0.00,
        "BrowsU_L": 0.00,
        "BrowsU_C": 0.00,
        "JawOpen": 0.00
    },

    laugh: {
        "EyeBlink_L": 0.45,
        "EyeBlink_R": 0.45,
        "BrowsU_L": 0.00,
        "BrowsU_C": 0.50,
        "JawOpen": 0.50
    }
};

if (module) {
    module.exports = BLENDSHAPES;
}
