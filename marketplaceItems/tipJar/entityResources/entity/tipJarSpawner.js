/*

    tipJar
    tipJarSpawner.js
    Created by Milad Nazeri on 2019-01-24
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Spawn file for the tipJar

*/


var SPAWN_DISTANCE_METERS = 2;
var entity = null;
var clientScript = Script.resolvePath("../entityClientScripts/tipJar_client.js?" + Date.now());
var tipJarJSON = Script.require("./tipJar.json?" + Date.now()).Entities[0];

tipJarJSON.script = clientScript;
tipJarJSON.position = Vec3.sum(
    MyAvatar.position,
    Vec3.multiply(
        Quat.getForward(MyAvatar.orientation), 
        SPAWN_DISTANCE_METERS
    ) 
);

tipJarJSON.description = 
        "Welcome to the TipJar!\n\n Just drop this in your domain if you have edit rights\n" +
        "In the userData, put in the destination username the money is going to\n" +
        "The amount you would like to tip(it will get rounded to the nearest integer\n" +
        "And finally put in a message you would like them to see";
tipJarJSON.userData = JSON.stringify({
    destinationName: "this is who the money will go to",
    hfcAmount: 1,
    message: "This is the message your guests will see and send to you"
});

entity = Entities.addEntity(tipJarJSON);

Script.scriptEnding.connect(function(){
    Entities.deleteEntity(entity);
});