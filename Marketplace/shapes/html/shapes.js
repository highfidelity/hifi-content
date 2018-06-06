//
//  shapes.js
//
//  Created by David Rowe on 14 May 2018.
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* global document, EventBridge */

(function () {

    "use strict";

    var isActive = false;

    function onToggleActiveClick() {
        var SET_ACTIVE_MESSAGE = "setActive"; // EventBridge message.

        isActive = !isActive;

        // Notify main script. It closes the dialog.
        EventBridge.emitWebEvent(JSON.stringify({
            command: SET_ACTIVE_MESSAGE,
            value: isActive
        }));
    }

    function onLoad() {
        var ICON_DIV = "icon",
            LOGO_IMG = "logo",
            LOGO_IMG_ACTIVE = "../assets/shapes-a.svg",
            LOGO_IMG_INACTIVE = "../assets/shapes-i.svg",
            TOGGLE_ACTIVE_BUTTON_ID = "toggle-active",
            iconDiv,
            logoImg,
            toggleActiveButton;

        isActive = location.search.replace("?active=", "") === "true";

        iconDiv = document.getElementById(ICON_DIV);
        logoImg = document.getElementById(LOGO_IMG);
        toggleActiveButton = document.getElementById(TOGGLE_ACTIVE_BUTTON_ID);
        toggleActiveButton.addEventListener("click", onToggleActiveClick, true);
        iconDiv.className = isActive ? "on" : "off";
        logoImg.src = isActive ? LOGO_IMG_ACTIVE : LOGO_IMG_INACTIVE;
        toggleActiveButton.value = isActive ? "TURN OFF SHAPES" : "TURN ON SHAPES";
        toggleActiveButton.className = isActive ? "on" : "off";
    }

    onLoad();

}());
