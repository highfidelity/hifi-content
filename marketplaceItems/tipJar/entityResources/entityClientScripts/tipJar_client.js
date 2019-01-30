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
    
    
    var INTERVAL_CHECK_AMOUNT = 1500; // Check every 1.5 seconds after
    var MAXIMUM_FIRST_BALANCE_RETRIES = 10; // Checks for 10 seconds
    var METAVERSE_BASE = Account.metaverseServerURL;
    var BALANCE_URL = METAVERSE_BASE + '/api/v1/commerce/balance';

    var firstBalance = null;
    var secondBalance = null;
    var receivedFirstBalance = false;
    var retryCount = 0;

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


    // Callback that is run after we request the first balance
    var TIME_TILL_SECOND_BALANCE_CHECK_TIMEOUT_AMOUNT_MS = 2000; // Wait 2 seconds before checking second balance
    var MAXIMUM_FIRST_BALANCE_RETRIES = 6; // Checks for 10 seconds
    var firstBalanceRetryCount = 0;
    function getFirstBalanceCallBack(error, result) {
        // If we have already received the first balance or we have reached past the retry count then
        // return from this callback.  
        if (receivedFirstBalance || firstBalanceRetryCount >= MAXIMUM_FIRST_BALANCE_RETRIES) {
            log("Already received first balance or retry count is max");
            log("retry count:", firstBalanceRetryCount);
            return;
        }

        // There was an error of some kind so retry. 
        if (error || result.status !== "success"){
            log("error", error);
            log("result", result);
            firstBalanceRetryCount++;
            log("current retry count:", firstBalanceRetryCount);
            Script.setTimeout(function(){
                request(options, getFirstBalanceCallBack);
            }, INTERVAL_CHECK_AMOUNT);
        } else {
            // We got the balance so start calling for the second balance
            firstBalance = result.data.balance;
            firstBalanceRetryCount = 0;
            receivedFirstBalance = true;
            Script.setTimeout(function(){
                getSecondBalance();
            }, TIME_TILL_SECOND_BALANCE_CHECK_TIMEOUT_AMOUNT_MS);
            
        }
        log("result balance", firstBalance);
        log("amount looking for", firstBalance - hfcAmount);
    }


    function getSecondBalance() {
        log("Get second balance is called")
        request(options, getSecondBalanceCallBack);
    }


    function getSecondBalanceCallBack(error, result) {
        log("running get second balance call back");
        if (error || result.status !== "success"){
            log("THERE WAS A PROBLEM");
            log("error", error);
            log("result.status", result.status);
            console.log(error);
            if (isSecondBalanceTheRightAmount() || retryCount >= MAXIMUM_FIRST_BALANCE_RETRIES) {
                resetBalanceChecks();
                return;
            }
            retryCount++;
            log("current retry count:", retryCount);
            Script.setTimeout(function(){
                log("There was an error, trying second balance again");
                request(options, getSecondBalanceCallBack);
            }, INTERVAL_CHECK_AMOUNT);
        } else {
            log("THERE WAS NOT A PROBLEM IN CALLBACK");
            secondBalance = result.data.balance;
            if (isSecondBalanceTheRightAmount()) {
                log("second balance is the right amount");
                resetBalanceChecks();
                startFeedback();
                return;
            }
            log("second balance isn't the right amount, trying again");
            retryCount++;
            log("current retry count:", retryCount);
            if (retryCount >= MAXIMUM_FIRST_BALANCE_RETRIES) {
                resetBalanceChecks();
                return;
            }
            log("RUNNING SECOND CALLBACK AGAIN");
            Script.setTimeout(function(){
                log("Still haven't got the right amount yet!");
                request(options, getSecondBalanceCallBack);
            }, INTERVAL_CHECK_AMOUNT);
        }
        console.log(JSON.stringify(result));
        log("result balance", firstBalance);
        log("amount looking for", firstBalance - hfcAmount);
    }


    function isSecondBalanceTheRightAmount(){
        log("isSecondBalanceTheRightAmount");
        var targetBalance = firstBalance - hfcAmount;
        if (firstBalance === secondBalance) {
            return false;
        }

        if (secondBalance === targetBalance) {
            return true;
        }

        return false;
    }


    function resetBalanceChecks(){
        retryCount = 0;
        receivedFirstBalance = false;
        firstBalance = null;
        secondBalance = null;
    }


    // This function will open a user's tablet and prompt them to pay for VIP status.
    function sendTip(hfcAmount, destinationName, message) {
        var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
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
    
    
    var COIN_SOUND_URL = Script.resolvePath('../resources/sounds/CoinsDrop_BW.6645_1497719.4.R.wav');
    var CLICK_SOUND_URL = Script.resolvePath('../resources/sounds/beep.mp3');

    var coinSound = null;
    var coinInjector = null;

    var clickSound = null;
    var clickInjector = null;

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
    

    function stopAnimation(){
        Overlays.deleteOverlay(tipJar);
        createOverlay();
    }


    var ANIMATION_URL = Script.resolvePath('../resources/models/tipJar_Anim.fbx');
    var ANIMATION_STOP_TIMEOUT_MS = 2300;
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

    var TIMEOUT_FOR_AUDIO = 2000;
    function startFeedback(){
        playAnimation();
        Script.setTimeout(function(){
            coinInjector = playAudio(coinSound);
        }, TIMEOUT_FOR_AUDIO);
    }
    
    
    // #endregion
    // *************************************
    // END ANIMATION
    // *************************************

    // *************************************
    // START OVERLAY
    // *************************************
    // #region OVERLAY
    
    
    var tipJar = null;

    var tipJarModel = Script.resolvePath("../resources/models/tipJar_Anim.fbx");

    var tipJarProps = {
        name: "tipjar",
        dimensions: {
            "x": 0.37060835361480713,
            "y": 0.4698657631874084,
            "z": 0.37296142578125
        },
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
        } else {
            log("new user data is different");
            return true;
        }
    }


    // Checks to see if the userData is updated
    var destinationName = null;
    var hfcAmount = 0;
    var message = "";
    function getLatestUserData(){
        log("in get latest user data");
        var newUserData = Entities.getEntityProperties(_entityID, 'userData').userData;
        if (isNewUserDataDifferent(previousUserData, newUserData)){
            if ("name" in userData) {
                previousUserData = userData;
            } else {
                previousUserData = newUserData;
            }
            userData = JSON.parse(newUserData);
            log("new user data", userData);
            if (typeof userData.hfcAmount !== "number") {
                userData.hfcAmount = 1;
            }
            destinationName = userData.destinationName;
            hfcAmount = Math.round(userData.hfcAmount);
            message = userData.message;
        }
    }


    var TIMEOUT_BEFORE_STARTING_SEND_TIP = 250;
    function userClicked(){
        getFirstBalance();
        // Wait just a little bit before we hit the menu. 
        Script.setTimeout(function(){
            sendTip(hfcAmount, destinationName, message);   
        }, TIMEOUT_BEFORE_STARTING_SEND_TIP);
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
    var userData = {};
    var previousUserData = {};
    var _entityID = null;
    function preload(entityID) {
        _entityID = entityID;
        createOverlay();
        coinSound = SoundCache.getSound(COIN_SOUND_URL);
        clickSound = SoundCache.getSound(CLICK_SOUND_URL);
        getLatestUserData();
    }


    // Handle if mouse pressed down on entity
    function clickDownOnEntity(id, event) {
        log("entity clicked down");
        if (event.button === "Primary") {
            getLatestUserData();
            userClicked();
        }
    }

    
    function startNearTrigger() {
        log("start near trigger called");
        getLatestUserData();
        userClicked();
        sendTip(hfcAmount, destinationName, message);
    }


    // Handle if startFar Trigger pressed down on entity
    function startFarTrigger() {
        log("start far trigger called");
        getLatestUserData();
        userClicked();
        sendTip(hfcAmount, destinationName, message);
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