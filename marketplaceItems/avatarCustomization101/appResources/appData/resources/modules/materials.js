/* global module */

var MATERIAL_DATA = {
    defaults: {
        // "materialVersion": 1,
        // "material": {
        //     name: "default",
        //     model: "hifi_pbr",
        //     opacity: 1
        // }
    },
    glass: {
        "materialVersion": 1,
        "material": {
            "name": "glass",
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
        materialVersion: 1,
        material: {
            name: "chainmail",
            model: "hifi_pbr",
            roughness: 0.5,
            metallic: 1,
            scattering: 0,
            unlit: false,
            emissive: [
                0,
                0,
                0
            ],
            albedo: [
                0,
                0,
                0
            ],
            albedoMap: Script.resolvePath("./resources/images/Metal_ChainMail2_512_DA.png"),
            metallicMap: Script.resolvePath("./resources/images/Metal_ChainMail2_512_M.png"),
            normalMap: Script.resolvePath("./resources/images/Metal_ChainMail2_512_N.png"),
            occlusionMap: Script.resolvePath("./resources/images/Metal_ChainMail2_512_ao.png")
        }
    },
    red: {
        materialVersion: 1,
        material: {
            name: "red",
            unlit: true,
            emissive: [
                1,
                0,
                0
            ],
            albedo: [
                1,
                0,
                0
            ]
        }
    },
    texture: {
        materialVersion: 1,
        material: {
            name: "texture",
            roughness: 0.5,
            metallic: 1,
            scattering: 0,
            albedo: [0.5, 0.5, 0.5],
            albedoMap: "",
            unlit: true
        }
    }
};

if (module) {
    module.exports = MATERIAL_DATA;
}