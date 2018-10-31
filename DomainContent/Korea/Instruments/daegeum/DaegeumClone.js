// DaegeumClone.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Utilizes InstrumentClone.js constructor to create Daegeum that plays when held. 
// 
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {

    var clone = Script.require(Script.resolvePath("../InstrumentClone.js"));
    var InstrumentClone = clone.instrumentClone;

    var MUSIC_URLS = [
        "Daegeum/Sounds/chung_sung_gok_1.wav",
        "Daegeum/Sounds/chung_sung_gok_2.wav",
        "Daegeum/Sounds/chung_sung_gok_3.wav",
        "Daegeum/Sounds/chung_sung_gok_4.wav"
    ];

    var instrument = new InstrumentClone(MUSIC_URLS);

    return instrument;
});
