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
    var USERS_ALLOWED_TO_SPIN_WHEEL =
        Script.require(Script.resolvePath('../../secrets/secrets.json?0')).usersAllowedToSpinWheel;

    var _this;

    var Wheel = function() {
        _this = this;
    };

    Wheel.prototype = {
        /* ON LOADING THE APP: Save a reference to this entity ID and its position */
        preload: function(entityID) {
            _this.entityID = entityID;
        },

        /* ON MOUSE CLICKING THE WHEEL (THIS WILL INCLUDE TRIGGERING ON WHEEL): If a right mouse click, ignore. Otherwise, 
        if at least 4 seconds have passed since the last spin, check the user's name aginst those allowed to spin the wheel. 
        If the user is allowed to spin, give the wheel an angular velocity of -10 in the z direction and play a ticking 
        sound, then set a timeout for 100MS to ensure we do not check velocity before the wheeel is spinning. Next, clear 
        any interval to be sure we do not have more than one interval running and set a new interval to check the velocity 
        of the wheel every 100MS. At this point, we have a shuffled list of possible bingo calls and the last number in 
        that list will be the final number that is chosen. To give the appearance of the wheel spinning through the list, 
        we update the text entity every interval, iterating over the list of possible calls. When the wheel has slowed to 
        a minimum velocity, we update the text entity with the final number. so, for every 100MS, we check the velocity. 
        If velocity is greater than the minimum, less than 0, and we are not on the final interval where the final number 
        will be shown, we edit the text with the next number in the list of possible numbers and increase the minimum 
        velocity to dynamically narrow the amount of time before the text entity will change again. If the angular velocity 
        is between 0 and -0.1 and we are not on the final text edit, the wheel will stop spinning soon so we pop the array 
        of possible calls and edit the text with the popped call. We send the called number to the server script and set 
        a flag that this is the final number. Now, the wheel text will not be edited during subsequent intervals and when 
        it slows to less than -0.05, we consider the spin finished and play the final beep sound, clear the interval, reset 
        the list of possible bingo calls, and set a timeout for 4seconds before the wheel can be spun again to allow time 
        for the server script to complete its tasks for this spin. */
        mousePressOnEntity: function(entityID, mouseEvent) {
            if (mouseEvent.button !== "Primary") {
                return;
            }
            if (USERS_ALLOWED_TO_SPIN_WHEEL.indexOf(AccountServices.username) >= 0){
                Entities.callEntityServerMethod(_this.entityID, 'spinBingoWheel',
                    [AccountServices.username]);
            }
        }
    };
    
    return new Wheel();
});
