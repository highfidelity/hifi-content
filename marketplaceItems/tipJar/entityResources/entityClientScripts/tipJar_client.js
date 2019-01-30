/*

    Name
    fileName.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

    Current commit with logs: 
*/


(function() {

    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    
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

    var options = {};
    options.uri = BALANCE_URL;
    options.method = "POST";


    // Before the user pays, check to see what their current balance is
    function getFirstBalance() {
        // This is so we don't start the process again if the user has clicked and we haven't finished going through
        // Getting the updated balance process.  This flag gets set back to false at the end.
        if (receivedFirstBalance) {
            log("Already received first balance, returning")
            return;
        }
        log("options", options); 
        request(options, getFirstBalanceCallBack);
    }


    // Now that we have the first balance, we initiate getting the second balance
    function getSecondBalance() {
        log("Get second balance is called")
        request(options, getSecondBalanceCallBack);
    }


    // Callback that is run after we request the first balance
    var TIME_TILL_SECOND_BALANCE_CHECK_TIMEOUT_AMOUNT_MS = 2000; // Wait 2 seconds before checking second balance
    var MAXIMUM_FIRST_BALANCE_RETRIES = 6; 
    var FIRST_BALANCE_CHECK_INTERVAL = 250;
    var firstBalanceRetryCount = 0;
    var receivedFirstBalance = false;
    var firstBalance = null;
    function getFirstBalanceCallBack(error, result) {
        // If we have already received the first balance or we have reached past the retry count then
        // return from this callback.  
        if (receivedFirstBalance) {
            log("Already received first balance or retry count is max");
            log("retry count:", firstBalanceRetryCount);
            return;
        }

        // Can't get the first balance for feedback.  Move on to the payment menu anyway
        if (firstBalanceRetryCount >= MAXIMUM_FIRST_BALANCE_RETRIES) {
            sendTip(hfcAmount, destinationName, message);
        }

        // There was an error of some kind so retry. 
        if (error || result.status !== "success"){
            log("error", error);
            log("result", result);
            firstBalanceRetryCount++;
            log("current retry count:", firstBalanceRetryCount);
            Script.setTimeout(function(){
                request(options, getFirstBalanceCallBack);
            }, FIRST_BALANCE_CHECK_INTERVAL);
            return;
        }

        // We got the balance so call the commerce api and start calling for the second balance 
        firstBalance = result.data.balance;
        firstBalanceRetryCount = 0;
        receivedFirstBalance = true;
        sendTip(hfcAmount, destinationName, message);

        Script.setTimeout(function(){
            getSecondBalance();
        }, TIME_TILL_SECOND_BALANCE_CHECK_TIMEOUT_AMOUNT_MS);
            
        log("result balance", firstBalance);
        log("amount looking for", firstBalance - hfcAmount);
    }


    // Called after we got the first balance to see if the tip went through
    var MAXIMUM_SECOND_BALANCE_RETRIES = 10; // Checks for 10 seconds
    var SECOND_BALANCE_CHECK_INTERVAL = 1500;
    var secondBalanceRetryCount = 0;
    var secondBalance = null;
    function getSecondBalanceCallBack(error, result) {
        log("running get second balance call back");        
        // The payment went through or we have hit the maximum amount of tries so return
        if (didThePaymentGoThrough() || secondBalanceRetryCount >= MAXIMUM_SECOND_BALANCE_RETRIES) {
            resetBalanceChecks();
            return;
        }

        if (error || result.status !== "success"){
            log("THERE WAS A PROBLEM");
            log("error", error);
            log("result.status", result.status);
            secondBalanceRetryCount++;
            log("current retry count:", secondBalanceRetryCount);
            Script.setTimeout(function(){
                log("There was an error, trying second balance again");
                request(options, getSecondBalanceCallBack);
            }, SECOND_BALANCE_CHECK_INTERVAL);
            return;
        }

        log("THERE WAS NOT A PROBLEM IN CALLBACK");
        secondBalance = result.data.balance;
        if (didThePaymentGoThrough()) {
            log("second balance is the right amount");
            resetBalanceChecks();
            startFeedback();
            return;
        }

        // Second balance isn't the right amount, trying again
        log("second balance isn't the right amount, trying again");
        secondBalanceRetryCount++;
        log("current retry count:", secondBalanceRetryCount);

        log("RUNNING SECOND CALLBACK AGAIN");
        Script.setTimeout(function(){
            request(options, getSecondBalanceCallBack);
        }, SECOND_BALANCE_CHECK_INTERVAL);
        console.log(JSON.stringify(result));
        log("result balance", firstBalance);
        log("amount looking for", firstBalance - hfcAmount);
    }


    // Check to see if the payment went through by examining the two balances
    function didThePaymentGoThrough(){
        log("isSecondBalanceTheRightAmount");
        var targetBalance = firstBalance - hfcAmount;

        if (firstBalance === secondBalance) {
            return false;
        }

        if (secondBalance === targetBalance) {
            return true;
        }

        // Just in case something strange happened in the last 10 seconds and their balance is now less than
        // the target balance
        return false; 
    }


    // Easy reset for the balance checks in case they click again
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
    
    
    // Play a sound and return the audioinjector
    var audioOptions = {
        volume: 0.5,
        localOnly: true
    };
    function playAudio(sound){
        log("playing audio");
        var position = Entities.getEntityProperties(_entityID, 'position').position;
        audioOptions.position = position;
        return Audio.playSound(sound, audioOptions);
    }
    

    // As of V78, there are some issues with FBX animation playback.  Deleting the overlay and recreating again works very well though for a seamless experience
    function stopAnimation(){
        Overlays.deleteOverlay(tipJar);
        createOverlay();
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
            loop: true,
            fps: 30,
            hold: true
        }
    };
    function playAnimation(){
        Overlays.editOverlay(tipJar, newOverlayProperties);
        Script.setTimeout(stopAnimation, ANIMATION_STOP_TIMEOUT_MS);
    }


    // Start both the animation and play the coin sound when the coin drops into the money
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
        dimensions: [0.370, 0.469, 0.372],
        url: tipJarModel
    };
    function createOverlay() {
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
    // START EVENT_HANDLER
    // *************************************
    // #region EVENT_HANDLER
    
    
    // Checks to see if the userData is unique
    function isNewUserDataDifferent(oldUserData, newUserData){
        log("in is newUserData Different");
        oldUserData = typeof oldUserData === "string" ? oldUserData : JSON.stringify(oldUserData);
        newUserData = typeof newUserData === "string" ? newUserData : JSON.stringify(newUserData);
        log("oldUserData", oldUserData);
        log("newUserData", newUserData);
        if (oldUserData === newUserData){
            return false;
        }
        
        return true;
    }


    // Checks to see if the userData is updated
    var destinationName = null;
    var hfcAmount = 0;
    var message = "";
    function getLatestUserData(){
        log("in get latest user data");
        var newUserData = Entities.getEntityProperties(_entityID, 'userData').userData;
        if (isNewUserDataDifferent(previousUserData, newUserData)){
            previousUserData = "name" in userData ? userData : newUserData;
            userData = JSON.parse(newUserData);
            log("new user data", userData);

            // In case someone points something strange in for the number
            if (typeof userData.hfcAmount !== "number") {
                userData.hfcAmount = 1;
            }

            // hfc shows on inventory that it gets rounded so go ahead and round the amount
            hfcAmount = Math.round(userData.hfcAmount);
            destinationName = userData.destinationName;
            message = userData.message;
        }
    }


    var clickInjector = null;    
    function userClicked(){
        clickInjector = playAudio(clickSound);
        getLatestUserData();
        getFirstBalance();
    }
    
    
    // #endregion
    // *************************************
    // END EVENT_HANDLER
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    // Grab the entityID on preload
    var COIN_SOUND_URL = Script.resolvePath('../resources/sounds/CoinsDrop_BW.6645_1497719.4.R.wav');
    var CLICK_SOUND_URL = Script.resolvePath('../resources/sounds/beep.mp3');
    var _entityID = null;
    var userData = {};
    var previousUserData = {};
    var coinSound = null;
    var clickSound = null;
    function preload(entityID) {
        _entityID = entityID;
        coinSound = SoundCache.getSound(COIN_SOUND_URL);
        clickSound = SoundCache.getSound(CLICK_SOUND_URL);
        createOverlay();
        getLatestUserData();
    }


    // Handle if mouse pressed down on entity
    function clickDownOnEntity(id, event) {
        log("entity clicked down");
        if (event.button === "Primary") {
            userClicked();
        }
    }

    
    function startNearTrigger() {
        log("start near trigger called");
        userClicked();
    }


    // Handle if startFar Trigger pressed down on entity
    function startFarTrigger() {
        log("start far trigger called");
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