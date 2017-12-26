





(function() {

var _this;

// Turret Properties
// maximum distance to shoot (meters)
var activeDistance = 5;

// Whether or not it's actually operating
var enabled = true;
// how fast it lerps to shoot at player
var rotateSpeed = 0.5;
// how frequently does it shoot at the player
var shootingInterval = 0.5;
// Is it always shooting or only when has a clean shot
var alwaysShoot = true;
// How fast will the bullet travel
var bulletVelocity = {};
var bulletGravity = {};
// How much damage can it inflict
var bulletDamage = 10.0;
// if on, the bullet attempts to follow player
var smartBullet = false;

// One shot audio clip played while charging to shoot
var CHARGING_SOUND;
// One shot audio clip played when shot is fired
var SHOT_SOUND;


var currentTarget = null;

// pick target

// function pickTarget() {
// 	currentTarget = null;
// 	identifiers = AvatarList.getAvatarIdentifiers();
// 	for (var i = 0; i < identifiers.length; ++i) {
//         var avatarID = identifiers[i];
//         // get the position for this avatar
//         var avatar = AvatarList.getAvatar(avatarID);
//         var avatarPosition = avatar && avatar.position;
//         if (avatarID === null) {
//             // this is our avatar, skip it
//             avatar = MyAvatar.sessionUUID ;
//             avatarPosition = MyAvatar.position;
//         } else {
//             avatar = AvatarList.getAvatar(avatarID);
//             avatarPosition = avatar && avatar.position;
//         }
//         if (!avatarPosition) {
//             // we don't have a valid position for this avatar, skip it
//             continue;
//         }

//         if ((Vec3.distance(avatarPosition, turret.position) < activeDistance)) {
//             currentTarget = avatar;
//             print( " Daantje Debug :  Found new target.");
//             return;
//         }

//     };
//     return;
// };


// // rotate to target

// function rotateToTarget(deltaTime) {
// 	if (currentTarget != null){
//         // rotate towards target ar rot speed
//         // direction vector
//         var targetDirection = Vec3.subtract(currentTarget.position, turret.position);
//         var front = Quat.getFront(turret.rotation);
//         var axis = Vec3.cross(front, targetDirection);
//         axis = Vec3.normalize(axis);
//         // TODO if there are locked axis, do a projection

//         var angle = rotateSpeed / deltaT;

//         var deltaRotation = Quat.axisAngle(angle, axis);
//         // TODO edit property
//         turret.rotation = Quat.multiply(deltaRotation, turret.rotation);

// 	}
// };

// // shoot

// function shoot() {
// 	if (alwaysShoot){
//        print(" Daantje Debug: shooting.");
// 	} else {
// 		// TODO has good rotation rang of player
// 	}
// };

// function onUpdate(deltaTime) {
//     if (currentTarget == null) {
//     	pickTarget();
//     }
//     if (currentTarget != null) {
//     	//TODO
//         rotateToTarget(deltaTime);
//         shoot();
//     }
// }


// function enableTurret() {
//         print("INFO: Enable Turret");
//         enabled = true;
//         Script.update.connect(onUpdate);
// }

// function disableTurret() {
//     print("INFO: Disable Turret");
//     enabled = false;
//     Script.update.disconnect(onUpdate);
// }




function Turret() {
    _this = this;
}

Turret.prototype = {
    preload: function(entityID) {
        _this.entityID = entityID;
        _this.properties = Entities.getEntityProperties(entityID);
        if (enabled) { 
            _this.enableTurret();
        }
    },
    enableTurret: function() {
    	print("INFO: Enable Turret");
        enabled = true;
        Script.update.connect(_this.onUpdate);
    },
    disableTurret: function() {
    	print("INFO: Disable Turret");
        enabled = false;
        Script.update.disconnect(_this.onUpdate);
    },
    onUpdate: function(deltaTime) {
    	var avatarPosition;
    	// Pick a new target in case we haven't got one or our current  target is no longer within the active distance
    	if (currentTarget == null) {
    		//print ("Daantje Debug : Trying to pick new target");
	    	_this.pickTarget();
	    } else {
	    	if (currentTarget == MyAvatar.sessionUUID) {
                avatarPosition = MyAvatar.position;
	    	} else {
	    		avatarPosition = currentTarget.position
	    	}
	    	if (Vec3.distance(avatarPosition, _this.properties.position) > activeDistance) {
                print ("Daantje Debug : Lost Target");
	    	    _this.pickTarget();
	    	}
	    }
	    if (currentTarget != null) {
	    	//TODO
	        _this.rotateToTarget(deltaTime, avatarPosition);
	        //shoot();
	        print ("Daantje Debug : Rotating and shooting" + Vec3.distance(avatarPosition, _this.properties.position));
	    }
    },
    pickTarget: function() {
		currentTarget = null;
		identifiers = AvatarList.getAvatarIdentifiers();
		print ("Daantje Debug avatar ID length: " + identifiers.length);
		for (var i = 0; i < identifiers.length; i++) {
	        var avatarID = identifiers[i];
	        // get the position for this avatar
	        var avatar = AvatarList.getAvatar(avatarID);
	        var avatarPosition = avatar && avatar.position;
	        if (avatarID === null) {
	            avatar = MyAvatar.sessionUUID ;
	            avatarPosition = MyAvatar.position;
	        } else {
	            avatar = AvatarList.getAvatar(avatarID);
	            avatarPosition = avatar && avatar.position;
	        }
	        if (!avatarPosition) {
	            // we don't have a valid position for this avatar, skip it
	            continue;
	        }
            
	        if ((Vec3.distance(avatarPosition, _this.properties.position) < activeDistance)) {
	            currentTarget = avatar;
	            print( " Daantje Debug :  Found new target.");
	            return;
	        }

	    };
	    return;
	},
	rotateToTarget: function(deltaTime, avatarPosition) {
		if (currentTarget != null){
	        // rotate towards target ar rot speed
	        // direction vector
	        var targetDirection = Vec3.subtract(avatarPosition, _this.properties.position);
	        var front = Quat.getFront(_this.properties.rotation);
	        var axis = Vec3.cross(front, targetDirection);
	        axis = Vec3.normalize(axis);
	        axis = Quat.getUp(_this.properties.rotation);
	        // TODO if there are locked axis, do a projection

	        var angle = rotateSpeed / deltaTime;
            var sign = Vec3.orientedAngle(front, Vec3.normalize(targetDirection), axis);
            if (Math.abs(sign) < Math.abs(angle)) {
            	angle = sign;
            } else {
            	sign = ((sign > 0) - (sign < 0)) || +sign;
	            angle = angle * sign;
            }
            
            // TODO make constant
            print( " Daantje Debug Angle :" + angle );
            	var deltaRotation = Quat.angleAxis(angle, axis);
		        // TODO edit property
		        _this.properties.rotation = Quat.multiply(deltaRotation, _this.properties.rotation);
	            Entities.editEntity(_this.entityID, {rotation : Quat.multiply(_this.properties.rotation, Quat.fromPitchYawRollDegrees(0.0, 180.0, 0.0))});
            

	        
		}
	},
    unload: function() {
    	_this.disableTurret();
    }    
};

return new Turret();
});