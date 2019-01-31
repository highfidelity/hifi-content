(function () {

    var EVENTBRIDGE_SETUP_DELAY = 200;

    // Consts
    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        UPDATE_UI = CONFIG.UPDATE_UI,
        APP_NAME = CONFIG.APP_NAME;

    // Events 
    // !important Add APP_NAME to each event

    // Debug 

    var DEBUG = false;

    // Components

    Vue.component('example', {
        props: {
            example: { type: Object }
        },
        methods: {
            example() {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EXAMPLE_MESSAGE,
                    value: this.example
                }));
            }
        },
        template: `
                <div class="card">
                    <div class="card-header">
                        {{ example.name }}
                    </div>
                    <div class="card-body">
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="example()">Example</button>
                    </div>
                </div>
            `
    })

    var app = new Vue({
        el: '#app',
        data: {
            dataStore: {
                example: [
                    {
                        name: "example"
                    }
                ],
                ui: {}
            }
        }
    });


    function onScriptEventReceived(message) {
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.dataStore = data.value;
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

    onLoad();

}());
