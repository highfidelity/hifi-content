/*

    Party Ball
    partyBall_client.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function() {

    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    

    // Bring in the texture and animation modules to cache before they are played on a client
    var danceCollection = Script.require("../modules/collection_animations.js?" + Date.now());
    var textureCollection = Script.require("../modules/collection_textures.js?" + Date.now());

    danceCollection.forEach(function(animation){
        ModelCache.prefetch(animation);
    });
    
    textureCollection.forEach(function(texture){
        TextureCache.prefetch(texture);
    });
    
    var _entityID;

    
    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    // Grab the entityID on preload
    function preload(entityID){
        _entityID = entityID;
    }


    // Get the naturalDimensions for the newly created Dancer and send them back to the server script as a string
    function getDancerDimensions(id, properties){
        var entityIDToPeekNaturalDimensions = properties[0];
        var entityProperties = Entities.getEntityProperties(entityIDToPeekNaturalDimensions, "naturalDimensions");
        var naturalDimensions = JSON.stringify(entityProperties.naturalDimensions);
        Entities.callEntityServerMethod(_entityID, "updateNaturalDimensions", [naturalDimensions]);
    }

    
    // Send info about who just touched the ball to the Entity Script Server
    function recordNewTouch(){
        var id = MyAvatar.sessionUUID;
        var timeStamp = Date.now();
        var skeletonModelURL = MyAvatar.skeletonModelURL;
        var data = JSON.stringify({ 
            id: id, 
            timeStamp: timeStamp, 
            skeletonModelURL: skeletonModelURL
        });     

        Entities.callEntityServerMethod(_entityID, "newAvatarTouch", [data]);
    }


    // Grab the User ID of whoever last near grabbed it
    function startNearGrab(){
        recordNewTouch();
    }


    // Grab the user ID of whoever last far grabbed it
    function startDistanceGrab(){
        recordNewTouch();
    }

    
    function PartyBall(){}
    
    PartyBall.prototype = {
        remotelyCallable: ["getDancerDimensions"],
        preload: preload,
        getDancerDimensions: getDancerDimensions,
        startNearGrab: startNearGrab,
        startDistanceGrab: startDistanceGrab
    };

    return new PartyBall();
    

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
