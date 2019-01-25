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

    
    // #endregion
    // *************************************
    // END INIT
    // *************************************

    // *************************************
    // START ENTITY DEFINITION
    // *************************************
    // #region ENTITY DEFINITION
    
    
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


    // Grab the entityID on preload
    function preload(entityID) {
        _entityID = entityID;
        log("about to get latest userData");
        getLatestUserData();
    }


    // This function will open a user's tablet and prompt them to pay for VIP status.
    function sendTip(hfcAmount, destinationName, message) {
        log("about to send tip");
        log("hfcAmount", hfcAmount);
        log("destinationName", destinationName);
        log("message", message);

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


    // Handle if mouse pressed down on entity
    function clickDownOnEntity(id, event) {
        log("entity clicked down");
        if (event.button === "Primary") {
            getLatestUserData();
            sendTip(hfcAmount, destinationName, message);
        }
    }


    // Handle if startFar Trigger pressed down on entity
    function startFarTrigger() {
        log("start far trigger called");
        getLatestUserData();
        sendTip(hfcAmount, destinationName, message);
    }

    
    // Cleans up anything outstanding upon entity closing
    function unload() {

    }


    function TipJar() {}
    
    TipJar.prototype = {
        remotelyCallable: [""],
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