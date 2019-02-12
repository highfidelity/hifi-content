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
    STRING_INFO = "info",
    STRING_STATE = "state";

// Material preset strings
var STRING_DEFAULT = "default",
    STRING_LEATHER = "leather",
    STRING_GLASS = "glass",
    STRING_CHAINMAIL = "chainmail",
    STRING_RED = "red",
    STRING_TEXTURE = "texture";


// material component names
var STRING_COLOR = "color",
    STRING_SLIDER = "slider",
    STRING_MAP_ONLY = "mapOnly";

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
    EVENT_UPDATE_AVATAR: "updateAvatar",

    STRING_BOOKMARK_NAME: "Avatar101 Saved By App",

    STRING_MATERIAL: STRING_MATERIAL,
    STRING_BLENDSHAPES: STRING_BLENDSHAPES,
    STRING_ANIMATION: STRING_ANIMATION,
    STRING_FLOW: STRING_FLOW,
    STRING_INFO: STRING_INFO,
    STRING_STATE: STRING_STATE,

    STATIC_DATA: {
        TAB_LIST: [ STRING_INFO, STRING_MATERIAL, STRING_BLENDSHAPES, STRING_ANIMATION, STRING_FLOW],
        TAB_DATA: {
            INFO: {
                TAB_NAME: STRING_INFO,
                TITLE: STRING_INFO,
                SUBTITLE: "Thank you for downloading the Avatar Customization 101 app.",
                COMPONENT_NAME: "info-tab"
            },
            MATERIAL: {
                TAB_NAME: STRING_MATERIAL, // key for dynamic data
                TITLE: STRING_MATERIAL,
                SUBTITLE: "Change avatars materials for each submesh.",
                COMPONENT_NAME: "material-tab",

                COMPONENT_DATA: {
                    PBR_LIST: [STRING_DEFAULT, STRING_LEATHER, STRING_GLASS, STRING_CHAINMAIL],
                    SHADELESS_LIST: [STRING_RED, STRING_TEXTURE],
                    PROPERTIES_LISTS: {
                        shadeless: [
                            {
                                key: "albedo",
                                hasMap: true,
                                componentType: STRING_COLOR
                            }
                        ],
                        pbr: [
                            {
                                key: "albedo",
                                hasMap: true,
                                componentType: STRING_COLOR
                            },
                            {
                                key: "roughness",
                                hasMap: true,
                                componentType: STRING_SLIDER
                            },
                            {
                                key: "normalMap",
                                hasMap: false,
                                componentType: STRING_MAP_ONLY
                            }
                        ],
                        selectOne: []
                    }
                }
            },
            BLENDSHAPES: {
                TAB_NAME: STRING_BLENDSHAPES,
                TITLE: STRING_BLENDSHAPES,
                SUBTITLE: "Change avatar expressions.",
                COMPONENT_NAME: "blendshapes-tab",

                COMPONENT_DATA: {
                    LIST: ["awe", "default", "angry", "laugh"],
                    FACIAL_BLENDSHAPES: [
                        "EyeBlink_L",
                        "EyeBlink_R",
                        "BrowsU_L",
                        "BrowsU_R",
                        "JawOpen"
                    ]
                }

            },
            ANIMATION: {
                TAB_NAME: STRING_ANIMATION,
                TITLE: STRING_ANIMATION,
                SUBTITLE: "Change avatars default animations.",
                COMPONENT_NAME: "test2",

                COMPONENT_DATA: {

                }
            }, 
            FLOW: {
                TAB_NAME: STRING_FLOW,
                TITLE: STRING_FLOW,
                SUBTITLE: "Modify flow joints for chain.",
                COMPONENT_NAME: "flow-tab",

                COMPONENT_DATA: {
                    HAIR_FLOW_OPTIONS: [ // "stiffness", "radius", "gravity", "damping"
                        {   
                            name: "stiffness",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "radius",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "gravity",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "damping",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        }
                    ],
                    JOINT_FLOW_OPTIONS: [
                        {   
                            name: "radius",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "offset",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        }
                    ]
                }
            }
        }
    },

    INITIAL_DYNAMIC_DATA: {
        state: {
            isAviEnabled: true,
            activeTabName: STRING_INFO
        },
        info: {},
        material: {
            selectedMaterial: "",
            shadeless: {
                albedo: { value: 0.5, map: null }
            },
            pbr: {
                albedo: { value: 0.5, map: null },
                emissive: { value: 0.5, map: null },
                roughness: { value: 0.5, map: null },
                metallic: { value: 0.5, map: null },
                scattering: { value: 0.5, map: null },
                opacity: { value: 0.5, map: null },
                normalMap: { value: 0.5, map: null },
                occlusionMap: { value: 0.5, map: null }
            }
        },
        blendshapes: {
            selected: "",
            updatedProperties: {}
        },
        animation: {

        },
        flow: {
            enableCollisions: true,
            showDebug: true,
            hairFlowOptions: {},
            jointFlowOptions: {}
        }
    }
};

if (module) {
    module.exports = CONFIG;
}