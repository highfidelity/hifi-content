(function(){

    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    var musicCollection = Script.require("../modules/collection_music");
    var sfxCollection = Script.require("../modules/collection_sfx");
    var textureCollection = Script.require("../modules/collection_textures");
    
    common = Script.require("./modules/common.js")
    randomInt = common.randomInt
    
    LightMaker = Script.require("./modules/lightMaker.js?" + Date.now())
    ParticleMaker = Script.require("./modules/particleMaker.js?" + Date.now())
    DanceMaker = Script.require("./modules/danceMaker.js?" + Date.now())
    SoundMaker = Script.require("./modules/soundMaker.js?" + Date.now())

    Lights = new LightMaker();
    Particles = new ParticleMaker(textureCollection);
    Music = new SoundMaker();
    SFX = new SoundMaker();

    var
        _entityID,
        canStartTimer = true,
        explodeTimer = false,
        currentPosition = null,
        entities = [] 
    ;

    var
        MILISECONDS = 1000,
        GRAVITY = -9.8,
        MIN_START_TIME = 2 * MILISECONDS,
        MAX_START_TIME = 10 * MILISECONDS,

        MIN_DURATION_TIME = 7 * MILISECONDS,
        MAX_DURATION_TIME = 25 * MILISECONDS,

        SMOKE_TIME = 0.85 * MILISECONDS        
    ;


    // #endregion
    // *************************************
    // END INIT
    // *************************************

});
