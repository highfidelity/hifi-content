/*

    Name
    fileName.js
    Created by Milad Nazeri on 2019-01-15
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Throw and get down!

*/


(function() {

    var log = Script.require('https://hifi-content.s3.amazonaws.com/milad/ROLC/d/ROLC_High-Fidelity/02_Organize/O_Projects/Repos/hifi-content/developerTools/sharedLibraries/easyLog/easyLog.js')
    var request = Script.require('https://raw.githubusercontent.com/highfidelity/hifi/master/scripts/modules/request.js').request;

    // *************************************
    // START INIT
    // *************************************
    // #region INIT
    
    var _entityID = null;

    var userData = {};
    var previousUserData = {};
    var destinationName = null;
    var hfcAmount = 0;
    var message = "";

    var firstBalance = null;
    var secondBalance = null;
    var running = false;
    var receivedFirstBalance = false;
    var retryCount = 0;
    var SECOND_BALANCE_TIMEOUT_AMOUNT = 3000; // Wait 3 seconds before checking second balance
    var INTERVAL_CHECK_AMOUNT = 500; // Check every half second
    var MAXIMUM_RETRIES = 20; // Checks for 10 sconds
    var METAVERSE_BASE = Account.metaverseServerURL;
    var BALANCE_URL = METAVERSE_BASE + '/api/v1/commerce/balance';
    
    var clickedID = null;
    var options = {};
    options.uri = BALANCE_URL;
    options.method = "POST";

    var ANIMATION_URL = Script.resolvePath('../resources/models/tipJar_Anim.fbx');

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
    var tipJar = null;

    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    

    var TIMEOUT_FOR_AUDIO = 2000;
    function startFeedback(){
        playAnimation();
        Script.setTimeout(function(){
            coinInjector = playAudio(coinSound);
        }, TIMEOUT_FOR_AUDIO);
    }


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


    var TIMEOUT = 2300;
    function playAnimation(){
        var newOverlayProperties = {
            animationSettings: {
                firstFrame: 0,
                lastFrame: 70,
                currentFrame: 0,
                allowTranslation: true,
                loop: true,
                fps: 30,
                hold: true
            }
        };
        newOverlayProperties.animationSettings.url = ANIMATION_URL;
        newOverlayProperties.animationSettings.running = true;
        Overlays.editOverlay(tipJar, newOverlayProperties);
        Script.setTimeout(stopAnimation, TIMEOUT);
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


    function getFirstBalanceCallBack(error, result) {
        log("running getfirst balance callback");
        if (error || result.status !== "success"){
            log("error", error);
            log("result.status", result.status);
            if (receivedFirstBalance || retryCount >= MAXIMUM_RETRIES) {
                log("Already received first balance or retry count is max");
                log("retry count:", retryCount);
                return;
            }
            retryCount++;
            log("current retry count:", retryCount);
            Script.setTimeout(function(){
                request(options, getFirstBalanceCallBack);
            }, INTERVAL_CHECK_AMOUNT);
        } else {
            firstBalance = result.data.balance;
            retryCount = 0;
            receivedFirstBalance = true;
            Script.setTimeout(function(){
                getSecondBalance();
            }, SECOND_BALANCE_TIMEOUT_AMOUNT);
            
        }
        console.log(JSON.stringify(result));
        log("result balance", firstBalance);
        log("amount looking for", firstBalance - hfcAmount);
    }

    
    function resetBalanceChecks(){
        retryCount = 0;
        receivedFirstBalance = false;
        firstBalance = null;
        secondBalance = null;
    }


    function getSecondBalanceCallBack(error, result) {
        log("running get second balance call back");
        if (error || result.status !== "success"){
            log("THERE WAS A PROBLEM");
            log("error", error);
            log("result.status", result.status);
            console.log(error);
            if (isSecondBalanceTheRightAmount() || retryCount >= MAXIMUM_RETRIES) {
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
                if (MyAvatar.sessionUUID === clickedID){
                    startFeedback();
                }
                return;
            }
            log("second balance isn't the right amount, trying again");
            retryCount++;
            log("current retry count:", retryCount);
            if (retryCount >= MAXIMUM_RETRIES) {
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

    function getFirstBalance() {
        log("getting first balance")
        if (receivedFirstBalance) {
            log("Already received first balance, returning")
            return;
        }
        request(options, getFirstBalanceCallBack);
    }

    function getSecondBalance() {
        log("Get second balance is called")
        request(options, getSecondBalanceCallBack);
    }
    
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
            if (typeof hfcAmount !== "number") {
                hfcAmount = 0;
            }
            destinationName = userData.destinationName;
            hfcAmount = userData.hfcAmount;
            message = userData.message;
        }
    }

    var tipJarModel = Script.resolvePath("../resources/models/tipJar_Anim.fbx");

    var tipJarProps = {
        name: "tipjar",
        dimensions: {
            "x": 0.47060835361480713,
            "y": 0.5698657631874084,
            "z": 0.47296142578125
        },
        url: tipJarModel
    };

    function createOverlay() {
        var currentPosition = Entities.getEntityProperties(_entityID, "position").position;
        tipJarProps.parentID = _entityID;
        tipJarProps.position = currentPosition;
        tipJar = Overlays.addOverlay("model", tipJarProps);

    }


    // Grab the entityID on preload
    function preload(entityID) {
        _entityID = entityID;
        createOverlay();
        coinSound = SoundCache.getSound(COIN_SOUND_URL);
        clickSound = SoundCache.getSound(CLICK_SOUND_URL);
        getLatestUserData();
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


    function userClicked(){
        clickInjector = playAudio(clickSound);
        clickedID = MyAvatar.sessionUUID;
        if (MyAvatar.sessionUUID === clickedID){
            getFirstBalance();
        }
    }


    // Handle if mouse pressed down on entity
    function clickDownOnEntity(id, event) {
        log("entity clicked down");
        if (event.button === "Primary") {
            getLatestUserData();
            userClicked();
            sendTip(hfcAmount, destinationName, message);
        }
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
        startFarTrigger: startFarTrigger,
        unload: unload
    };

    return new TipJar();
    

    // #endregion
    // *************************************
    // END ENTITY DEFINITION
    // *************************************

});