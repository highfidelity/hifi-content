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
var APP_NAME = "AvatarCustomization101",
    STRING_MATERIAL = "material",
    STRING_BLENDSHAPES = "blendshapes",
    STRING_ANIMATION = "animation",
    STRING_FLOW = "flow",
    STRING_INFO = "info";

var CONFIG = {
    APP_NAME: APP_NAME, 

    // Variables shared by ui and javascript files
    UPDATE_UI: APP_NAME + "_update_ui",
    BUTTON_NAME: "Avatar 101",
    EVENT_BRIDGE_OPEN_MESSAGE: "_eventBridgeOpen",

    // UI to app events
    EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR: "changeAvatarToAviAndSaveAvatar",
    EVENT_RESTORE_SAVED_AVATAR: "restoreSavedAvatar",
    EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR: "changeAvatarToAviWithoutSavingAvatar",
    EVENT_UPDATE_MATERIAL: "updateMaterial",
    EVENT_UPDATE_BLENDSHAPE: "updateBlendshape",
    EVENT_UPDATE_FLOW: "updateFlow",
    EVENT_UPDATE_ANIMATION: "updateAnimation",
    EVENT_CHANGE_TAB: "changeTab",

    STRING_BOOKMARK_NAME: "Avatar101 Saved By App",

    STRING_MATERIAL: STRING_MATERIAL,
    STRING_BLENDSHAPES: STRING_BLENDSHAPES,
    STRING_ANIMATION: STRING_ANIMATION,
    STRING_FLOW: STRING_FLOW,
    STRING_INFO: STRING_INFO,

    INITIAL_DATASTORE_SETTINGS: {
        isAviEnabled: false, // *** robin
        activeTabName: STRING_INFO,
        tabDataList: [
            {
                // INFORMATION
                tabName: STRING_INFO, 
                title: STRING_INFO, 
                subtitle: "Thank you for downloading the Avatar Customization 101 app.",
                componentName: "info-tab"
            },
            {
                // MATERIAL
                tabName: STRING_MATERIAL, 
                title: STRING_MATERIAL, 
                subtitle: "Change avatars materials for each submesh.",
                componentName: "test2"
            },
            {
                // BLENDSHAPES
                tabName: STRING_BLENDSHAPES, 
                title: STRING_BLENDSHAPES, 
                subtitle: "Change avatar expressions.",
                componentName: "test1"
            },
            {
                // ANIMATION
                tabName: STRING_ANIMATION, 
                title: STRING_ANIMATION, 
                subtitle: "Change avatars default animations.",
                componentName: "test2"
            },
            {
                // FLOW
                tabName: STRING_FLOW, 
                title: STRING_FLOW, 
                subtitle: "Modify flow joints for chain.",
                componentName: "test1"
            }
        ],
    }

};

if (module !== undefined) {
    module.exports = CONFIG;
}