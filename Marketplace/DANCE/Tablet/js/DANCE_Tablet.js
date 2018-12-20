(function() { 
    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
        var 
            BUTTON_NAME = "DANCE",
            EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
            UPDATE_UI = BUTTON_NAME + "_update_ui",
            TRY_DANCE = "try_dance",
            STOP_DANCE = "stop_dance",
            START_DANCING = "start_dancing",
            REMOVE_DANCE = "remove_dance",
            REMOVE_DANCE_FROM_MENU = "remove_dance_from_menu",
            ADD_DANCE = "add_dance",
            PREVIEW_DANCE = "preview_dance",
            PREVIEW_DANCE_STOP = "preview_dance_stop",
            UPDATE_DANCE_ARRAY = "update_dance_array",
            CURRENT_DANCE = "current_dance",
            TOGGLE_HMD = "toggle_hmd",
            EVENTBRIDGE_SETUP_DELAY = 10
        ;

    // Components
    // /////////////////////////////////////////////////////////////////////////
        Vue.component('current-dance', {
            props: {
                add_this_dance: { type: Boolean },
                current_dance: { type: Boolean },
                should_be_running: { type: Boolean },
                dance_array: { type: Boolean },
                add_dance_name: { type: String },
                current_dance_name: { type: String },
                toggle_hmd: {type: Boolean}
            },
            methods: {
                startDancing(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: START_DANCING
                    }));
                },
                stopDance(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: STOP_DANCE
                    }));
                },
                toggleHMD(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: TOGGLE_HMD
                    }));
                }
            },
            template: /*html*/`
            <div>
                <div class="logo">
                    <img src="./Assets/DANCE-i.svg" class=" mt-2 ml-3" style="height: 1.95rem;" >  
                    <span style="font-size: 1.25rem; position: relative; top: 5px;" class="mt-5 white-text">DANCE!</span>
                </div>
                <hr class="divider">
                <div class="instructions white-text">
                    <div class="mb-2 mt-3 ml-3">
                        <span class="label-text" v-if="add_this_dance">Preview: </span>
                        <span class="label-text" v-else-if="current_dance">Current: </span>
                        <span class="label-text" v-else>Choose dances below</span>
                        <span class="dance-name" v-if="current_dance && !add_this_dance">
                            <i>{{current_dance_name}}</i>
                        </span>
                        <span class="dance-name" v-if="add_this_dance">
                            <i>{{add_dance_name}}</i>
                        </span>
                    </div>
                    
                    <div class="mb-2 ml-3">
                        <span class="form-check mt-3 options-left">
                            <input type="checkbox" class="form-check-input" id="checkbox" :checked="toggle_hmd" v-on:click="toggleHMD()">
                            <label class="form-check-label" for="checkbox">Use in VR</label>
                        </span>
                        <span v-if="dance_array" class="mr-4 options-right">
                            <button v-if="!should_be_running" class="btn dance-toggle-start mt-3 mr-1 font-weight-bold"  v-on:click="startDancing()">Start Dance</button>
                            <button v-else class="btn dance-toggle-stop mt-3 mr-1 font-weight-bold" v-on:click="stopDance()">Stop Dance</button>
                        </span>
                    </div>
                </div>
            </div>
               
            `
        })

        Vue.component('dance-list-item', {
            props: ['dance', 'index'],
            data: function() {
                return {
                    clicked: false,
                    maxEndFrame: this.dance.endFrame
                }
            },
            methods: {
                removeDance(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: REMOVE_DANCE,
                        value: this.index
                    }));
                },
                onBlur(){
                    var sanitizedObject = {
                        startFrame: parseInt(Math.max(this.dance.startFrame, 0)),
                        endFrame: parseInt(Math.min(this.dance.endFrame, this.maxEndFrame)),
                        duration: parseInt(Math.max(1, this.dance.duration)),
                        fps: parseInt(Math.min(this.dance.fps, 500))
                    }
                    console.log(JSON.stringify(sanitizedObject));
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: UPDATE_DANCE_ARRAY,
                        value: {
                            dance: sanitizedObject,
                            index: this.index
                        }
                    }));
                },
                onClicked(){
                    this.clicked = !this.clicked;
                }
            },
            template: /*html*/`
                <div class="list-complete-item p-2 list-background">
                    <div class="card-header transparent">
                        <span class="font-weight-bold white-text"> {{dance.name}} </span>
                        <span class="menu">
                            <i class="icon icon-playback-play" data-toggle="collapse" :data-target="'#collapse' + dance.name + index" v-on:click="onClicked"></i>
                        </span>
                        <span class="delete" v-on:click="removeDance">
                            <i class="float-right mr-2 icon icon-close"></i>
                        </span>
                    </div>
                    <form class="form-inline collapse" :id="'collapse' + dance.name + index" onsubmit="event.preventDefault()">
                        <div class="row">
                            <div class="col">
                                <div class="input-group mb-1 ">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text main-font-size font-weight-bold">Start Frame</span>
                                    </div>
                                    <input v-if="dance" type="number" min="0" v-on:blur="onBlur" v-model="dance.startFrame" class="form-control main-font-size" placeholder="start frame">
                                </div>
                            </div>
                            <div class="col">
                                <div class="input-group mb-1">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text main-font-size font-weight-bold">End Frame</span>
                                    </div>
                                    <input v-if="dance" type="number" min="0" v-on:blur="onBlur" v-model="dance.endFrame" class="form-control main-font-size" placeholder="end frame">
                                </div>
                            </div>
                        </div class="row">
                        <div class="row">
                            <div class="col">
                                <div class="input-group mb-1">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text main-font-size font-weight-bold">Duration (ms)</span>
                                    </div>
                                    <input v-if="dance" type="number" min="0" v-on:blur="onBlur" v-model="dance.duration" class="form-control main-font-size" placeholder="duration">
                                </div>
                            </div>
                            <div class="col">
                                <div class="input-group mb-1">
                                    <div class="input-group-prepend">
                                        <span class="input-group-text main-font-size font-weight-bold">FPS</span>
                                    </div>
                                    <input v-if="dance" type="number" min="0" max="300" v-on:blur="onBlur" v-model="dance.fps" class="form-control main-font-size" placeholder="fps">
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            `
        })

        Vue.component('dance-list', {
            props: ['dances', 'should_be_running'],

            template: /*html*/`
                <div class="accordian " id="dance-accordian">
                    <div class="card transparent">
                        <div v-for="(dance, index) in dances" :key="index">
                            <dance-list-item :index="index" :dance="dance"></dance-list-item>
                        </div>

                    </div>
                </div>
                `
        })

        Vue.component('dance', {
            props: {
                dance: { type: Object },
                index: { type: Number }
            },
            methods: {
                addDance(){
                    if (!this.dance.selected) {
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: ADD_DANCE,
                            value: {
                                dance: this.dance,
                                index: this.index
                            }
                        }));
                    } else {
                        EventBridge.emitWebEvent(JSON.stringify({
                            type: REMOVE_DANCE_FROM_MENU,
                            value: {
                                dance: this.dance,
                                index: this.index
                            }
                        }));
                    }

                },
                tryDance(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: TRY_DANCE,
                        value: this.dance
                    }));
                },
                previewDance(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: PREVIEW_DANCE,
                        value: this.dance
                    }));
                },
                previewDanceStop(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: PREVIEW_DANCE_STOP,
                        value: this.dance
                    }));
                },
            },
            template: /*html*/`
                    <img
                        class="dance"
                        :src="'./Assets/Dance-Images/' + dance.icon"            
                        v-on:mouseover="previewDance()" 
                        v-on:mouseleave="previewDanceStop()" 
                        v-on:click="addDance()"
                    >
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
