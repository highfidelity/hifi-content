var 
    common = Script.require("./Common.js?" + Date.now()),     
    randomInt = common.randomInt,
    log = common.log,
    vec = common.vec
;

function DanceMaker(partyFN, danceCollection, dancerCollection) {
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
    this.handleModelFetch = function(state){
        log("state change on model", state);
        log("dancerLoaded", that.dancerLoaded);
        log("animationLoaded", that.animationLoaded);
        if (state === READY) {
            // state === READY &&
            log("state is finished");
            that.dancerLoaded = true;
            log("that.dancer Loaded after assign:", that.dancerLoaded);
            that.animationLoaded;
            log("About to start the party!");
            partyFN();
        }
        
    };
    this.handleAnimationFetch = function(state){
        log("state change on animation", state);
        log("dancerLoaded", that.dancerLoaded);
        log("animationLoaded", that.animationLoaded);

        if (state === READY) {
            log("state is finished");
            that.animationLoaded = true;
            log("that.animationLoaded Loaded after assign:", that.animationLoaded);
            that.dancerLoaded;
            log("About to start the party!");
            partyFN();
        }
       
    };
    this.prefetch = function() {
        log("prefetch started");
        this.randomAnimation = danceCollection[randomInt(0, danceCollection.length -1)];
        this.randomDancer = dancerCollection[randomInt(0, dancerCollection.length -1)];
        // log("chosen dancer", this.randomDancer);
        this.modelResource = ModelCache.prefetch(this.randomDancer);
        this.animationResource = AnimationCache.prefetch(this.randomAnimation);
        this.modelResource.stateChanged.connect(this.handleModelFetch);
        this.animationResource.stateChanged.connect(this.handleAnimationFetch);
    };
    this.create = function(position) {
        this.randomAnimation = danceCollection[randomInt(0, danceCollection.length -1)];
        this.randomDancer = dancerCollection[randomInt(0, dancerCollection.length -1)];
        this.dancer = Entities.addEntity({
            type: "Model",
            name: "Suprise-Dancer",
            modelURL: this.randomDancer,
            position: Vec3.sum(position, vec(0,0.75,0)),
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