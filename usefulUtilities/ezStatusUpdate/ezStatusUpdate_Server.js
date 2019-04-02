//
//  Easy Status Updater
//  statusUpdate.js
//  Created by Milad Nazeri on 2019-04-02
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Update Your Status
//

(function(){
    
    var textID = "";
    var textHelper = new (Script.require('./textHelper.js'));
    var lineHeight = 0.1;
    var textSizeBuffer = 1.03;
    var newDate = Date.now();

    var SECOND_MS = 1000;
    var MINUTES_MS = SECOND_MS * 60;
    var HOUR_MS = MINUTES_MS * 60;
    var CALI_TIME = HOUR_MS * 7;

    function StatusUpdater(){

    }

    var remotelyCallable = ["handleNewStatus"];

    function preload(id){
        textID = id;
    }


    // Handle clicking on entity
    function handleNewStatus(id, params){
        var newStatus = params[0];
        newDate = new Date(newDate - CALI_TIME);

        var month = ("" + newDate.getMonth()).length === 1 ? 
            "0" + (+newDate.getMonth() + 1) : (+newDate.getMonth() + 1);
        var day = ("" + newDate.getDay()).length === 1 ? 
            "0" + newDate.getDay() : newDate.getDay();
        var hour = ("" + newDate.getHours()).length === 1 ? 
            "0" + newDate.getHours() : newDate.getHours();
        var minutes = ("" + newDate.getMinutes()).length === 1 ? 
            "0" + newDate.getMinutes() : newDate.getMinutes();

        var dateString = month + "-" + day + "_" + hour + ":" + minutes;

        var finalStatus = dateString + " :: " + newStatus;

        textHelper
            .setText(finalStatus)
            .setLineHeight(lineHeight);
        
        var textXDimension = textHelper.getTotalTextLength();
        var newDimensions = [textXDimension * textSizeBuffer, lineHeight, 0];

        var props = { dimensions: newDimensions, text: finalStatus };

        Entities.editEntity(textID, props);
    }


    StatusUpdater.prototype = {
        remotelyCallable: remotelyCallable,
        preload: preload,
        handleNewStatus: handleNewStatus
    };

    return new StatusUpdater();
});