//
//  User Inspector
//  defaultLocalEntityProps.js
//  Created by Milad Nazeri on 2019-03-09
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  Base properties for the Local Entities
//

var localEntityProps = {
    dimensions: [1, 0.1, 0],
    type: "Text",
    lineHeight: 0.1,
    // This will have to be changed in 81 until we bring unlit property to local text entities
    textColor: "#ffffff",
    textAlpha: 1.0,
    backgroundColor: "#2d2d2d",
    backgroundAlpha: 1,
    billboardMode: "full",
    lifetime: 20,
    // The following will be added back in 81
    renderLayer: "front"
};

module.exports = localEntityProps;