//
//  html/js/tutorial.js
//
//  Created by Thijs Wenker on 11/30/17.
//  Copyright 2017 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

/* eslint-env jquery, browser */
/* globals EventBridge */
$(document).ready(function() {
    $('.gotIt').on('click', function() {
        EventBridge.emitWebEvent(JSON.stringify({
            action: 'gotIt'
        }));
    });
});
