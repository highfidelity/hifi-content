// JangguClone.js
//
// Copyright 2018 High Fidelity, Inc.
// Created by Robin Wilson 7/5/2018
//
// Utilizes InstrumentClone.js constructor to create Janggu that plays when held. 
// 
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function () {

    var clone = Script.require(Script.resolvePath("../InstrumentClone.js"));
    var InstrumentClone = clone.instrumentClone;
    
    var MUSIC_URLS = [
        "Janggu/Sounds/janggu_11_16Bit.wav",
        "Janggu/Sounds/janggu_10_16Bit.wav",
        "Janggu/Sounds/janggu_08_16Bit.wav"
    ];

    var instrument = new InstrumentClone(MUSIC_URLS);

    return instrument;
});
