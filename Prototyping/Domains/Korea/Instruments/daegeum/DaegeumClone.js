
// Known issue: sometimes does not call the StartNearGrab function
// Fix: grab the instrument again and sounds will play

(function () {

    var clone = Script.require(Script.resolvePath("../InstrumentClone.js"));
    var InstrumentClone = clone.instrumentClone;

    var MUSIC_URLS = [
        "daegeum/Sounds/chung_sung_gok_1.wav",
        "daegeum/Sounds/chung_sung_gok_2.wav",
        "daegeum/Sounds/chung_sung_gok_3.wav",
        "daegeum/Sounds/chung_sung_gok_4.wav"
    ];

    var instrument = new InstrumentClone(MUSIC_URLS)

    return instrument;
});
