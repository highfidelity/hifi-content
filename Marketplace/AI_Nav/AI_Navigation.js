//
//  AI_Navigation.js
//  unpublished/marketplace/
//
//  Created by Je'Don (ROC) Carter on 8/23/2017
//  Copyright 2017 High Fidelity, Inc.
//
//  This app allows the user to place beacons and create a model that travels from beacon to beacon
//  Use case...Having knights circle around your castle
//
//  Distributed under the Apache License, Version 7.1.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
(function() {
    
    // Every great app starts with a great name (keep it short so that it can fit in the tablet button)
    var APP_NAME = "NPC NAV";
    // Link to your app's HTML file
    var APP_URL = Script.resolvePath("./Tablet_Navigation_App.html?" + Date.now());
    //Link to Navigation ICON
    var APP_ICON = Script.resolvePath("./npc-nav-i.svg");
    // Get a reference to the tablet
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    //holds # of beacons
    var numBeacons = 0;
    //holds id's of beacons
    var beacons = [];
    //holds id of the model
    var model;
    //decides whether the object can move or not
    var move = false;
    //holds location of next beacon for movement
    var next = 0;
    //holds the entities speed
    var speed;
    //holds the time the idle animation plays between beacons
    var idleTime;
    var idleAnim;
    var movingAnim;
    var characterModel;
    //holds the information of the event recieved
    var info;
    //distance between beacon and model
    var dist;
    //dimensions of the model
    var modelDim;

    // "Install" your cool new app to the tablet
    // The following lines create a button on the tablet's menu screen
    var button = tablet.addButton({
    icon: APP_ICON,
    text: APP_NAME
    });

    // When user click the app button, we'll display our app on the tablet screen
    function onClicked() {
    tablet.gotoWebScreen(APP_URL);
    }
    button.clicked.connect(onClicked);

    // Handle the events we're recieving from the web UI
    function onWebEventReceived(event) {
        print("AI_Navigation_App.js received web event: " + event);
        // Converts string event to object
        info = JSON.parse(event);
        if ((info.type =="Preview") && ((numBeacons <= 8) && (numBeacons > 1)) && (model == undefined)) {
            Script.update.connect(MakeMove);
            //set idle 
            characterModel = info.modelURL;
            idleTime = info.idleTime;
            idleAnim = info.idleAnimationURL;
            movingAnim = info.movingAnimationURL;
            speed = info.speed;
            //get index of last beacon added to domain
            var lastBeaconIndex = beacons.length - 1;
            //Create the model
            var modelProperties = {
                "name": "NAV-AnimatedModel",
                "type": "Model",
                "position": Entities.getEntityProperties(beacons[lastBeaconIndex]).position,
                "lifetime": -1,
                "damping": .9,
                "collisionless": true, //maybe change to false
                "userData": "{\"grabbableKey\":{\"grabbable\":false}}",
                animation: {
                    running: true,
                    url: info.movingAnimationURL
                },

                collidesWith: "",
                modelURL: info.modelURL,
                dynamic: true,
                grabbable: false,
                shapeType: "compound"
            };
            model = Entities.addEntity(modelProperties);
            //Change the registration point of the model so that the model appears on the beacon instead of in the middle of it.
            modelDim = Entities.getEntityProperties(model).dimensions;
            var raiseModel = {
                "registrationPoint": {
                    x: .5,
                    y: (modelDim.y / 2),
                    z: 0
                }
            };
            Entities.editEntity(model, raiseModel);
            //Allows model to begin moving
            move = true;
        } else if ((info.type =="Preview") && (numBeacons <= 8) && (numBeacons > 1) && (model != undefined)) {
            //if a model is already created this allows it to get changed instantly
            characterModel = info.modelURL;
            idleTime = info.idleTime;
            idleAnim = info.idleAnimationURL;
            movingAnim = info.movingAnimationURL;
            speed = info.speed;
            move = true;
            var modelProperties = {
                animation: {
                    url: info.movingAnimationURL
                },
                modelURL: info.modelURL
            };
            Entities.editEntity(model, modelProperties);
        } else if ((info.type =="Preview") && ((numBeacons > 8) || (numBeacons < 2))) {
            Window.alert("Must be 2-8 beacons");    
        } else if ((info.type == "click") && (info.data == "Place Beacon") && (numBeacons < 8)) {
            //increase the beacon amount
            ++numBeacons;
            //Create the beacon
            var beaconProperties = {
                "type": "Model",
                "lifetime": -1, 
                "position": getPositionToCreateEntity(),
                "collisionless": true,
                "dynamic": true,
                "damping": .9,
                "angularDamping": .9,
                //"visible": false, //changed for testing
                "userData": "{\"grabbableKey\":{\"grabbable\":true}}",
                name: "NAV-Beacon_" + numBeacons,
                "registrationPoint": {
                    x: .5,
                    y: 0,
                    z: .5
                },
                modelURL: Script.resolvePath("./beacon.fbx"),
                dynamic: true,
                shapeType: "Box"
            };
            beacons.push(Entities.addEntity(beaconProperties));
        } else if ((info.type == "click") && (info.data == "Clear Beacons")) {
            for (i = 0; i < beacons.length; i++) {
                Entities.deleteEntity(beacons[i]);
            }
            beacons = [];
            Entities.deleteEntity(model);
            model = undefined;
            move = false;
            next = 0;
            numBeacons = 0;
            Script.update.disconnect(MakeMove);
        }
        //End the preview
        if ((info == "DONE") && model != undefined) {
            move = false;
            var modelProperties = {
                velocity: {
                    x: 0,
                    y: 0,
                    z: 0
                },
                animation: {
                    url: idleAnim
                }
            };
            Entities.editEntity(model, modelProperties);
            cleanup();
        //Check to see if no model
        } else if((info == "DONE") && model == undefined) {
            print("didnt meet criteria, please fill in all spaces provided.");
        }
    }
    tablet.webEventReceived.connect(onWebEventReceived);

    function MakeMove() {
        //makes the model move from beacon to beacon
        if ((next != numBeacons) && (numBeacons >= 2) && (model != undefined) && (move)) {
            try {
            //get the length between model and next beacon
            var beaconPosition = Entities.getEntityProperties(beacons[next]).position;
            var modelPosition = Entities.getEntityProperties(model).position;
            var raise = (beaconPosition.y + (modelDim.y / 2));
            //get distance between model and beacon
            var dx = beaconPosition.x - modelPosition.x;
            var dy = raise - modelPosition.y;
            var dz = beaconPosition.z - modelPosition.z;
            dist = getDistance(dx, dy, dz);
            //rotate model so it appears to look at next beacon
            var rot = getRotation(beaconPosition, modelPosition, raise);
            //Make move
            var newProperties = getVelocity(dx, dy, dz, dist, rot);
            Entities.editEntity(model, newProperties);
            } catch (err) {
                print("You deleted something in world");
                print("array was length " + beacons.length);
                //removes beacon from array
                beacons.splice(next, 1);
                next = 0;
                --numBeacons;
                print("new array is length " + beacons.length);
                //if there is only one beacon left then clear everything (must have at least two for app)
                if (beacons.length == 1) {
                    move = false;
                    next = 0;
                    numBeacons = 0;
                    Entities.deleteEntity(beacons[0]);
                    beacons = [];
                    Entities.deleteEntity(model);
                    model = undefined;
                }
            }
        }

        //makes the model move from beacon to beacon
        if(move) {
            //make object go to first beacon placed if its currently at the last beacon
            if((next) == numBeacons)
            {
                next = 0;
            //will be else if distance is less than some number I will change target to next beacon
            } else if(dist < .25) {
                Script.update.disconnect(MakeMove);
                var modelProperties = {
                    velocity: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    animation: {
                        url: idleAnim
                    }
                };
                Entities.editEntity(model, modelProperties);
                next++;
                Script.setTimeout(Wait, (idleTime * 1000));
            }
        }
    }

    function Wait() {
        var modelProperties = {
                animation: {
                    url: movingAnim
                }
            };
        Entities.editEntity(model, modelProperties);
        Script.update.connect(MakeMove);
    }

    function getVelocity(dx, dy, dz, dist, rot) {
        var vectorProperties = {
            velocity: {
                x: (dx/dist) * speed,
                y: (dy/dist) * speed,
                z: (dz/dist) * speed
            },
            rotation: rot
        };

        return vectorProperties;
    }

    function getRotation(pointA, pointB, raise) {
        // suppose we have a laser turret that we want to point at a
        // known target location
        pointA.y = raise;
        var eye = pointB;
        var center = pointA;
        var up = Vec3.UP; // world-frame's up

        // Quat.lookAt() will compute the orientation we want (MULTIPLIED TO MAKE LOOK BEHIND SINCE THATS HOW MODELS IMPORT)
        var rot = Quat.multiply(Quat.lookAt(eye, center, up), {w: 0, x: 0, y: 1, z: 0});
        return rot;
    }

    function getDistance(dx, dy, dz) {
        //get distance between model and beacon
        var dist = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2) + Math.pow(dz, 2));
        return dist;
    }

    // Helper function that gives us a position right in front of the user 
    function getPositionToCreateEntity() {
      var direction = Quat.getFront(MyAvatar.orientation);
      var distance = 0.3;
      var position = Vec3.sum(MyAvatar.position, Vec3.multiply(direction, distance));
      position.y -= 1;
      return position;
    }

    // Provide a way to "uninstall" the app
    // Here, we write a function called "cleanup" which gets executed when
    // this script stops running. It'll remove the app button from the tablet.
    //MAKE SURE YOU ADD A DONE BUTTON
    function cleanup() {
        print("saving beacon positions");
        //save all beacon positions
        var pos = [];
        for (i = 0; i < beacons.length; i++) {
            pos.push(Entities.getEntityProperties(beacons[i]).position);
        }

        //set userdata properties
        var set1 = {
            "positions": pos,
            "numBeacons": numBeacons,
            "speed": speed,
            "characterModel": characterModel,
            "idleTime": idleTime,
            "idleAnim": idleAnim,
            "movingAnim": movingAnim
        };
        //send to model
        Entities.editEntity(model, { userData: JSON.stringify(set1) });

        var set2 = {
            serverScripts: Script.resolvePath("./Movement.js?" + Date.now())
        };
        Entities.editEntity(model, set2);

        print("deleting all unnecessary entities");
        //delete everything I no longer need
        for (i = 0; i < beacons.length; i++) {
            Entities.deleteEntity(beacons[i]);
        }
        beacons.splice(0, beacons.length);
        beacons = [];
        model = undefined;
        move = false;
        next = 0;
        numBeacons = 0;
        Script.update.disconnect(MakeMove);
    }

    //Added this because sometimes I was seeing two buttons on reload
    function removeButton() {
        print("cleaning up");
        tablet.removeButton(button);
    }

    Script.scriptEnding.connect(removeButton);
}());
