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
        EDIT_DEFAULT = "editDefault",
        EDIT_BRAKE = "editBrake",
        EVENTBRIDGE_SETUP_DELAY = 100;

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
        props: ["is_enabled", "position", "orientation", "mode"],
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
                        <div>
                            <strong>Current Mode:</strong> {{mode}}
                        </div>
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

    Vue.component('move_options', {
        props: ["move"],
        methods: {
            onBlur: function(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EDIT_DEFAULT,
                    value: this.move
                }));
            }
        },
        template: /*html*/`
        <div class="card">
            <div class="card-header">
                move options
            </div>
            <div class="card-body">
            
                <form class="form-inline">
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">DRAG_COEFFICIENT</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.DRAG_COEFFICIENT" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MAX_SPEED</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.MAX_SPEED" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">ACCELERATION</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.ACCELERATION" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MOUSE_YAW_SCALE</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.MOUSE_YAW_SCALE" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MOUSE_PITCH_SCALE</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.MOUSE_PITCH_SCALE" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MOUSE_SENSITIVITY</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.MOUSE_SENSITIVITY" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">W</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="move.W" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    
                </form>
            </div>
        </div>
        `
    })

    Vue.component('brake_options', {
        props: ["brake"],
        methods: {
            onBlur: function(){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EDIT_DEFAULT,
                    value: this.brake
                }));
            }
        },
        template: /*html*/`
        <div class="card">
            <div class="card-header">
                brake options
            </div>
            <div class="card-body">
            
                <form class="form-inline">
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">DRAG_COEFFICIENT</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.DRAG_COEFFICIENT" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MAX_SPEED</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.MAX_SPEED" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">ACCELERATION</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.ACCELERATION" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MOUSE_YAW_SCALE</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.MOUSE_YAW_SCALE" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MOUSE_PITCH_SCALE</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.MOUSE_PITCH_SCALE" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">MOUSE_SENSITIVITY</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.MOUSE_SENSITIVITY" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    <div class="input-group mb-1 ">
                        <div class="input-group-prepend">
                            <span class="input-group-text main-font-size font-weight-bold">W</span>
                        </div>
                        <input type="text" v-on:blur="onBlur" v-model="brake.W" class="form-control main-font-size" placeholder="start frame">
                    </div>
                    
                </form>
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
                fetch(app.settings.settingsURL, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(app.settings), // body data type must match "Content-Type" header
                })
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



//  <div class="dropdown">
//             <input type="button" class="blue" id="catalog" onclick="toggleMenu('databaseDropdown')" disabled = true value="Default Catalog &#9660;">
//             <ul class="dropdown-database">
//                 <div id="databaseDropdown" class="dropdown-items">
//                     <li>Default Catalog</li>
//                     <li>Custom Catalog</li>
//                     <li>Misc. Catalog</li>
//                 </div>
//             </ul>
//             <input type="button" id="selectedType" onclick="toggleMenu('typeDropdown')" class="blue" disabled = true value="Any Type &#9660;">
//             <ul class="dropdown-type">
//                 <div id="typeDropdown" class="dropdown-items">
//                     <li>Any Type</li>
//                     <li>Multiple Choice</li>
//                     <li>True or False</li>
//                 </div>
//             </ul>
//             <br>
//             <br>
//             <input type="button" id="selectedDifficulty" onclick="toggleMenu('difficultyDropdown')" class="blue" disabled = true value="Level &#9660;">
//             <ul class="dropdown-difficulty">
//                 <div id="difficultyDropdown" class="dropdown-items">
//                     <li>Any</li>
//                     <li>Easy</li>
//                     <li>Medium</li>
//                     <li>Hard</li>
//                 </div>
//             </ul>
//             <input type="button" id="selectedCategory" onclick="toggleMenu('categoryDropdown')" class="blue" disabled = true value="Any Category &#9660;">
//             <ul class="dropdown-category">
//                 <div id="categoryDropdown" class="dropdown-items">
//                     <li value="">Any Category</li>
//                     <li value="9">General Knowledge</li>
//                     <li value="10">Books</li>
//                     <li value="11">Film</li>
//                     <li value="12">Music</li>
//                     <li value="13">Musicals and Theatres</li>
//                     <li value="14">Television</li>
//                     <li value="15">Video Games</li>
//                     <li value="16">Board Games</li>
//                     <li value="29">Comics</li>
//                     <li value="31">Japanese Anime and Manga</li>
//                     <li value="32">Cartoon and Animations</li>
//                     <li value="18">Computers</li>
//                     <li value="19">Mathematics</li>
//                     <li value="30">Gadgets</li>
//                     <li value="25">Art</li>
//                     <li value="26">Celebrities</li>
//                     <li value="27">Animals</li>
//                     <li value="28">Vehicles</li>
//                     <li value="20">Mythology</li>
//                     <li value="21">Sports</li>
//                     <li value="23">History</li>
//                     <li value="22">Geography</li>
//                     <li value="24">Politics</li>
//                 </div>
//             </ul>
//             <br>
//             <br>
//         </div>

// .dropdown {
//     font-family: 'Raleway', sans-serif;
//     font-weight: bold;
//     font-size: 13px;
//     position: relative;
//     width: 100%;
// }


// .dropdown:focus {
//     border: none;
//     outline: none;
// }

// .dropdown li {
//     list-style-type: none;
//     padding: 3px 0 1px 12px;
//     width: 120px;
//     height: auto;
//     font-size: 15px;
//     color: #404040;
//     background-color: #d4d4d4;
//     z-index: 999;
// }

// .dropdown li:hover {
//     background-color: #e6eaeb;
// }

// .styled-select { 
//     height: 50px;
//     overflow: hidden;
//     width: 290px;
//  }

// .dropdown-items {
//     display: none;
//     position: absolute;
//     background-color: #dddcdc;
//     box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
//     z-index: 1;
// }
// #typedropdown {
//     left: 0%;
//     width: 100%;
// }
// #difficultydropdown {
//     left: 0%;
//     width: 100%;
// }
// #categorydropdown {
//     left: 0%;
//     width: 100%;
// }
// #databasedropdown {
//     left: 0%;
//     width: 100%;
// }

// .dropdown-items a {
//     color: black;
//     padding: 12px 16px;
//     text-decoration: none;
//     display: block;
// }

// .dropdown-items a:hover {
//     background-color: #f1f1f1
// }

// .dropdown-type {
//     margin:0;
//     padding: 0
// }
// .dropdown-database {
//     margin:0;
//     padding: 0
// }

// .dropdown-difficulty {
//     margin:0;
//     padding: 0
// }

// .dropdown ul {
//     display: inline;
// }

// .dropdown-category {
//     margin:0;
//     padding: 0;
// }

// #categorydropdown li{
//     width: 100%
// }
// #databasedropdown li{
//     width: 100%
// }
// #typedropdown li{
//     width: 100%
// }
// #difficultydropdown li{
//     width: 100%
// }
//  .show {
//     display:block;
// }

// $('#databaseDropdown li').click(function() {
//     document.getElementById('catalog').value=$(this).text() + "\u25BC";
//     var event = {
//             app: 'trivia',
//             type: "catalog",
//             value: $(this).text()
//         };
//     if (document.getElementById('catalog').value === "Custom Catalog" + "\u25BC") {
//         typeButton.disabled = true;
//         diffButton.disabled = true;
//         catButton.disabled = true;
//     } else if (document.getElementById('catalog').value === "Misc. Catalog" + "\u25BC") {
//         typeButton.disabled = true;
//         diffButton.disabled = true;
//         catButton.disabled = true;
//     } else {
//         typeButton.disabled = false;
//         diffButton.disabled = false;
//         catButton.disabled = false;
//     }
//     EventBridge.emitWebEvent(JSON.stringify(event));
// });


// var databaseButton = document.getElementById("catalog");
// var typeButton = document.getElementById("selectedType");
// var diffButton = document.getElementById("selectedDifficulty");
// var catButton = document.getElementById("selectedCategory");
// var endButton = document.getElementById("end");
// var beginButton = document.getElementById("begin");
// var newQButton = document.getElementById("newQuestion");
// var showQButton = document.getElementById("showQuestion");
// var answerButton = document.getElementById("showAnswers");

// function toggleMenu(menu) {
//     document.getElementById(menu).classList.toggle("show");
// }    

// window.onclick = function(event) {
//     if (!event.target.matches('#selectedType') && !event.target.matches('#selectedDifficulty')
//         && !event.target.matches('#selectedCategory') && !event.target.matches('#catalog')) {
//         var dropdowns = document.getElementsByClassName("dropdown-items");                    
//         var i;
//         for (i = 0; i < dropdowns.length; i++) {
//             var openDropdown = dropdowns[i];
//             if (openDropdown.classList.contains('show')) {
//                 openDropdown.classList.remove('show');
//             }
//         }
//     }
// }

