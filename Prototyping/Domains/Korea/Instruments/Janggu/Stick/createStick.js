/* globals Entities */

(function() {
    var _this;
    var STICK_CLIENT_SCRIPT_URL = Script.resolvePath("stick.js?v1" + Math.random());

    var JangguStick = function() {
        _this = this;
        this.listener = null;
    };

    JangguStick.prototype = {
        preload: function (entityID) {
            _this.entityID = entityID;

            this.makeListener();
        },

        deleteListener: function () {

            if (this.listener) {
                Entities.deleteEntity(this.listener);
                this.listener = null;
            }

        },

        makeListener: function () {

            var joint = Entities.getJointIndex(_this.entityID, "joint1");

            // var jointPos = Entities.getLocalJointTranslation(_this.entityID, joint);
            
            var props = Entities.getEntityProperties(_this.entityID, ["rotation", "position", "dimensions"]);
            var dimensions = props.dimensions;
            
            // var scalar = Vec3.dot({x: 0, y: jangguProps.dimensions.y, z:0}, {x: 0, y: topJointPos.y, z:0});
            
            var yHeight = dimensions.y / 10;

            var listenerProps = {
                name: "StickListener",
                locked: false,
                rotation: props.rotation,
                type: "Shape",
                shape: "Cylinder",
                dynamic: true,
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
                dimensions: {
                    x: dimensions.x,
                    y: yHeight,
                    z: dimensions.z
                },
                position: {
                    x: props.position.x,
                    y: props.position.y - (dimensions.y/2 - yHeight/2),
                    z: props.position.z
                },
                color: { red: 255, green: 0, blue: 0 },
                parentID: _this.entityID,
                parentJointIndex: joint,
                restitution: 0,
                friction: 0,
                collisionless: false,
                collidesWith: "static,dynamic,kinematic,myAvatar,otherAvatar,",
                script: STICK_CLIENT_SCRIPT_URL
            };
            
            this.listener = Entities.addEntity(listenerProps);
        },

        unload: function () {
            this.deleteListeners();
        }
    };

    return new JangguStick();

});