

var 
    common = Script.require("./commonUtilities.js?" + Date.now()),
    danceCollection = Script.require("./collection_animations.js?" + Date.now()),
    randomInt = common.randomInt
;

var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
log("in dance maker");

function DanceMaker() {
    var that = this;
    var READY = 3;
    this._entityID = null;
    this.registerEntity = function(entityID){
        this._entityID = entityID;
    };
    this.dancer = null;
    this.randomAnimation = null;
    this.randomDancer = null;
    this.dancerLoaded = false;
    this.animationLoaded = false;
    this.modelResource = null;
    this.animationResource = null;
    this.registerURL = function(url) {
        this.randomDancer = url;
    };
    this.create = function(position) {
        this.randomAnimation = danceCollection[randomInt(0, danceCollection.length -1)];
        this.dancer = Entities.addEntity({
            type: "Model",
            name: "Suprise-Dancer",
            modelURL: this.randomDancer,
            position: Vec3.sum(position, [0,0.75,0]),
            parentID: this.entityID,
            animation: {
                url: this.randomAnimation,
                running: true
            }
        });
    };
    this.destroy = function() {
        Entities.deleteEntity(this.dancer);
    };
}

module.exports = DanceMaker;