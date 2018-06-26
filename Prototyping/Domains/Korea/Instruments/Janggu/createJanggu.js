/* globals Entities */

(function() {
    var _this;
    var JANGGU_CLIENT_SCRIPT_URL = "C:/Users/robin/Documents/code/hifi-content/Prototyping/Domains/Korea/Instruments/Janggu/janggu.js"; // Script.resolvePath("janggu.js?v1" + Math.random());

    var Janggu = function() {
        _this = this;
        this.topListener = null;
        this.botListener = null;
    };

    function duplicateObject(obj) {
        var ret = {};
        for (var prop in obj) {
            ret[prop] = obj[prop];
        }
        return ret;
    }

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
                Entities.deleteEntity(this.topListener);
                this.topListener = null;
            }
            if (this.botListener) {
                Entities.deleteEntity(this.botListener);
                this.botListener = null;
            }

        },

        makeNewDrumListeners: function () {

            var topJoint = Entities.getJointIndex(_this.entityID, "joint1");
            var botJoint = Entities.getJointIndex(_this.entityID, "joint2");

            var topJointPos = Entities.getLocalJointTranslation(_this.entityID, topJoint);
            var botJointPos = Entities.getLocalJointTranslation(_this.entityID, botJoint);
            
            var jangguProps = Entities.getEntityProperties(_this.entityID, ["rotation", "position", "dimensions"]);
            var jangguDimens = jangguProps.dimensions;
            
            // var scalar = Vec3.dot({x: 0, y: jangguProps.dimensions.y, z:0}, {x: 0, y: topJointPos.y, z:0});
            
            var name = "JangguListener_";

            var listenerProps = {
                locked: false,
                rotation: jangguProps.rotation,
                type: "Shape",
                shape: "Cylinder",
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
            
            var topPos = duplicateObject(jangguProps.position);
            topPos.y = topPos.y + jangguDimens.y / 2;
            var botPos = duplicateObject(jangguProps.position);
            botPos.y = botPos.y - jangguDimens.y / 2;

            var topProps = duplicateObject(listenerProps);
            topProps.name = topProps.name + "top";
            topProps.parentJointIndex = topPos;
            topProps.position = topPos;
            topProps.color = { red: 255, green: 0, blue: 0 };
            print("topProps", 
            // JSON.stringify(topProps), 
            JSON.stringify(topJointPos));

            var botProps = duplicateObject(listenerProps);
            botProps.name = botProps.name + "bot";
            botProps.parentJointIndex = botJoint;
            botProps.position = botPos;
            botProps.color = { red: 0, green: 0, blue: 255 };
            
            this.topListener = Entities.addEntity(topProps);
            this.botListener = Entities.addEntity(botProps);
            print("topListener", this.topListener, "botListener", this.botListener);
        },

        unload: function () {
            this.deleteListeners();
        }
    };

    return new Janggu();

});