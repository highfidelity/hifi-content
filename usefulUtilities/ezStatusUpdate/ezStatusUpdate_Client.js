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
    var newStatus = "";
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
        
        newStatus = Window.prompt("New status:", newStatus);
        if (!newStatus){
            return;
        }
        Entities.callEntityServerMethod(textID, "handleNewStatus", [newStatus]);
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