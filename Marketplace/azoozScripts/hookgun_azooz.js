//
//  Hookgun.js
//
//  Created by Matti 'Menithal' Lahtinen on 5/8/16.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// hifi-js-wrap helper library. https://github.com/Menithal/hifi-js-wrap


(function() {
  var Overlay;
  var Entity;

  // Using an very ancient version of a library, I made
  Overlay=function(a){this.properties=a?a:{},this.properties.scale=this.properties.scale?this.properties.scale:{x:1,y:1,z:1},this.properties.position=this.properties.position?this.properties.position:MyAvatar.position,this.properties.rotation=this.properties.rotation?this.properties.rotation:Quat.ZERO,this.properties.color=this.properties.color?this.properties.color:{red:255,green:255,blue:255},this.properties.alpha=this.properties.alpha?this.properties.alpha:1,this.type=this.properties.type?this.properties.type:"cube","line3d"===this.properties.type?(this.properties.start=this.properties.start?this.properties.start:Vec3.ZERO,this.properties.end=this.properties.end?this.properties.end:Vec3.ZERO,this.properties.glow=this.properties.glow?this.properties.glow:0):this.properties.solid=!!this.properties.solid,this.callbacks={},this._filter=[];var b=this;this.scriptEnding=function(){b.deleteOverlay(),Script.scriptEnding.disconnect(b.scriptEnding)},Script.scriptEnding.connect(b.scriptEnding)},Overlay.prototype={properties:null,id:-1,_filter:null,callbacks:null,filter:function(a){return this.id!==-1?(this._filter=a,this.sync(a)):this},addOverlay:function(){return this.id===-1&&(this.id=Overlays.addOverlay(this.type,this.properties)),this},deleteOverlay:function(){try{this.id!==-1&&Overlays.deleteOverlay(this.id)}catch(a){print("Overlay does no longer exist.")}return this.id=-1,this},updateOverlay:function(){try{this.id!==-1&&Overlays.editOverlay(this.id,this.properties)}catch(a){print("OWrap: Overlay does not exist in world.")}return this},editProperties:function(a){for(var b in a)this.properties[b]=a[b];return this}},Entity=function(a){if(null===a||void 0===a||"function"==typeof a){var b=this;this.preload="function"==typeof a?a:function(a){b.id=a},this.callbacks={},this.properties={},this._filter=[]}else"string"==typeof a?(this.properties=Entities.getEntityProperties(a),this.properties&&null!==this.properties&&0!==this.properties.length?this.id=a.id:(this.id=null,this.properties={})):this.properties=a;this.callbacks={},this._filter=[]},Entity.prototype={properties:null,id:null,_filter:null,callbacks:null,filter:function(a){return null!==this.id?(this._filter=a,this.sync(a)):this},addEntity:function(){return null===this.id&&(this.id=Entities.addEntity(this.properties)),this},deleteEntity:function(){try{null!==this.id&&Entities.deleteEntity(this.id)}catch(a){print("Entity does no longer exist.")}return this.id=null,this},sync:function(a){if(null!==this.id){a=null===a||void 0===a?this._filter:a;var b=Entities.getEntityProperties(this.id,a);void 0!==b.id?this.properties=b:this.id=null}return this._filter=[],this},editProperties:function(a){for(var b in a)this.properties[b]=a[b];return this},callMethod:function(a,b){return null!==this.id&&Entities.callEntityMethod(this.id,a,b),this},unbind:function(a){return null===this.callbacks[a]?this:(Script.clearEventHandler(this.id,a,this.callbacks[a]),delete this.callbacks[a],this)},bind:function(a,b,c){void 0===c&&(c=!0),null!==this.callbacks[a]&&this.unbind(a,this.callbacks[a]);var d=this;return this.callbacks[a]=c?function(){b(d,this.arguments)}:b,Script.addEventHandler(this.id,a,b),this},clearInteractions:function(){return this.unbind("startFarTrigger").unbind("clickDownOnEntity").unbind("continueFarTrigger").unbind("holdingClickOnEntity").unbind("continueFarTrigger").unbind("holdingClickOnEntity"),this},setOnEquip:function(a){var b=this,c=function(c,d){var e="left"===d[0]?Controller.Standard.LT:Controller.Standard.RT;a(b,e,d)};return null===this.id?this.startEquip=c:this.bind("onEquip",c,!1),b},setOnEquipTrigger:function(a){var b=this,c=function(c,d){var e="left"===d[0]?Controller.Standard.LT:Controller.Standard.RT,f=Controller.getValue(e);a(b,e,f,d)};return null===this.id?this.continueEquip=c:this.bind("continueEquip",c,!1),b},setOnUnequip:function(a){var b=this,c=function(c,d){var e="left"===d[0]?Controller.Standard.LT:Controller.Standard.RT,f=Controller.getValue(e);a(b,e,f,d)};return null===this.id?this.releaseEquip=c:this.bind("releaseEquip",c,!1),b},setInteractionStart:function(a){var b=this,c=function(){a(b,{button:"hand"})},d=function(c,d){a(b,d)};return null===this.id?(this.clickDownOnEntity=d,this.startFarTrigger=c):this.bind("startFarTrigger",c,!1).bind("clickDownOnEntity",d,!1),this},setInteractionHold:function(a){var b=this,c=function(){a(b,{button:"hand"})},d=function(c,d){a(b,d)};return null===this.id?(this.continueFarTrigger=c,this.holdingClickOnEntity=d):this.bind("continueFarTrigger",c,!1).bind("holdingClickOnEntity",d,!1),this},setInteractionStop:function(a){var b=this,c=function(){a(b,{button:"hand"})},d=function(c,d){a(b,d)};return null===this.id?(this.stopFarTrigger=c,this.clickReleaseOnEntity=d):this.bind("stopFarTrigger",c,!1).bind("clickReleaseOnEntity",d,!1),this},updateEntity:function(){try{null!==this.id&&Entities.editEntity(this.id,this.getProperties())}catch(a){print("EWrap: Entity does not exist in world.")}return this.sync()},getProperties:function(a){if(a=null===a||void 0===a?this._filter:a,0===a.length)return this.properties;var b={};return a.forEach(function(c){b.push(this.properties[a[index]])}),b}};
  //// Hook Gun

  var ROPE_SCRIPT = "(function (){function a(){this.oId=\"\"}var b=Script,c=Overlays,d=Entities,e=Vec3;return a.prototype={preload:function(f){function g(v,w){var x=e.sum(w,e.multiply(e.sum(v,e.multiply(w,-1)),0.5));return x}function h(v,w,x){var y=e.distance(v,w),z=y/q,F=e.mix(v,w,x<z?x/z:1);return{position:g(v,F),rotation:Quat.lookAtSimple(v,F),scale:{x:0.0125,z:e.distance(v,F),y:0.0125}}}function i(v){var w=d.getEntityProperties(f,[\"position\"]);(0===Object.keys(w).length||!o&&r>e.distance(w.position,n)/q)&&(c.deleteOverlay(k.oId),j()),r+=v,c.editOverlay(k.oId,h(w.position,n,r))}function j(){b.update.disconnect(i)}var k=this,l=d.getEntityProperties(f,[\"userData\",\"position\"]),m=JSON.parse(l.userData),n=m.target,o=m.connected,q=m.ropeSpeed;k.oId=c.addOverlay(\"cube\",{solid:!0,alpha:1,color:{red:32,blue:32,green:32},scale:{x:0.025,z:0,y:0.025}});var r=0;b.update.connect(i),b.scriptEnding.connect(j)}},new a})";

  var BULLET_GRAVITY = {
      x: 0,
      y: 0,
      z: 0
  };
  var BULLET_DIMENSIONS = {
      x: 0.02,
      y: 0.02,
      z: 0.5
  };
  var BULLET_COLOR = {
      red: 255,
      green: 255,
      blue: 255
  };
  var RELOAD_TIME = 4;
  var RELOAD_THRESHOLD = 0.95;

  var GUN_TIP_FWD_OFFSET = 0.08;
  var BULLET_SPAWN_OFFSET = 0.4;
  var GUN_TIP_UP_OFFSET = 0;

  var GUN_FORCE = 90;
  var HOOK_LIFE_TIME = 20;
  var MAX_DISTANCE = 15;
  var TRIGGER_CONTROLS = [
      Controller.Standard.LT,
      Controller.Standard.RT
  ];

  var SHOOTING_1_SOUND = SoundCache.getSound("http://mpassets.highfidelity.com/de2f7e5c-4945-48a0-a045-fe602d7fa4b9-v2/sound/HookGunFire1.wav");
  var SHOOTING_2_SOUND = SoundCache.getSound("http://mpassets.highfidelity.com/de2f7e5c-4945-48a0-a045-fe602d7fa4b9-v2/sound/HookGunFire2.wav");

  var soundInjector;

  var ROPE = {
      collisionless: true,
      type: "Box",
      name: "RopeEmitter",
      script: ROPE_SCRIPT,
      visible: false
  };
  var GLOBAL_VELOCITY = Vec3.ZERO;
  var GRAVITY = {x:0, y:-6, z:0};
  function emptyObjectCheck(obj) {
      return Object.keys(obj).length === 0 && JSON.stringify(obj) === JSON.stringify({});
  }
  function rayCollidable(origin, direction){
    var ray = {origin: origin, direction: direction};
    var trace = Entities.findRayIntersection(ray, true);
    var blacklist = [];
    var properties = Entities.getEntityProperties(trace.entityID , ["name", "collisionless", "visible"]);
	//print("CMF: "+properties.name);
    while(trace.intersects && (properties.collisionless  || properties.name!="HookSpot")) {
      blacklist.push(trace.entityID);
      trace = Entities.findRayIntersection(ray, true, [], blacklist);
    }
    return trace;
  }
  var getWeaponBulletInfo = function(weaponInstance) {

      var properties = weaponInstance.properties;
      if (emptyObjectCheck(properties)) {
          return {
              found: false
          };
      }

      var frontVector = Quat.getFront(properties.rotation);
      var frontOffset = Vec3.multiply(frontVector, GUN_TIP_FWD_OFFSET);
      var bulletSpawnOffset = Vec3.multiply(frontVector, GUN_TIP_FWD_OFFSET + BULLET_SPAWN_OFFSET);
      var tip = Vec3.multiply(frontVector, GUN_TIP_FWD_OFFSET + BULLET_SPAWN_OFFSET);
      var upVector = Quat.getUp(properties.rotation);
      var upOffset = Vec3.multiply(upVector, GUN_TIP_UP_OFFSET);

      var forward = Quat.getFront(properties.rotation);
      var gunTipPosition = Vec3.sum(properties.position, frontOffset);
      var bulletSpawnPosition = Vec3.sum(properties.position, bulletSpawnOffset);

      return {
          found: true,
          forward: forward,
          tipSpawn: bulletSpawnPosition,
          tip: gunTipPosition,
          rotation: properties.rotation,
          position: properties.position
      };

  }


  var ActiveHand = {
      0: {
          secured: false
      },
      1: {
          secured: false
      }
  };
  var ActiveEquip = false;

  //var debugLine = new Overlay({type: "line3d", position: Vec3.ZERO, color: {blue:Math.random()*255, red: Math.random()*255, green: Math.random()*255}}).addOverlay();

  var HookShot = function (val) {
    Entity.call(this, val);
  };
  HookShot.prototype = Object.create(Entity.prototype);
  HookShot.prototype.ropeTo = function (fromPosition, toPosition) {
      var rotation = Quat.multiply(Quat.lookAt(fromPosition, toPosition, Vec3.UP), {
          w: 0.707,
          z: 0,
          x: 0.707,
          y: 0
      });
      var distance = Vec3.distance(toPosition, fromPosition);
      if (distance >= MAX_DISTANCE) {
          return {distance: MAX_DISTANCE,
            rotation: rotation};
      }

      return {
          distance: distance,
          rotation: rotation
      }
  };
  HookShot.prototype.calculateThrustDirection = function(fromPosition, toPosition) {
      return Vec3.normalize(Vec3.sum(toPosition, Vec3.multiply(fromPosition, -1)));
  };
  gun = new HookShot(function(id){
    this.id = id;
    this.timer = 0;
    this.point = {};
    this.active = false;
    this.canShoot = false;
    this.connected = false;
    this.currentThrust = Vec3.ZERO
    this.sync();
    var self = this;
    this.ropeCycle = function (dt) {
      if (self.active) {
        var bInfo = getWeaponBulletInfo(self.sync());

        var rope = self.ropeTo(bInfo.tip, self.point);
        self.timer += dt;
        var amount = rope.distance / GUN_FORCE;
        var currentDestination = Vec3.mix(bInfo.tip, self.point, self.timer < amount ? self.timer / amount: 1);

        //debugLine.editProperties({alpha:1, start: bInfo.tip, end: currentDestination }).updateOverlay();

        if(self.timer > amount && !self.connected) {
          self.active = false;
        } else if (self.timer > amount && self.connected) {
          var direction = self.calculateThrustDirection(MyAvatar.position, self.point);

          MyAvatar.setFlyingEnabled(false);
          var distance = 1 -( ( (MAX_DISTANCE+1) - rope.distance) / (MAX_DISTANCE) );

          if(distance > 1){
            distance = 1;
          }

          MyAvatar.motorReferenceFrame = "world";
          MyAvatar.motorTimescale = dt;
          MyAvatar.motorVelocity =  Vec3.multiply(direction, distance*80);
        }
      } else if (MyAvatar.isInAir() && self.connected) {
        MyAvatar.motorVelocity = GRAVITY;
        MyAvatar.motorReferenceFrame = "world";
        MyAvatar.motorTimescale = 15;
      } else {

        // Defaulting
        MyAvatar.motorReferenceFrame = "camera";
        MyAvatar.motorTimescale = 1000000;
        MyAvatar.motorVelocity = Vec3.ZERO;

        //  debugLine.editProperties({alpha:0, start: Vec3.ZERO, end: Vec3.ZERO, visibility: 0}).updateOverlay();
        Script.update.disconnect(self.ropeCycle);
      }
    };
  });

  // Move these to controller events.
  gun.setOnEquip(function(instance, controller, args) {
      var bInfo = getWeaponBulletInfo(instance.sync());
      ROPE.parentID = instance.id;
      MyAvatar.setFlyingEnabled(false);
    })
    .setOnUnequip(function(instance, controller, triggerValue, arg) {
        MyAvatar.setFlyingEnabled(true);
        instance.active = false;
        instance.timer = 0;


        // Defaulting
        MyAvatar.motorReferenceFrame = "camera";
        MyAvatar.motorTimescale = 1000000;
        MyAvatar.motorVelocity = Vec3.ZERO;

        //debugLine.editProperties({alpha:0, start: Vec3.ZERO, end: Vec3.ZERO, visibility: 0}).updateOverlay();
        try{ Script.update.disconnect(instance.ropeCycle); }catch(e) {}

    })
    .setOnEquipTrigger(function (instance, controller, triggerValue, arg) {
      if (triggerValue >= RELOAD_THRESHOLD && instance.canShoot) {
        instance.canShoot = false;
        if(!instance.active) {
          instance.active = true;
          var bInfo = getWeaponBulletInfo(instance.sync());
          if (Math.random() > 0.5) {
              Audio.playSound(SHOOTING_1_SOUND, {
                  volume: 0.25,
                  position: bInfo.tip
              });
          } else {
              Audio.playSound(SHOOTING_2_SOUND, {
                  volume: 0.25,
                  position: bInfo.tip
              });
          }

          var trace = rayCollidable(Vec3.sum(bInfo.tip, MyAvatar.velocity), bInfo.forward);

          if(trace.intersects) {
            if(Vec3.distance(trace.intersection, bInfo.tip) > MAX_DISTANCE ){
              instance.connected = false;
              instance.point = Vec3.sum(Vec3.multiply(bInfo.forward,MAX_DISTANCE), bInfo.tip);
            }else {
              instance.connected = true;
              instance.point = trace.intersection;
            }
          } else {
            instance.connected = false;
            instance.point = Vec3.sum(Vec3.multiply(bInfo.forward,MAX_DISTANCE), bInfo.tip);
          }

          ROPE.position = bInfo.tip;
          ROPE.userData = JSON.stringify({
            ropeSpeed: GUN_FORCE,
            target: instance.point,
            connected: instance.connected
          });
          instance.ropeInstance = new Entity(ROPE);

          instance.ropeInstance.addEntity();

          try{ Script.update.disconnect(instance.ropeCycle); }catch(e) {}
          Script.update.connect(instance.ropeCycle);
        }
      } else if (triggerValue < RELOAD_THRESHOLD && !instance.canShoot) {
        instance.canShoot = true;
        instance.intersection = {};

        instance.ropeInstance.deleteEntity();
        instance.active = false;
        instance.timer = 0;

        GLOBAL_VELOCITY = Vec3.ZERO;
        MyAvatar.motorVelocity = GLOBAL_VELOCITY;

      }
    });
      Script.scriptEnding.connect(function () {
      try{ Script.update.disconnect(instance.ropeCycle); }catch(e) {}
    });
    return gun;
  });
