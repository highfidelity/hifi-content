(function () {

    var lightID;
    var objectID;
    var entityID;

    var maxDistance;
    var minDistance;
    var curDistance;
    var startPosition;
    var curPosition;

    var BASE_TIME = 500;

    var isRunning = false;

    var interval = null;
    var deltaTime = 1000;

    var props = {
        name: "test_hello",
        type: "Model",
        modelURL: "http://hifi-content.s3-us-west-1.amazonaws.com/robin/dev/domains/halloween/flashingLight/boyStatue.fbx",
        lifetime: 180,
        dimensions: { x: 0.5015, y: 0.9090, z: 0.5014 }
    };

    var DELTA_TIME = 1500;

    // var MIN_DELTA_TIME = 10;
    // var MAX_DELTA_TIME = 1000;

    function getNextPosition(deltaDistance) {
        var moveTowards = MyAvatar.position;

        var deltaMove = Vec3.multiply(deltaDistance, Vec3.normalize(Vec3.subtract(moveTowards, curPosition)));

        var newPos = {
            x: curPosition.x + deltaMove.x,
            y: curPosition.y,
            z: curPosition.z + deltaMove.z
        };

        return newPos;
    }

    function updateModelPosition () {

    }

    function turnOn() {
        if (isRunning) {

        } else {
            unload();
        }
    }

    function turnOff() {
        if (isRunning) {

            Script.timeout(function () {

            }, BASE_TIME + );

        } else {
            unload();
        }
    }

    function getRandomTime(max) {


        return Math.floor(Math.random() * (max-BASE_TIME)) + BASE_TIME;
    }

    function start() {

        isRunning = true;

        turnOn();

        var flag = false;

        interval = Script.setInterval(function () {

            print(flag);

            if (flag === true) {
                // update light
                Entities.callEntityServerMethod(lightID, "turnOn");

                // update object
                Entities.editEntity(lightID, {
                    position: nextPos,
                    rotation: Quat.getUp(Camera.orientation) // check
                });

                var delta = 1;

                // if (minDistance < 1) {
                //     delta = 0.1;
                // }

                var nextPos = getNextPosition(delta);

                print(JSON.stringify(nextPos));

                Entities.editEntity(objectID, {
                    visible: true,
                    position: nextPos,
                    rotation: Quat.cancelOutRoll(Quat.lookAtSimple(nextPos, MyAvatar.position))
                });

                curPosition = nextPos;

            } else {
                Entities.callEntityServerMethod(lightID, "turnOff");
                Entities.editEntity(objectID, {
                    visible: false
                });
            }

            flag = !flag;

        }, deltaTime);

    }

    function generateRandom() {

    }

    var Zone = function () {
        this.objectID;

    };

    Zone.prototype = {

        preload: function (id) {
            entityID = id;
            var properties = Entities.getEntityProperties(entityID, ["userData", "position"]);
            var userData = properties.userData;
            var data;
            try {
                data = JSON.parse(userData);
            } catch (e) {
                console.error(e);
            }

            if (data) {
                lightID = data.lightID;
                // objectID = data.objectID;
            }

            props.position = properties.position;
            curPosition = properties.position;

        },

        enterEntity: function () {

            objectID = Entities.addEntity(props);

            if (lightID && objectID) {
                start();
            }

        },

        leaveEntity: function () {
            Entities.deleteEntity(objectID);
            this.unload();
        },

        unload: function () {
            if (interval) {
                Script.clearInterval(interval);
                interval = null;
            }

            var properties = Entities.getEntityProperties(entityID, ["position"]);

            curPosition = properties.position;
        }
    };

    return new Zone();
});