(function() {

    "use strict";

    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",
        LISTEN_TOGGLE = "listen_toggle",
        BAN = "ban",
        MUTE = "mute",
        GOTO = "goto",
        TOGGLE_EXPANDING_AUDIO = "toggleExpandingAudio",
        REFRESH = "refresh",
        SEARCH_WHOLE_DOMAIN_FOR_LOUDEST_ENABLED = "searchWholeDomainForLoudestEnabled",
        SELECT_AVATAR = "selectAvatar",
        EVENTBRIDGE_SETUP_DELAY = 200;

    
    Vue.component('options', {
        props: {
            isexpandingaudioenabled: { type: Boolean },
            isallavatarsintoptenenabled: { type: Boolean }
        },
        data () {
            return {
                expandingAudioValue: this.isexpandingaudioenabled,
                allAvatarsInTopTenEnabledValue: this.isallavatarsintoptenenabled
            }
        },
        methods: {
            toggleExpandingAudio(value){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: TOGGLE_EXPANDING_AUDIO,
                    value: value
                }));
            },
            toggleAllAvatars(value){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: SEARCH_WHOLE_DOMAIN_FOR_LOUDEST_ENABLED,
                    value: value
                }));
            }
        },
        template:`
            <form>
                <input type="checkbox" v-model="expandingAudioValue" name="toggleExpandingAudio" value="toggleExpandingAudio" v-on:change="toggleExpandingAudio(expandingAudioValue)"> Enable expanding overlays<br>
                <input type="checkbox" v-model="allAvatarsInTopTenEnabledValue" name="toggleAllAvatars" value="toggleAllAvatars" v-on:change="toggleAllAvatars(allAvatarsInTopTenEnabledValue)"> Enable search for all avatars in domain<br>
            </form>
        `
    })


    Vue.component('people-table', {
        props: {
            users: { type: Array}
        },
        methods: {
            refresh(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: REFRESH
                }));
            }
        },
        template:`
            <table class="table">
                    <thead>
                        <tr>
                            <th scope="col">User Name</th>
                            <th scope="col">Avg Audio Level</th>
                            <th scope="col"></th>
                            <th scope ="col"><button class="btn-md"  v-on:click="refresh()">Refresh</button></td></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="user in users">
                            <user  :key=" '1_' + user.uuid" :user="user" :is_listening ="$parent.settings.ui.isListening"></user>
                            <user-methods  :key="user.uuid" :user="user" :is_listening ="$parent.settings.ui.isListening"></user-methods>
                        </template>
                        
                    </tbody>
            </table>
        `
    })
    
    Vue.component('user', {
        props: {
            user: { type: Object }
        },
        methods: {
            selectAvatar(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: SELECT_AVATAR,
                    value: this.user
                }));
            }
        },
        template:`
            <tr v-bind:class="{ 'background-yellow': user.isSelected }">
                <td v-on:click="selectAvatar()" >{{ user.userName ? user.userName : user.displayName }}</td>
                <td>{{ user.avgAudioLevel }}</td>
                <td>{{ user.avgAudioLoudness }}</td>
                <td></td>
            </tr>
        `
    })


    Vue.component('user-methods', {
        props: {
            user: { type: Object}
        },
        methods: {
            listenToggle(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: LISTEN_TOGGLE,
                    value: this.user
                }));
            },
            ban(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: BAN,
                    value: this.user
                }));
            },
            mute(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: MUTE,
                    value: this.user
                }));
            }, 
            goto(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO,
                    value: this.user
                }));
            }
        },
        template:`
            <tr v-bind:class="{ 'background-yellow': user.isSelected }">
                <td><button class="btn-sm mt-1 mr-1" v-bind:class="{ 'btn-primary': !user.isToggled, 'btn-warning': user.isToggled }"  v-on:click="listenToggle()">Listen</button></td>
                <td><button class="btn-sm mt-1 mr-1"  v-on:click="goto()">Go to</button></td>
                <td><button class="btn-sm btn-primary mt-1 mr-1"  v-on:click="mute()">Mute</button></td>
                <td><button class="btn-sm btn-primary mt-1 mr-1"  v-on:click="ban()">Ban</button></td>
            </tr>
        `
    })

    var app = new Vue({
        el: '#app',
        data: {
            settings: {
                users: [],
                ui: {
                    isExpandingAudioEnabled: false,
                    isAllAvatarsInTopTenEnabled: false
                }
            }
        }
    });

    function onScriptEventReceived(message) {
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    if (message.key) {
                        app.settings[message.key] = data.value
                    } else {
                        app.settings = data.value;
                    }
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
