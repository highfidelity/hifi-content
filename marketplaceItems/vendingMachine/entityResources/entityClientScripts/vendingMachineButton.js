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
        
        var position = Entities.getEntityProperties(_entityID, 'position').position;
        var options = AUDIO_OPTIONS;
        options.position = position;
        soundInjector = Audio.playSound(sound, options);
    }
    

    // Grab the entityID on preload, load sounds, and check marketplaceIDs.
    var VEND_SOUND_URL = Script.resolvePath('../resources/sounds/vend.wav');
    var _entityID = null;
    var vendSound = null;
    var vendingMachineItems;
    function preload(entityID) {
        _entityID = entityID;
        vendingMachineItems = Script.require(Script.resolvePath('vendingMachineItems.json'));
        vendSound = SoundCache.getSound(VEND_SOUND_URL);
        var props = Entities.getEntityProperties(_entityID, ["type", "name"]);
        var imageURL = "https://hifi-metaverse.s3-us-west-1.amazonaws.com/marketplace/previews/" +
            vendingMachineItems[props.name] + "/large/hifi-mp-" + vendingMachineItems[props.name] + ".jpg";
        if (props.type === "Image") {
            Entities.editEntity(_entityID, {
                "imageURL": imageURL,
                emissive: true
            });
        }
    }


    // This plays the vending sound and opens up the checkout page on the tablet for the selected item
    function buttonActivated() {
        playAudio(vendSound);
        var name = Entities.getEntityProperties(_entityID, ["name"]).name;
        checkoutItem(vendingMachineItems[name]);
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


    function VendingMachineButton() {}
    

    VendingMachineButton.prototype = {
        preload: preload,
        clickDownOnEntity: clickDownOnEntity,
        startNearTrigger: startNearTrigger,
        startFarTrigger: startFarTrigger
    };


    return new VendingMachineButton();
});
