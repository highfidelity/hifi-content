/* eslint-disable no-magic-numbers */
//
// bingoWheel.js
// 
// Created by Rebecca Stankus on 10/16/2018
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

/* global AccountServices, Audio, Entities, Math, MyAvatar, Script, String */

(function() {
    var _this;

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        /* ON LOADING THE APP: Save a reference to this entity ID */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        // When left-clicking/triggering on the wheel, tell the server script on the wheel
        // to spin the wheel
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button !== "Primary") {
                return;
            }

            var usersAllowedToSpinWheel = 
                Script.require(Script.resolvePath('../../config/config.json?' + Date.now())).usersAllowedToSpinWheel;
            if (usersAllowedToSpinWheel.indexOf(AccountServices.username) >= 0){
                Entities.callEntityServerMethod(_this.entityID, 'spinBingoWheel',
                    [AccountServices.username]);
            }
        }
    };
    
    return new Wheel();
});
