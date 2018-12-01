(function() {
    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            BUTTON_NAME = "HIFI-DANCE",
            EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
            UPDATE_UI = BUTTON_NAME + "_update_ui",
            TRY_DANCE = "try_dance",
            STOP_DANCE = "stop_dance",
            START_DANCING = "start_dancing",
            REMOVE_DANCE = "remove_dance",
            ADD_DANCE = "add_dance",
            PREVIEW_DANCE = "preview_dance",
            PREVIEW_DANCE_STOP = "preview_dance_stop",
            UPDATE_DANCE_ARRAY = "update_dance_array",
            CURRENT_DANCE = "current_dance",
            
            EVENTBRIDGE_SETUP_DELAY = 10
        ;

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
            template: /*html*/` 
                <div class="card ">
                    <div class="card-header current-dance-background-header">
                        <h6 class="font-weight-bold current-dance-text"> Current Dance </h6>
                    </div>
                    <div class="card-body current-dance-background">
                        <h6 class="font-weight-bold current-dance-text"> {{ current.name }} </h6>
                        <button class="btn-sm btn-primary mt-1 mr-1 font-weight-bold" v-on:click="stopDance()">Stop Dance</button>
                    </div>
                </div>
            `
        })

        Vue.component('dance-list', {
            props: ['dances', 'should_be_running'],
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
                }
            },
            template: /*html*/`
                <div class="accordian " id="dance-accordian">
                    <div class="card transparent">
                        <div class="card-header transparent">
                            <button class="btn btn-link" type="button" data-toggle="collapse" data-target="#collapseOne">
                                <h6 class="font-weight-bold">Dance List - click to open/close</h6>
                            </button>
                        </div>
                        <div id="collapseOne" class="collapse show" data-parent="#dance-accordian">
                            <div v-for="(dance, index) in dances" :key="index">
                                    <div class="list-complete-item p-2">
                                        <div class="card-header transparent">
                                            <span class="font-weight-bold">{{dance.name}}</span>
                                            <a href="#" class="float-right" data-toggle="collapse" :data-target="'#collapse' + dance.name">
                                                <i class="far fa-angle-down"></i>
                                            </a>
                                        </div>
                                        <form class="form-inline collapse show" :id="'collapse' + dance.name" onsubmit="event.preventDefault()">
                                            
                                            <div class="row">
                                                <div class="col">
                                                    <div class="input-group mb-1 ">
                                                        <div class="input-group-prepend">
                                                            <span class="input-group-text main-font-size font-weight-bold">Start Frame</span>
                                                        </div>
                                                        <input v-if="dance" type="text" v-on:blur="onBlur" v-model="dance.startFrame" class="form-control main-font-size" placeholder="start frame">
                                                    </div>
                                                </div>
                                                <div class="col">
                                                    <div class="input-group mb-1">
                                                        <div class="input-group-prepend">
                                                            <span class="input-group-text main-font-size font-weight-bold">End Frame</span>
                                                        </div>
                                                        <input v-if="dance" type="text" v-on:blur="onBlur" v-model="dance.endFrame" class="form-control main-font-size" placeholder="end frame">
                                                    </div>
                                                </div>
                                            </div class="row">
                                            <div class="row">
                                                <div class="col">
                                                    <div class="input-group mb-1">
                                                        <div class="input-group-prepend">
                                                            <span class="input-group-text main-font-size font-weight-bold">Duration (ms)</span>
                                                        </div>
                                                        <input v-if="dance" type="text" v-on:blur="onBlur" v-model="dance.duration" class="form-control main-font-size" placeholder="duration">
                                                    </div>
                                                </div>
                                                <div class="col">
                                                    <div class="input-group mb-1">
                                                        <div class="input-group-prepend">
                                                            <span class="input-group-text main-font-size font-weight-bold">FPS</span>
                                                        </div>
                                                        <input v-if="dance" type="text" v-on:blur="onBlur" v-model="dance.fps" class="form-control main-font-size" placeholder="fps">
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="row">
                                                <div class="col">
                                                    <button class="btn-sm btn-danger mt-1 font-weight-bold font-weight-bold"  v-on:click="removeDance(index)">Remove</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                    <div class="row">
                                        <div class="col">
                                            <button class="btn-sm btn-primary mt-3 mr-1 font-weight-bold font-weight-bold" v-if="!should_be_running" v-on:click="startDancing()">Start Dance</button>
                                        </div>
                                    </div>
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
            template: /*html*/`
                <div class="card p-2">
                    <div class="row">
                        <div class="col-8">
                            <span class="font-weight-bold"> {{ dance.name }} </span>
                        </div>
                        <div class="col-4">
                            <span>
                                <button 
                                    class="btn-sm btn-primary mr-1 font-weight-bold"
                                    v-on:mouseover="previewDance()" 
                                    v-on:mouseleave="previewDanceStop()" 
                                    v-on:click="addDance()"
                                >
                                    Add Dance!
                                </button>
                            </span>
                        </div>
                    </div>
                </div>
            `
        })

    // App
    // /////////////////////////////////////////////////////////////////////////
        var app = new Vue({
            el: '#app',
            data: {
                dataStore: {
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
                console.log("Date.slice: ", data.slice);
                switch (data.type) {
                    case UPDATE_UI:
                        if (data.slice === CURRENT_DANCE) {
                            app.dataStore.currentDance = data.value.currentDance;
                        } else {
                            app.dataStore = data.value;
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

    // Main
    // /////////////////////////////////////////////////////////////////////////    
        onLoad();

}());
