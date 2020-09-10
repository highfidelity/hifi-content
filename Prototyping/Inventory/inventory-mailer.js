//
//  inventory-mailer.js
//
//  Created by kasenvr@gmail.com on 9 Sep 2020
//  Copyright 2020 Vircadia and contributors.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () { // BEGIN LOCAL_SCOPE
    "use strict";
    
    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    var inventoryDataSettingString = "inventoryApp.data";
    var urlToPostBase = "https://google.com/";
    
    var ICON = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"><path fill="white" d="M13 17H17V14L22 18.5L17 23V20H13V17M20 4H4A2 2 0 0 0 2 6V18A2 2 0 0 0 4 20H11V18H4V8L12 13L20 8V14H22V6A2 2 0 0 0 20 4M12 11L4 6H20Z" /></svg>';
    var button = tablet.addButton({
        text: "Email Cards",
        icon: ICON
    });

    function promptForEmail() {
        var email = Window.prompt("What email do you want the business cards sent to?", "your@email.com");
        if (email === "") {
            console.log("Cancelled sending.");
        } else {
            sendEmail(email);
        }
    }
    
    function sendEmail(email) {
        console.log("Sending email to: " + email);
        var inventoryData = Settings.getValue(inventoryDataSettingString);
        var urlToPost = urlToPostBase + email;

        var postEmail = new XMLHttpRequest();
        postEmail.open("POST", urlToPost, false);
        postEmail.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        postEmail.send(JSON.stringify(inventoryData));    
        console.log("Server Response: " + postEmail.responseText);
    }

    function startup() {
        button.clicked.connect(promptForEmail);
    }

    startup();

    Script.scriptEnding.connect(function () {
        tablet.removeButton(button);
        button = null;
    });

}()); // END LOCAL_SCOPE