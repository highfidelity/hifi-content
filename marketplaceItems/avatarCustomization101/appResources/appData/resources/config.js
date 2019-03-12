//
//  config.js 
// 
//  Variables shared by Avatar Customization 101 UI and Hifi Javascript files.
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
    STRING_GLASS = "glass",
    STRING_CHAINMAIL = "chainmail",
    STRING_DISCO = "disco",
    STRING_RED = "red",
    STRING_TEXTURE = "texture";

// material component names
var STRING_COLOR = "color",
    STRING_SLIDER = "slider",
    STRING_MAP_ONLY = "mapOnly";

// custom flow data
// utilized in flow.js and dynamic data
var CUSTOM_FLOW_DATA = {
    "leaf": {
        "active": true,
        "stiffness": 0.7,
        "radius": 0.01,
        "gravity": 0,
        "damping": 0.85,
        "inertia": 0.8,
        "delta": 0.55
    }
};

var CUSTOM_COLLISION_DATA = {
    "HeadTop_End": {
        "type": "sphere",
        "radius": 0.12,
        "offset": {
            "x": 0,
            "y": 0,
            "z": 0
        }
    }
};

var CONFIG = {
    APP_NAME: APP_NAME,

    // Variables shared by ui and javascript files
    UPDATE_UI: APP_NAME + "_update_ui",
    BUTTON_NAME: "AVATAR-101",
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

    // Material component types
    STRING_COLOR: STRING_COLOR,
    STRING_SLIDER: STRING_SLIDER,
    STRING_MAP_ONLY: STRING_MAP_ONLY,

    // Material preset strings
    STRING_DEFAULT: STRING_DEFAULT,
    STRING_GLASS: STRING_GLASS,
    STRING_CHAINMAIL: STRING_CHAINMAIL,
    STRING_DISCO: STRING_DISCO,
    STRING_RED: STRING_RED,
    STRING_TEXTURE: STRING_TEXTURE,

    MATERIAL_EVENTS_SUBTYPE: {
        STRING_NAMED_MATERIAL_SELECTED: "namedMaterialSelected",
        STRING_MODEL_TYPE_SELECTED: "modelTypeSelected",
        STRING_UPDATE_PROPERTY: "updateProperty",
        STRING_UPDATE_ENTITY_PROPERTIES: "updateEntityProperties"
    },

    FLOW_EVENTS_SUBTYPE: {
        STRING_DEBUG_TOGGLE: "debugToggle",
        STRING_COLLISIONS_TOGGLE: "collisionsToggle",
        STRING_HAIR: "hair",
        STRING_JOINTS: "joints"
    },

    DATA_FOR_FLOW_APP: {
        CUSTOM_FLOW_DATA: CUSTOM_FLOW_DATA,
        CUSTOM_COLLISION_DATA: CUSTOM_COLLISION_DATA
    },

    STATIC_DATA: {
        TAB_LIST: [STRING_INFO, STRING_MATERIAL, STRING_BLENDSHAPES, STRING_FLOW],
        TAB_DATA: {
            INFO: {
                TAB_NAME: STRING_INFO,
                TITLE: STRING_INFO,
                SUBTITLE: "Thank you for downloading the Avatar Customization 101 app!",
                COMPONENT_NAME: "info-tab"
            },
            MATERIAL: {
                TAB_NAME: STRING_MATERIAL, // key for dynamic data
                TITLE: STRING_MATERIAL,
                SUBTITLE: "Using material entities, you can change materials on a submesh.",
                COMPONENT_NAME: "material-tab",
                COMPONENT_DATA: {
                    PBR_LIST: [STRING_DEFAULT, STRING_GLASS, STRING_CHAINMAIL, STRING_DISCO],
                    SHADELESS_LIST: [STRING_RED, STRING_TEXTURE],

                    PROPERTY_MAP_IMAGES: {
                        none: "no.jpg",
                        albedoMap: [
                            "chainmail_albedoMap.png",
                            "disco_albedoMap.jpg",
                            "texture_emissiveMap_albedoMap.jpg"
                        ],
                        metallicMap: [
                            "chainmail_metallicMap.png",
                            "disco_metallicMap.jpg"
                        ],
                        normalMap: [
                            "chainmail_normalMap.png",
                            "disco_normalMap.jpg"
                        ],
                        occlusionMap: [
                            "chainmail_occlusionMap.png"
                        ],
                        roughnessMap: [
                            "disco_roughnessMap.jpg"
                        ],
                        emissiveMap: [
                            "texture_emissiveMap_albedoMap.jpg",
                            "disco_emissiveMap.jpg"
                        ]
                    },
                    
                    TYPE_LIST: [
                        { name: "Select one", key: "selectOne", index: 0 },
                        { name: "shadeless", key: "shadeless", index: 1 },
                        { name: "hifi-pbr", key: "pbr", index: 2 }
                    ],

                    PROPERTIES_LISTS: {
                        shadeless: [
                            { 
                                key: "albedo", componentType: STRING_COLOR
                            },
                            { 
                                key: "emissive", componentType: STRING_COLOR
                            }
                        ],
                        pbr: [
                            // color
                            { 
                                key: "albedo", componentType: STRING_COLOR
                            },
                            { 
                                key: "emissive", componentType: STRING_COLOR
                            },
                            // slider
                            { 
                                key: "roughness", componentType: STRING_SLIDER
                            },
                            { 
                                key: "metallic", componentType: STRING_SLIDER
                            },
                            { 
                                key: "scattering", componentType: STRING_SLIDER
                            },
                            { 
                                key: "opacity", componentType: STRING_SLIDER
                            },
                            // map only
                            { 
                                key: "normalMap", componentType: STRING_MAP_ONLY
                            },
                            { 
                                key: "occlusionMap", componentType: STRING_MAP_ONLY
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
                    FACIAL_BLENDSHAPES_OPTIONS: [ 
                        {   
                            name: "EyeBlink_L",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "EyeBlink_R",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "BrowsU_L",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "BrowsU_R",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        },
                        {   
                            name: "JawOpen",
                            min: 0,
                            max: 5,
                            increment: 0.1 
                        },
                        {   
                            name: "Sneer",
                            min: 0,
                            max: 1,
                            increment: 0.1 
                        }
                    ]
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
                            name: "radius", 
                            increment: 0.01, 
                            min: 0.01, 
                            max: 0.1
                        },
                        {
                            name: "stiffness", 
                            increment: 0.05, 
                            min: 0.0, 
                            max: 1.0
                        },
                        {
                            name: "gravity", 
                            increment: 0.0001, 
                            min: -0.05, 
                            max: 0.05
                        },
                        {
                            name: "damping", 
                            increment: 0.05, 
                            min: 0.0, 
                            max: 1.0
                        }
                    ],
                    JOINT_FLOW_OPTIONS: [
                        {   
                            name: "radius",
                            min: 0.01,
                            max: 0.5,
                            increment: 0.01 
                        }
                    ]
                }
            }
        }
    },

    INITIAL_DYNAMIC_DATA: {
        state: {
            isAviEnabled: false,
            activeTabName: STRING_INFO
        },
        info: {},
        material: {
            selectedTypeIndex: 0,
            selectedMaterial: "default",
            shadeless: {
                // component type color
                albedo: { value: "N/A", map: null },
                emissive: { value: "N/A", map: null }
            },
            pbr: {
                // component type color
                albedo: { value: "N/A", map: null }, 
                emissive: { value: "N/A", map: null }, 
                // component type sliders
                roughness: { value: 0, map: null },
                metallic: { value: 0, map: null },
                scattering: { value: 0, map: null },
                opacity: { value: 1, map: null },
                // component type map only
                normalMap: { value: null, map: null },
                occlusionMap: { value: null, map: null }
            }
        },
        blendshapes: {
            selected: "default",
            updatedProperties: {
                "EyeBlink_L": 0.00,
                "EyeBlink_R": 0.00,
                "BrowsU_L": 0.00,
                "BrowsU_R": 0.00,
                "JawOpen": 0.00,
                "Sneer": 0
            }
        },
        flow: {
            showDebug: true,
            enableCollisions: true,
            hairFlowOptions: {
                stiffness: CUSTOM_FLOW_DATA.leaf.stiffness, 
                radius: CUSTOM_FLOW_DATA.leaf.radius, 
                gravity: CUSTOM_FLOW_DATA.leaf.gravity, 
                damping: CUSTOM_FLOW_DATA.leaf.damping
            },
            jointFlowOptions: {
                radius: CUSTOM_COLLISION_DATA.HeadTop_End.radius,
                offset: CUSTOM_COLLISION_DATA.HeadTop_End.offset
            }
        }
    }
};

if (module) {
    module.exports = CONFIG;
}