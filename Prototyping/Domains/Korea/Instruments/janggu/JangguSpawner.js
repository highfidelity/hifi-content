(function () {
    
    var spawner = Script.require(Script.resolvePath("../InstrumentSpawner.js"));
    var InstrumentSpawner = spawner.instrumentSpawner;

    var NAME = "Janggu";
    var MODEL_URL = "https://hifi-content.s3.amazonaws.com/jimi/environment/2018_Korea/janggu.fbx";
    var DIMENSIONS = {
        x: 0.2150,
        y: 0.2171,
        z: 0.2150
    }
    var CLONE_LIFETIME = 18;
    var SCRIPT_URL = Script.resolvePath("JangguClone.js?v1" + Math.random());

    var janggu = {
        name: NAME,
        modelURL: MODEL_URL,
        dimensions: DIMENSIONS,
        cloneLifetime: CLONE_LIFETIME,
        scriptURL: SCRIPT_URL
    };

    var jangguSpawner = new InstrumentSpawner(janggu);
    jangguSpawner.createSpawner();

})();