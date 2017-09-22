//
//  laundry.js
//
//  Created by Rebecca Stankus on 9/22/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This script can be applied to an object to make it delete avatar attachments when they enter it---as a 
//  laundry basket to get rid of attachments after trying them on.

(function () {
    print("Enter the laundry zone......finish it");
    var _this = this;

    _this.collisionWithEntity = function (thisID, otherID, collisionInfo) {
        var otherUserData = JSON.stringify(Entities.getEntityProperties(otherID).userData);
        print(otherUserData);
        var matchWord = "Attachment";
        var isAttachment = otherUserData.match(matchWord);
        if (isAttachment != null) {
            print("The item is an attachment...delete it!");
            Entities.deleteEntity(otherID);
        } else {
            print("NOT an attachment!");
        }
    };





});
