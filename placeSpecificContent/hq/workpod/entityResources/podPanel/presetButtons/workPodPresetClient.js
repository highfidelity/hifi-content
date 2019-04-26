//
// workPodPresetClient.js
// 
// Edited by Rebecca Stankus on 04/25/2019
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/

(function() {

    var _this;

    var NEUTRAL_1_COLOR = { red: 241, green: 243, blue: 238 };
    var NEUTRAL_4_COLOR = { red: 126, green: 140, blue: 129 };

    var panel;
    var presetLabel;

    var PresetButton = function() {
        _this = this;
    };

    PresetButton.prototype = {
        /* Save reference to this and find the panel  */
        preload: function(entityID) {
            _this.entityID = entityID;
            var properties = Entities.getEntityProperties(_this.entityID, ['text', 'parentID']);
            panel = properties.parentID;
            presetLabel = properties.text;
        },

        /* Send the panel server the preset type to unload previous pod and load new pod. Set this text entity's 
        color to white and all other preset buttons to dark gray */
        pressButton: function() {
            Entities.callEntityServerMethod(panel, 'changeContentSet', [presetLabel]);
            Entities.getChildrenIDs(panel).forEach(function(panelChildEntity) {
                var name = Entities.getEntityProperties(panelChildEntity, 'name').name;
                if (name === "Pod Preset Name Text") {
                    Entities.getChildrenIDs(panelChildEntity).forEach(function(panelButton) {
                        if (panelChildEntity !== _this.entityID) {
                            Entities.editEntity(panelButton, { color: NEUTRAL_4_COLOR });
                        } else {
                            Entities.editEntity(panelButton, { color: NEUTRAL_1_COLOR });
                        }
                    });
                }
            });
        },

        /* If this is a left mouse button release on the entity, the button has been pressed */
        mouseReleaseOnEntity: function(entityID, mouseEvent) {
            if (!mouseEvent.isLeftButton) {
                return;
            }
            _this.pressButton();
        },

        /*  */
        unload: function() {
        }
    };

    return new PresetButton();
});
