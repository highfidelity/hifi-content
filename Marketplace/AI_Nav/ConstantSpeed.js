//
//  ConstantSpeed.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/23/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  Because my server script (Movement.js) moves th object through Gravity. I need this scripts to keep my entity from increasing speed (9.8 m/s^2).
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() { 
    var _this = this;
    var check = true;
    _this.preload = function(entityID) {
        print("Loading Constant Speed script"); 
        _this.entityID = entityID; 
    };

    var Speed = Script.setInterval(function() {
    	//check = !check;
    	var setSpeed = {
	        velocity: {
	        	x: 0,
	        	y: 0,
	        	z: 0
	        }
	    };
    	Entities.editEntity(_this.entityID, setSpeed);
    }, 100);

    Entities.deletingEntity.connect(function(entityID){
	    try{
	        Script.clearInterval(Speed);
	    } catch (err) {
	        print("already disconnected");
	    }
	});
})
