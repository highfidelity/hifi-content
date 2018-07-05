(function () {
    
    var spawner = Script.require(Script.resolvePath("../InstrumentSpawner.js"));
    var InstrumentSpawner = spawner.instrumentSpawner;

    var NAME = "Daegeum";
    var MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/daegeum.fbx";
    var DIMENSIONS = {
        x: 0.0495,
        y: 1.0530,
        z: 0.0522
    }
    var CLONE_LIFETIME = 17;
    var SCRIPT_URL = Script.resolvePath("DaegeumClone.js?v1" + Math.random());

    var daegeum = {
        name: NAME,
        modelURL: MODEL_URL,
        dimensions: DIMENSIONS,
        cloneLifetime: CLONE_LIFETIME,
        scriptURL: SCRIPT_URL
    };

    var daegeumSpawner = new InstrumentSpawner(daegeum);
    daegeumSpawner.createSpawner();

})();