
/* global Pointers */

(function() { 
    var _this;

    var SEARCH_RADIUS = 0.1;
    var CHECKING_INTERVAL_MS = 5000;

    var checking;

    function GunSpawner() {
        _this = this;
    }

    GunSpawner.prototype = {
        position: null,
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.position = Entities.getEntityProperties(_this.entityID, 'position').position;
            _this.checkingStatus();
        },
        checkingStatus: function() {
            checking = Script.setInterval(function() {
                var needClone = true;
                Entities.findEntities(_this.position, SEARCH_RADIUS).forEach(function(element) {
                    var name = Entities.getEntityProperties(element, 'name').name;
                    if (name === "Gun Material Swapping") {
                        print("found gun...no need to clone, yo!");
                        needClone = false;
                    }
                });
                if (needClone) {
                    print("no other gun found...calling to create a new one");
                    _this.spawnNewGun();
                }
            }, CHECKING_INTERVAL_MS);
        },
        spawnNewGun: function() {
            print("creating gun elements");
            // create gun without scripts gun is invisible, particle is visible but not emitting, a material is parented
            var gun = Entities.addEntity({
                "clientOnly": false,
                "collidesWith": "myAvatar,otherAvatar,",
                "collisionMask": 24,
                "visible": false,
                "collisionsWillMove": true,
                "damping": 0.5,
                "dimensions": {
                    "x": 0.25364601612091064,
                    "y": 0.4168066680431366,
                    "z": 0.6038495898246765
                },
                "dynamic": true,
                "lifetime": -1,
                "modelURL": "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/" +
                    "Hub/Material%20Gun/models/gun.fbx",
                "name": "Gun Material Swapping",
                "position": _this.position,
                "serverScripts": "http://hifi-content.s3-us-west-1.amazonaws.com/" +
                    "rebecca/Hub/Material%20Gun/materialSwapGunServer.js?6754",
                "shapeType": "simple-compound",
                "type": "Model",
                "userData": "{\"grabbableKey\":{\"invertSolidWhileHeld\":true},\"wearable\":{\"joints\":" +
                    "{\"RightHand\":[{\"x\":0.07079616189002991,\"y\":0.20177987217903137," +
                    "\"z\":0.06374628841876984},"+
                    "{\"x\":-0.5863648653030396,\"y\":-0.46007341146469116,\"z\":0.46949487924575806," +
                    "\"w\":-0.4733745753765106}],\"LeftHand\":" +
                    "[{\"x\":0.1802254319190979,\"y\":0.13442856073379517," +
                    "\"z\":0.08504903316497803},{\"x\":0.2198076844215393,\"y\":-0.7377811074256897," +
                    "\"z\":0.2780133783817291,\"w\":0.574519157409668}]}}}",
                "script": "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/" +
                    "Hub/Material%20Gun/materialSwapGun.js?9876"
            });


            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Blue.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Violet.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Green.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });
            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Orange.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Indigo.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Red.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                "clientOnly": false,
                "lifetime": -1,
                "materialURL": "https://hifi-content.s3.amazonaws.com/liv/dev/Materials/Yellow.json",
                "name": "Gun Next Color Material",
                "parentID": gun,
                "priority": 1,
                "parentMaterialName": "39",
                "position": _this.position,
                "type": "Material",
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}"
            });

            Entities.addEntity({
                "type":"ParticleEffect",
                "localPosition":{
                    "x": 0.018980979919433594,
                    "y": 0.0623936653137207,
                    "z": -0.1919243335723877
                },
                "dimensions": {
                    "x": 32.87999725341797,
                    "y": 32.87999725341797,
                    "z": 32.87999725341797
                },
                "parentID": gun,
                "collisionless":1,
                "dynamic":0,
                "name":"Gun Particle Effect",
                "isEmitting":false,
                "lifespan":"2",
                "maxParticles":"500",
                "textures":"http://hifi-content.s3.amazonaws.com/alan/dev/Particles/Bokeh-Particle.png",
                "emitRate":"1",
                "emitSpeed":"3.15",
                "emitDimensions":{"x":"0.1","y":".1","z":".1"},
                "emitOrientation":{"x":"-90","y":"0","z":"0"},
                "emitterShouldTrail":false,
                "particleRadius":"0.02",
                "radiusSpread":"6",
                "radiusStart":"0.01",
                "radiusFinish":"0",
                "color":{"red":"247","blue":"0","green":"247"},
                "colorSpread":{"red":"0","blue":"0","green":"0"},
                "colorStart":{"red":"255","blue":"255","green":"255"},
                "colorFinish":{"red":"255","blue":"255","green":"255"},
                "emitAcceleration":{"x":"-0.0","y":"2.5","z":"-0.1"},
                "accelerationSpread":{"x":"0.5","y":"3","z":"0.5"},
                "alpha":"0",
                "alphaSpread":"0",
                "alphaStart":"1",
                "alphaFinish":"0",
                "polarStart":"0",
                "polarFinish":"17",
                "azimuthStart":"-180",
                "azimuthFinish":"180"
            });
        },
        unload: function() {
            if (checking) {
                Script.stop(checking);
            }
        }
    };

    return new GunSpawner();
});