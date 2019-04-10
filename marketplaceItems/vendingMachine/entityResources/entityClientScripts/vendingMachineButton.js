/*
    Vending Machine!
    vendingMachineButton.js
    Created by Mark Brosche and Zach Fox on 2019-02-27
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
*/

(function() { 
    // This function opens up the checkout page for the given marketplaceID.
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    function checkoutItem(marketplaceID) {
        tablet.loadQMLSource("hifi/commerce/checkout/Checkout.qml");
        tablet.sendToQml({method: 'updateCheckoutQMLItemID', params: {itemId: marketplaceID}});
    }


    // This function checks for playing audio injectors before starting a new audio sound.
    var AUDIO_OPTIONS = {
        volume: 0.2,
        localOnly: false
    };
    var soundInjector = false;
    function playAudio(sound) {
        if (soundInjector && soundInjector.isPlaying()) {
            soundInjector.stop();
        }
        
        var position = Entities.getEntityProperties(that.entityID, 'position').position;
        var options = AUDIO_OPTIONS;
        options.position = position;
        soundInjector = Audio.playSound(sound, options);
    }


    // Parses the entity's `userData` and returns the `marketplaceID`
    function getMarketplaceIDFromUserData() {
        var properties = Entities.getEntityProperties(that.entityID, ["userData"]);
        var userData;

        try {
            userData = JSON.parse(properties.userData);
        } catch (e) {
            console.error("Error parsing userData: ", e);
            return false;
        }

        if (userData) {
            if (userData.marketplaceID) {
                return userData.marketplaceID;
            } else {
                console.log("Please specify `marketplaceID` inside this entity's `userData`!");
                return false;
            }
        } else {
            console.log("Please specify this entity's `userData`! See README.md for instructions.");
            return false;
        }
    }


    // If this script is attached to an image entity, update the image URL of that entity
    // to the thumbnail associated with the relevant marketplace item
    var AFTER_UNLOCK_TIMEOUT_MS = 600;
    function updateImageEntity() {        
        if (!that.marketplaceID) {
            return;
        }

        var props = Entities.getEntityProperties(that.entityID, ["type"]);
        if (props.type === "Image") {
            Entities.editEntity(that.entityID, {
                "locked": false
            });

            Script.setTimeout(function() {
                var imageURL = "https://hifi-metaverse.s3-us-west-1.amazonaws.com/marketplace/previews/" +
                    that.marketplaceID + "/large/hifi-mp-" + that.marketplaceID + ".jpg";
                Entities.editEntity(that.entityID, {
                    "imageURL": imageURL,
                    "emissive": true,
                    "locked": true
                });
            }, AFTER_UNLOCK_TIMEOUT_MS);
        }
    }
    

    // Grab the entityID on preload, load sounds, and check marketplaceIDs.
    var VEND_SOUND_URL = Script.resolvePath('../resources/sounds/vend.wav');
    function preload(entityID) {
        that.entityID = entityID;
        that.vendSound = SoundCache.getSound(VEND_SOUND_URL);
        that.marketplaceID = getMarketplaceIDFromUserData();
        updateImageEntity();
    }


    // This plays the vending sound and opens up the checkout page on the tablet for the selected item
    function buttonActivated() {
        if (!that.marketplaceID) {
            that.marketplaceID = getMarketplaceIDFromUserData();
        }
        
        if (!that.marketplaceID) {
            return;
        }

        playAudio(that.vendSound);
        checkoutItem(that.marketplaceID);
    }


    // Handle if mouse pressed down on entity
    function clickDownOnEntity(id, event) {
        if (event.button === "Primary") {
            buttonActivated();
        }
    }

    
    // Handle near triggered on entity
    function startNearTrigger() {
        buttonActivated();
    }


    // Handle if far triggered on entity
    function startFarTrigger() {
        buttonActivated();
    }


    var that;
    function VendingMachineButton() {
        that = this;
    }
    

    VendingMachineButton.prototype = {
        preload: preload,
        clickDownOnEntity: clickDownOnEntity,
        startNearTrigger: startNearTrigger,
        startFarTrigger: startFarTrigger
    };


    return new VendingMachineButton();
});
