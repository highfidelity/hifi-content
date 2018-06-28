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

            var jangguProps = Entities.getEntityProperties(_this.entityID, ["rotation", "position", "dimensions"]);
            var jangguDimens = jangguProps.dimensions;
            
            var name = "JangguListener_";

            var listenerProps = {
                locked: false,
                rotation: jangguProps.rotation,
                type: "Shape",
                shape: "Cylinder",
                name: name,
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
                    x: jangguDimens.x,
                    y: 0.001,
                    z: jangguDimens.z
                },
                parentID: _this.entityID,
                restitution: 0,
                friction: 0,
                collisionless: false,
                collidesWith: "static,dynamic,kinematic",
                script: JANGGU_CLIENT_SCRIPT_URL
                // userData: userData
            };

            var topProps = duplicateObject(listenerProps);
            topProps.name = topProps.name + "top";
            topProps.position = Vec3.sum(jangguProps.position, Vec3.multiplyQbyV(jangguProps.rotation, { x: 0, y: jangguDimens.y / 2, z: 0 }));
            topProps.color = { red: 255, green: 0, blue: 0 };

            var botProps = duplicateObject(listenerProps);
            botProps.name = botProps.name + "bot";
            botProps.position = Vec3.sum(jangguProps.position, Vec3.multiplyQbyV(jangguProps.rotation, { x: 0, y: -jangguDimens.y / 2, z: 0 }));
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