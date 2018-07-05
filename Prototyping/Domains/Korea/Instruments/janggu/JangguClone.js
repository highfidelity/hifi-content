// Janggu
// Known issue: sometimes does not call the StartNearGrab function
// Fix: grab the instrument again and sounds will play

(function () {

    var clone = Script.require(Script.resolvePath("../InstrumentClone.js"));
    var InstrumentClone = clone.instrumentClone;
    
    var MUSIC_URLS = [
        "janggu/Sounds/janggu_11_16Bit.wav",
        "janggu/Sounds/janggu_10_16Bit.wav",
        "janggu/Sounds/janggu_08_16Bit.wav"
    ];

    var instrument = new InstrumentClone(MUSIC_URLS);

    return instrument;
});
