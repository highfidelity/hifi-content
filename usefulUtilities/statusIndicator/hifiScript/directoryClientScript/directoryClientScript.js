//
// directoryClientScript.js
//
// Created by Zach Fox 2019-06-25
//
// Copyright 2019 High Fidelity, Inc.
//
// Distributed under the Apache License, Version 2.0.
// See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
// This is a client script because Entity Server Scripts do not have access to the `location` or `AddressManager` scripting APIs.
// This will result in very slightly impacted Interface performance when loading into the domain in which this script is set to load.
//

(function () {
    
    var DIRECTORY_URL_BASE = "https://www.highfidelity.co/statusIndicator/allEmployees.html?organization=";
    function preload(id) {
        // Don't bother doing anything if the user can't rez
        if (!Entities.canRez()) {
            return;
        }

        var currentURL = Entities.getEntityProperties(id, ["sourceUrl"]).sourceUrl;
        var domainID = location.domainID;
        domainID = domainID.substring(1, domainID.length - 1);
        var newURL = DIRECTORY_URL_BASE + domainID;
        if (currentURL !== newURL) {
            Entities.editEntity(id, {sourceUrl: newURL});
        }
    }


    function DirectoryClient() {
    }


    DirectoryClient.prototype = {
        preload: preload
    };


    return new DirectoryClient();
});