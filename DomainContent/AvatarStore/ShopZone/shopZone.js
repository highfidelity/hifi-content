//
//  shopZone.js
//
//  Created by Thijs Wenker on 10/20/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {
    this.enterEntity = function() {
        if (!HMD.active) {
            Messages.sendLocalMessage('com.highfidelity.wear.tutorialChannel', 'storeEnter');
        }
    };
});
