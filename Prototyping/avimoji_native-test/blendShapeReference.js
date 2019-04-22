
    // #region BLENDSHAPES

    // Take newBlendshapeData and update selected blendshape, properties, and the avatar blendshapes
    function updateBlendshapes(newBlendshapeData, isName) {
        if (DEBUG) {
            print("New blendshape data", JSON.stringify(newBlendshapeData));
        }
        if (!isName) {
            // is not named blendshape, ensure last blendshape is not selected
            dynamicData[STRING_BLENDSHAPES].selected = "";
        }

        // update all dynamic data blendshapes
        for (var property in newBlendshapeData) {
            // set it in dynamic data for ui
            dynamicData[STRING_BLENDSHAPES].updatedProperties[property] = newBlendshapeData[property]; 

            // set it on the avatar
            MyAvatar.setBlendshape(property, newBlendshapeData[property]);
        }
    }


    // Apply the named blendshape to avatar
    function applyNamedBlendshapes(blendshapeName) {
        // Set the selected blendshape data in UI
        dynamicData[STRING_BLENDSHAPES].selected = blendshapeName;

        switch (blendshapeName){
            case "default":
                updateBlendshapes(BLENDSHAPE_DATA.defaults, true);
                break;
            case "awe":
                updateBlendshapes(BLENDSHAPE_DATA.awe, true);
                break;
            case "laugh":
                updateBlendshapes(BLENDSHAPE_DATA.laugh, true);
                break;
            case "angry":
                updateBlendshapes(BLENDSHAPE_DATA.angry, true);
                break;
        }
    }


    // Set Blendshapes back to default
    var BLENDSHAPE_RESET_MS = 50;
    function removeBlendshapes() {
        MyAvatar.hasScriptedBlendshapes = true;
        applyNamedBlendshapes("default");
        Script.setTimeout(function () {
            MyAvatar.hasScriptedBlendshapes = false;
            // updateUI(STRING_BLENDSHAPES);
        }, BLENDSHAPE_RESET_MS);
    }

    // #endregion BLENDSHAPES
