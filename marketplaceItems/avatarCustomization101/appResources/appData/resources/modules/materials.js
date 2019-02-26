//
//  materials.js
//
//  Holds material data for Avatar Customization 101 App
// 
//  Created by Robin Wilson and Mark Brosche 2/20/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* global module */

var directory = Script.resolvePath("../images") + "/";
var chainmail = "chainmail_";
var disco = "disco_";
var texture = "texture_";

// contains names
var MAPS = {
    chainmail: {
        "albedoMap": directory + chainmail + "albedoMap.png",
        "metallicMap": directory + chainmail + "metallicMap.png",
        "normalMap": directory + chainmail + "normalMap.png",
        "occlusionMap": directory + chainmail + "occlusionMap.png",
    },
    disco: {
        "albedoMap": directory + disco + "albedoMap.jpg",
        "emissiveMap": directory + disco + "emissiveMap.jpg",
        "metallicMap": directory + disco + "metallicMap.jpg",
        "roughnessMap": directory + disco + "roughnessMap.jpg",
        "normalMap": directory + disco + "normalMap.jpg"
    },
    texture: {
        "albedoMap": directory + texture + "emissiveMap_albedoMap.jpg",
        "emissiveMap": directory + texture + "emissiveMap_albedoMap.jpg"
    }
}

var MATERIAL_DATA = {
    directory: directory,
    glass: {
        "materialMappingScale": { "x":1, "y":1 },
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
            "opacity": 1,
            "albedoMap": MAPS.chainmail.albedoMap,
            "metallicMap": MAPS.chainmail.metallicMap,
            "normalMap": MAPS.chainmail.normalMap,
            "occlusionMap": MAPS.chainmail.occlusionMap
        }
    },
    disco: {
        "materialMappingScale": {"x":5,"y":5},
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
            "unlit": false,
            "opacity": 1,
            "emissiveMap": MAPS.disco.emissiveMap,
            "albedoMap": MAPS.disco.albedoMap,
            "metallicMap": MAPS.disco.metallicMap,
            "roughnessMap": MAPS.disco.roughnessMap,
            "normalMap": MAPS.disco.normalMap
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
        "materialMappingScale": { "x": 3, "y": 3 },
        "description": "Free Vectors via <a href='https://www.vecteezy.com'>www.vecteezy.com</a>",
        "parentMaterialName": 1,
        "materials": {
            "model": "hifi_pbr",
            "emissiveMap": MAPS.texture.emissiveMap,
            "albedoMap": MAPS.texture.albedoMap
        }
    }
};

if (module) {
    module.exports = MATERIAL_DATA;
}