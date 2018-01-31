(function () {

    var GRAVITY = {x: 0, y: -1.5, z: 0};
    var VELOCITY_MULTIPLIER = 4;
    var VELOCITY_Y_BOOST = 1;
    var BALL_DIMENSIONS = {x: 1, y: 1, z: 1};
    var CLICK_RESET_TIME = 1000;
    var clicked = false;
    var _entityID;

    function pushBall(entityID) {
        if (!clicked) {
            var entityProps = Entities.getEntityProperties(entityID, ["position", "velocity"]);
            var velocityToSet = Vec3.normalize(Vec3.subtract(entityProps["position"], MyAvatar.position));
            if (velocityToSet.y < 0) {
                velocityToSet.y = velocityToSet.y / -1;
            }
            velocityToSet.y += VELOCITY_Y_BOOST;
            var velocityToSet2 = Vec3.multiply(VELOCITY_MULTIPLIER, velocityToSet);
            Entities.editEntity(entityID, {velocity: velocityToSet2});
            clicked = true;
            Script.setTimeout(function () {
                clicked = false;
            }, CLICK_RESET_TIME);
        }
    }

    this.startFarTrigger = function (entityID) {
        pushBall(entityID);
    };

    this.startNearGrab = function (entityID) {
        pushBall(entityID);
    };

    this.clickDownOnEntity = function (entityID, mouseEvent) {
        if (mouseEvent.isLeftButton) {
            pushBall(entityID);
        }
    };

    this.preload = function (entityID) {
        this.entityID = entityID;
        _entityID = entityID;
        Entities.editEntity(this.entityID, {
            dimensions: BALL_DIMENSIONS,
            dynamic: true,
            gravity: GRAVITY,
            userData: "{\"grabbableKey\": { \"wantsTrigger\": true, \"grabbable\": false  }}"
        })
    }
});
