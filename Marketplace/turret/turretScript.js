





(function() {

var _this;
const MESSAGE_CHANNEL = "Turret-Bullet-Hit";

// Turret Properties
// maximum distance to shoot (meters)
var activeDistance = 5;
// Whether or not it's actually operating
var enabled = true;
// how fast it lerps to shoot at player
var rotateSpeed = {
    x: 0.05,
    y: 0.03,
    z: 0.0 // it doesn't make sense to make the turret roll
}
// how frequently does it shoot at the player
var shootingInterval = 1.0;
var shootTimer = null; 
// Is it always shooting or only when has a clean shot
var alwaysShoot = true;
// How fast will the bullet travel - m/s
var bulletVelocity = 3.0;
var bulletGravity = {
    x: 0,
    y: -3,
    z: 0
};
// How much damage can it inflict
var bulletDamage = 10.0;
// if on, the bullet attempts to follow player
var smartBullet = true;

// Minimum angle difference to have a clear line at the target
const minAngleRange = 1;

// One shot audio clip played while charging to shoot
var CHARGING_SOUND = SoundCache.getSound(Script.resolvePath('assets/chargeSound.wav'));
// One shot audio clip played when shot is fired
var SHOT_SOUND =  SoundCache.getSound(Script.resolvePath('assets/shotSound.wav'));

const BULLET_MODEL_URL = Script.resolvePath('assets/Dogeodgeball.fbx');
const BULLET_SCRIPT_URL = Script.resolvePath('bulletScript.js');
const BULLET_DIMENSIONS = {
    x: 0.15,
    y: 0.15,
    z: 0.15
};

const TURRET_TIP_FWD_OFFSET  = -1;

var currentTarget = null;
var targetID;
var currentBullet = null;

var tempShotParticleProps = {
    type: "ParticleEffect",
    name: "Turret Shot Particle",
    isEmitting: true,
    lifespan: 5.5,
    maxParticles: 10,
    textures: "https://content.highfidelity.com/DomainContent/production/Particles/wispy-smoke.png",
    emitRate: 5.5,
    emitSpeed: 0,
    emitDimensions: {"x":0,"y":0,"z":0},
    emitOrientation: {"x":-90,"y":0,"z":1},
    emitterShouldTrail: true,
    particleRadius: 0.25,
    radiusSpread: 0,
    radiusStart: 0,
    radiusFinish: 0.10000000149011612,
    color: {"red":200,"blue":200,"green":200},
    colorSpread: {"red":0,"blue":0,"green":0},
    colorStart: {"red":200,"blue":200,"green":200},
    colorFinish: {"red":0,"blue":0,"green":0},
    emitAcceleration: {"x":-0.5,"y":2.5,"z":-0.5},
    accelerationSpread: {"x":0.5,"y":1,"z":0.5},
    alpha: 0,
    alphaSpread: 0,
    alphaStart: 1,
    alphaFinish: 0,
    polarStart: 0,
    polarFinish: 0,
    azimuthStart: -180.00000500895632,
    azimuthFinish: 180.00000500895632
};

var shotParticleArray = [];

function hitMessage(channel, message, sender) {
    if (channel == MESSAGE_CHANNEL) {
        print("INFO: Message received - " + message);
    }
    
};

function setup() {
    Messages.messageReceived.connect(hitMessage);
    Messages.subscribe(MESSAGE_CHANNEL);
}

function cleanup() {
    Messages.messageReceived.disconnect(hitMessage);
    Messages.unsubscribe(MESSAGE_CHANNEL);
}

function Turret() {
    _this = this;
};

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
        shootTimer = Script.setInterval(_this.shoot, shootingInterval*1000);
    },
    disableTurret: function() {
        print("INFO: Disable Turret");
        enabled = false;
        Script.clearInterval(shootTimer);
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
                //print ("Daantje Debug : Lost Target");
                _this.pickTarget();
                
            }
        }
        if (currentTarget != null) {
            //TODO
            _this.avatarPosition = avatarPosition;
            _this.rotateToTarget(deltaTime, avatarPosition);
            //print ("Daantje Debug : Rotating and shooting" + Vec3.distance(avatarPosition, _this.properties.position));
        }
    },
    pickTarget: function() {
        currentTarget = null;
        identifiers = AvatarList.getAvatarIdentifiers();
        //print ("Daantje Debug avatar ID length: " + identifiers.length);
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
                // maybe theres a smart bullet bug here
                //print( " Daantje Debug :  Found new target.");
                return;
            }

        };
        return;
    },
    rotateToTarget: function(deltaTime, avatarPosition) {
        if (currentTarget != null){
            // rotate towards target at rot speed
            // direction vector
            var targetDirection = Vec3.subtract(avatarPosition, _this.properties.position);
            var front = Quat.getFront(_this.properties.rotation);
            // LERP on y - yaw
            var axisUp = Quat.getUp(_this.properties.rotation);
            
            if (rotateSpeed.y > 0.0) {
                var angleYaw = rotateSpeed.y / deltaTime;
                var sign = Vec3.orientedAngle(front, Vec3.normalize(targetDirection), axisUp);
                if (Math.abs(sign) < Math.abs(angleYaw)) {
                    angleYaw = sign;
                } else {
                    sign = ((sign > 0) - (sign < 0)) || +sign;
                    angleYaw = angleYaw * sign;
                }

                var deltaRotation = Quat.angleAxis(angleYaw, axisUp);
                if (Math.abs(angleYaw) > minAngleRange) {
                    _this.properties.rotation = Quat.multiply(deltaRotation, _this.properties.rotation);
                }
            }
            // LERP on x - pitch
            var axisRight = Quat.getRight(_this.properties.rotation);
            if (rotateSpeed.x > 0.0) {
                // update front
                front = Quat.getFront(_this.properties.rotation);
                var pitchAngleSign = Vec3.orientedAngle(front, Vec3.normalize(targetDirection), axisRight);
                var anglePitch = rotateSpeed.x / deltaTime;
                if (Math.abs(pitchAngleSign) < Math.abs(anglePitch)) {
                    anglePitch = pitchAngleSign;
                } else {
                    pitchAngleSign = ((pitchAngleSign > 0) - (pitchAngleSign < 0)) || +pitchAngleSign;
                    anglePitch = anglePitch * pitchAngleSign;
                }
                deltaRotation = Quat.angleAxis(anglePitch, axisRight);
                if (Math.abs(anglePitch) > minAngleRange) {
                    _this.properties.rotation = Quat.multiply(deltaRotation, _this.properties.rotation);
                }
            }
            // update with new rotation
            Entities.editEntity( _this.entityID, {
                rotation : Quat.multiply(_this.properties.rotation, 
                    Quat.fromPitchYawRollDegrees(0.0, 180.0, 0.0))
            });  
        }
    },
    shoot: function() {
        if (alwaysShoot){
            var injector = Audio.playSound(CHARGING_SOUND, {
                volume: 1.0,
                position: Entities.getEntityProperties(_this.entityID, 'position').position
            });
            injector.finished.connect(function() {
                Audio.playSound(SHOT_SOUND, {
                    volume: 1.0,
                    position: Entities.getEntityProperties(_this.entityID, 'position').position
                });
                currentBullet = _this.createBullet();
                
            });   
        } else {
            // TODO has good rotation range of player
            //print(" Daantje Debug: facing player.");
            var targetDirection = Vec3.subtract(_this.avatarPosition, _this.properties.position);
            var front = Quat.getFront(_this.properties.rotation);
            var axis = Quat.getUp(_this.properties.rotation);
            var angle = Vec3.orientedAngle(front, Vec3.normalize(targetDirection), axis);

            if (Math.abs(angle) < minAngleRange){
                var injector = Audio.playSound(CHARGING_SOUND, {
                    volume: 1.0,
                    position: Entities.getEntityProperties(_this.entityID, 'position').position
                });
                injector.finished.connect(function() {
                    Audio.playSound(SHOT_SOUND, {
                        volume: 1.0,
                        position: Entities.getEntityProperties(_this.entityID, 'position').position
                    });

                    currentBullet = _this.createBullet();
                    
                });    
            }
        }
    },
    createBullet: function(){
        var bullet = Entities.addEntity({
                type: 'Model',
                name: 'Turret Bullet',
                description: 'hifi:turret:bullet',
                modelURL: BULLET_MODEL_URL,
                //shapeType: 'simple-compound',
                shapeType: 'sphere',
                dimensions: BULLET_DIMENSIONS,
                position: _this.getTurretTipPosition(Entities.getEntityProperties(_this.entityID)),
                rotation: Entities.getEntityProperties(_this.entityID, 'rotation').rotation,
                dynamic: true,
                collisionless: false,
                collidesWith: "static,dynamic,otherAvatar,myAvatar",
                velocity: Vec3.multiply(-bulletVelocity, Quat.getFront(Entities.getEntityProperties(_this.entityID, 'rotation').rotation)),
                gravity: bulletGravity,
                script: BULLET_SCRIPT_URL,
                userData: JSON.stringify({
                    grabbableKey: {
                        grabbable: true
                    },
                    bulletData: {
                        target: currentTarget,
                        smartBullet: smartBullet,
                        damage: bulletDamage,
                        turret: _this.entityID
                    }
                })
            });

        // spawn smoke particle
        var created = [];
        var shotParticle = null;
        var success = Clipboard.importEntities(Script.resolvePath('assets/shotParticle.json'));
        if (success === true) {
            created = Clipboard.pasteEntities(_this.getTurretTipPosition(Entities.getEntityProperties(_this.entityID)));
            shotParticle = created[0];

            Entities.editEntity(shotParticle, tempShotParticleProps);
            shotParticleArray.push(shotParticle);
        }
        
        // stop smoke particle
        Script.setTimeout(function () {
            for (var i = 0; i < shotParticleArray.length; i++) { 
                Entities.deleteEntity(shotParticleArray[0]);
            }
            shotParticleArray = [];
        }, 500);

        return bullet;
    },
    getTurretTipPosition: function(properties) {
        var front = Quat.getFront(properties.rotation);
        var frontOffset = Vec3.multiply(front, TURRET_TIP_FWD_OFFSET);

        var turretTipPosition = Vec3.sum(properties.position, frontOffset);
        return turretTipPosition;
    },
    unload: function() {
        _this.disableTurret();
    }    
};

setup();
Script.scriptEnding.connect(cleanup);
return new Turret();
});