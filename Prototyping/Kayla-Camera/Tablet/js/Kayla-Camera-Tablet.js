(function() {

    "use strict";
    
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",
        LOAD_JSON = "loadJSON",
        UPDATE_CONFIG_NAME = "updateConfigName",
        ENABLE_CUSTOM_LISTENER = "enableCustomListener",
        DISABLE_CUSTOM_LISTENER = "disableCustomListener",
        UPDATE_CUSTOM_LISTENER = "updateCustomListener",
        ADD_CAMERA_POSITION = "addCameraPosition",
        EDIT_CAMERA_POSITION_KEY = "editCameraPositionKey",
        REMOVE_CAMERA_POSITION = "removeCameraPosition",
        EDIT_CAMERA_POSITION_NAME = "editCameraPositionName",
        CHANGE_AVATAR_TO_CAMERA = "changeAvatarToCamera",
        CHANGE_AVATAR_TO_INVISIBLE = "changeAvatarToInvisible",
        TOGGLE_AVATAR_COLLISIONS = "toggleAvatarCollisions",
        EVENTBRIDGE_SETUP_DELAY = 50;

    Vue.component('config', {
        props: ["config_name"],
        data: function(){
            return {
                newName: "",
                JSONURL: "Replace with the JSON URL",
                editing: false,
                editingJSONURL: false,
            }
        },
        methods: {
            saveJSON(){
                this.$parent.saveJSON();
            },
            loadJSON(url){
                this.$parent.loadJSON(url);
            },
            selectURL(){
                this.editingJSONURL = true;
            },
            editName(name){
                this.editing = true;
            },
            goBack(){
                this.editingJSONURL = false;
            },
            updateName(name){
                this.editing = false;
                EventBridge.emitWebEvent(JSON.stringify({
                    type: UPDATE_CONFIG_NAME,
                    value: name
                }));
                this.newName = "";
            },
            changeAvatarToCamera(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: CHANGE_AVATAR_TO_CAMERA
                }));
            },
            changeAvatarToInvisible(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: CHANGE_AVATAR_TO_INVISIBLE
                }));
            },
            toggleAvatarCollisions(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: TOGGLE_AVATAR_COLLISIONS
                }));
            }
        },
        template:`
            <div class="card">
                <div class="card-header">
                <strong>Config Name: {{config_name}}</strong> <button class="btn-sm btn-primary mt-1 mr-1 float-right" v-if="!editing" v-on:click="editName()">Edit Name</button> 
                    <div v-if="editing">
                        <input id="new-name" type="text" class="form-control" v-model="newName">
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="updateName(newName)">Update Name</button>
                    </div>
                </div>
                <div class="card-body">
                    <div v-if="!editingJSONURL">
                        <button v-if="" class="btn-sm btn-primary mt-1 mr-1" v-on:click="selectURL()">Load JSON Config</button>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="saveJSON()">Save JSON Config</button>
                    </div>
                    <div v-if="editingJSONURL">
                        Go to https://kayla-camera.glitch.me/ to get the links for your saved JSONs
                        <input id="load-json" type="text" class="form-control" v-model="JSONURL">
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="loadJSON(JSONURL)">Load JSON URL</button>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="goBack()">Go Back</button>
                    </div>
                    <div>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="changeAvatarToCamera()">Use Camera Avatar</button>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="changeAvatarToInvisible()">Use Invisible Avatar</button>
                    </div>
                    <div>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="toggleAvatarCollisions()">Toggle Avatar Collisions</button>
                    </div>
                </div>
            </div>
        `
    })

    Vue.component('listener', {
        props: ["is_enabled", "position", "orientation"],
        data: function(){
            return {
                enabled: false,
            }
        },
        methods: {
            disableCustom(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: DISABLE_CUSTOM_LISTENER,
                    value: false
                }));
            },
            enableCustom(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: ENABLE_CUSTOM_LISTENER,
                    value: true
                }));
            },
            updateListening(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: UPDATE_CUSTOM_LISTENER
                }));
            }
        },
        template: `
            <div class="card">
                <div class="card-header">
                    <strong>Custom Listener</strong>
                </div>
                <div class="card-body">
                    <div>
                        <div v-if="is_enabled">
                            <strong>Position: </strong>
                            <br>
                            <div>x: {{position.x.toFixed(2)}} <strong>|</strong> y: {{position.y.toFixed(2)}} <strong>|</strong> z: {{position.z.toFixed(2)}}</div>
                            <strong>Orientation: </strong> 
                            <br>
                            <div>x: {{orientation.x.toFixed(2)}} <strong>|</strong> y: {{orientation.y.toFixed(2)}} <strong>|</strong> z: {{orientation.z.toFixed(2)}} <strong>|</strong> w: {{orientation.z.toFixed(2)}}</div>
                        </div>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-if="!is_enabled" v-on:click="enableCustom()">Enable Custom</button>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-if="is_enabled" v-on:click="disableCustom()">Disable Custom</button>
                        <button class="btn-sm btn-primary mt-1 mr-1" v-if="is_enabled" v-on:click="updateListening()">Update Listening</button>

                    </div>
                </div>
            </div>
        `
    })

    Vue.component('position', {
        props: ["name", "key_press", "position", "orientation"],
        data: function(){
            return {
                newKey: "",
                newName: "",
                editingKey: false,
                editingName: false,
            }
        },
        methods: {
            remove(key){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: REMOVE_CAMERA_POSITION,
                    value: key
                }));
            },
            editKey(){
                this.editingKey = true;
            },
            updateKey(key){
                this.editingKey = false;
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EDIT_CAMERA_POSITION_KEY,
                    value: {
                        key: this.key_press,
                        newKey: key
                    }
                }));
                this.newKey = "";
            },
            editName(){
                this.editingName = true;
            },
            updateName(name){
                this.editingName = false;
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EDIT_CAMERA_POSITION_NAME,
                    value: {
                        name: name,
                        key: this.key_press
                    }
                }));
                this.newName = "";
            },
        },
        template: `
            <div class="card">
                <div class="card-header">
                    <div>
                    <strong>{{name}}</strong> <button class="btn-sm btn-primary mt-1 mr-1 float-right" v-if="!editingName" v-on:click="editName()">Edit Name</button>
                    </div>
                    
                        <div v-if="editingName">
                            <input id="new-name" type="text" class="form-control" v-model="newName">
                            <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="updateName(newName)">Update Name</button>
                        </div>
                </div>
                <div class="card-body">
                    <div>
                    <strong>Key: </strong>{{key_press}} <button class="float-right btn-sm btn-primary mt-1 mr-1" v-if="!editingKey" v-on:click="editKey()">Edit Key</button>
                        
                        <div v-if="editingKey">
                            <input id="new-key" type="text" class="form-control" v-model="newKey">
                            <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="updateKey(newKey)">Update Key</button>
                        </div>
                        <div>
                        <strong>Position: </strong>
                        <br>
                        <div>x: {{position.x.toFixed(2)}} <strong>|</strong> y: {{position.y.toFixed(2)}} <strong>|</strong> z: {{position.z.toFixed(2)}}</div>
                        <strong>Orientation: </strong>
                        <br>
                        <div>x: {{orientation.x.toFixed(2)}} <strong>|</strong> y: {{orientation.y.toFixed(2)}} <strong>|</strong> z: {{orientation.z.toFixed(2)}} <strong>|</strong> w: {{orientation.z.toFixed(2)}}</div>
                        </div>
                    </div>
                    <button class="btn-sm btn-primary mt-1 mr-1 float-right" v-on:click="remove(key_press)">remove</button>
                </div>
            </div>
        `
    })

    var app = new Vue({
        el: '#app',
        data: {
            settings: {
                configName: "Please name the config",
                mapping: {},
                listener: {
                    isCustomListening: false,
                    customPosition: {
                        x: 0,
                        y: 0,
                        z: 0
                    },
                    customOrientation: {
                        x: 0,
                        y: 0,
                        z: 0,
                        w: 0
                    }
                }
            }
        },
        methods: {
            saveJSON(){
                var url = 'https://kayla-camera.glitch.me/json';
                $.post(url, app.settings);
            },
            loadJSON(link){
                $.get(link, function(data){
                    var newObj = convertBadJSON(data);
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: LOAD_JSON,
                        value: newObj
                    }));
                })
                    
                
            },
            createPosition(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: ADD_CAMERA_POSITION,
                    value: {
                        name: "Update the name",
                        key: "Update the key press"
                    }
                }));
            }
        } 
    });

    function onScriptEventReceived(message) {
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.settings = data.value;
                default:
            }
        } catch (e) {
            console.log(e)
            return;
        }
    }
    var map = {
        configName: "string",
        name: "string",
        key: "string",
        mapping: "object",
        position: "object",
        x: "number",
        y: "number",
        z: "number",
        w: "number",
        orientation: "object",
        listener: "object",
        isCustomListening: "boolean",
        customPosition: "object",
        customOrientation: "object"
    }
    
    function convert(string, value) {
        switch(string){
            case "string":
                return value;
                break;
            case "number":
                return Number(value);
                break;
            case "boolean":
                return Boolean(value);
                break;
        }
    };

    function convertBadJSON(obj){
        var newObj = {};
        for (var key in obj) {
            if (typeof obj[key] === "object") {
                newObj[key] = convertBadJSON(obj[key]);
            }
            else {
                newObj[key] = convert(map[key], obj[key])
            }
        }
        return newObj;
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
