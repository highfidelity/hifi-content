"use strict";

//  
//  Vote App | voteApp.js
//
//  Vote App integrates with Google Sheets via Google Scripts API and High Fidelity.
//  Enables users to "vote" on contests.
//
//  Created by Robin Wilson 2019-1-09
//
//  Using Example Vue App Created by Milad Nazeri on 2018-10-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals Tablet, Script, HMD, Controller, AccountServices, Menu */

(function () {

    // Modules
    var AppUi = Script.require("appUi"),
        request = Script.require("request").request,
        GOOGLE_SCRIPTS_URL = Script.require(Script.resolvePath("./resources/secrets/secrets.js")).googleScriptsUrl,
        URL = Script.resolvePath("./resources/voteApp_ui.html?v1234"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v12345"));

    // Google scripts type events
    var GOOGLE_VOTE = "vote",
        GOOGLE_GET_INFO = "getInfo";
    
    // Configurable variables
    var EVENT_DATE = CONFIG.EVENT_DATE,
        EVENT_NAME = CONFIG.EVENT_NAME;

    // Domains vs Zone visited
    var DOMAINS_ENABLED = true; // enable domains UI / domain visited checks
    
    // Static strings
    var DOMAIN_STRING = "domain";
    var AVATAR_STRING = "avatar";
    
    var DEBUG = false;
    
    var DEFAULT_DOMAIN_IMAGE = "http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg";

    var domains = {

        // Manages domain data
        // keys are lowercase domain name
        domainsInfo: {},
        
        // Sends vote to google sheet to track
        sendVote: function (nameToVoteFor) {

            var _this = this;

            if (DEBUG) {
                print("Domains sendVote");
            }

            _this.domainsInfo[nameToVoteFor.toLowerCase()].voted = true;
            dataStore.voted.domain = true;

            if (DEBUG) {
                print("Domains sendVote voted nameToVoteFor", JSON.stringify(dataStore.voted.domain));
            }

            updateUI();

            var options = {
                url: GOOGLE_SCRIPTS_URL,
                body: {
                    type: GOOGLE_VOTE,
                    time: Date.now(),
                    uuid: MyAvatar.sessionUUID,
                    username: AccountServices.username,
                    name: nameToVoteFor,
                    eventName: EVENT_NAME,
                    eventDate: EVENT_DATE,
                    contestName: DOMAIN_STRING
                }
            };

            var callback = function(error, response) {
                if (error) {
                    // Error
                    print("Issue in sendDomainVote() either error with the request or you've already voted", error);

                    _this.domainsInfo[nameToVoteFor.toLowerCase()].voted = false;
                    dataStore.voted.domain = false;
    
                    updateUI();

                } else {
                    // Success

                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        console.error("Issue with parsing response in domains sendVote: " + e);
                    }

                    var voteAppSettings = utils.getVoteAppSettings();
                    voteAppSettings.voted[DOMAIN_STRING] = nameToVoteFor.toLowerCase();
                    Settings.setValue(VOTE_APP_SETTINGS_NAME, voteAppSettings);
    
                    if (DEBUG) {
                        print("Domain sendVote onComplete", JSON.stringify(voteAppSettings));
                    }

                }
            };

            request(options, callback);
        },

        // Takes google domain data and preps the data in domainInfo to send request to hifi for images
        // and deletes the removed domains
        setDomains: function (gDomains) {
            // [ "TheSpot", "Studio" ],
            // add domains to the location array

            var _this = this;

            if (DEBUG) {
                print("Domains setDomains");
            }

            var changed = false;
            var existingDomains = Object.keys(_this.domainsInfo);

            if (DEBUG) {
                print("Domains existingDomains", JSON.stringify(existingDomains));
                print("Domains NEW google domain list", JSON.stringify(gDomains));
            }

            gDomains.forEach(parseDomainData);

            if (DEBUG) {
                print("Domains existingDomains length", JSON.stringify(existingDomains.length));
            }

            if (existingDomains.length > 0) {
                if (DEBUG) {
                    print("Domains delete old domain");
                }
                // found domains to delete
                utils.removeItems(existingDomains, dataStore.domains, this.domainsInfo);
            }

            if (changed === true) {
                Script.setTimeout(function () {
                    _this.setDataStoreDomainsInfo();
                    updateUI();
                }, FIRST_LOAD_TIMEOUT);
            }

            return changed;

            function parseDomainData(domainName) {
                var lowercase = domainName.toLowerCase();

                var voteAppSettings = utils.getVoteAppSettings();
                var votedName = voteAppSettings.voted[DOMAIN_STRING];

                if (votedName !== "") {
                    dataStore.voted.domain = true;
                }

                var existingIndex = existingDomains.indexOf(lowercase);
                if (existingIndex !== -1) {
                    existingDomains.splice(existingIndex, 1);
                    if (DEBUG) {
                        print("Domains existingDomains index: ", 
                            JSON.stringify(existingDomains), 
                            JSON.stringify(existingIndex)
                        );
                    }
                }

                if (firstLoad || !_this.domainsInfo[lowercase]) {
                    // need to get all domain info because of first load
                    // or new domain encountered
                    changed = true;

                    _this.domainsInfo[lowercase] = {
                        name: domainName,
                        displayName: "",
                        image: "",
                        visited: false,
                        index: -1,
                        voted: votedName && lowercase === votedName ? true : false
                    };

                    _this.sendDomainInfoRequest(lowercase);
                }
            }
        },

        // Sends request to High Fidelity to get domain images and names
        // onComplete sets these images and names in domainInfo
        sendDomainInfoRequest: function (domainName) {
            // domainName is lowercase

            var _this = this;

            if (DEBUG) {
                print("Domains sendDomainInfoRequest", domainName, _this.domainsInfo);
            }

            var options = {
                url: "https://metaverse.highfidelity.com/api/v1/places/" + domainName
            };

            var callback = function(error, response) {
                if (error) {
                    // Error
                    print("Error in VoteApp.js: Issue in sendDomainInfoRequest()");

                } else {
                    // Success
                    
                    if (DEBUG) {
                        print("Domains sendDomainInfoRequest onComplete");
                    }
    
                    var image = response.data.place.previews
                        ? response.data.place.previews.thumbnail
                        : DEFAULT_DOMAIN_IMAGE; // url to image
                    
                    _this.domainsInfo[domainName].image = image;
                    
                    // Display name is the name of the domain
                    _this.domainsInfo[domainName].displayName = response.data.place.name;
    
                    if (DEBUG) {
                        print("Domains onComplete displayName:", _this.domainsInfo[domainName].displayName);
                        print("Domains onComplete domainsInfo:", JSON.stringify(_this.domainsInfo[domainName]));
                    }
    
                    updateUI();
    
                    if (DEBUG) {
                        print(JSON.stringify(image));
                    }
                }
            };

            request(options, callback);
        }, 

        // Sets domains and data into dataStore from domainInfo
        setDataStoreDomainsInfo: function () {

            var _this = this;

            if (DEBUG) {
                print("Domains setDataStoreDomainsInfo");
            }
    
            if (firstLoad) {
    
                var domains = [];
    
                var domainKeys = Object.keys(_this.domainsInfo);
    
                domainKeys.forEach(function (domainKey, index) {
                    _this.domainsInfo[domainKey].index = index;
                    _this.domainsInfo[domainKey].visited = _this.hasUserVisitedDomain(domainKey);
                    domains.push(_this.domainsInfo[domainKey]);
                });
    
                utils.shuffle(domains);
                firstLoad = false;
    
            }
    
            dataStore.domains = domains;
        },

        // Checks if user visited domain from Settings
        hasUserVisitedDomain: function(domainName) {

            if (DEBUG) {
                print("Domains hasUserVisitedDomain");
            }
            // domainName is lowercase
    
            var visitedDomainList = utils.getVoteAppSettings().domains;
            var visited = visitedDomainList.indexOf(domainName) !== -1;
    
            return visited;
        }
    
    };

    // Triggered when a user goes to another domain
    // Handles logic for setting domain to visited and updating Settings
    function onHostChanged(host) {

        if (DEBUG) {
            print("onHostChanged: " + host);
            print("onHostChanged location is visitable: ", host, visitedDomains.isLocationVisitable(host));
        }

        if (DOMAINS_ENABLED) {

            if (DEBUG) {
                print("onHostChanged Domains enabled");
            }
            var domainName = host.toLowerCase();

            if (DEBUG) {
                print("onHostChanged: domainInfo is:", domains.domainsInfo[domainName]);
            }

            if (domains.domainsInfo[domainName]) {

                domains.domainsInfo[domainName].visited = true;

                // set value in settings to save it
                var voteAppSettings = utils.getVoteAppSettings();
                voteAppSettings.domains.push(domainName);
                Settings.setValue(VOTE_APP_SETTINGS_NAME, voteAppSettings);

                dataStore.visitedAllDomains = visitedDomains.checkVisitedAllDomains(voteAppSettings.domains);

                updateUI();
            }
        }
    }

    var visitedDomains = {
        // returns true or false to whether the user has visited all domains
        checkVisitedAllDomains: function (clientVisitedList) {

            if (DEBUG) {
                print("checkVisitedAllDomains domain info: ", JSON.stringify(domains.domainsInfo));
                print("checkVisitedAllDomains clientVisitedList info: ", JSON.stringify(clientVisitedList));
            }
    
            var visitedAllDomains = Object.keys(domains.domainsInfo).reduce(function (visitedAll, domainName) {
                var wasVisited = clientVisitedList.indexOf(domainName) !== -1;
                return visitedAll && wasVisited;
            }, true);
    
            return visitedAllDomains;
        },
    
        isLocationVisitable: function (host) {
            var domainName = host.toLowerCase();
    
            // Is currentLocation on the list?
            var isCurrentLocationVisitable = Object.keys(domains.domainsInfo).indexOf(domainName) !== -1;
    
            return isCurrentLocationVisitable;
        }
    };

    var avatars = {

        // Manages avatar data
        // keys are lowercase avatar name
        avatarsInfo: {},

        // Send avatar vote to Google Sheets
        sendVote: function (name) {

            var _this = this;

            if (DEBUG) {
                print("Avatars sendVote");
            }
            _this.avatarsInfo[name.toLowerCase()].voted = true;
            dataStore.voted.avatar = true;

            if (DEBUG) {
                print("Avatars voted is ", JSON.stringify(dataStore.voted.avatar));
            }

            updateUI();

            var options = {
                url: GOOGLE_SCRIPTS_URL,
                body: {
                    type: GOOGLE_VOTE,
                    time: Date.now(),
                    uuid: MyAvatar.sessionUUID,
                    username: AccountServices.username,
                    name: name,
                    eventName: EVENT_NAME,
                    eventDate: EVENT_DATE,
                    contestName: AVATAR_STRING
                }
            };

            var callback = function(error, response) {
                if (error) {
                    // Error

                    print("Issue in sendAvatarVote() either error with the request or you've already voted", error);
    
                    _this.avatarsInfo[name.toLowerCase()].voted = false;
                    dataStore.voted.avatar = false;
    
                    updateUI();
                } else {
                    // Success

                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        console.error("Issue with parsing response in sendAvatarVote(): " + e);
                    }

                    if (DEBUG) {
                        print("Avatars onComplete, settings are ", JSON.stringify(voteAppSettings));
                    }
                    
                    var voteAppSettings = utils.getVoteAppSettings();
                    voteAppSettings.voted[AVATAR_STRING] = name.toLowerCase();
                    Settings.setValue(VOTE_APP_SETTINGS_NAME, voteAppSettings);

                }
            };

            request(options, callback);
        },

        // Takes google avatar data and preps the data in avatarInfo
        // and deletes the removed avatars
        setAvatars: function (gAvatars) {
            // { name: "Robin", image: "hello" }
            // update avatar images if necessary

            var _this = this;
    
            var changed = false;
    
            var existingAvatars = Object.keys(_this.avatarsInfo);
            var voteAppSettings = utils.getVoteAppSettings();
            var votedName = voteAppSettings.voted[AVATAR_STRING];
    
            if (votedName !== "") {
                dataStore.voted.avatar = true;
            }
    
            gAvatars.forEach(parseAvatarData);
    
            if (existingAvatars.length > 0) {
                // found avatars to delete

                utils.removeItems(existingAvatars, dataStore.avatars, this.avatarsInfo);
            }
    
            Script.setTimeout(function () {
                firstLoad = false;
                updateUI();
            }, FIRST_LOAD_TIMEOUT);
    
            return changed;

            function parseAvatarData(avatar, index) {
                if (DEBUG) {
                    print("Avatar ", index, JSON.stringify(avatar));
                }
                var lowercase = avatar.name.toLowerCase();
    
                var existingIndex = existingAvatars.indexOf(lowercase);
                if (existingIndex !== -1) {
                    // exists
                    existingAvatars.splice(existingIndex, 1);
                }
    
                if (firstLoad || !_this.avatarsInfo[lowercase]) {
                    // need to get all domain info because of first load
                    // or new domain encountered
                    changed = true;

                    _this.avatarsInfo[lowercase] = {
                        name: avatar.name,
                        image: avatar.image,
                        index: dataStore.avatars.length - 1, // not using this yet
                        voted: votedName && lowercase === votedName ? true : false
                    };
    
                    dataStore.avatars.push(_this.avatarsInfo[lowercase]);
                } else if (_this.avatarsInfo[lowercase].image !== avatar.image) {
                    // image changed, update to new image
                    _this.avatarsInfo[lowercase].image = avatar.image;
                }
            }
        }
    };

    // Unload app variables
    var UNLOAD_DATE = CONFIG.UNLOAD_DATE,
        UNLOAD_TIME = 10000; // ms show app will unload screen for 10 seconds

    // Local Settings.setValue/getValue key variable
    var VOTE_APP_SETTINGS_NAME = EVENT_NAME + "_voteApp"; // "Futvrelands_11_17_2018_voteApp"

    var utils = {

        // shuffles items in place in an array
        shuffle: function (a) {
            var j, x, i;
            for (i = a.length - 1; i > 0; i--) {
                j = Math.floor(Math.random() * (i + 1));
                x = a[i];
                a[i] = a[j];
                a[j] = x;
            }
            return a;
        },

        // Takes an array with names, the dataStore list and the objWithKeys
        // Will remove the names in the array from the dataStore list and the objWithKeys
        // For example for avatars: the names to delete in an array, dataStore.avatars, avatars.avatarsInfo
        removeItems: function (listToDelete, dataStoreList, objWithKeys) {

            var list = dataStoreList;
            var infoStore = objWithKeys;

            listToDelete.forEach(function (nameToDelete) {
                // for every avatar to delete
                var deleteIndex = -1;
                for (var i = 0; i < list.length; i++) {
                    // search
                    var current = list[i];
                    var lowercase = current.name.toLowerCase();

                    if (nameToDelete === lowercase) {
                        // found
                        deleteIndex = i;
                        break;
                    }
                }
                if (deleteIndex !== -1) {
                    // remove from dataStore list and the avatar object itself
                    list.splice(deleteIndex, 1);
                    delete infoStore[nameToDelete];
                }

            });

            updateUI();
        },


        loggedIn: {

            // Sets up to listen for a user to log in
            handleNotLoggedInStatus: function () {

                if (!setupNotLoggedIn) {
                    if (DEBUG) {
                        print("handleNotLoggedInStatus", setupNotLoggedIn);
                    }

                    dataStore.loggedin = false;
                    AccountServices.loggedInChanged.connect(loggedIn);
                    setupNotLoggedIn = true;
                    dataStore.loading = false;
                    updateUI();
                }
    
                function loggedIn() {
                    AccountServices.loggedInChanged.disconnect(loggedIn);
                    setupNotLoggedIn = false;
                    dataStore.loggedin = true;
                }
            }

        },

        // handles all function with unloading the app
        unloadByDate: {

            // Unloads the app if the date is later than the unload date
            willUnload: function () {

                if (DEBUG) {
                    print("UnloadByDate willUnload() check date");
                }
                var now = new Date();

                if (now > UNLOAD_DATE) {

                    var scriptList = ScriptDiscoveryService.getRunning();
                    var url;
                    scriptList.forEach(function (scriptInfo) {
                        if (scriptInfo.name === VOTE_APP_NAME) {
                            url = scriptInfo.url;
                            dataStore.unload = true;
                            dataStore.loading = false;

                            updateUI();
                        }
                    });

                    if (DEBUG) {
                        print("UnloadByDate TRUE past UNLOAD_DATE");
                    }
                    Script.setTimeout(function () {

                        ScriptDiscoveryService.stopScript(url);

                    }, UNLOAD_TIME);

                    return true;
                }

                return false;
            }

        },

        // Handles the loading screen in the app
        loading: {
            start: function () {
                dataStore.loading = true;
                updateUI();
            },

            end: function () {
                dataStore.loading = false;
                updateUI();
            }
        },

        // Checks if user voted by contest type
        hasUserVoted: function(type) {

            var voteAppSettings = this.getVoteAppSettings();
    
            if (DEBUG) {
                print("Settings says:", voteAppSettings.voted[type], voteAppSettings.voted[type] !== "");
            }
    
            return voteAppSettings.voted[type] !== "";
        },

        // Returns Settings value 
        getVoteAppSettings: function() {

            var DEFAULT_VOTE_APP_SETTINGS = {
                visited: false,
                domains: [],
                voted: {
                    avatar: "", domain: ""
                }
            };

            var currentSettings = Settings.getValue(VOTE_APP_SETTINGS_NAME, DEFAULT_VOTE_APP_SETTINGS);
    
            return currentSettings;
        }
    };

    var google = {

        // Gets data from Google sheets
        getData: function () {
            var _this = this;

            utils.loading.start();

            var options = {
                url: GOOGLE_SCRIPTS_URL,
                body: { type: GOOGLE_GET_INFO }
            };

            var callback = function(error, response) {
                if (error) {
                    // Error
                    print("Error in VoteApp.js: Issue in getGoogleData()");
                } else {

                    try {
                        response = JSON.parse(response);
                    } catch (e) {
                        console.error("Issue with parsing response in google.getData: " + e);
                    }
                    
                    if (DEBUG) {
                        print("Google getData");
                    }
                    
                    var gData = response;
    
                    _this.setData(gData);
                }
            };

            request(options, callback);
        },

        // Takes google data and handles distributing the data to be set
        setData: function (gData) {
            if (DEBUG) {
                print("Google setData");
            }

            if (DEBUG) {
                print("Google compareGoogleData: ", dataStore.loading, dataStore.loggedin);
            }

            this.setPollsOpen(gData.openPolls);
            avatars.setAvatars(gData.avatars);

            if (DOMAINS_ENABLED) {
                domains.setDomains(gData.domains);
            }

            var voteAppSettings = utils.getVoteAppSettings();

            if (DOMAINS_ENABLED) {
                dataStore.visitedAllDomains = visitedDomains.checkVisitedAllDomains(voteAppSettings.domains);
                dataStore.voted.domain = utils.hasUserVoted(DOMAIN_STRING);
            }

            dataStore.voted.avatar = utils.hasUserVoted(AVATAR_STRING);
            // dataStore.visited = voteAppSettings.visited; // decorating contest

            if (firstLoad) {
                utils.shuffle(dataStore.avatars);

                if (DOMAINS_ENABLED) {
                    utils.shuffle(dataStore.domains);
                    onHostChanged(location.hostname); // ***
                }
            }

            utils.loading.end();
        },

        // Takes google poll data and sets contests open
        setPollsOpen: function(gPolls) {
            //     {
            //         avatar: true,
            //         domain: truex
            //     },
    
            if (DEBUG) {
                print("Google data setPolls are: ", gPolls.avatar, gPolls.domain);
            }
    
            var changed = false;
            if (dataStore.openPolls.avatar !== gPolls.avatar 
                || DOMAINS_ENABLED && dataStore.openPolls.domain !== gPolls.domain) {
                changed = true;
    
                dataStore.openPolls.avatar = gPolls.avatar;
    
                if (DOMAINS_ENABLED) {
                    dataStore.openPolls.domain = gPolls.domain;
                }
            }
            return changed;
        }
    
    };


    // Web event types from UI variables
    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        GOTO_DOMAIN = CONFIG.GOTO_DOMAIN,
        VOTE_AVATAR = CONFIG.VOTE_AVATAR,
        VOTE_DOMAIN = CONFIG.VOTE_DOMAIN;

    // App variables
    var BUTTON_NAME = "VOTE",
        VOTE_APP_NAME = "voteApp.js";

    // App status variables
    var firstLoad = true,
        setupNotLoggedIn = false,
        FIRST_LOAD_TIMEOUT = 400; // ms

    var app = {

        // Uses AppUi to create a tablet button
        startup: function() {
            var _this = this;

            ui = new AppUi({
                buttonName: BUTTON_NAME,
                home: URL,
                onMessage: _this.onMessage,
                graphicsDirectory: Script.resolvePath("./resources/icons/"),
                onOpened: _this.onOpened
            });
    
            location.hostChanged.connect(onHostChanged);
    
            utils.unloadByDate.willUnload();
            Script.scriptEnding.connect(_this.unload);
        },

        // Open the app callback
        onOpened: function() {

            var isUnloading = utils.unloadByDate.willUnload();
    
            if (DEBUG) {
                print("onOpened: isUnloading:", isUnloading);
            }
    
            if (isUnloading) {
                return;
            }
    
            var loggedIn = AccountServices.loggedIn;
    
            if (DEBUG) {
                print("onOpened: loggedIn:", loggedIn);
            }
    
            if (loggedIn) {
                if (firstLoad) {
                    dataStore.loggedin = true;
    
                    if (DEBUG) {
                        print("onOpened: setting datastore.loggedin true");
                    }
                }
                google.getData(); // asynchronous and will call compareGoogleData(gData) once complete
            } else {
                // is not logged in
                utils.loggedIn.handleNotLoggedInStatus();
            }
    
        },

        // Unload callback
        unload: function() {
            if (DEBUG) {
                print("Unloading vote app");
            }

            location.hostChanged.disconnect(onHostChanged);
        },

        // Handles events recieved from the UI
        onMessage: function(data) {
            // EventBridge message from HTML script.
    
            // Check against EVENT_NAME to ensure we're getting the correct messages fromt eh correct app
            if (!data.type || data.type.indexOf(EVENT_NAME) === -1){
                if (DEBUG) {
                    print("Event type event name index check: ", !data.type, data.type.indexOf(EVENT_NAME) === -1);
                }
                return;
            }
            data.type = data.type.replace(EVENT_NAME,"");

            if (DEBUG) {
                print("Event type replace name:", "'", data.type, "' & '", VOTE_AVATAR, "'");
                print("Event type replace name: ", data.type === VOTE_AVATAR);
            }
    
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    updateUI();
                    break;
                case GOTO_DOMAIN:
                    Window.location = "hifi://" + data.value;
                    break;
                case VOTE_AVATAR:
                    if (DEBUG) {
                        print("Vote Avatar event");
                    }
                    console.log(utils.hasUserVoted(AVATAR_STRING));
                    if (utils.hasUserVoted(AVATAR_STRING) === false) {
                        avatars.sendVote(data.value);
                    }
                    break;
                case VOTE_DOMAIN:
                    if (DEBUG) {
                        print("Vote Domain event");
                    }
                    console.log(utils.hasUserVoted(DOMAIN_STRING));
                    if (utils.hasUserVoted(DOMAIN_STRING) === false) {
                        domains.sendVote(data.value);
                    }
                    break;
                default:
                    break;
            }
        }
    };

    // Vue UI update event variables
    var UPDATE_UI = CONFIG.UPDATE_UI;
    
    // UI variables
    var ui;
    var dataStore = {
        unload: false,
        loading: true,
        loggedin: true,

        voted: {
            domain: false,
            avatar: false
        },
        openPolls: {
            avatar: false,
            domain: false
        },
        visitedAllDomains: false, // for domains
        domains: [],
        avatars: []
    };

    function updateUI() {

        var messageObject = {
            type: UPDATE_UI,
            value: dataStore
        };

        ui.sendToHtml(messageObject);
    }

    app.startup();

}());