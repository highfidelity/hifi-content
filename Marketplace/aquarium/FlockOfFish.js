//
//  FlockOfFish.js
//  marketplace
//
//  Philip Rosedale
//  Modified by Cain Kilgore
//  Copyright 2017 High Fidelity, Inc.   
//  Fish smimming around in a space in front of you in an aquarium
//   
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() { // BEGIN LOCAL_SCOPE

    var TABLET_BUTTON_NAME = "FISHTANK";
    var buttonActivated = false;
    var ICONS = {
        icon: "http://mpassets.highfidelity.com/4535b57c-f35a-4d9d-a3ee-1233c457dc8e-v1/fish-i.svg",
        activeIcon: "http://mpassets.highfidelity.com/4535b57c-f35a-4d9d-a3ee-1233c457dc8e-v1/fish-a.svg"
    };
    
    var NUM_FISH = 20;
    //var TANK_WIDTH = 3.0; 
   // var TANK_HEIGHT = 1.0;  
   // var FISH_WIDTH = 0.3;
   // var FISH_LENGTH = 0.3; 
   // var MAX_SIGHT_DISTANCE = 0.8;
   // var MIN_SEPARATION = 0.40;
   // var AVOIDANCE_FORCE = 0.4;
   // var COHESION_FORCE = 0.05;
   //// var ALIGNMENT_FORCE = 1.05;
   // var SWIMMING_FORCE = 0.05;
  //  var SWIMMING_SPEED = 1.5;

var TANK_WIDTH = 3.0; 
var TANK_HEIGHT = 1.0;  
var FISH_WIDTH = 0.13;
var FISH_LENGTH = 0.25; 
var MAX_SIGHT_DISTANCE = 0.8;
var MIN_SEPARATION = 0.20;
var AVOIDANCE_FORCE = 0.2;
var COHESION_FORCE = 0.05;
var ALIGNMENT_FORCE = 0.05;
var SWIMMING_FORCE = 0.05;
var SWIMMING_SPEED = 0.6;
 
    var fishLoaded = false; 
    var fish = [];

    var aquariumModel = null;

    var lowerCorner = { x: 0, y: 0, z: 0 };
    var upperCorner = { x: 0, y: 0, z: 0 };

    function onClicked() {
        if (buttonActivated) {
            cleanupFish();
            button.editProperties({isActive: false});
            buttonActivated = false;
            Script.update.disconnect(updateFish);
            fishLoaded = false;
        } else {
            Script.update.connect(updateFish);
            button.editProperties({isActive: true});
            buttonActivated = true;
        }
    }
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var button = tablet.addButton({
        icon: ICONS.icon,
        activeIcon: ICONS.activeIcon,
        text: TABLET_BUTTON_NAME,
        sortOrder: 1
    });
    
    button.clicked.connect(onClicked);
        
    function randomVector(scale) {
        return { x: Math.random() * scale - scale / 2.0, y: Math.random() * scale - scale / 2.0, z: Math.random() * scale - scale / 2.0 };
    }

    function updateFish(deltaTime) {
        if (!Entities.serversExist() || !Entities.canRez()) {
            return;
        }
        if (!fishLoaded) {
            var center = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), 2 * TANK_WIDTH));
            lowerCorner = { x: center.x - TANK_WIDTH / 2, y: center.y - 1, z: center.z - TANK_WIDTH / 2 };
            upperCorner = { x: center.x + TANK_WIDTH / 2, y: center.y + TANK_HEIGHT, z: center.z + TANK_WIDTH / 2 };
            
            aquariumModel = Entities.addEntity({
                name: 'aquariumModel',
                dimensions: { x: 4, y: 2, z: 3.5 },
                type: 'Model',
                position: { x: center.x, y: center.y + 0.5, z: center.z },
                modelURL: 'http://mpassets.highfidelity.com/4535b57c-f35a-4d9d-a3ee-1233c457dc8e-v1/aquarium.fbx',
                shapeType: 'box'
            });
            
            loadFish(NUM_FISH);
            fishLoaded = true;
            return;
        }

        var averageVelocity = { x: 0, y: 0, z: 0 };
        var averagePosition = { x: 0, y: 0, z: 0 };
        var birdPositionsCounted = 0;
        var birdVelocitiesCounted = 0;

        // First pre-load an array with properties  on all the other fish so our per-fish loop
        // isn't doing it. 
        var flockProperties = [];
        for (var i = 0; i < fish.length; i++) {
            var otherProps = Entities.getEntityProperties(fish[i].entityId, ["position", "velocity", "rotation"]);
            flockProperties.push(otherProps);
        }

        for (var i = 0; i < fish.length; i++) {
            if (fish[i].entityId) {
                // Get only the properties we need, because that is faster
                var properties = flockProperties[i];
                //  If fish has been deleted, bail
                if (properties.id != fish[i].entityId) {
                    fish[i].entityId = false;
                    return;
                }

                // Store old values so we can check if they have changed enough to update
                var velocity = { x: properties.velocity.x, y: properties.velocity.y, z: properties.velocity.z };
                var position = { x: properties.position.x, y: properties.position.y, z: properties.position.z };
                averageVelocity = { x: 0, y: 0, z: 0 };
                averagePosition = { x: 0, y: 0, z: 0 };

                var othersCounted = 0;
                for (var j = 0; j < fish.length; j++) {
                    if (i != j) {
                        // Get only the properties we need, because that is faster
                        var otherProps = flockProperties[j];
                        var separation = Vec3.distance(properties.position, otherProps.position);
                        if (separation < MAX_SIGHT_DISTANCE) {
                            averageVelocity = Vec3.sum(averageVelocity, otherProps.velocity);
                            averagePosition = Vec3.sum(averagePosition, otherProps.position);
                            othersCounted++;
                        }
                        if (separation < MIN_SEPARATION) {
                            var pushAway = Vec3.multiply(Vec3.normalize(Vec3.subtract(properties.position, otherProps.position)), AVOIDANCE_FORCE);
                            velocity = Vec3.sum(velocity, pushAway);
                        }
                    }
                }

                if (othersCounted > 0) {
                    averageVelocity = Vec3.multiply(averageVelocity, 1.0 / othersCounted);
                    averagePosition = Vec3.multiply(averagePosition, 1.0 / othersCounted);
                    //  Alignment: Follow group's direction and speed
                    velocity = Vec3.mix(velocity, Vec3.multiply(Vec3.normalize(averageVelocity), Vec3.length(velocity)), ALIGNMENT_FORCE);
                    // Cohesion: Steer towards center of flock
                    var towardCenter = Vec3.subtract(averagePosition, position);
                    velocity = Vec3.mix(velocity, Vec3.multiply(Vec3.normalize(towardCenter), Vec3.length(velocity)), COHESION_FORCE);
                }

                //  Try to swim at a constant speed
                velocity = Vec3.mix(velocity, Vec3.multiply(Vec3.normalize(velocity), SWIMMING_SPEED), SWIMMING_FORCE);

                //  Keep fish in their 'tank' 
                if (position.x < lowerCorner.x) {
                    position.x = lowerCorner.x; 
                    velocity.x *= -1.0;
                } else if (position.x > upperCorner.x) {
                    position.x = upperCorner.x; 
                    velocity.x *= -1.0;
                }
                if (position.y < lowerCorner.y) {
                    position.y = lowerCorner.y; 
                    velocity.y *= -1.0;
                } else if (position.y > upperCorner.y) {
                    position.y = upperCorner.y; 
                    velocity.y *= -1.0;
                } 
                if (position.z < lowerCorner.z) {
                    position.z = lowerCorner.z; 
                    velocity.z *= -1.0;
                } else if (position.z > upperCorner.z) {
                    position.z = upperCorner.z; 
                    velocity.z *= -1.0;
                } 

                //  Orient in direction of velocity 
                var rotation = Quat.rotationBetween(Vec3.UNIT_NEG_Z, velocity);
                var VELOCITY_FOLLOW_RATE = 0.30;

                //  Only update properties if they have changed, to save bandwidth
                var MIN_POSITION_CHANGE_FOR_UPDATE = 0.001;
                if (Vec3.distance(properties.position, position) < MIN_POSITION_CHANGE_FOR_UPDATE) {
                    Entities.editEntity(fish[i].entityId, { velocity: velocity, rotation: Quat.mix(properties.rotation, rotation, VELOCITY_FOLLOW_RATE) });
                } else {
                    Entities.editEntity(fish[i].entityId, { position: position, velocity: velocity, rotation: Quat.slerp(properties.rotation, rotation, VELOCITY_FOLLOW_RATE) });
                }
            }
        }
    }

    Script.scriptEnding.connect(function() {
            cleanupFish();
            button.clicked.disconnect(onClicked);
            tablet.removeButton(button);
    });

    //  Delete our little friends and the aquarium if the function/script is stopped
    function cleanupFish() {
        for (var i = 0; i < fish.length; i++) {
            Entities.deleteEntity(fish[i].entityId);
        }
        Entities.deleteEntity(aquariumModel);
    }
    
    var STARTING_FRACTION = 0.25; 
    function loadFish(howMany) {
      var center = Vec3.sum(MyAvatar.position, Vec3.multiply(Quat.getFront(MyAvatar.orientation), 2 * TANK_WIDTH));
      lowerCorner = { x: center.x - TANK_WIDTH / 2, y: center.y, z: center.z - TANK_WIDTH / 2 };
      upperCorner = { x: center.x + TANK_WIDTH / 2, y: center.y + TANK_HEIGHT, z: center.z + TANK_WIDTH / 2 };
      
      for (var i = 0; i < howMany; i++) {
        var position = { 
            x: lowerCorner.x + (upperCorner.x - lowerCorner.x) / 2.0 + (Math.random() - 0.5) * (upperCorner.x - lowerCorner.x) * STARTING_FRACTION, 
            y: lowerCorner.y + (upperCorner.y - lowerCorner.y) / 2.0 + (Math.random() - 0.5) * (upperCorner.y - lowerCorner.y) * STARTING_FRACTION, 
            z: lowerCorner.z + (upperCorner.z - lowerCorner.x) / 2.0 + (Math.random() - 0.5) * (upperCorner.z - lowerCorner.z) * STARTING_FRACTION
        }; 

        fish.push({
            entityId: Entities.addEntity({
                        type: "Model",
                        position: position,
                        rotation: { x: 0, y: 0, z: 0, w: 1 },
                        dimensions: { x: FISH_WIDTH, y: FISH_WIDTH, z: FISH_LENGTH },
                        velocity: { x: SWIMMING_SPEED, y: SWIMMING_SPEED, z: SWIMMING_SPEED },
                        damping: 0.0,
                        dynamic: false,
                        modelURL: "https://s3-eu-west-1.amazonaws.com/cainkilgore-prod/files/goldfishNonShiny3.fbx",
                        shapeType: "sphere",
                        collisionless: 1,
                        collisionMask: 0
            })
          });
        }
    }
}());

