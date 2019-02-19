(function () {

    function avatarOffset(offset) {
        return Vec3.subtract(MyAvatar.position, offset);
    }

    var sphere01 = Entities.addEntity({ type: "Sphere", position: avatarOffset([1, 0.25, -0.5]), parentID: MyAvatar.sessionUUID });
    var sphere02 = Entities.addEntity({ type: "Sphere", position: avatarOffset([0, 0, -0.5]), parentID: MyAvatar.sessionUUID });
    var sphere03 = Entities.addEntity({ type: "Sphere", position: avatarOffset([-1, -0.25, -0.5]), parentID: MyAvatar.sessionUUID });

    var spheres = [sphere01, sphere02, sphere03];

    Script.scriptEnding.connect(function () {
        spheres.forEach(function (sphere) {
            Entities.deleteEntity(sphere);
        });
    });

    var radius = 2;
    var totalTravelTime = 2000;

    function animate(){
        var x = Math.sin();
        var y = Math.cos();
        var position = 
    };
    Script.update.connect(animate);
})();