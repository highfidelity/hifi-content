///
/// monster_walk.js
/// A little angry monster
/// Attach to an entity 
/// 
/// Author: Elisa Lupin-Jimenez
/// Copyright High Fidelity 2017
///
/// Licensed under the Apache 2.0 License
/// See accompanying license file or http://apache.org/
///
/// All assets are under CC Attribution Non-Commerical
/// http://creativecommons.org/licenses/
///

(function () {
	var GROWL_URL = "https://hifi-content.s3.amazonaws.com/elisalj/emoji_scripts/behaviors/sounds/monster-growl.wav";
	var GROWL = SoundCache.getSound(Script.resolvePath(GROWL_URL));

    var _entityID;
    var props;
    this.preload = function(entityID) {
        _entityID = entityID;
        props = Entities.getEntityProperties(_entityID);
        var faceAwayRot = Quat.multiply(MyAvatar.orientation, {x:0, y:1, z:0, w:0});
        var set = {
            "position": {
                "x": props.position.x,
                "y": props.position.y - 1,
                "z": props.position.z
            },
            "rotation": faceAwayRot
        };
        Entities.editEntity(_entityID, set);
    };

    // Monster walks away from spawner
    Script.setInterval(function () {
        var pos = Entities.getEntityProperties(_entityID).position;
        var destination = Vec3.normalize(Vec3.subtract(pos, MyAvatar.position));
        var newProps = {
            "rotation": Quat.multiply(MyAvatar.orientation, {x:0, y:1, z:0, w:0}),
            "velocity": destination
        };
        Entities.editEntity(_entityID, newProps);
    }, 200)
    
    this.unload = function() {
         // UI and Cache cleanup etc happen here
    };

});