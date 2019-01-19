/*

    Party Ball
    partyBall.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function(){

    // *************************************
    // START MODULES
    // *************************************
    // #region MODULES
    

    Script.resetModuleCache(true);
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js');
    var danceCollection = Script.require("../modules/collection_animations.js?" + Date.now());
    var textureCollection = Script.require("../modules/collection_textures.js?" + Date.now());

    danceCollection.forEach(function(animation){
        log("animation", animation);
        ModelCache.prefetch(animation);
    });
    
    textureCollection.forEach(function(texture){
        // log("texture", texture);
        TextureCache.prefetch(texture);
    });

    // #endregion
    // *************************************
    // END MODULES
    // *************************************

    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    
    
    var _entityID;

    
    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    // Register the entity id with module that need it, make the ball dynamic, and prep the sounds
    function preload(entityID){
        log("in PreLoad");
        _entityID = entityID;
    }


    function recordNewTouch(){
        log("mousePressOnEntity");
        var id = MyAvatar.sessionUUID;
        var timeStamp = Date.now();
        var skeletonModelURL = MyAvatar.skeletonModelURL;
        var data = JSON.stringify({ id: id, timeStamp: timeStamp, skeletonModelURL: skeletonModelURL });        
        Entities.callEntityServerMethod(_entityID, "newAvatarTouch", [data]);
    }


    // Grab the User ID of whoever last clicked on it
    function mousePressOnEntity(mouseEvent){
        if (!mouseEvent.button === "Primary") {
            return;
        }
        recordNewTouch();
    }


    // Grab the User ID of whoever last grabbed it
    function startNearGrab(){
        recordNewTouch();
    }


    // Clear the explodeTimer if there is one
    function unload(){
    }


    function PartyBall(){}
    
    PartyBall.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity,
        startNearGrab: startNearGrab,
        unload: unload
    };

    return new PartyBall();
    
    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
