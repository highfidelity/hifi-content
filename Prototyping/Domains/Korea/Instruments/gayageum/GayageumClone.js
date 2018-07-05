// Gayageum
// Known issue: sometimes does not call the StartNearGrab function
// Fix: grab the instrument again and sounds will play

(function () {

    var clone = Script.require(Script.resolvePath("../InstrumentClone.js"));
    var InstrumentClone = clone.instrumentClone;
    
    var MUSIC_URLS = [
        "gayageum/Sounds/gayageum1.wav",
        "gayageum/Sounds/gayageum2.wav",
        "gayageum/Sounds/gayageum3.wav"
    ];

    var instrument = new InstrumentClone(MUSIC_URLS);

    return instrument;
});
