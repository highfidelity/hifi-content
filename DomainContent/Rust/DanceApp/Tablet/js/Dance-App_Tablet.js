(function() {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",
        TRY_DANCE = "try_dance",
        STOP_DANCE = "stop_dance",
        START_DANCING = "start_dancing",
        REMOVE_DANCE = "remove_dance",
        ADD_DANCE = "add_dance",
        PREVIEW_DANCE = "preview_dance",
        PREVIEW_DANCE_STOP = "preview_dance_stop",
        CLEAR_ALL_DANCES = "clear_all_dances",
        UPDATE_DANCE_ARRAY = "update_dance_array",
        CURRENT_DANCE = "current_dance",
        EVENTBRIDGE_SETUP_DELAY = 200;

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
            <div class="card">
                <div class="card-header">
                    <h4> Current Dance </h4>
                </div>
                <div class="card-body">
                    <h4> {{ current.name }} </h4>
                    <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="stopDance()">Stop Dance</button>
                </div>
            </div>
        `
    })

    Vue.component('dance-list', {
        props: {
            dances: { type: Array}
        },
        methods: {
            startDancing(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: START_DANCING
                }));
            },
            removeDance(index){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: REMOVE_DANCE,
                    value: index
                }));
            },
            onBlur(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: UPDATE_DANCE_ARRAY,
                    value: this.dances
                }));
                // alert(console.log(this.$parent.settings.danceArray))
            }
        },
        template:`
        <div class="accordian" id="dance-accordian">
            <div class="card">
                <div class="card-header">
                    <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne">
                    <h4>Dance List - click to open/close</h4>
                        
                    </button>
                    <br>
                    
                </div>
                <div id="collapseOne" class="collapse show" data-parent="#dance-accordian">
                    <div class="card-body">
                        <draggable :dances="dances">
                            <transition-group name="list-complete">
                                <div v-for="(dance, index) in dances" 
                                    v-bind:key="(dance.name + index)"
                                    class="list-complete-item" 
                                >
                                    <form class="form-inline">
                                                <h3> {{dance.name}}</h3>
                                                <div class="input-group mb-3 ">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text">Start Frame</span>
                                                    </div>
                                                    <input type="text" col-sm-1 v-on:blur="onBlur" v-model="dance.startFrame" class="form-control" placeholder="start frame">
                                                </div>

                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text">End Frame</span>
                                                    </div>
                                                    <input type="text" v-on:blur="onBlur" v-model="dance.endFrame" class="form-control" placeholder="end frame">
                                                </div>

                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text">Duration</span>
                                                    </div>
                                                    <input type="text" v-on:blur="onBlur" v-model="dance.duration" class="form-control" placeholder="duration">
                                                </div>
                                                <div class="input-group mb-3">
                                                    <div class="input-group-prepend">
                                                        <span class="input-group-text">fps</span>
                                                    </div>
                                                    <input type="text" v-on:blur="onBlur" v-model="dance.fps" class="form-control" placeholder="fps">
                                                </div>
                                        <div>
                                            <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="removeDance(index)">Remove</button>
                                        </div>
                                    </form>
                                </div>
                            </transition-group>
                        </draggable>
                        <div>
                            <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="startDancing()">start Dance</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        `
    })

    Vue.component('dance', {
        props: {
            dance: { type: Object}
        },
        methods: {
            addDance(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: ADD_DANCE,
                    value: this.dance
                }));
            },
            tryDance(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: TRY_DANCE,
                    value: this.dance
                }));
            },
            previewDance(){
                // console.log("preview Dance")
                EventBridge.emitWebEvent(JSON.stringify({
                    type: PREVIEW_DANCE,
                    value: this.dance
                }));
            },
            previewDanceStop(){
                // console.log("preview Dance Stop")
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
                    <button class="btn-sm btn-primary mt-1 mr-1" v-on:mouseover="previewDance()" v-on:mouseleave="previewDanceStop()" v-on:click="addDance()">Add Dance!</button>
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
                    currentDance: false,
                    danceList: false
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
                    if (data.update.slice === CURRENT_DANCE) {
                        app.settings.currentDance = data.value.currentDance;
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
