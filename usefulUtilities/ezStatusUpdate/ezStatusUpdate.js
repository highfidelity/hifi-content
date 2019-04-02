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
    
    var buttonID = null;
    var textID = "";
    var textHelper = new (Script.require('./textHelper.js'));
    var lineHeight = 0.1;
    var newStatus = "";
    var buffer = 1.03;
    var textName = "STATUS_UPDATE_TEXT";
    var SEARCH_RADIUS = 2;
    var username = "";

    function StatusUpdater(){

    }


    // Get the Button position and text entity ID
    function preload(id){
        buttonID = id;
        var buttonPosition = Entities.getEntityProperties(buttonID, "position").position;
        textID = Entities.findEntitiesByName(textName, buttonPosition, SEARCH_RADIUS)[0];
        console.log("textID", textID)
        var userData = Entities.getEntityProperties(buttonID, "userData").userData;
        try {
            userData = JSON.parse(userData);
            username = userData.username || "";
        } catch (e) {
            console.log("could not get username for status update", e);
        }
        
    }


    // Handle clicking on entity
    function onClick(){
        if (AccountServices.username.toLowerCase() !== username.toLowerCase() && username !== "") {
            console.log("doesn't match can't update status");
            return;
        }

        var newDate = new Date();

        var month = ("" + newDate.getMonth()).length === 1 ? 
            "0" + (+newDate.getMonth() + 1) : (+newDate.getMonth() + 1);
        var day = ("" + newDate.getDay()).length === 1 ? 
            "0" + newDate.getDay() : newDate.getDay();
        var hour = ("" + newDate.getHours()).length === 1 ? 
            "0" + newDate.getHours() : newDate.getHours();
        var minutes = ("" + newDate.getMinutes()).length === 1 ? 
            "0" + newDate.getMinutes() : newDate.getMinutes();

        var dateString = month + "-" + day + "_" + hour + ":" + minutes;

        newStatus = Window.prompt("New status:", newStatus);

        var finalStatus = dateString + " :: " + newStatus;

        textHelper
            .setText(finalStatus)
            .setLineHeight(lineHeight);
        
        var textXDimension = textHelper.getTotalTextLength();
        var newDimensions = [textXDimension * buffer, lineHeight, 0];

        var props = { dimensions: newDimensions, text: finalStatus };

        Entities.editEntity(textID, props);
    }


    // Handle mouse and trigger press
    function mousePressOnEntity(){
        onClick();
    }


    StatusUpdater.prototype = {
        preload: preload,
        mousePressOnEntity: mousePressOnEntity
    };

    return new StatusUpdater();
});