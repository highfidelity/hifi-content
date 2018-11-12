(function() {
    
    var entityIDs = Entities.findEntities(MyAvatar.position, 1000);
  
    entityIDs.forEach(function (entityID) {

      var entityProperties = Entities.getEntityProperties(entityID, ["userData", "script", "serverScripts"]);
  
      if(entityProperties) {

        // var modelURL = entityProperties.modelURL;
        var script = entityProperties.script;
        var serverScript = entityProperties.serverScripts;

        // var userData = entityProperties.userData;

        if (script) {
            print("updating script");
            Entities.editEntity(entityID, {script: script + "1"})
        }
        if (serverScript) {
            Entities.editEntity(entityID, {serverScripts: serverScript + "1"})
        }
                    print("what script");

      }
                  print("thing script");

    });
                print("why script");

  })();