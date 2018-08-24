//
//  triviaPodium.js
//
//  Created by Rebecca Stankus on 08/01/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

// show choices as overlays
// on clicking/triggering an overlay, the choice is saved
// on time up, the choice is shown as an entity on the front of the podium

(function() {
    var NUMBER_OF_CHOICES = 4;
    var SELECTED_COLOR = { red: 131, blue: 252, green: 238 };
    var DESELECTED_COLOR = { red: 62, blue: 129, green: 138 };
    var CORRECT_COLOR = { red: 74, blue: 116, green: 255 };
    var INCORRECT_COLOR = { red: 252, blue: 149, green: 131 };

    var choicesLocalPositions = [
        { x: -0.13284015655517578, y: 0.55535888671875, z: 0.09815025329589844 },
        { x: 0.15333318710327148, y: 0.5553245544433594, z: 0.10216426849365234 },
        { x: -0.13469266891479492, y: 0.5553092956542969, z: 0.24424362182617188 },
        { x: 0.15348529815673828, y: 0.5552749633789062, z: 0.24558639526367188 }
    ];
    var overlays = [];
    var podium;
    var selectedAnswer;
    var questionTextEntity = null;
    var revealTextEntity = null;

    var _this;

    var TriviaZone = function() {
        _this = this;
    };

    TriviaZone.prototype = {
        preload: function(entityID) {
            _this.entityID = entityID;
            podium = Entities.getEntityProperties(_this.entityID, 'parentID').parentID;
            var podiumParts = Entities.getChildrenIDs(podium);
            podiumParts.forEach(function(part) {
                var name = Entities.getEntityProperties(part, 'name').name;
                if (name === "Trivia Podium Question") {
                    questionTextEntity = part;
                } else if (name === "Trivia Podium Reveal") {
                    revealTextEntity = part;
                }
            });
        },

        shuffle: function(array) {
            var currentIndex = array.length, temporaryValue, randomIndex;
          
            while (currentIndex !== 0) {
                randomIndex = Math.floor(Math.random() * currentIndex);
                currentIndex -= 1;
                temporaryValue = array[currentIndex];
                array[currentIndex] = array[randomIndex];
                array[randomIndex] = temporaryValue;
            }
            return array;
        },

        createChoiceOverlays: function() {
            var currentLocalPosition = 0;
            while (currentLocalPosition < NUMBER_OF_CHOICES) {
                var overlay = Overlays.addOverlay("text3d", {
                    color: { red: 66, blue: 63, green: 0 },
                    backgroundColor: SELECTED_COLOR,
                    dimensions: { x: 0.2629, y: 0.1214, z: 0.01 },
                    parentID: podium,
                    lineHeight: 0.03,
                    text: "Answer choices\nwill appear here",
                    localPosition: choicesLocalPositions[currentLocalPosition],
                    localRotation: {
                        x: -0.7083390951156616,
                        y: 0,
                        z: 0,
                        w: 0.7058365345001221
                    },
                    leftMargin: 0.01,
                    topMargin: 0.01,
                    rightMargin: 0.01,
                    bottomMargin: 0.01
                });
                overlays.push(overlay);
                currentLocalPosition++;
            }
        },

        mouseRelease: function(id, event) {
            if (!event.button === "Primary") {
                return;
            }
            if (overlays.indexOf(id) !== -1) {
                selectedAnswer = Overlays.getProperty(id, 'text');
                overlays.forEach(function(overlay) {
                    if (overlay === id) {
                        Overlays.editOverlay(overlay, { backgroundColor: SELECTED_COLOR });
                    } else {
                        var text = Overlays.getProperty(overlay, 'text');
                        if (text) {
                            Overlays.editOverlay(overlay, { backgroundColor: DESELECTED_COLOR });
                        }
                    }
                });
            }
        },

        deleteOverlays: function() {
            overlays.forEach(function(overlay) {
                Overlays.deleteOverlay(overlay);
            });
        },

        triviaListener: function(channel, message, sender) {
            message = JSON.parse(message);
            if (channel === "TriviaChannel" && message.type === 'newQuestion') {
                _this.newQuestion(message.question, message.choices);
            } else if (channel === "TriviaChannel" && message.type === 'reveal') {
                _this.reveal();
            } else if (channel === "TriviaChannel" && message.type === 'clearPodium') {
                _this.clearPodium();
            } else if (channel === "TriviaChannel" && message.type === 'check') {
                _this.showIfCorrect(message.correct);
            }
        },

        enterEntity: function() {
            Messages.subscribe("TriviaChannel");
            Messages.messageReceived.connect(_this.triviaListener);
            _this.createChoiceOverlays();
            Overlays.mouseReleaseOnOverlay.connect(this.mouseRelease);
        },

        newQuestion: function(question, choices) {
            selectedAnswer = null;
            Entities.editEntity(questionTextEntity, { text: question });
            Entities.editEntity(revealTextEntity, {
                text: "?",
                backgroundColor: SELECTED_COLOR
            });
            var currentOverlay = 0;
            choices.forEach(function(choice) {
                Overlays.editOverlay(overlays[currentOverlay], {
                    text: choice,
                    backgroundColor: SELECTED_COLOR,
                    visible: true
                });
                currentOverlay++;
            });
            if (choices.length < NUMBER_OF_CHOICES) {
                while (currentOverlay < NUMBER_OF_CHOICES) {
                    Overlays.editOverlay(overlays[currentOverlay], {
                        text: "",
                        visible: false
                    });
                    currentOverlay++;
                }
            }
        },

        reveal: function() {
            if (selectedAnswer) {
                if (!revealTextEntity) {
                    var podiumParts = Entities.getChildrenIDs(podium);
                    podiumParts.forEach(function(part) {
                        var name = Entities.getEntityProperties(part, 'name').name;
                        if (name === "Trivia Podium Reveal") {
                            revealTextEntity = part;
                        }
                    });
                }
                Entities.editEntity(revealTextEntity, { text: selectedAnswer });
            } else {
                print("no answer was selected");
            }
            overlays.forEach(function(overlay) {
                var text = Overlays.getProperty(overlay, 'text');
                if (text !== selectedAnswer) {
                    Overlays.editOverlay(overlay, { visible: false });
                }
            });
        },

        showIfCorrect: function(correctAnswer) {
            var myAnswer = Entities.getEntityProperties(revealTextEntity, 'text').text;
            if (myAnswer === correctAnswer) {
                Entities.editEntity(revealTextEntity, { backgroundColor: CORRECT_COLOR });
            } else {
                Entities.editEntity(revealTextEntity, { backgroundColor: INCORRECT_COLOR });
            }
        },

        leaveEntity: function() {
            Entities.editEntity(questionTextEntity, { text: "Question will appear here" });
            Entities.editEntity(revealTextEntity, {
                text: "?",
                backgroundColor: SELECTED_COLOR
            });
            Messages.messageReceived.disconnect(_this.triviaListener);
            Messages.unsubscribe("TriviaChannel");
            _this.deleteOverlays();
            overlays = [];
        },

        clearPodium: function() {
            if (overlays) {
                overlays.forEach(function(overlay) {
                    Overlays.editOverlay(overlay, {
                        text: "Select an \n answer here",
                        visible: true
                    });
                });
            }
        },

        unload: function() {
            _this.leaveEntity();
        }
    };

    return new TriviaZone;
});
