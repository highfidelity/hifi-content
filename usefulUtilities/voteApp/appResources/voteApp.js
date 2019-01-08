"use strict";

//  
//  Vote App | voteApp.js
//
//  Created by Robin Wilson 2018-11-12
//
//  Using Example Vue App Created by Milad Nazeri on 2018-10-11
//  Copyright 2016 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

/* globals Tablet, Script, HMD, Controller, AccountServices, Menu */

(function () { // BEGIN LOCAL_SCOPE

    // Modules
    var AppUi = Script.require('appUi'),
        GOOGLE_SCRIPTS_URL = Script.require(Script.resolvePath("./resources/secrets/secrets.js")).googleScriptsUrl,
        URL = Script.resolvePath("./resources/Tablet.html?v12344"),
        CONFIG = Script.require(Script.resolvePath("./resources/config.js?v12344"));

    // Configurable variables
    var EVENT_DATE = CONFIG.EVENT_DATE,
        EVENT_TITLE = CONFIG.EVENT_TITLE,
        EVENT_NAME = CONFIG.EVENT_NAME;

    // Unload app variables
    // Example: UTC month 0 = January ; month 10 = sNovember
    // year, month, day, hour, minutes
    var UNLOAD_DATE = CONFIG.UNLOAD_DATE,
        UNLOAD_TIME = 10000; // show app will unload screen for 10 seconds
    
    // App variables
    var BUTTON_NAME = "VOTE",
        VOTE_APP_NAME = "voteApp.js";

    // App status variables
    var firstLoad = true,
        setupNotLoggedIn = false;

    // Domains vs Zone visited
    var DOMAINS_ENABLED = true; // enable domains UI / domain visited checks
    
    // Zone visited
    var intervalCheckVisited,
        TIME_CHECK = 1000,
        HAS_VISITED_ZONE_CHECK = false, // if there's a zone to visit
        GOTO_ADDRESS = "thespot//-26.8224,-11.1442,-67.663/0,0.068694,0,0.997638";

    // Web event types from UI
    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        GOTO_LOCATION = CONFIG.GOTO_LOCATION,
        GOTO_DOMAIN = CONFIG.GOTO_DOMAIN,
        VOTE_AVATAR = CONFIG.VOTE_AVATAR,
        VOTE_DOMAIN = CONFIG.VOTE_DOMAIN;

    // Google scripts type events
    var VOTE_GOOGLE = "vote",
        GET_INFO_GOOGLE = "getInfo";

    // Vue UI update event
    var UPDATE_UI = EVENT_NAME + "_update_ui"; // !important must match Tablet.js
    
    // Static strings
    var DOMAIN = "domain";
    var AVATAR = "avatar";
    
    var DEBUG = true;

    // Local Settings.setValue/getValue key
    var VOTE_APP_SETTINGS_NAME = EVENT_NAME + "_voteApp"; // "Futvrelands_11_17_2018_voteApp"
    
    var DEFAULT_VOTE_APP_SETTINGS = {
        visited: false,
        domains: [],
        voted: {
            avatar: "", domain: ""
        }
    };

    // UI variables
    var ui;
    var dataStore = {
        unload: false,
        loading: true,
        loggedin: true,

        visited: false, // set by zone HOLIDAY APP

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
    

    var domains = {
        DOMAIN: "domain",
        domainsInfo: {},
        sendVote: function (name) {

            var _this = this;

            if (DEBUG) {
                print("Domains sendVote");
            }

            _this.domainsInfo[name.toLowerCase()].voted = true;
            dataStore.voted.domain = true;

            if (DEBUG) {
                print("Domains sendVote voted name", JSON.stringify(dataStore.voted.domain));
            }

            updateUI();

            var params = utils.encodeURLParams({
                type: VOTE_GOOGLE,
                time: Date.now(),
                uuid: MyAvatar.sessionUUID,
                username: AccountServices.username,
                name: name,
                eventName: EVENT_NAME,
                eventDate: EVENT_DATE,
                contestName: DOMAIN
            });
            var onComplete = function (request) {

                var voteAppSettings = utils.getVoteAppSettings();
                voteAppSettings.voted[DOMAIN] = name.toLowerCase();
                Settings.setValue(VOTE_APP_SETTINGS_NAME, voteAppSettings);

                if (DEBUG) {
                    print("Domain sendVote onComplete", JSON.stringify(voteAppSettings));
                }

            };
            var onError = function () {
                if (DEBUG) {
                    print("Error in VoteApp.js: Issue in sendDomainVote()");
                }

                _this.domainsInfo[name.toLowerCase()].voted = false;
                dataStore.voted.domain = false;

                updateUI();
            };

            utils.sendRequest(GOOGLE_SCRIPTS_URL, params, onComplete, onError);
        },

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

            gDomains.forEach(function (domainName) {
                var lowercase = domainName.toLowerCase();

                var voteAppSettings = utils.getVoteAppSettings();
                var votedName = voteAppSettings.voted[DOMAIN];

                if (votedName !== "") {
                    dataStore.voted.domain = true;
                }

                var existingIndex = existingDomains.indexOf(lowercase);
                if (existingIndex !== -1) {
                    existingDomains.splice(existingIndex, 1);
                    if (DEBUG) {
                        print("Domains existingDomains index: ", JSON.stringify(existingDomains), JSON.stringify(existingIndex));
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
            });

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
                }, 500);
            }

            return changed;
        },

        sendDomainInfoRequest: function (domainName) {
            // domainName is lowercase

            var _this = this;

            if (DEBUG) {
                print("Domains sendDomainInfoRequest", domainName, _this.domainsInfo);
            }

            var url = "https://metaverse.highfidelity.com/api/v1/places/" + domainName;
            var paramString = "";
            var onComplete = function (request) {

                if (DEBUG) {
                    print("Domains sendDomainInfoRequest onComplete");
                }

                try {
                    var response = JSON.parse(request.responseText);
                } catch (e) {
                    console.error("Error parsing request in sendDomainInfoRequest");
                }

                var image = response.data.place.previews
                    ? response.data.place.previews.thumbnail
                    : "http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"; // url to image
                
                _this.domainsInfo[domainName].image = image;
                
                // Display name is the name of the domain
                _this.domainsInfo[domainName].displayName = response.data.place.name;

                // Used for futvrelands where the displayName was different from the host name
                // var displayName = response.data.place.description;
                // displayName = displayName.split(" (")[0];
                // _this.domainsInfo[domainName].displayName = displayName;

                if (DEBUG) {
                    print("Domains onComplete displayName:", _this.domainsInfo[domainName].displayName);
                    print("Domains onComplete domainsInfo:", JSON.stringify(_this.domainsInfo[domainName]));
                }

                updateUI();

                if (DEBUG) {
                    print(JSON.stringify(image));
                }
            };
            var onError = function () {
                if (DEBUG) {
                    print("Error in VoteApp.js: Issue in sendDomainInfoRequest()");
                }
            };

            utils.sendRequest(url, paramString, onComplete, onError);
        }, 

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

    var visitedZone = {

        checkVisited: {
            startInterval: function () {

                intervalCheckVisited = Script.setInterval(
                    utils.getVoteAppSettings,
                    TIME_CHECK
                );

            },

            stopInterval: function () {
                if (intervalCheckVisited) {
                    Script.clearInterval(intervalCheckVisited);
                    intervalCheckVisited = null;
                }
            }
        }

    };

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
        AVATAR: "avatar",
        avatarsInfo: {},
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

            var params = utils.encodeURLParams({
                type: VOTE_GOOGLE,
                time: Date.now(),
                uuid: MyAvatar.sessionUUID,
                username: AccountServices.username,
                name: name,
                eventName: EVENT_NAME,
                eventDate: EVENT_DATE,
                contestName: AVATAR
            });
            var onComplete = function (request) {

                var voteAppSettings = utils.getVoteAppSettings();

                if (DEBUG) {
                    print("Avatars onComplete, settings are ", JSON.stringify(voteAppSettings));
                }

                voteAppSettings.voted[AVATAR] = name.toLowerCase();

                Settings.setValue(VOTE_APP_SETTINGS_NAME, voteAppSettings);

                updateUI();
            };
            var onError = function () {
                if (DEBUG) {
                    print("Error in VoteApp.js: Issue in sendAvatarVote()");
                }

                _this.avatarsInfo[name.toLowerCase()].voted = false;
                dataStore.voted.avatar = false;

                updateUI();
            };

            utils.sendRequest(GOOGLE_SCRIPTS_URL, params, onComplete, onError);
        },

        setAvatars: function (gAvatars) {
            // { name: "Robin", image: "hello" }
            // update avatar images if necessary

            var _this = this;
    
            var changed = false;
    
            var existingAvatars = Object.keys(_this.avatarsInfo);
            var voteAppSettings = utils.getVoteAppSettings();
            var votedName = voteAppSettings.voted[AVATAR];
    
            if (votedName !== "") {
                dataStore.voted.avatar = true;
            }
    
            gAvatars.forEach(function (avatar, index) {
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
    
                    console.log("Avatars setAvatars avatar info is ", _this.avatarsInfo[lowercase], existingIndex);
    
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
            });
    
            if (existingAvatars.length > 0) {
                // found avatars to delete

                utils.removeItems(existingAvatars, dataStore.avatars, this.avatarsInfo);
            }
    
            Script.setTimeout(function () {
                firstLoad = false;
                updateUI();
            }, 500);
    
            return changed;
        }
    };

    var utils = {

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

        // AVATAR 
        // delete, dataStore.avatars, avatars.avatarsInfo
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

        // Takes an object as argument and creates the paramString for sendRequest() to send along with a GET request
        // Example argument { username: "MyUsername", displayName: "MyDisplayName" }
        encodeURLParams: function (params) {
            var paramPairs = [];
            for (var key in params) {
                paramPairs.push(key + "=" + params[key]);
            }
            return paramPairs.join("&");
        },

        // url - the request url
        // paramString - the encodedURLParams as arguments to be sent, if not needed can be null or ""
        // onComplete - the callback after requst completes see defaultOnComplete for standards
        // onError - the callback after an error
        sendRequest: function (url, paramString, onComplete, onError) {

            var defaultOnComplete = function (request) {
                if (DEBUG) {
                    print("sendRequest() is complete");
                }
                try {
                    var info = JSON.parse(request.responseText);
                } catch (e) {
                    console.error("Error parsing response in defaultOnComplete");
                }
                if (DEBUG) {
                    print("Response info is: ", JSON.stringify(info));
                }
            };

            var defaultOnError = function () {
                console.error("sendRequest() timed out or there was another error.");
            };

            // Set request callbacks or assign to the default
            var onCompleteCallback = onComplete ? onComplete : defaultOnComplete;
            var onErrorCallback = onError ? onError : defaultOnError;

            // Create the request
            var request = new XMLHttpRequest();
            // If paramString is truthy (exists and is not an empty string) append the param string to the url
            // For GET requests, this is how we send in arguments
            var requestURL = paramString
                ? url + "?" + paramString
                : url;

            if (DEBUG) {
                print("Utils requtes url is: ", requestURL);
            }

            request.open('GET', requestURL);
            request.timeout = 10000;
            request.ontimeout = onErrorCallback;
            request.onreadystatechange = function () {
                // request.readyState === 4 indicates the request was complete and returned
                if (request.readyState === 4) {
                    onCompleteCallback(request);
                }
            };
            request.send();
        },

        loggedIn: {

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

        unloadByDate: {

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

        hasUserVoted: function(type) {

            var voteAppSettings = this.getVoteAppSettings();
    
            if (DEBUG) {
                print("Settings says:", voteAppSettings.voted[type], voteAppSettings.voted[type] !== "");
            }
    
            return voteAppSettings.voted[type] !== "";
        },

        getVoteAppSettings: function() {

            var currentSettings = Settings.getValue(VOTE_APP_SETTINGS_NAME); // , DEFAULT_VOTE_APPSETTINGS);
            var toSet = JSON.parse(JSON.stringify(DEFAULT_VOTE_APP_SETTINGS));
            var voteAppSettings;
    
            if (currentSettings) {
                // exists
    
                if (currentSettings["voted"]) {
                    toSet.voted = currentSettings["voted"];
                }

                if (currentSettings["domains"]) {
                    toSet.domains = currentSettings["domains"];
                }
    
                if (currentSettings["visited"]) {
                    toSet.visited = currentSettings["visited"];
    
                    dataStore.visited = true;
    
                    updateUI();
                } else {
                    toSet.visited = currentSettings["visited"];
    
                    dataStore.visited = false;
    
                    updateUI();
                }
    
            } else {
                voteAppSettings = toSet;
            }
    
            Settings.setValue(VOTE_APP_SETTINGS_NAME, toSet);
            voteAppSettings = toSet;
    
            return voteAppSettings;
        }
    };

    var google = {

        getData: function () {
            var _this = this;

            var params = utils.encodeURLParams({ type: GET_INFO_GOOGLE });
            var onComplete = function (request) {

                if (DEBUG) {
                    print("Google getData");
                    // print ("google info is :", JSON.stringify(request));
                }

                try {
                    var gData = JSON.parse(request.responseText);
                } catch (e) {
                    console.error("Error parsing request in sendDomainInfoRequest");
                }

                _this.setData(gData);
            };
            var onError = function () {
                if (DEBUG) {
                    print("Error in VoteApp.js: Issue in getGoogleData()");
                }
            };

            utils.sendRequest(GOOGLE_SCRIPTS_URL, params, onComplete, onError);
        },

        setData: function (gData) {
            if (DEBUG) {
                print("Google setData");
            }

            utils.loading.start();

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
                dataStore.voted.domain = utils.hasUserVoted(DOMAIN);
            }

            dataStore.voted.avatar = utils.hasUserVoted(AVATAR);
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

    var app = {
        startup: function() {
            var _this = this;

            ui = new AppUi({
                buttonName: BUTTON_NAME,
                home: URL,
                onMessage: _this.onMessage,
                graphicsDirectory: Script.resolvePath("./resources/icons/"),
                onOpened: _this.onOpened,
                onClosed: _this.onClosed
            });
    
            location.hostChanged.connect(onHostChanged);
    
            utils.unloadByDate.willUnload();
            Script.scriptEnding.connect(_this.unload);
        },
        onClosed: function() {

            if (HAS_VISITED_ZONE_CHECK) {
                visitedZone.checkVisited.stopInterval();
            }

        },

        onOpened: function() {

            var isUnloading = utils.unloadByDate.willUnload();
    
            if (DEBUG) {
                print("onOpened: isUnloading:", isUnloading);
            }
    
            if (isUnloading) {
                return;
            }
    
            var loggedIn = AccountServices.loggedIn;
    
            if (HAS_VISITED_ZONE_CHECK) {
                visitedZone.checkVisited.startInterval();
            }
    
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

        unload: function() {
            if (DEBUG) {
                print("Unloading vote app");
            }
            if (HAS_VISITED_ZONE_CHECK) {
                visitedZone.checkVisited.stopInterval();
            }

            location.hostChanged.disconnect(onHostChanged);
        },

        onMessage: function(data) {
            // EventBridge message from HTML script.
    
            // Check against EVENT_NAME to ensure we're getting the correct messages fromt eh correct app
            if (!data.type || data.type.indexOf(EVENT_NAME) === -1){
                if (DEBUG) {
                    print("Event type event name index check: ", !data.type, data.type.indexOf(EVENT_NAME) === -1)
                }
                return;
            }
            data.type = data.type.replace(EVENT_NAME,'');

            if (DEBUG) {
                print("Event type replace name:", "'", data.type, "' & '", VOTE_AVATAR, "'");
                print("Event type replace name: ", data.type === VOTE_AVATAR);
            }
    
            switch (data.type) {
                case EVENT_BRIDGE_OPEN_MESSAGE:
                    updateUI();
                    break;
                case GOTO_LOCATION:
                    Window.location = "hifi://" + GOTO_ADDRESS;
                    dataStore.visited = true;
    
                    ui.close();
    
                    updateUI();
    
                    break;
                case GOTO_DOMAIN:
                    Window.location = "hifi://" + data.value;
                    break;
                case VOTE_AVATAR:
                    if (DEBUG) {
                        print("Vote Avatar event");
                    }
                    console.log(utils.hasUserVoted(AVATAR));
                    if (utils.hasUserVoted(AVATAR) === false) {
                        avatars.sendVote(data.value);
                    }
                    break;
                case VOTE_DOMAIN:
                    if (DEBUG) {
                        print("Vote Domain event");
                    }
                    console.log(utils.hasUserVoted(DOMAIN));
                    if (utils.hasUserVoted(DOMAIN) === false) {
                        domains.sendVote(data.value);
                    }
                    break;
                default:
                    break;
            }
        }
    };

    function updateUI() {
        var messageObject = {
            type: UPDATE_UI,
            value: dataStore
        };
        ui.sendToHtml(messageObject);
    }

    app.startup();

}()); // END LOCAL_SCOPE