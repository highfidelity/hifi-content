/*

    Party Ball
    materialProperties.js
    Created by Milad Nazeri on 2019-01-16
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Material properties for the party ball

*/


module.exports = {
    name: "Party-Ball-Material",
    type: "Material",
    materialData: JSON.stringify({
        materialVersion: 1,
        materials: {
            albedoMap: Script.resolvePath("../resources/images/question.png"),
            emissiveMap: Script.resolvePath("../resources/images/question.png")
        }
    }),
    materialURL: "materialData",
    materialMappingScale: [0, 7]
};