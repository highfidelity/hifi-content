//
// zombiePositions.js
// A library with functions that access the JSON containing zombie
// positions
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//
/* globals module */

module.exports = {
    positions: {
        Red: {
            1: {
                x: -9,
                y: -10,
                z: 16.5 
            },
            2: {
                x: -22.5,
                y: -5,
                z: -32
            },
            3: {
                x: -21,
                y: -10,
                z: 5
            },
            4: {
                x: -13,
                y: -10,
                z: -19
            },
            5: {
                x: 35,
                y: -4,
                z: -45
            },
            readable: {
                1: "Starting Bus",
                2: "Dumpster",
                3: "Bus",
                4: "Flipped over car",
                5: "Plateau"
            }
        }, 
        Orange: {
            1: {
                x: -37,
                y: -10,
                z: -18
            }, 
            2: {
                x: 3,
                y: -6,
                z: -33
            },
            3: {
                x: -28,
                y: -10.5, 
                z: -29
            },
            4: {
                x: 2,
                y: -7,
                z: -28
            },
            5: {
                x: 27,
                y: -2.5,
                z: -41
            },
            readable: {
                1: "Exit",
                2: "Cubby by Door",
                3: "Left Boardwalk",
                4: "Up the hill",
                5: "Plateau"
            }
        },
        Yellow: {
            1: {
                x: 27,
                y: -7,
                z: -15.5
            },
            2: { 
                x: 3.5,
                y: -9,
                z: -20.5
            },
            3: { 
                x: -19,
                y: -10,
                z: 25
            },
            4: {
                x: -11,
                y: -5,
                z: -33
            },
            5: {
                x: 25,
                y: -8,
                z: -3
            },
            readable: {
                1: "Ramp",
                2: "Bull statue",
                3: "Sidewalk boardwalk",
                4: "Generator",
                5: "With mannequins"
            }
        },
        Green : {
            1: {
                x: -53.5,
                y: -1.5,
                z: -70
            },
            2: {
                x: -11,
                y: -10,
                z: -12
            },
            3: {
                x: -27,
                y: -10,
                z: 5
            },
            4: {
                x: -35,
                y: -4,
                z: -33.5
            },
            5: {
                x: 8,
                y: -9,
                z: 23
            },
            readable: {
                1: "Gate",
                2: "Trash and Tires",
                3: "Gas Main",
                4: "Generator",
                5: "Boardwalk, near tires/bus"
            }
        },
        Blue: {
            1: {
                x: -31.5,
                y: 2,
                z: -63.5
            },
            2: {
                x: -24,
                y: -10,
                z: 5
            },
            3: {
                x: -27,
                y: -10,
                z: 5
            },
            4: {
                x: -31.5,
                y: 2,
                z: -69
            },
            5: {
                x: -9,
                y: -10,
                z: 16.5
            },
            readable : {
                1: "Phase 4",
                2: "Bus",
                3: "Gas Main",
                4: "Tree",
                5: "Boardwalk by bus"
            }
        },
        Purple: {
            1: {
                x: -44.5,
                y: -4,
                z: -43.5
            },
            2: {
                x: -23,
                y: -10,
                z: 8
            },
            3: {
                x: 2,
                y: -7,
                z: -28
            },
            4: {
                x: -31.5,
                y: 2,
                z: -69
            },
            5: {
                x: -9,
                y: -10,
                z: 16.5
            },
            readable : {
                1: "Car",
                2: "Bus",
                3: "Gate",
                4: "Bush",
                5: "Boardwalk"
            }
        }
    },

    getPosition: function(color, number, library) {
        if (color in library) {
            var colorJSON = library[color];
            if (number in colorJSON) {
                return colorJSON[number];
            }
            print("number not in specified color");
            return null;
        } else {
            print("Unable to locate position");
            return null;
        }
    }
};
