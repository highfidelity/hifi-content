/* globals Entity */


(function() {
    var _this;
    var JANGGU_CLIENT_SCRIPT_URL = Script.resolvePath("janggu.js?v1" + Math.random());

    var Janggu = function () {
        this.topListener = null;
        this.botListener = null;
    };

    Janggu.prototype = {
        preload: function (entityID) {
            _this.entityID = entityID;

            if (this.topListener || this.botListener) {
                this.deleteListeners();
            }
            this.makeNewDrumListeners();
        },

        deleteListeners: function () {

            if (this.topListener) {
                Entity.deleteEntity(this.topListener);
                this.topListener = null;
            }
            if (this.botListener) {
                Entity.deleteEntity(this.botListener);
                this.botListener = null;
            }

        },

        makeNewDrumListeners: function () {

            var topJoint = Entity.getJointIndex(_this.entityID, "Joint1");
            var botJoint = Entity.getJointIndex(_this.entityID, "Joint2");

            var topJointPos = Entity.getLocalJointTranslation(_this.entityID, topJoint);
            var botJointPos = Entity.getLocalJointTranslation(_this.entityID, botJoint);

            var jangguProps = Entity.getProperties(_this.entityID, ["rotation", "dimensions"]);
            var jangguDimens = jangguProps.dimensions;

            var name = "JangguListener_";

            var listenerProps = {
                locked: true,
                rotation: jangguProps.rotation,
                shapeType: "Cylinder",
                name: name,
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
                dimensions: {
                    x: jangguDimens.x,
                    y: 0.01,
                    z: jangguDimens.z
                },
                parentID: _this.entityID,
                restitution: 0,
                friction: 0,
                collisionless: true,
                // collidesWith: "",
                script: JANGGU_CLIENT_SCRIPT_URL
                // userData: userData
            };

            var topProps = Object.create(listenerProps);
            topProps.name = topProps.name + "top";
            topProps.parentJointIndex = topJoint;
            topProps.position = topJointPos;
            topProps.color = { red: 255, green: 0, blue: 0 };

            var botProps = Object.create(listenerProps);
            botProps.name = botProps.name + "bot";
            botProps.parentJointIndex = botJoint;
            botProps.position = botJointPos;
            botProps.color = { red: 0, green: 0, blue: 255 };

            this.topListener = Entity.addEntity(topProps);
            this.botListener = Entity.addEntity(botProps);
        },

        unload: function () {
            this.deleteListeners();
        }
    };

    return new Janggu();

})();