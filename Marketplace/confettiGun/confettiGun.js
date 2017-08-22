/**
Confettigun V2

Created by Matti 'Menithal' Lahtinen
on  13/5/2017
for High Fidelity.

Script Released Under CC Attribution 4.0
http://creativecommons.org/licenses/by/4.0/

All Assets refered in this script are
Released Under CC Attribution Non-Commercial 4.0
http://creativecommons.org/licenses/by/4.0/
**/
(function() {


  var RELOAD_THRESHOLD = 0.95;
  var RELOAD_TIME = 2;
  var GUN_TIP_FWD_OFFSET = 0.05;
  var GUN_TIP_UP_OFFSET = 0.05;

  var TRIGGER_CONTROLS = [
    Controller.Standard.LT,
    Controller.Standard.RT
  ];

  var GUN_FORCE = 3;

  var LOCAL_AUDIOPLAYBACK = {
    volume: 1,
    position: Vec3.sum(Camera.getPosition(), Quat.getFront(Camera.getOrientation()))
  };

  var GRAVITY = {
    x: 0,
    y: -1,
    z: 0
  };
  var DIMENSIONS = {
    x: 0.04,
    y: 0.002,
    z: 0.04
  }

  var DIMENSIONS_VARIANT = {
    x: 0.02,
    y: 0.002,
    z: 0.02
  }

  var FRICTION = 0.05;
  var DENSITY = 100;

  var PARTICLE_AMOUNT = 8;
  var ENTITY_AMOUNT = 20;

  var randColor = function() {
    return {
      red: Math.random() * 255,
      green: Math.random() * 255,
      blue: Math.random() * 255
    }
  };
  var randVec = function(amount) {
    return Vec3.multiply({
      x: Math.random() - Math.random(),
      y: Math.random() - Math.random(),
      z: Math.random() - Math.random()
    }, amount)
  }
  var randCone = function(size) {
    return Quat.fromVec3Degrees(randVec(size));
  }

  var SHOOT_SOUND_URLS = [
    "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/PartyHorn4.wav",
    "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/PartyHorn5.wav",
    "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/PartyHorn6.wav"
  ];
  var rotation = Quat.fromVec3Degrees({x:0,y:90,z:0});

  var PLASTIC = {

    type: "ParticleEffect",
    isEmitting: 1,
    maxParticles: 8,
    lifespan: 10,
    lifetime: 3,
    emitRate: 100,
    emitSpeed: 3,
    speedSpread: 1,
    script: "(function() { return { preload: function(e) { Script.setTimeout(function(){Entities.editEntity(e, { 'isEmitting': 0, 'script':'' }) },50); } } })",
    emitOrientation: rotation,
    emitDimensions: {
      x: 0.5,
      y: 0.5,
      z: 0.5
    },
    polarStart: Math.PI/180 * 75,
    polarFinish: Math.PI/180 * (90+15),
    azimuthStart: -0.3,
    azimuthFinish: 0.3,
    emitAcceleration: {
      x: 0,
      y: -0.5,
      z: 0
    },
    accelerationSpread: {
      x: 0,
      y: 0,
      z: 0
    },
    textures:  "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/Confetti.png",
    alpha: 1,
    alphaSpread: 0,
    alphaStart: 1,
    alphaFinish: 1,
    emitterShouldTrail: 0,

  };

  var SHOOT_SOUNDS = [];
  for (var i = 0; i < SHOOT_SOUND_URLS.length; i++) {
    SHOOT_SOUNDS.push(SoundCache.getSound(Script.resolvePath(SHOOT_SOUND_URLS[i])));
  }

  var SUPRISE_SOUND_URL = "http://mpassets.highfidelity.com/a5f42695-f15a-4f44-9660-14b4f8ca2b29-v1/poot.wav";
  var SUPRISE_SOUND = SoundCache.getSound(Script.resolvePath(SUPRISE_SOUND_URL));

  function ConfettiGun() {
    return;
  }
  ConfettiGun.prototype = {
    hand: null,
    gunTipPosition: null,
    canShoot: true,
    equipped: false,
    firedProjectiles: [],
    startEquip: function(entityID, args) {
      this.hand = args[0] == "left" ? 0 : 1;
    },

    continueEquip: function(entityID, args) {
      this.checkTriggerPressure(this.hand);
    },

    releaseEquip: function(entityID, args) {
      var _this = this;
      this.equipped = false;
      this.canShoot = false;
    },
    checkTriggerPressure: function(gunHand) {
      this.triggerValue = Controller.getValue(TRIGGER_CONTROLS[gunHand]);
      if (this.triggerValue >= RELOAD_THRESHOLD && this.canShoot) {
        this.canShoot = false;
        var gunProperties = Entities.getEntityProperties(this.entityID, ["position", "rotation"]);
        this.fire(gunProperties);
      } else if (this.triggerValue <= RELOAD_THRESHOLD && !this.equipped && !this.canShoot) {
        this.equipped = true;
        this.canShoot = true;
      }
      return;
    },
    getGunTipPosition: function(properties) {
      //the tip of the gun is going to be in a different place than the center, so we move in space relative to the model to find that position
      var frontVector = Quat.getFront(properties.rotation);
      var frontOffset = Vec3.multiply(frontVector, GUN_TIP_FWD_OFFSET);
      var upVector = Quat.getUp(properties.rotation);
      var upOffset = Vec3.multiply(upVector, GUN_TIP_UP_OFFSET);

      var gunTipPosition = Vec3.sum(properties.position, frontOffset);
      gunTipPosition = Vec3.sum(gunTipPosition, upOffset);

      return gunTipPosition;
    },
    fire: function(gunProperties) {

      this.canShoot = false;

      var self = this;
      Script.setTimeout(function() {
        self.canShoot = true
      }, 2000);
      var size = SHOOT_SOUNDS.length - 1;
      var rand = Math.random();
      var co = Math.round(Math.random() * size);
      var sound = SHOOT_SOUNDS[co];
      var entityCount = ENTITY_AMOUNT;
      var particleCount = PARTICLE_AMOUNT;
      if (0.95 < rand) {
        sound = SUPRISE_SOUND;
        entityCount = 5;
        particleCount = 1;
      }
      Audio.playSound(sound, {
        volume: 1,
        position: gunProperties.position
      });
      Controller.triggerShortHapticPulse(1, this.hand)


      for (var x = 0; x < particleCount; x++) {
        var part = PLASTIC;

        part.colorStart = randColor();
        part.colorFinish = part.colorStart;
        part.color = part.colorStart;
        part.dimensions= {
          x:Math.random()*0.5,
          y:Math.random()*0.5,
          z:Math.random()*0.5,
        }
        part.position = this.getGunTipPosition(gunProperties);
        part.rotation = gunProperties.rotation;
        Entities.addEntity(part, true);
      }

      for (var i = 0; i < entityCount; i++) {
        //  Controller.triggerShortHapticPulse(1, this.hand)
        var forwardVec = Quat.multiply(randCone(45), Quat.getFront(Quat.multiply(gunProperties.rotation, Quat.fromPitchYawRollDegrees(0, 0, 0))));
        forwardVec = Vec3.normalize(forwardVec);
        forwardVec = Vec3.multiply(forwardVec, GUN_FORCE);
        Entities.addEntity({
          type: 'Box',
          name: 'Confetti',
          position: Vec3.sum(randVec(0.05), this.getGunTipPosition(gunProperties)),
          color: randColor(),
          collisionless: 1,
          rotation: randCone(180),
          script: "(function() { return { preload: function(e) { Script.setTimeout(function(){ Entities.editEntity(e, { 'collisionless': 0, 'script':'' }) },50); } } })",
          dynamic: true,
          dimensions: Math.ceil(Math.random() * 12) % 2 === 0 ? DIMENSIONS : DIMENSIONS_VARIANT,
          gravity: GRAVITY,
          velocity: forwardVec,
          angularVelocity: randVec(25),
          angularDamping: FRICTION,
          gravity: GRAVITY,
          dynamic: true,
          lifetime: 15
        }, true);


      }
    },
    preload: function(entityID) {
      this.entityID = entityID;
    }
  }

  var self = new ConfettiGun();
  return self;

});