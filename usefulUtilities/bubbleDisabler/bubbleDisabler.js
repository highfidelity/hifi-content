//
//  bubbleDisabler.js
//
//  Created by Preston Bezos on 2019-06-05
//  Copyright 2019 High Fidelity, Inc.
//
//  See accompanying README.md for usage instructions.
// 
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function () {

    var BubbleDisabler = function() {};

    var enableOnUnload = false;

    BubbleDisabler.prototype = {
        preload: function (id) {
           if (Users.getIgnoreRadiusEnabled()) {
               Users.disableIgnoreRadius();
               enableOnUnload = true;
           }
        },

        unload: function() {
            if (enableOnUnload) {
                Users.enableIgnoreRadius();
                enableOnUnload = false;
            }
        }
    };

    return new BubbleDisabler();
});
