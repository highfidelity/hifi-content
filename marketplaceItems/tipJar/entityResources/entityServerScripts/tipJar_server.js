/*

    Name
    name.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function() {
    
    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    
    // *************************************
    // START UTILITY
    // *************************************
    // #region UTILITY


    function updateText() {
        var textProps = {
            text: "deposited: " + amountDeposited + "   current Money Level: " + currentMoneyLevel
        };
        Entities.editEntity(textEntity, textProps);
    }

    // #endregion
    // *************************************
    // END UTILITY
    // *************************************

    // *************************************
    // START INIT
    // *************************************
    // #region INIT


    var _entityID;
    var amountDeposited = 0;

    var LOW = 5;
    var MEDIUM = 10;
    var HIGH = 15;

    var fst = "https://hifi-content.s3.amazonaws.com/milad/ROLC/Organize/O_Projects/Hifi/Assets/Avatar/stickMilad_rigged %282%29.fst";
    var LOW_ANIMATION_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/marketplaceItems/partyBall/entityResources/resources/animations/Flair%20it%20Up%2075.fbx";
    var MEDIUM_ANIMATION_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/marketplaceItems/partyBall/entityResources/resources/animations/Runnin%20Man%20326.fbx";
    var HIGH_ANIMATION_URL = "https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/marketplaceItems/partyBall/entityResources/resources/animations/Swing%20so%20happy%20628.fbx";

    var textEntity = null;

    var currentState = "initialize";
    var currentMoneyLevel = "low";

    var soundURL = Script.resolvePath('../resources/sounds/bell.wav');

    var dancer = null;
    var sound = null;
    var injector = null;
    var audioOptions = {
        volume: 0.5
    }

    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START STATE_MACHINE
    // *************************************
    // #region STATE_MACHINE

    // function transitionToNextState(nextState) {
    //     switch(nextState) {
    //         case "initialize":
    //         case "idle":
    //         case "someoneClicked":
    //         case "money low":
    //         case "money medium":
    //         case "money high":
    //     }
    // }

    // #endregion
    // *************************************
    // END STATE_MACHINE
    // *************************************

    // *************************************
    // START eventHandlers
    // *************************************
    // #region eventHandlers


    function onUserClicked(id, param){
        log("user clicked");
        amountDeposited += +param[0];
        updateText();
        playAudio();
        log("amount deposited", amountDeposited);
        switch (true) {
            case amountDeposited < LOW :
                currentMoneyLevel = "low";
                playAnimation("low");
                break;
            case amountDeposited < MEDIUM :
                currentMoneyLevel = "medium";
                playAnimation("medium");
                break;
            case amountDeposited < HIGH :
                currentMoneyLevel = "high";
                playAnimation("high");
                break;
        }
    }

    
    function playAudio(){
        log("playing audio");
        var position = Entities.getEntityProperties(_entityID, 'position').position;
        audioOptions.position = position;
        injector = Audio.playSound(sound, audioOptions);
    }

    // *************************************
    // END eventHandlers
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION


    // Initialize the entity on preload
    var dancerProps = {   
        name: "tipJar dancer",
        type: "Model",
        visible: true,
        modelURL: fst,
        dimensions: [1,1,1]

    };

    var textProps = {
        name: "Tip text",
        type: "Text",
        dimensions: [1,1,0],
        text: "deposited: " + amountDeposited + "   current Money Level: " + currentMoneyLevel
    };

    function preload(entityID) {
        _entityID = entityID;
        sound = SoundCache.getSound(soundURL);
        dancerProps.parentID = _entityID;
        dancerProps.localPosition = [1,0,0];
        textProps.parentID = _entityID;
        textProps.localPosition = [0,1.5,0];
        dancer = Entities.addEntity(dancerProps);
        textEntity = Entities.addEntity(textProps);
    }

    function stopAnimation(){
        var props = {
            animation: {
                running: false,
                loop: false,
                hold: false,
                firstFrame: 0,
                currentFrame: 0
            }
        };
        Entities.editEntity(dancer, props);  
    }

    var TIMEOUT = 1000;
    function playAnimation(type){
        log("in play animation", type)
        var props = {
            animation: {
                url: "",
                running: false,
                loop: false,
                hold: false,
                firstFrame: 0,
                currentFrame: 0
            }
        };
        // Entities.editEntity(dancer, props);

        switch (type) {
            case "low":
                log("in low");
                props.animation.url = LOW_ANIMATION_URL;
                props.animation.running = true;
                Script.setTimeout(stopAnimation, TIMEOUT);
                break;
            case "medium":
                log("in medium");

                props.animation.url = MEDIUM_ANIMATION_URL;
                props.animation.running = true;
                Script.setTimeout(stopAnimation, TIMEOUT);

                break;
            case "high":
                log("in high");
                props.animation.url = HIGH_ANIMATION_URL;
                props.animation.running = true;
                Script.setTimeout(stopAnimation, TIMEOUT);

                break;
            case "idle":
                props.animation.running = false;
                
        }
        log("props", props);
        Entities.editEntity(dancer, props);
    }

    // Clean up for when the entity is unloaded
    function unload() {
        Entities.deleteEntity(textEntity);
        Entities.deleteEntity(dancer);
    }


    function Name() { }

    Name.prototype = {
        remotelyCallable: ["userClicked"],
        userClicked: onUserClicked,
        preload: preload,
        unload: unload
    };

    return new Name();

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});

/*

        animation: {
            url: this.randomAnimation,
            running: true
        }


*/