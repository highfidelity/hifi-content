/* global module */

var MATERIAL_DATA = {
    defaults: {
        // "parentMaterialName": 1,
        // "materials": {
        //     model: "hifi_pbr",
        //     opacity: 1
        // }
    },
    glass: {
        "materialMappingScale": {"x":1,"y":1},
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
            "opacity": 0.5775400996208191,
            "roughness": 0.08235287666320801,
            "metallic": 1,
            "scattering": 0,
            "unlit": false,
            "emissive": [
                0,
                0,
                0
            ],
            "albedo": [
                0.48069190979003906,
                0.5661895275115967,
                0.6400046944618225
            ]
        }
    },
    chainmail: {
        "materialMappingScale": {"x":5,"y":5},
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
            "roughness": 0.2,
            "unlit": false,
            "albedoMap": Script.resolvePath("../images/Metal_ChainMail2_512_DA.png"),
            "metallicMap": Script.resolvePath("../images/Metal_ChainMail2_512_M.png"),
            "normalMap": Script.resolvePath("../images/Metal_ChainMail2_512_N.png"),
            "occlusionMap": Script.resolvePath("../images/Metal_ChainMail2_512_ao.png")
        }
    },
    disco: {
        "materialMappingScale": {"x":5,"y":5},
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
            "unlit": false,
            "emissiveMap": Script.resolvePath("../images/Facade02_emi.jpg"),
            "albedoMap": Script.resolvePath("../images/Facade02_col.jpg"),
            "metallicMap": Script.resolvePath("../images/Facade02_met.jpg"),
            "roughnessMap": Script.resolvePath("../images/Facade02_rgh.jpg"),
            "normalMap": Script.resolvePath("../images/Facade02_nrm.jpg")
        }
    },
    red: {
        "materialMappingScale": {"x":1,"y":1},
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
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
        "materialMappingScale": {"x":3,"y":3},
        "description": "Free Vectors via <a href='https://www.vecteezy.com'>www.vecteezy.com</a>",
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
            "emissiveMap": Script.resolvePath("../images/Free-Doughnut-patern-Vector-.jpg"),
            "albedoMap": Script.resolvePath("../images/Free-Doughnut-patern-Vector-.jpg")
        }
    }
};

if (module) {
    module.exports = MATERIAL_DATA;
}