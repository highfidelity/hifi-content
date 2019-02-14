/* global module */

var MATERIAL_DATA = {
    defaults: {
        // parentMaterialName: "1",
        // materials: {
        //     opacity: 1
        // }
    },
    glass: {
        parentMaterialName: "1",
        materials: {
            "opacity": 0.6,
            "roughness": 0.09,
            "metallic": 1,
            "scattering": 0,
            "unlit": false,
            "emissive": [
                0,
                0,
                0
            ],
            "albedo": [
                0.48,
                0.56,
                0.64
            ]
        }
    },
    chainmail: {
        parentMaterialName: "1",
        materialMappingScale: {
            "x": 5,
            "y": 5
        },
        materials: {
            "roughness": 0.2,
            "metallic": 1,
            "scattering": 0,
            "unlit": false,
            "albedoMap": Script.resolvePath("./resources/images/Metal_ChainMail2_512_DA.png"),
            "metallicMap": Script.resolvePath("./resources/images/Metal_ChainMail2_512_M.png"),
            "normalMap": Script.resolvePath("./resources/images/Metal_ChainMail2_512_N.png"),
            "occlusionMap": Script.resolvePath("./resources/images/Metal_ChainMail2_512_ao.png")
        }
    },
    red: {
        parentMaterialName: "1",
        materials: {
            "emissive": [
                1,
                0,
                0
            ],
            "albedo": [
                1,
                0,
                0
            ]
        }
    },
    texture: {
        parentMaterialName: "1",
        materialMappingScale: {
            "x": 5,
            "y": 5
        },
        materialVersion: 1,
        materials: {
            "roughnessMap": Script.resolvePath("./resources/images/Facade02_rgh.jpg"),
            "albedoMap": Script.resolvePath("./resources/images/Facade02_col.jpg"),
            "normalMap": Script.resolvePath("./resources/images/Facade02_nrm.jpg"),
            "metallicMap": Script.resolvePath("./resources/images/Facade02_met.jpg"),
            "emissiveMap": Script.resolvePath("./resources/images/Facade02_emi.jpg")       
        }
    }
};

if (module) {
    module.exports = MATERIAL_DATA;
}