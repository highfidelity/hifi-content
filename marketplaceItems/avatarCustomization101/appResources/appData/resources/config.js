//
//  config.js 
// 
//  Variables shared by ui and javascript files.
//
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global module */

// Variables other variables depend on
var APP_NAME = "AvatarCustomization101";

var CONFIG = {
    APP_NAME: APP_NAME, 

    // Variables shared by ui and javascript files
    EVENT_BRIDGE_OPEN_MESSAGE: APP_NAME + "_eventBridgeOpen",
    UPDATE_UI: APP_NAME + "_update_ui",
    BUTTON_NAME: "Avatar 101",

    // UI to app events
    EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR: "changeAvatarToAviAndSaveAvatar",
    EVENT_RESTORE_SAVED_AVATAR: "restoreSavedAvatar",
    EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR: "changeAvatarToAviWithoutSavingAvatar",
    EVENT_UPDATE_MATERIAL: "updateMaterial",
    EVENT_UPDATE_BLENDSHAPE: "updateBlendshape",
    EVENT_UPDATE_FLOW: "updateFlow",
    EVENT_UPDATE_ANIMATION: "updateAnimation",
    EVENT_CHANGE_TAB: "changeTab"

};

if (module) {
    module.exports = CONFIG;
}