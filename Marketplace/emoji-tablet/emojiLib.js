//
// emojiLib.js
// A library of JSON links for emojis
// 
// Author: Elisa Lupin-Jimenez
// Copyright High Fidelity 2017
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
// All assets are under CC Attribution Non-Commerical
// http://creativecommons.org/licenses/
//

/* globals module */
module.exports = {

    emojiLib: {
        corn: Script.resolvePath("JSON_files/corn.json"),
        flower: Script.resolvePath("JSON_files/flower.json"),
        heart: Script.resolvePath("JSON_files/heart.json"),
        monster: Script.resolvePath("JSON_files/monster.json"),
        pickle: Script.resolvePath("JSON_files/pickle.json"),
        pizza: Script.resolvePath("JSON_files/pizza.json"),
        poo: Script.resolvePath("JSON_files/poo.json")
    },

    getEmoji: function(name, library) {
        print("Emoji to retrieve: " + name);
        if (name in library) {
            return library[name];
        } else {
            print("Unable to locate emoji");
            return null;
        }
    }

};