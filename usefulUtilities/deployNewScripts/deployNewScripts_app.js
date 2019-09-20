//
// deployNewScripts_app.js
// Created by Zach Fox and Rebecca Stankus on 2019-03-20
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

(function() {
    function onEventBridgeReady() {
        ui.sendMessage({
            app: APP_NAME,
            method: "initializeUI"
        });
    }


    function EntityObject(id, name, locked, script, serverScripts, userData) {
        this.id = id;
        this.name = name;
        this.locked = locked;
        this.script = script;
        this.serverScripts = serverScripts;
        this.userData = userData;
    }


    function matches(substringToMatch, fullText, isSubstringMatch) {
        if (substringToMatch.length === 0) {
            return false;
        }

        if (isSubstringMatch) {
            return (fullText.indexOf(substringToMatch) > -1);
        } else {
            return (substringToMatch === fullText);
        }
    }
    

    function unlockEntities(entityArray) {
        for (var i = 0; i < entityArray.length; i++) {
            if (entityArray[i].locked) {
                Entities.editEntity(entityArray[i].id, {
                    "locked": false
                });
            }
        }
    }


    function editEntities(entitiesToChange, oldText, newText, isSubstringMatch, isDryRun) {
        var numModifiedClientScripts = 0;
        var numModifiedServerScripts = 0;
        var numModifiedUserData = 0;
        var numLockedScripts = 0;
        var modifiedEntityNames = [];

        for (var i = 0; i < entitiesToChange.length; i++) {
            var propertiesToChange = {};
            
            // If the entity was originally locked, relock it.
            if (entitiesToChange[i].locked) {
                propertiesToChange.locked = true;
                numLockedScripts++;
            }

            var newScript = "";
    
            if (oldText.client !== "" && matches(oldText.client, entitiesToChange[i].script, isSubstringMatch)) {
                newScript = "";
                if (isSubstringMatch) {
                    newScript = entitiesToChange[i].script.replace(oldText.client, newText.client);
                } else {
                    newScript = newText.client;
                }
                propertiesToChange.script = newScript;
                numModifiedClientScripts++;
            }
        
            if (oldText.server !== "" && matches(oldText.server, entitiesToChange[i].serverScripts, isSubstringMatch)) {
                newScript = "";
                if (isSubstringMatch) {
                    newScript = entitiesToChange[i].serverScripts.replace(oldText.server, newText.server);
                } else {
                    newScript = newText.server;
                }
                propertiesToChange.serverScripts = newScript;
                numModifiedServerScripts++;
            }
        
            if (oldText.userData !== "" && matches(oldText.userData, entitiesToChange[i].userData, isSubstringMatch)) {
                newScript = "";
                if (isSubstringMatch) {
                    newScript = entitiesToChange[i].userData.replace(oldText.userData, newText.userData);
                } else {
                    newScript = newText.userData;
                }
                propertiesToChange.userData = newScript;
                numModifiedUserData++;
            }

            modifiedEntityNames.push(entitiesToChange[i].name);
            
            if (!isDryRun) {
                Entities.editEntity(entitiesToChange[i].id, propertiesToChange);
            }
        }

        ui.sendMessage({
            app: APP_NAME,
            method: "editComplete",
            data: {
                "isDryRun": isDryRun,
                "numModifiedClientScripts": numModifiedClientScripts,
                "numModifiedServerScripts": numModifiedServerScripts,
                "numModifiedUserData": numModifiedUserData,
                "numLockedScripts": numLockedScripts,
                "modifiedEntityNames": modifiedEntityNames
            }
        });
    }


    var SEARCH_RADIUS_M = 10000;
    var WAIT_BEFORE_EDITING_MS = 500;
    var operationInProgress = false;
    function deployNewScripts(oldText, newText, isSubstringMatch, isDryRun) {
        if (operationInProgress) {
            ui.sendMessage({
                app: APP_NAME,
                method: "operationInProgress"
            });
            return;
        }
        
        var allEntities = Entities.findEntities(MyAvatar.position, SEARCH_RADIUS_M);

        var entitiesToChange = [];
        for (var entityIndex in allEntities) {
            var entity = Entities.getEntityProperties(allEntities[entityIndex], ["id", "name", "locked", "script", "serverScripts", "userData"]);

            if ((entity.script && matches(oldText.client, entity.script, isSubstringMatch)) ||
                (entity.serverScripts && matches(oldText.server, entity.serverScripts, isSubstringMatch)) ||
                (entity.userData && matches(oldText.userData, entity.userData, isSubstringMatch))) {
                entitiesToChange.push(new EntityObject(entity.id, entity.name, entity.locked, entity.script, entity.serverScripts, entity.userData));
            }
        }

        if (!isDryRun) {
            unlockEntities(entitiesToChange);
        }

        Script.setTimeout(function() {
            editEntities(entitiesToChange, oldText, newText, isSubstringMatch, isDryRun);
            operationInProgress = false;
        }, WAIT_BEFORE_EDITING_MS);
    }


    // Handle EventBridge messages from UI JavaScript.
    function onWebEventReceived(event) {
        if (event.app !== APP_NAME) {
            return;
        }
        
        switch (event.method) {
            case "eventBridgeReady":
                onEventBridgeReady();
                break;


            case "deployNewScripts":
                deployNewScripts(event.data.oldText, event.data.newText, event.data.isSubstringMatch, event.data.isDryRun);
                break;


            default:
                console.log("Unrecognized event method supplied to App JS: " + event.method);
                break;
        }
    }


    // When the script starts up, setup AppUI and call `cacheSounds()`.
    // Also hook up necessary signals and open the app's UI.
    var ui;
    var AppUi = Script.require('appUi');
    var appPage = Script.resolvePath('ui/deployNewScripts_ui.html?0');
    var APP_NAME = "DEPLOY";
    function startup() {
        ui = new AppUi({
            buttonName: APP_NAME,
            home: appPage,
            // Deploy by Olivier Magnet from the Noun Project
            graphicsDirectory: Script.resolvePath("assets/icons/"),
            onMessage: onWebEventReceived
        });
    }
    startup();
})();
