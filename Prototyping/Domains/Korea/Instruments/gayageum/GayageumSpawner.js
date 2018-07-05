(function () {
    
    var spawner = Script.require(Script.resolvePath("../InstrumentSpawner.js"));
    var InstrumentSpawner = spawner.instrumentSpawner;

    var NAME = "Gayageum";
    var MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/gayageum.fbx";
    var DIMENSIONS = {
        x: 0.3526,
        y: 0.1614,
        z: 1.6474
    }
    var CLONE_LIFETIME = 18;
    var SCRIPT_URL = Script.resolvePath("GayageumClone.js?v1" + Math.random());

    var gayageum = {
        name: NAME,
        modelURL: MODEL_URL,
        dimensions: DIMENSIONS,
        cloneLifetime: CLONE_LIFETIME,
        scriptURL: SCRIPT_URL
    };

    var gayageumSpawner = new InstrumentSpawner(gayageum);
    gayageumSpawner.createSpawner();

})();