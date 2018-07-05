// Instrument plays on grab

/*
    @params
    one object with the following keys 
    {
        name (String):  name of object, spawner will have name + Spawner, clones will be named name
        modelURL (String): model  url
        dimensions (Object): dimensions for model
        cloneLifetime (Integer): length of clones life in ms
        scriptURL (String):  relative path to cloned entity script URL
    }

    var arguments = {
        name: ,
        modelURL: ,
        dimensions: ,
        cloneLifetime: ,
        scriptURL: 
    }
    
*/

var InstrumentSpawner = function (args) {
    this.name = args.name;
    this.modelURL = args.modelURL;
    this.cloneLifetime = args.cloneLifetime;
    this.dimensions = args.dimensions;
    this.scriptURL = args.scriptURL;
};

InstrumentSpawner.prototype = {

    createSpawner: function () {

        // Spawns object 3 m in front of Avatar
        var orientation = MyAvatar.orientation;
        orientation = Quat.safeEulerAngles(orientation);
        var spawnPosition = Vec3.sum(MyAvatar.position, Vec3.multiply(3, Quat.getForward(MyAvatar.orientation)));

        var cloneLifetime = this.cloneLifetime
        var userData = {
            "grabbableKey": {
                "cloneLifetime": cloneLifetime,
                "cloneLimit": 0,
                "cloneDynamic": false,
                "cloneAvatarEntity": false,
                "cloneable": true,
                "grabbable": true
            }
        };

        Entities.addEntity({
            locked: true,
            type: "Model",
            modelURL: this.modelURL,
            rotation: orientation,
            shapeType: "box",
            name: this.name + " Spawner",
            dynamic: false,
            gravity: {
                x: 0,
                y: 0,
                z: 0
            },
            velocity: {
                x: 0,
                y: 0,
                z: 0
            },
            position: spawnPosition,
            dimensions: this.dimensions,
            restitution: 0,
            friction: 0,
            collisionless: true,
            collidesWith: "",
        
            script: this.scriptURL,
            userData: JSON.stringify(userData)
        });
    }
};

module.exports = {
    instrumentSpawner: InstrumentSpawner
};
