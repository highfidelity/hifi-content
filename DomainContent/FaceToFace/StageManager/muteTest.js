//
//  muteTest.js
//
//  Created by Rebecca Stankus on 06/21/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global AccountServices */

(function() {

    var ignore;

    if (AccountServices.username === "Philip" || AccountServices.username === "theextendedmind" || 
        Audio.muted) {
        ignore = true;
    }

    if (!ignore) {
        Audio.muted = true;
    }
    
    this.unload = function() {
        if (!ignore) {
            Audio.muted = false;
        }
    };
});
