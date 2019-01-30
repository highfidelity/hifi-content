/*

    Tip Jar!
    tipJar_client.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Simple customizable client only tip jar

*/


(function() {

    // *************************************
    // START INIT
    // *************************************
    // #region INIT


    var request = Script.require('../modules/request.js').request;
        

    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START MONEY
    // *************************************
    // #region MONEY
    
    
    var METAVERSE_BASE = Account.metaverseServerURL;
    var BALANCE_URL = METAVERSE_BASE + '/api/v1/commerce/balance';

    // Options request uses
    var options = {};
    options.uri = BALANCE_URL;
    options.method = "POST";


    // Before the user pays, check to see what their current balance is
    function getFirstBalance() {
        // This is so we don't start the process again if the user has clicked and we haven't finished going through
        // getting the updated balance process.  This flag gets set back to false when the entire balance check sequence ends.
        if (receivedFirstBalance) {
            return;
        }
        request(options, getFirstBalanceCallBack);
    }


    // When we have the first balance, we initiate getting the second balance
    function getSecondBalance() {
        request(options, getSecondBalanceCallBack);
    }


    // Callback that is run after we request the first balance
    var TIME_TILL_SECOND_BALANCE_CHECK_TIMEOUT_MS = 2500;
    var MAXIMUM_FIRST_BALANCE_RETRIES = 5;
    var FIRST_BALANCE_CHECK_INTERVAL = 250;
    var firstBalanceRetryCount = 0;
    var receivedFirstBalance = false;
    var firstBalance = null;
    function getFirstBalanceCallBack(error, result) {
        // If we have already received the first balance or we have reached past the retry count then
        // return from this callback.  
        if (receivedFirstBalance || firstBalanceRetryCount >= MAXIMUM_FIRST_BALANCE_RETRIES) {
            return;
        }

        // There was an error of some kind so retry. 
        if (error || result.status !== "success"){
            firstBalanceRetryCount++;
            Script.setTimeout(function(){
                request(options, getFirstBalanceCallBack);
            }, FIRST_BALANCE_CHECK_INTERVAL);
            return;
        }

        // We got the balance so call the commerce api and start calling for the second balance 
        firstBalance = result.data.balance;
        firstBalanceRetryCount = 0;
        receivedFirstBalance = true;

        Script.setTimeout(function(){
            getSecondBalance();
        }, TIME_TILL_SECOND_BALANCE_CHECK_TIMEOUT_MS);
    }


    // Called after we got the first balance to see if the tip went through
    var MAXIMUM_SECOND_BALANCE_RETRIES = 7;
    var SECOND_BALANCE_CHECK_INTERVAL = 1000;
    var secondBalanceRetryCount = 0;
    var secondBalance = null;
    function getSecondBalanceCallBack(error, result) {
        // The payment went through or we have hit the maximum amount of tries so return and reset balance related data
        if (didThePaymentGoThrough() || secondBalanceRetryCount >= MAXIMUM_SECOND_BALANCE_RETRIES) {
            resetBalanceChecks();
            return;
        }

        if (error || result.status !== "success"){
            secondBalanceRetryCount++;
            Script.setTimeout(function(){
                request(options, getSecondBalanceCallBack);
            }, SECOND_BALANCE_CHECK_INTERVAL);
            return;
        }

        secondBalance = result.data.balance;
        if (didThePaymentGoThrough()) {
            // The balance has gone through correctly.  Reset ur balance data and start feedback animation.
            resetBalanceChecks();
            startFeedback();
            return;
        }

        // Second balance isn't the right amount, trying again
        secondBalanceRetryCount++;
        Script.setTimeout(function(){
            request(options, getSecondBalanceCallBack);
        }, SECOND_BALANCE_CHECK_INTERVAL);
    }


    // Check to see if the payment went through by examining the two balances
    function didThePaymentGoThrough(){
        var targetBalance = firstBalance - hfcAmount;

        if (firstBalance === secondBalance) {
            return false;
        }

        if (secondBalance === targetBalance) {
            return true;
        }

        // Just in case something strange happened in the last 10ish seconds and their balance is now less than
        // the target balance
        return false; 
    }


    // Easy reset for the balance checks
    function resetBalanceChecks(){
        firstBalanceRetryCount = 0;
        secondBalanceRetryCount = 0;
        receivedFirstBalance = false;
        firstBalance = null;
        secondBalance = null;
    }


    // This function will open a user's tablet and prompt them to pay for VIP status.
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    function sendTip(hfcAmount, destinationName, message) {
        tablet.loadQMLSource("hifi/commerce/common/sendAsset/SendAsset.qml");
        tablet.sendToQml({
            method: 'updateSendAssetQML',
            assetCertID: "",
            amount: hfcAmount,
            username: destinationName,
            message: message
        });
    }

    
    // #endregion
    // *************************************
    // END MONEY
    // *************************************

    // *************************************
    // START ANIMATION
    // *************************************
    // #region ANIMATION
    
    
    // Play a local sound and return the audioinjector
    var audioOptions = {
        volume: 1.0,
        localOnly: true
    };
    function playAudio(sound){
        var position = Entities.getEntityProperties(_entityID, 'position').position;
        audioOptions.position = position;
        return Audio.playSound(sound, audioOptions);
    }
    

    // As of V78, there are some issues with FBX animation playback.  Deleting the overlay and recreating again works very well though for a seamless experience
    function stopAnimation(){
        Overlays.deleteOverlay(tipJar);
        createTipJarOverlay();
    }

    
    // Play the overlay animation and then delete it
    var ANIMATION_STOP_TIMEOUT_MS = 2300;
    var ANIMATION_URL = Script.resolvePath('../resources/models/tipJar_Anim.fbx');
    var newOverlayProperties = {
        animationSettings: {
            url: ANIMATION_URL,
            running: true,
            firstFrame: 0,
            lastFrame: 70,
            currentFrame: 0,
            allowTranslation: true,
            fps: 30
        }
    };
    function playAnimation(){
        Overlays.editOverlay(tipJar, newOverlayProperties);
        Script.setTimeout(stopAnimation, ANIMATION_STOP_TIMEOUT_MS);
    }


    // Start both the animation and play the sound when the coin drops into the money
    var TIMEOUT_FOR_COIN_DROP_AUDIO = 2000;
    var coinInjector = null;
    function startFeedback(){
        playAnimation();
        Script.setTimeout(function(){
            coinInjector = playAudio(coinSound);
        }, TIMEOUT_FOR_COIN_DROP_AUDIO);
    }
    
    
    // #endregion
    // *************************************
    // END ANIMATION
    // *************************************

    // *************************************
    // START OVERLAY
    // *************************************
    // #region OVERLAY
    
    
    // Create the model overlay where the box is
    var tipJar = null;
    var tipJarModel = Script.resolvePath("../resources/models/tipJar_Anim.fbx");
    var tipJarProps = {
        name: "tipjar",
        dimensions: {
            x: 0.57060835361480713,
            y: 0.6698657631874084,
            z: 0.47296142578125
        },
        url: tipJarModel,
        visible: true
    };
    function createTipJarOverlay() {
        var currentPosition = Entities.getEntityProperties(_entityID, "position").position;
        tipJarProps.parentID = _entityID;
        tipJarProps.position = currentPosition;
        tipJar = Overlays.addOverlay("model", tipJarProps);
    }
    
    
    // #endregion
    // *************************************
    // END OVERLAY
    // *************************************

    // *************************************
    // START USER_DATA
    // *************************************
    // #region USER_DATA
    
    
    // Checks to see if the userData is unique
    function isNewUserDataDifferent(oldUserData, newUserData){
        oldUserData = typeof oldUserData === "string" ? oldUserData : JSON.stringify(oldUserData);
        newUserData = typeof newUserData === "string" ? newUserData : JSON.stringify(newUserData);
        if (oldUserData === newUserData){
            return false;
        }

        return true;
    }


    // Get the latest userData before initiating payment
    var userData = {};
    var previousUserData = {};
    var destinationName = null;
    var hfcAmount = 0;
    var message = "";
    function getLatestUserData(){
        var newUserData = Entities.getEntityProperties(_entityID, 'userData').userData;
        if (isNewUserDataDifferent(previousUserData, newUserData)){
            previousUserData = "name" in userData ? userData : newUserData;
            userData = JSON.parse(newUserData);

            // In case someone puts something strange in for the number
            if (typeof userData.hfcAmount !== "number") {
                userData.hfcAmount = 1;
            }

            // hfc shows on inventory that it gets rounded, so go ahead and round the amount to clear up any confusion
            hfcAmount = Math.round(userData.hfcAmount);
            destinationName = userData.destinationName;
            message = userData.message;
        }
    }

    
    // #endregion
    // *************************************
    // END USER_DATA
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    // Grab the entityID on preload
    var COIN_SOUND_URL = Script.resolvePath('../resources/sounds/CoinsDrop_BW.6645_1497719.4.R.wav');
    var CLICK_SOUND_URL = Script.resolvePath('../resources/sounds/beep.mp3');
    var _entityID = null;
    var coinSound = null;
    var clickSound = null;
    function preload(entityID) {
        _entityID = entityID;
        coinSound = SoundCache.getSound(COIN_SOUND_URL);
        clickSound = SoundCache.getSound(CLICK_SOUND_URL);
        createTipJarOverlay();
        getLatestUserData();
    }


    // Main user interaction handler
    var clickInjector = null;
    var WAIT_TO_SEND_TIP_TIMEOUT_MS = 500;
    function userClicked() {
        clickInjector = playAudio(clickSound);
        getLatestUserData();
        getFirstBalance();
        Script.setTimeout(function(){
            sendTip(hfcAmount, destinationName, message);
        }, WAIT_TO_SEND_TIP_TIMEOUT_MS)

    }


    // Handle if mouse pressed down on entity
    function clickDownOnEntity(id, event) {
        if (event.button === "Primary") {
            userClicked();
        }
    }

    
    // Handle near triggered on entity
    function startNearTrigger() {
        userClicked();
    }


    // Handle if far triggered on entity
    function startFarTrigger() {
        userClicked();
    }

    
    // Cleans up anything outstanding upon entity closing
    function unload() {
        Overlays.deleteOverlay(tipJar);
    }


    function TipJar() {}
    
    TipJar.prototype = {
        preload: preload,
        clickDownOnEntity: clickDownOnEntity,
        startNearTrigger: startNearTrigger,
        startFarTrigger: startFarTrigger,
        unload: unload
    };

    return new TipJar();
    

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});
