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
    var DO_NOT_MUTE = ['philip', 'theextendedmind'];

    var ignore;

    if ( DO_NOT_MUTE.includes(AccountServices.username) || Audio.muted) {
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
