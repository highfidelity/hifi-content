/* globals Entities */

(function() {
    var _this;
    // var STICK_CLIENT_SCRIPT_URL = Script.resolvePath("stick.js?v1" + Math.random());

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

            var props = Entities.getEntityProperties(_this.entityID, ["rotation", "position", "dimensions"]);
            var dimensions = props.dimensions;

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
                position: Vec3.sum(props.position, Vec3.multiplyQbyV(props.rotation, { x: 0, y: -(dimensions.y/2 - yHeight/2), z: 0 })),
                color: { red: 255, green: 0, blue: 0 },
                parentID: _this.entityID,
                restitution: 0,
                friction: 0,
                collisionless: false,
                collidesWith: "static,dynamic,kinematic,myAvatar,otherAvatar,",
                // script: STICK_CLIENT_SCRIPT_URL
            };
            
            this.listener = Entities.addEntity(listenerProps);
        },

        unload: function () {
            this.deleteListeners();
        }
    };

    return new JangguStick();

});