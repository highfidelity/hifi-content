var 
    common = Script.require("./Common.js?" + Date.now()),     
    randomFloat = common.randomFloat,
    lerp = common.lerp,
    clamp = common.clamp,
    makeColor = common.makeColor
;

function LightMaker(){
    var that = this;
    this.box = null;
    this.lights = [];
    this.spotLight = null;
    this.lightProps = {};
    this.makeProps = function(position) {
        this.lightProps = {
            name: "Suprise lights",
            type: "Light",
            position: this.position,
            dimensions: {
                x: 10,
                y: 10,
                z: 10
            },
            angularDamping: 0,
            color:{red: 255,
                blue: 255,
                green: 255
            },
            intensity: 1000,
            falloffRadius: 0,
            isSpotlight: 0,
            exponent: 1,
            cutoff: 10,
            collisionless: true,
            userData: "{ \"grabbableKey\": { \"grabbable\": false} }" };
    };
    this.makeRandomLightProps = function(){
        var SEED_MIN = 0;
        var SEED_MAX = 1;
        
        var seed = randomFloat(SEED_MIN, SEED_MAX);
        var lightProps = {
            intensity: lerp(SEED_MIN, SEED_MAX, 2, 25, seed),
            color: makeColor(
                clamp(0, 255, parseInt(lerp(SEED_MIN, SEED_MAX, 0, 255, Math.sin(seed)))),
                clamp(0, 255, parseInt(lerp(SEED_MIN, SEED_MAX, 0, 255, Math.cos(seed)))),
                clamp(0, 255, parseInt(lerp(SEED_MIN, SEED_MAX, 0, 255, Math.tan(seed))))
            ),
            falloffRadius: clamp(0, 10, lerp(SEED_MIN, SEED_MAX, 0, 10, Math.sin(seed))),
            cutoff: clamp(0, 100, lerp(SEED_MIN, SEED_MAX, 0, 100, Math.cos(seed)))
        };     
        
        return lightProps;        
    };

    this.interval = null, 
    this.animate = function(){
                            
        var SEED_MIN = 0;
        var SEED_MAX = 1;
        
        var UDPATE_MIN = 25;
        var UPDATE_MAX = 150;

        var seed = randomFloat(SEED_MIN, SEED_MAX);
        var intervalAmount = parseInt(lerp(SEED_MIN, SEED_MAX, UDPATE_MIN, UPDATE_MAX, seed));
        
        this.interval = Script.setInterval(function(){
            var seed = randomFloat(SEED_MIN, SEED_MAX);
            var angularVelocity = {
                x: clamp(1, 5, lerp(SEED_MIN, SEED_MAX, 1, 5, Math.sin(seed))),
                y: clamp(1, 5, lerp(SEED_MIN, SEED_MAX, 1, 5, Math.cos(seed))),
                z: clamp(1, 5, lerp(SEED_MIN, SEED_MAX, 1, 5, Math.tan(seed))) 
            };
            Entities.editEntity(that.box, {
                angularVelocity: angularVelocity
            });
        
            Entities.editEntity(that.spotLight, that.makeRandomLightProps());
            that.lights.forEach(function(light){
                Entities.editEntity(light, that.makeRandomLightProps());
            });
        }, intervalAmount);
    },
    this.create = function(position){
        this.position = position;
        this.makeProps();
        this.makeBox();
        this.makeLights();
        this.animate();
    };
    this.makeBox = function(position) {
        this.box = Entities.addEntity({
            name: "Suprise-Box",
            type: "Box",
            position: this.position,
            dimensions: {
                x: 0.35,
                y: 0.35,
                z: 0.35
            },
            angularDamping: 0,
            friction: 0,
            color:{
                red: 100,
                blue: 0,
                green: 0
            },
            visible: false
        });
    };
    this.makeLights = function() {
        this.lightProps.parentID = this.box;
        this.lightProps.isSpotlight = 0;
        this.spotLight = Entities.addEntity(this.lightProps);

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(90,0,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(180,0,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,90,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-90,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,45,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,-45,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,0);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,180);
        this.lights.push(Entities.addEntity(this.lightProps));

        this.lightProps.isSpotlight = 1;
        this.lightProps.rotation = Quat.fromPitchYawRollDegrees(0,0,-180);
        this.lights.push(Entities.addEntity(this.lightProps));
    };
    this.destroy = function() {
        Script.clearInterval(this.interval);
        Entities.deleteEntity(this.box);
        Entities.deleteEntity(this.spotLight);
        this.lights.forEach(function(light){
            Entities.deleteEntity(light);
        });
        Entities.deleteEntity(this.box);

    };
}

module.exports = LightMaker;