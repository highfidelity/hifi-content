//
// gasMainButton.js
// 
// Created by Rebecca Stankus on 03/07/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
(function(){
    var FIRE_BY_GAS_MAIN_1 = "{358ac501-b964-4502-a0d6-2be2be3691cd}";
    var FIRE_BY_GAS_MAIN_2 = "{21c65586-06c0-429b-9dc3-2a13d7e92a10}";
    var FIRE_BY_GENERATOR = "{84d98c70-fe1c-4624-a8ba-d0e9171a1e46}";
    var FIRE_BY_CAFE = "{88aec9a6-97cc-4828-9983-493ab81f9131}";

    var _this;

    var Button = function() {
        _this = this;
    };

    Button.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            _this.reset();
        },
        reset: function() {
            Entities.editEntity(_this.entityID, {
                rotation: Quat.fromPitchYawRollDegrees(0,0,0)
            });
        },
        mousePressOnEntity: function(entityID, mouseEvent) {
            Entities.editEntity(_this.entityID, {
                angularVelocity: {x:0,y:0.75,z:0}
            });
            var yaw = Entities.getEntityProperties(_this.entityID, 'rotation').rotation.y;
            print(yaw);
            if (yaw > 0.9) {
                Entities.editEntity(FIRE_BY_GAS_MAIN_1, {
                    visible: false,
                    collisionless: true
                });

                Entities.editEntity(FIRE_BY_GAS_MAIN_2, {
                    visible: false,
                    collisionless: true
                });

                Entities.editEntity(FIRE_BY_GENERATOR, {
                    visible: false,
                    collisionless: true,
                    locked: false
                });

                Entities.editEntity(FIRE_BY_CAFE, {
                    visible: false,
                    collisionless: true,
                    locked: true
                });
            }
        }
    };
    
    return new Button();
});