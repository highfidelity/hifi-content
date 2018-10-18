"use strict";
/* eslint-disable indent */

//
//  Example Vue App
//
//  Created by Milad Nazeri on 2018-10-11
//  Modified from AppUi.js by Howard Stearns on 2 Nov 2016
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//
/* globals Tablet, Script, HMD, Controller, Menu */

(function () { // BEGIN LOCAL_SCOPE
    // Dependencies
    // /////////////////////////////////////////////////////////////////////////
    var AppUi = Script.require('./AppUi.js');
    var Helper = Script.require('https://raw.githubusercontent.com/highfidelity/hifi-content/master/Utilities/Helper.js');

    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var URL = Script.resolvePath("./html/tablet.html"),
        BUTTON_NAME = "VOTEAPP",

        EXAMPLE_MESSAGE = "EXAMPLE_MESSAGE",
        EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen";

    // DATA MANAGEMENT
    var openPolls = {
        avatar: false,
        domain: true
    };
    var domainsInfo = {}; // will use Object.keys to get array
    var avatarsInfo = {}; // array for now

    var firstLoad = true;
    var VOTE_APP_SETTINGS_NAME = "robinTest";
    // JSON.stringify(Settings.setValue("robinTest", []));
    // JSON.stringify(Settings.getValue("robinTest"));

    // Init
    // /////////////////////////////////////////////////////////////////////////
    var ui;
    var dataStore = {
        openPolls: {
            avatar: false,
            domain: true
        },
        visitedAllDomains: false,
        domains: [],
        avatars: []
    };
    // Constructors
    // /////////////////////////////////////////////////////////////////////////
    // Collections
    // /////////////////////////////////////////////////////////////////////////

    // GOOGLE SHEET FUNCTIONS
    function getGoogleData() {

        // REQUEST list of domains

        return {
            openPolls: {
                avatar: true,
                domain: true
            },
            visitedAllDomains: false,
            domains: ["TheSpot", "Studio", "Help"],
            avatars: [
                { name: "Robin, will you vote", image: "http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg" }
            ]
        };

    }

    function sendAvatarVote(name) {

        // var paramString = this.encodeURLParams({
        //     username: params[1],
        //     displayName: params[2],
        //     date: new Date(),
        //     event: event
        // });

        // REQUEST list of domains
        // if no username or uuid ignore request

    }

    function sendDomainVote(name) {

        // REQUEST list of domains
        // if no username or uuid ignore request

    }


    // Helper Functions
    // /////////////////////////////////////////////////////////////////////////

    function onHostChanged(host) {
        print("Host changed to: " + host);

        print("location is visitable: ", host, isLocationVisitable(host));
        var domainName = host.toLowerCase();
        
        if (domainsInfo[domainName]) {

            domainsInfo[domainName].visited = true;

            // set value in settings to save it
            var clientVisitedList = Settings.getValue(VOTE_APP_SETTINGS_NAME);
            if (!clientVisitedList) {
                clientVisitedList = [];
            }
            clientVisitedList.push(domainName);
            Settings.setValue(VOTE_APP_SETTINGS_NAME, clientVisitedList);

            dataStore.visitedAllDomains = checkVisitedAllDomains(clientVisitedList);
            
            ui.updateUI(dataStore);
        }
    }

    function compareGoogleData(gData) {
        // {
        //     openPolls: {
        //         avatar: true,
        //         domain: true
        //     },
        //     domains: [ "TheSpot", "Studio" ],
        //     avatars: [
        //         { name: "Robin", image: "hello" }
        //     ]
        // };
        print("voting 1");


        var changedPolls = setPollsOpen(gData.openPolls);
        var changedDomains = setDomains(gData.domains);
        var changedAvatars = setAvatars(gData.avatars);

        var needsUpdateUI = changedPolls && changedAvatars && changedDomains;

        if (firstLoad) {
            firstLoad = false;
        }

        return needsUpdateUI;
    }

    function setPollsOpen(gPolls) {
        //     {
        //         avatar: true,
        //         domain: true
        //     },

        print("voting 2");

        var changed = false;
        if (openPolls.avatar !== gPolls.avatar || openPolls.domain !== gPolls.domain) {
            changed = true;

            openPolls.avatar = gPolls.avatar;
            openPolls.domain = gPolls.domain;
        }

        return changed;
    }
    function setDomains(gDomains) {
        // [ "TheSpot", "Studio" ],
        // add domains to the location array

        print("voting 3");

        var changed = false;

        gDomains.forEach(function (domainName) {
            var lowercase = domainName.toLowerCase();

            if (firstLoad || !domainsInfo[lowercase]) {
                // need to get all domain info because of first load
                // or new domain encountered
                changed = true;

                domainsInfo[lowercase] = {
                    name: domainName,
                    image: "",
                    visited: false,
                    index: -1,
                };

                sendDomainInfoRequest(lowercase);
                // check if visited all domains
                // sendDomainRequest
            }
        });

        Script.setTimeout(function () {
            setDataStoreDomainsInfo();
            ui.updateUI();
        }, 500);

        return changed;
    }

    function sendDomainInfoRequest(domainName) {
        // domainName is lowercase

        print("voting 4");

        var url = "https://metaverse.highfidelity.com/api/v1/places/" + domainName;
        var paramString = "";
        var onComplete = function (request) {

            print("voting 5");

            var response = JSON.parse(request.responseText);

            var image = response.data.place.previews
                ? response.data.place.previews.thumbnail
                : "http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"; // url to image
            domainsInfo[domainName].image = image;

            ui.updateUI();

            print(JSON.stringify(image));
        };
        var onError = function () {
            print("Error in VoteApp.js: Issue in sendDomainInfoRequest()");
        };

        sendRequest(url, paramString, onComplete, onError);
    }

    function setDataStoreDomainsInfo() {

        print("voting 6");

        var domains = [];

        var domainKeys = Object.keys(domainsInfo);

        domainKeys.forEach(function (domainKey, index) {
            domainsInfo[domainKey].index = index;
            domainsInfo[domainKey].visited = hasUserVisitedDomain(domainKey);
            domains.push(domainsInfo[domainKey]);
        });

        dataStore.domains = domains;
    }

    function hasUserVisitedDomain(domainName) {

        print("voting 7");
        // domainName is lowercase

        var visitedDomainList = Settings.getValue(VOTE_APP_SETTINGS_NAME, []);
        var visited = visitedDomainList.indexOf(domainName) !== -1;

        return visited;
    }

    function setAvatars(gAvatars) {
        // { name: "Robin", image: "hello" }
        // update avatar images if necessary

        dataStore.avatars = gAvatars;

        // var changed = false;
        // if (openPolls.avatar !== gPolls.avatar || openPolls.domain !== gPolls.domain) {
        //     changed = true;

        //     openPolls.avatar = gPolls.avatar;
        //     openPolls.domain = gPolls.domain;
        // }

        // return changed;
    }

    function updateDataStore() {

        ui.updateUI(dataStore);
    }


    function checkVisitedAllDomains(clientVisitedList) {
        print("voting 8");

        var visitedAllDomains = Object.keys(domainsInfo).reduce(function (visitedAll, domainName) {
            var wasVisited = clientVisitedList.indexOf(domainName) !== -1;
            return visitedAll && wasVisited;
        }, true);

        return visitedAllDomains;
    }

    function isLocationVisitable(host) {
        var domainName = host.toLowerCase();

        var isCurrentLocationVisitable = Object.keys(domainsInfo).indexOf(domainName) !== -1; // currentLocation is on list

        return isCurrentLocationVisitable;
    }


    function encodeURLParams(params) {
        var paramPairs = [];
        for (var key in params) {
            paramPairs.push(key + "=" + params[key]);
        }
        return paramPairs.join("&");
    }

    function sendRequest(url, paramString, onComplete, onError) {
        print("voting _1");

        var request = new XMLHttpRequest();
        var requestURL = paramString
            ? url + "?" + paramString
            : url;
        request.open('GET', requestURL);
        request.timeout = 10000;
        request.ontimeout = onError;
        request.onreadystatechange = function () { // called after load when readyState = 4
            if (request.readyState === 4) {
                if (onComplete) {
                    onComplete(request);
                }
            }
        };
        request.send();

    }


    // Procedural Functions
    // /////////////////////////////////////////////////////////////////////////
    function exampleFunctionToRun() {

    }

    // Tablet
    // /////////////////////////////////////////////////////////////////////////
    function startup() {
        ui = new AppUi({
            buttonName: BUTTON_NAME,
            home: URL,
            onMessage: onMessage,
            graphicsDirectory: Script.resolvePath("./icons/"),
            onOpen: onOpen
        });

        location.hostChanged.connect(onHostChanged);
        onOpen();
    }

    function onOpen() {
        var gData = getGoogleData();
        var needToUpdateUI = compareGoogleData(gData);

        if (needToUpdateUI) {
            ui.updateUI(dataStore);
        }
    }

    function unload() {
        print("WATCH OUT!");
        location.hostChanged.disconnect(onHostChanged);
    }

    // *** web event actions
    var GOTO = "goto",
    VOTE_AVATAR = "vote_avatar",
    VOTE_DOMAIN = "vote_domain";


    function onMessage(data) {
        // EventBridge message from HTML script.
        switch (data.type) {
            case EVENT_BRIDGE_OPEN_MESSAGE:
                ui.updateUI(dataStore);
                break;
            case EXAMPLE_MESSAGE:
                exampleFunctionToRun();
                break;
            case GOTO:
                Window.location = "hifi://" + data.value;
                break;
            case VOTE_AVATAR:
                sendAvatarVote(data.value);
                break;
            case VOTE_DOMAIN:
                sendDomainVote(data.value);
                break;
            default:
        }
    }


    // Main
    // /////////////////////////////////////////////////////////////////////////
    startup();

    Script.scriptEnding.connect(unload);

}()); // END LOCAL_SCOPE