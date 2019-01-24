/*

    Party Ball
    materialProperties.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Material properties for the party ball

*/


var common = Script.require("../modules/commonUtilities.js?" + Date.now());
var randomInt = common.randomInt;
var randomFloat = common.randomFloat;
var makeColor = common.makeColor;

module.exports = {
    name: "Party-Ball-Material",
    type: "Material",
    materialData: JSON.stringify({
        materialVersion: 1,
        materials: {
            albedo: makeColor(
                randomInt(0, 255),
                randomInt(0, 255),
                randomInt(0, 255)
            ),
            emissive: makeColor(
                randomFloat(0, 1.5),
                randomFloat(0, 1.5),
                randomFloat(0, 1.5)
            ),
            glossMap: Script.resolvePath("../resources/images/pink.jpg"),
            occlusionMap: Script.resolvePath("../resources/images/AmbientOcclusionMap.png"),
            normalMap: Script.resolvePath("../resources/images/NormalMap.png"),
            specularMap: Script.resolvePath("../resources/images/SpecularMap.png")
        }
    }),
    materialURL: "materialData",
    materialMappingScale: [
        randomFloat(0.5, 5), 
        randomFloat(0.5, 5)
    ]
};