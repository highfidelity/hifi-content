//
// noFly.js
// 
// Author: Liv Erickson
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//


(function(){
    var stopDancing;
    var danceInterval = 5000;

    var NoDanceZone = function(){

    };

    NoDanceZone.prototype = {

        preload: function(entityID) {

        },

        enterEntity: function() {
            if (MyAvatar.isFlying()) {
                MyAvatar.restoreAnimation();
            };
            stopDancing = Script.setInterval(function(){
                if (MyAvatar.isFlying()){
                    MyAvatar.restoreAnimation();
                }
            }, danceInterval);
        },
        leaveEntity: function(){
            Script.clearInterval(stopDancing);
        }
    };

    return new NoDanceZone();

});
