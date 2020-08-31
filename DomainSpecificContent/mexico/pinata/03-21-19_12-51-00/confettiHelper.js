//
// confettiHelper.js
// A script to define pinata confetti behavior
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

(function() {
    var TIMEOUT = 50;
    return {
        preload: function(entityID) {
            Script.setTimeout(function() {
                Entities.editEntity(entityID, {
                    isEmitting: false,
                    script: ''
                });
            }, TIMEOUT);
        }
    };
});