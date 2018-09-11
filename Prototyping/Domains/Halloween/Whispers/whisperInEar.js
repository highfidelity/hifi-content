(function () {
    
    function getPropertiesFromNamedObj (entityName, searchOriginPosition, searchRadius, arrayOfProperties ) {
        
        var entityList = Entities.findEntitiesByName(
            entityName,
            searchOriginPosition,
            searchRadius
        );

        if (entityList.length > 0) {
            return Entities.getEntityProperties(entityList[0], arrayOfProperties);
        } else {
            return null;
        }

    }

    var headIdx = MyAvatar.getJointIndex("Head");
    var headPos = MyAvatar.getJointPosition(headIdx);

    var focusPosition = getPropertiesFromNamedObj("focusObj", MyAvatar.position, 50, ["position"]).position;

    Entities.addEntity({
        name: "test_hello",
        type: "Box",
        parentID: MyAvatar,
        lifetime: 180,
        position: Vec3.sum(Vec3.multiply(0.2, Vec3.subtract(focusPosition, headPos)), headPos),
        dimensions: { x: 0.1, y: 0.1, z: 0.1}
    });

})();