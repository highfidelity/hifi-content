//
//  ExternalOutlineConfig.js
//
//  Created by Rebecca Stankus on 9/13/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
//  This is a temporary fix keep access to changing highlights private
/* global Render */

module.exports = {
    changeHighlight1: (function(highlightConfig) {
        highlightConfig["glow"] = true;
        highlightConfig["width"] = 7;
        highlightConfig["intensity"] = 0.8;
        highlightConfig["colorR"] = 0.18;
        highlightConfig["colorG"] = 0.61;
        highlightConfig["colorB"] = 0.86;
        highlightConfig["unoccludedFillOpacity"] = 0;
        highlightConfig["occludedFillOpacity"] = 0;    
    }),
    changeHighlight2: (function(highlightConfig) {
        highlightConfig["glow"] = true;
        highlightConfig["width"] = 7;
        highlightConfig["intensity"] = 0.8;
        highlightConfig["colorR"] = 0.92;
        highlightConfig["colorG"] = 0.34;
        highlightConfig["colorB"] = 0.34;
        highlightConfig["unoccludedFillOpacity"] = 0;
         
    }),
    changeHighlight3: (function(highlightConfig) {
        highlightConfig["glow"] = true;
        highlightConfig["width"] = 7;
        highlightConfig["intensity"] = 0.8;
        highlightConfig["colorR"] = 0.15;
        highlightConfig["colorG"] = 0.68;
        highlightConfig["colorB"] = 0.37;
        highlightConfig["unoccludedFillOpacity"] = 0;        
    }),
    changeHighlight4: (function(highlightConfig) {
        highlightConfig["glow"] = true;
        highlightConfig["width"] = 7;
        highlightConfig["intensity"] = 0.8;
        highlightConfig["colorR"] = 1;
        highlightConfig["colorG"] = 0;
        highlightConfig["colorB"] = 0;
        highlightConfig["unoccludedFillOpacity"] = 0;        
    })
};
