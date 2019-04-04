//  hiFiCalendarServer.js
//
//  Created by Mark Brosche on 4/3/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


(function() {
    this.remotelyCallable = [
        "updateTextEntity",
        "updateSignColor"
    ];


    this.updateTextEntity = function(id, params) {
        Entities.editEntity(id, {
            "text": params[0], 
            "textColor": [255, 255, 255]
        });
    };  


    this.updateSignColor = function(id, params) {
        if (params[1]) {
            Entities.editEntity(id, {
                "text": params[0], 
                "textColor": [0,0,0], 
                "textAlpha": 1, 
                "backgroundColor": [125, 255, 125]
            });
        } else {
            Entities.editEntity(id, {
                "text": params[0], 
                "textColor": [0,0,0], 
                "textAlpha": 1, 
                "backgroundColor": [255, 125, 125]
            });
        }
    };      
});