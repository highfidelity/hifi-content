(function () {
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
    BUTTON_NAME = "Overlay-Talker",
        UPDATE_UI = BUTTON_NAME + "_update_ui",
        SAVE_JSON = "saveJSON",
        EVENTBRIDGE_SETUP_DELAY = 200,
        connection = new WebSocket('ws://tan-cheetah.glitch.me/');

    connection.onopen = function () {
        console.log("on open")
        // connection is opened and ready to use
    };

    connection.onerror = function (error) {
        // an error occurred when sending/receiving data
    };

    connection.onmessage = function (message) {
        try {
            var json = JSON.parse(message.data);
          } catch (e) {
            console.log('Invalid JSON: ', message.data);
            return;
          }
          app.settings.history = json.data;
        // handle incoming message
    };

    Vue.component('chat', {
        props: ["history", "username"],
        methods: {
        },
        computed: {
            formatedMessage() {
                console.log("FORMATTED MESSAGES")
                var newMessage = JSON.stringify(this.message)
                    .replace(/\\n/g, "<br>")
                    .replace(/\"/g, "")
                    .replace(/\\t/g, "    ")
                    .split(",").join("<br>\   ")
                    .split("{").join("")
                    .split("}").join("<br>").replace(/"/g, "");
                return newMessage;
            }
        },
        template: `
            <div class="card">
                <div class="card-header">
                    History
                </div>
                <div class="card-body">
                    <div v-for="item in history">
                        {{ item.author }} :: {{ item.text }}
                    </div>
                </div>
            </div>
        `
    })

    Vue.component('input-text', {
        data: function(){
            return {
                input_text: "",
            }
        },
        methods: {
            sendInput: function(text) {
                console.log("sendInput", text)
                var message = {
                    name: this.$parent.settings.username,
                    message: this.input_text
                }
                connection.send(JSON.stringify(message));
                this.input_text = "";
            }
        },
        template: `
            <div>
                <input id="input" type="text" class="form-control" v-model="input_text" />
                <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="sendInput(input_text)">send chat</button>
            </div>
        `
    })

    var app = new Vue({
        el: '#app',
        data: {
            settings: {
                username: "",
                history: [ 
                    {to: [], message: "test"}, 
                    {to: [], message: "test2"} 
                ] 
            }
        }
    });

    function onScriptEventReceived(message) {
        console.log(message);
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.settings = data.value;
                    break;
                case SAVE_JSON:
                    saveJSON(data.value);
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
