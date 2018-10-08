//
// spawnPills.js
// 
// Author: Liv Erickson
// Edited by Milad Nazeri
// Copyright High Fidelity 2018
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function(){
    var avatarURL;

    this.preload = function(id){
        var entityProperties = Entities.getEntityProperties(id);
        var userData = entityProperties.userData;
        avatarURL = JSON.parse(userData).avatarUrl;
        print("avatarURL: ", avatarURL);
    };

    this.replaceAvatar = function() {
        MyAvatar.useFullAvatarURL(avatarURL);
    };

    this.replaceAvatarByMouse = function(entityID, mouseEvent) {
        if (mouseEvent.isLeftButton) {
            this.replaceAvatar();
        }
    };

    this.clickDownOnEntity = this.replaceAvatarByMouse; 
    this.stopFarTrigger = this.replaceAvatar; 
    this.stopNearTrigger = this.replaceAvatar; 
});
