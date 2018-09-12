(function () {

    var lightID;
    var objectID;
    var entityID;

    var maxDistance;
    var curDistance;
    var startPosition;
    var curPosition;

    var interval = null;
    var deltaTime = 1000;

    var props = {
        name: "test_hello",
        type: "Box",
        lifetime: 180,
        dimensions: { x: 0.1, y: 0.1, z: 0.1 }
    };

    var DELTA_TIME = 1500;

    // var MIN_DELTA_TIME = 10;
    // var MAX_DELTA_TIME = 1000;

    function getNextPosition(deltaDistance) {
        var moveTowards = MyAvatar.position;

        var nextPos = Vec3.sum(Vec3.multiply(deltaDistance, Vec3.normalize(Vec3.subtract(curPosition, MyAvatar.position))), curPosition);

        var newPos = {
            x: curPosition.x + nextPos.x,
            y: curPosition.y,
            z: curPosition.z + nextPos.z
        };

        return newPos;
    }

    function start() {

        interval = Script.setInterval(function () {

            Entities.callEntityMethod(lightID, "turnOn", [DELTA_TIME * 2]);
            // Entities.callEntityMethod(objectID, "oppositeHandSetupErase", [DELTA_TIME]);

            curDistance += 1; // m

            Entities.editEntity(objectID, {
                position: getNextPosition(1)
            });

        }, deltaTime);

    }

    function generateRandom() {

    }

    var Zone = function () {
        this.objectID;

    };

    Zone.prototype = {

        preload: function () {
            var properties = Entities.getEntityProperties(entityID, ["userData", "position"]);

            try {
                var data = JSON.parse(properties.userData);
            } catch (e) {
                console.error(e);
            }

            if (properties) {
                lightID = data.lightID;
                objectID = data.objectID;
            }

            props.position = properties.position;

        },

        enterEntity: function () {

            this.objectID = Entities.addEntity(props);

            if (lightID && objectID) {
                start();
            }

            // 

            maxDistance
        },

        leaveEntity: function () {
            Entities.deleteEntity(this.objectID);
        },

        unload: function () {

        }
    };

    return new Zone();
});