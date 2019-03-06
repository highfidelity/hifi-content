/*

    Audio Focus
    Created by Milad Nazeri on 2019-01-07
    Copyright 2019 High Fidelity, Inc.

    Distributed under the Apache License, Version 2.0.
    See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

    Point to solo someone to hear them better in a crowd!
    TABLET UI JS
    
*/

// *************************************
// START VUE
// *************************************
// #region Vue


Vue.component('solo-list', {
    props: ['list'],
    template: /*html*/`
    <div id="avatar-list" >
        <div v-for="(name, index) in list" :key="index">
            <solo-item :name="name"></solo-item>
        </div>
    </div>
    `
})


Vue.component('solo-item', {
    props: ['name'],
    methods: {
        clicked: function(name) {
            EventBridge.emitWebEvent(JSON.stringify({
                type: "REMOVE_USER",
                value: name
            }));
        }
    },
    template: /*html*/`
        <div class="shadow name">
            <span >{{name}}</span><span class="close" @click="clicked(name)">X</span>
        </div>
    `
})


var app = new Vue({
    el: '#app',
    methods: {
        clear: function() {
            EventBridge.emitWebEvent(JSON.stringify({
                type: "CLEAR_LIST"
            }));
        }
    },
    data: {
        soloList: [],
        showingError: false,
        fadeIn: false,
        fadeOut: false
    }
});


// #endregion
// *************************************
// END VUE 
// *************************************

// *************************************
// START EVENTBRIDGE
// *************************************
// #region Eventbridge


// Handle incoming tablet messages
function onScriptEventReceived(message) {
    try {
        message = JSON.parse(message);
    } catch (e) {
        console.log(e)
        return;
    }

    switch (data.type) {
        case "UPDATE_SOLO":
            app.soloList = data.value;
            break;
        case "DISPLAY_ERROR":
            if (app.showingError) {
                return;
            }
            var MS_TIMEOUT = 2500;
            app.showingError = true;
            app.fadeIn = true;
            app.fadeOut = false;
            setTimeout(function() {
                app.showingError = false;
                app.fadeIn = false;
                app.fadeOut = true;
            }, MS_TIMEOUT)
        default:
    }
    
}


// This is how much time to give the Eventbridge to wake up.  This won't be needed in RC78 and will be removed.
// Run when the JS is loaded and give enough time to for EventBridge to come back
var EVENTBRIDGE_SETUP_DELAY = 500;
function onLoad() {
    setTimeout(function() {
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            app: "nametags",
            method: "eventBridgeReady"
        }));
    }, EVENTBRIDGE_SETUP_DELAY);
}

onLoad();