(function() {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",
        TRY_DANCE = "try_dance",
        STOP_DANCE = "stop_dance",
        PREVIEW_DANCE = "preview_dance",
        PREVIEW_DANCE_STOP = "preview_dance_stop",
        EVENTBRIDGE_SETUP_DELAY = 50;

    // Components
    // /////////////////////////////////////////////////////////////////////////
    Vue.component('current-dance', {
        props: {
            current: { type: Object}
        },
        methods: {
            stopDance(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: STOP_DANCE
                }));
            }
        },
        template:`
            <div class="card sticky-top">
                <div class="card-header">
                    <h1> Current Dance </h1>
                </div>
                <div class="card-body">
                    {{ current.name }}
                    <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="stopDance()">Stop Dance</button>
                </div>
            </div>
        `
    })

    Vue.component('dance', {
        props: {
            dance: { type: Object}
        },
        methods: {
            tryDance(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: TRY_DANCE,
                    value: this.dance
                }));
            },
            previewDance(){
                console.log("preview Dance")
                EventBridge.emitWebEvent(JSON.stringify({
                    type: PREVIEW_DANCE,
                    value: this.dance
                }));
            },
            previewDanceStop(){
                console.log("preview Dance Stop")
                EventBridge.emitWebEvent(JSON.stringify({
                    type: PREVIEW_DANCE_STOP,
                    value: this.dance
                }));
            },
        },
        template:`
            <div class="card">
                <div class="card-header">
                    {{ dance.name }}
                </div>
                <div class="card-body">
                    <button class="btn-sm btn-primary mt-1 mr-1" v-on:mouseover="previewDance()" v-on:mouseleave="previewDanceStop()" v-on:click="tryDance()">Try Dance</button>
                </div>
            </div>
        `
    })

    // App
    // /////////////////////////////////////////////////////////////////////////
    var app = new Vue({
        el: '#app',
        data: {
            settings: {
                ui: {
                    currentDance: false
                }
            }
        }
    });

    // Procedural
    // /////////////////////////////////////////////////////////////////////////
    function onScriptEventReceived(message) {
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.settings = data.value;
                    break;
                default:
            }
        } catch (e) {
            console.log(e)
            return;
        }
    }
    
    function onLoad() {
        
        // Initial button active state is communicated via URL parameter.
        // isActive = location.search.replace("?active=", "") === "true";

        setTimeout(function () {
            // Open the EventBridge to communicate with the main script.
            // Allow time for EventBridge to become ready.
            EventBridge.scriptEventReceived.connect(onScriptEventReceived);
            EventBridge.emitWebEvent(JSON.stringify({
                type: EVENT_BRIDGE_OPEN_MESSAGE
            }));
        }, EVENTBRIDGE_SETUP_DELAY);
    }

    // App
    // /////////////////////////////////////////////////////////////////////////    
    onLoad();

}());
