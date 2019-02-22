//
//  avatarCustomization_ui.js
//
//  Defines the Tablet UI for the Avatar Customization 101 App.
// 
//  Created by Robin Wilson 2/20/2019
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

// color picker by xiaokaike | http://xiaokaike.github.io/vue-color/ | https://github.com/xiaokaike/vue-color

(function () {

    // Consts
    var UPDATE_UI = CONFIG.UPDATE_UI,
        APP_NAME = CONFIG.APP_NAME;

    // Static strings
    var STRING_INFO = CONFIG.STRING_INFO;

    // Events 
    // !important Add APP_NAME to each event
    var EVENT_BRIDGE_OPEN_MESSAGE = APP_NAME + CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        EVENT_CHANGE_TAB = APP_NAME + CONFIG.EVENT_CHANGE_TAB,

        // Info tab events
        EVENT_UPDATE_AVATAR = APP_NAME + CONFIG.EVENT_UPDATE_AVATAR,
        EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR = CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR,
        EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR = CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR,
        EVENT_RESTORE_SAVED_AVATAR = CONFIG.EVENT_RESTORE_SAVED_AVATAR,

        // Material tab events
        EVENT_UPDATE_MATERIAL = APP_NAME + CONFIG.EVENT_UPDATE_MATERIAL,
        EVENT_UPDATE_BLENDSHAPE = APP_NAME + CONFIG.EVENT_UPDATE_BLENDSHAPE,
        EVENT_UPDATE_FLOW = APP_NAME + CONFIG.EVENT_UPDATE_FLOW,

        STRING_UPDATE_PROPERTY = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_UPDATE_PROPERTY;

    // Static TAB DATA
    var STATIC_DATA = CONFIG.STATIC_DATA;
    var TAB_LIST = STATIC_DATA.TAB_LIST;
    var TAB_DATA = STATIC_DATA.TAB_DATA;

    // Debug
    var DEBUG = true;

    // Components

    // #region Tabs and Tab Layout

    Vue.component('page-content', {
        props: ['dynamicdata', 'staticdata'],
        template: /* html */ `
            <div>

                <navigation 
                    :dynamicdata="dynamicdata"
                    :tablist="staticdata.TAB_LIST"
                ></navigation>
                
                <tab-content-container
                    :staticdata="staticdata"
                    :dynamicdata="dynamicdata"
                ></tab-content-container>

            </div>
        `
    })

    Vue.component('navigation', {
        props: ['tablist', 'dynamicdata'],
        template: /* html */ `
            <nav>
                <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">

                    <template v-for="tabName in tablist">
                        
                        <tab 
                            :tabname="tabName"
                            :activetabname="dynamicdata.state.activeTabName" 
                            :isavienabled="dynamicdata.state.isAviEnabled"
                        ></tab>

                    </template>

                </div>
            </nav>
        `
    })

    Vue.component('tab', {
        props: ['tabname', 'activetabname', 'isavienabled'],
        methods: {
            switchTab(tabName) {

                if (DEBUG) {
                    console.log("Tab has been clicked: " + tabName);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_CHANGE_TAB,
                    value: tabName
                }));
            }
        },
        computed: {
            tabInfo() {

                var tabName = this.tabname;
                var isAviEnabled = this.isavienabled;

                // set tab size depending on the size of the word
                var flexGrowSize = tabName.length < 5 ? 1 : 2;
                flexGrowSize = tabName.length < 10 ? flexGrowSize : 3;

                return {
                    tabName: tabName,
                    active: (tabName === this.activetabname),
                    href: "#" + tabName,
                    tabID: tabName + "-tab",
                    isDisabled: !isAviEnabled || (!isAviEnabled && tabName !== STRING_INFO),
                    flexGrowSize: flexGrowSize
                }
            }
        },
        template: /* html */ `
            <a 
                class="nav-item nav-link title-case" 
                v-bind:class="{ 
                    'active': tabInfo.active, 
                    'disabled': tabInfo.isDisabled,
                    'flex-grow-1': tabInfo.flexGrowSize === 1,
                    'flex-grow-2': tabInfo.flexGrowSize === 2,
                    'flex-grow-3': tabInfo.flexGrowSize === 3,
                }" 
                v-bind:aria-disabled="tabInfo.isDisabled"
                v-bind:id="tabInfo.tabID" 
                :key="tabInfo.tabID" 
                data-toggle="tab" 
                v-bind:href="tabInfo.href" 
                role="tab" 
                aria-controls="tabInfo.tabName" 
                aria-selected="tabInfo.active"
                v-on:click="switchTab(tabInfo.tabName)"
            >
                {{ tabInfo.tabName }}
            </a>
        `
    })

    Vue.component('tab-content-container', {
        props: ['staticdata', 'dynamicdata'],
        computed: {
            tabDataList() {
                var dynamic = this.dynamicdata;
                // var TAB_DATA = this.TAB_DATA;

                return this.TAB_LIST.map((tabName) => {

                    var tabData = {
                        static: this.TAB_DATA[tabName.toUpperCase()],
                        dynamic: dynamic[tabName.toLowerCase()]
                    }

                    return tabData;
                });
            }
        },
        data() {
            return {
                TAB_LIST: TAB_LIST,
                TAB_DATA: TAB_DATA
            }
        },
        template: /* html */ `
            <div class="tab-content" id="nav-tabContent">

                <template v-for="tabData in tabDataList">

                    <tab-content 
                        :activetabname="dynamicdata.state.activeTabName"
                        :isavienabled="dynamicdata.state.isAviEnabled"
                        :tabid="tabData.static.TAB_NAME"
                        :tabdata="tabData"
                    ></tab-content>

                </template>

            </div>
        `
    })

    Vue.component('tab-content', {
        props: ['tabdata', 'tabid', 'isavienabled', 'activetabname'],
        computed: {
            isActiveTab() {
                return this.activetabname === this.tabid;
            }
        },
        template: /* html */ `
            <div 
                class="tab-pane fade" 
                v-bind:class="{ 'show active': isActiveTab }" 
                v-bind:id="tabid" 
                role="tabpanel" 
                v-bind:aria-labelledby="tabid"
            >

                <h1 class="title-case">{{ tabdata.static.TITLE }}</h1>
                <p>{{ tabdata.static.SUBTITLE }}</p>

                <component 
                    :is="tabdata.static.COMPONENT_NAME"

                    :isavienabled="isavienabled"
                    :dynamic="tabdata.dynamic"
                    :static="tabdata.static"
                ></component>

            </div>
        `
    })

    // #endregion Tabs and Tab Layout
 
    // #region Info tab

    Vue.component('info-tab', {
        props: ['isavienabled'],
        methods: {
            showModalSaveAvatar() {
                if (DEBUG) {
                    console.log("showModalSaveAvatar clicked");
                }
                this.isModalSaveAvatarVisible = true;
            },
            closeModalSaveAvatar() {
                if (DEBUG) {
                    console.log("closeModalSaveAvatar clicked");
                }
                this.isModalSaveAvatarVisible = false;
            },
            restoreAvatar() {
                // restore avatar

                if (DEBUG) {
                    console.log("restoreAvatar clicked");
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_AVATAR,
                    subtype: EVENT_RESTORE_SAVED_AVATAR
                }));

            }
        },
        data() {
            return {
                isModalSaveAvatarVisible: false,
                title: "You will learn about customizing your avatar in High Fidelity:",
                items: ["Materials", "Blendshapes", "Flow"]
            };
        },
        template: /* html */ `
            <div>

                <title-list 
                    :title="title" 
                    :items="items"
                ></title-list>

                <div class="flex-container-row">
                    <button-big 
                        :isdisabled="isavienabled"
                        :text="'Switch Avatar'" 
                        :onclick="showModalSaveAvatar" 
                        :classes="'flex-item'"
                    ></button-big>
                </div>

                <div class="flex-container-row">
                    <button-big 
                        :isdisabled="!isavienabled"
                        :text="'Restore Avatar'" 
                        :onclick="restoreAvatar" 
                        :classes="'flex-item'"
                    ></button-big>
                </div>

                <modal-save-avatar
                    v-show="isModalSaveAvatarVisible"
                    :close="closeModalSaveAvatar"
                ></modal-save-avatar>

            </div>
        `
    })

    // #endregion Info tab

    // #region Material tab components

    Vue.component('material-tab', {
        props: ['dynamic', 'static'],
        methods: {
            applyNamedMaterial(materialName) {
                if (DEBUG) {
                    console.log("Materials applyNamedMaterial clicked " + materialName);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_MATERIAL,
                    subtype: CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_NAMED_MATERIAL_SELECTED,
                    name: materialName
                }));

            },
            updateTypeSelected(newTypeSelectedIndex) {
                // updates the index of the selected type: "shadeless" or "hifi-pbr" or "Select one" (none selected) 

                if (DEBUG) {
                    console.log("Materials updateTypeSelected clicked" + newTypeSelectedIndex);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_MATERIAL,
                    subtype: CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_MODEL_TYPE_SELECTED,
                    updates: newTypeSelectedIndex
                }));
                
            }
        },
        data() {

            var selectedTypeIndex = this.dynamic.selectedTypeIndex;
            var typeList = this.static.COMPONENT_DATA.TYPE_LIST;
            var selectedTypeData = typeList[selectedTypeIndex];
            var key = selectedTypeData.key;

            return {   
                selectedTypeIndex: selectedTypeIndex,
                selectedTypeData: selectedTypeData,
                staticPropertyList: typeList[key]
            }
        },
        watch: {
            dynamic(value, oldvalue) {
                // *** can be more performant
                this.selectedTypeIndex = this.dynamic.selectedTypeIndex;
                this.selectedTypeData = this.static.COMPONENT_DATA.TYPE_LIST[value.selectedTypeIndex];
                this.staticPropertyList = this.static.COMPONENT_DATA.PROPERTIES_LISTS[this.selectedTypeData.key]
            }
        },
        template: /* html */ `
            <div>

                <h3>Jacket</h3>

                <options-row-buttons
                    :selectedbutton="dynamic.selectedMaterial"
                    :title="'PBR Presets'"
                    :onclick="applyNamedMaterial"
                    :buttonlist="static.COMPONENT_DATA.PBR_LIST"
                >
                </options-row-buttons>

                <options-row-buttons
                    :selectedbutton="dynamic.selectedMaterial"
                    :title="'Shadeless Presets'"
                    :onclick="applyNamedMaterial"
                    :buttonlist="static.COMPONENT_DATA.SHADELESS_LIST"
                >
                </options-row-buttons>

                <h3>Shading Model</h3>

                <drop-down
                    :items="static.COMPONENT_DATA.TYPE_LIST"
                    :selectedItemIndex="this.dynamic.selectedTypeIndex"
                    :selectItem="updateTypeSelected"
                >
                </drop-down>
                
                <template v-for="propertyData in staticPropertyList">

                    <material-property-container 
                        :property="propertyData"
                        :dynamic="dynamic[selectedTypeData.key]"
                        :static="static.COMPONENT_DATA"
                    ></material-property-container>

                </template>

            </div>
        `
    })

    // material component names
    var STRING_COLOR = CONFIG.STRING_COLOR,
        STRING_SLIDER = CONFIG.STRING_SLIDER,
        STRING_MAP_ONLY = CONFIG.STRING_MAP_ONLY;

    Vue.component('material-property-container', {
        props: ['property', 'dynamic', "static"],
        methods: {
            updateProperty(info) {
                if (DEBUG) {
                    console.log("updating property!" + this.propertyInfo.name);
                }

                var propertyName = this.propertyInfo.name;
                var newMaterialData = info;
                var componentType = this.propertyInfo.componentType;
                var isPBR = this.dynamic.selectedItemIndex === 1 ? false : true; // 1 = shadeless, 2 = pbr

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_MATERIAL,
                    subtype: STRING_UPDATE_PROPERTY,
                    updates: {
                        propertyName,
                        newMaterialData,
                        componentType,
                        isPBR
                    }
                }));

            }
        },
        computed: {
            propertyInfo() {
                // sets material properties to be interpreted by components
                
                var propertyData = this.property; // get all data

                var name = propertyData.key;
                var dynamicPropertyData = this.dynamic[name];
                var componentType = propertyData.componentType;
                var value = dynamicPropertyData.value;
                var mapName = componentType !== STRING_MAP_ONLY ? name + "Map" : name;
                var mapList = this.static.PROPERTY_MAP_IMAGES[mapName] ? this.static.PROPERTY_MAP_IMAGES[mapName] : [];
                var mapValue = componentType === STRING_COLOR || componentType === STRING_SLIDER ? dynamicPropertyData.map : dynamicPropertyData.value;

                var propertyInfo = {
                    name: name,
                    componentType: componentType, 
                    value: value,
                    mapName: mapName,
                    mapValue: mapValue,
                    mapList: mapList,
                    isColor: componentType === STRING_COLOR, // for binding the right css class
                };

                return propertyInfo;
            }
        },
        data() {
            return {
                STRING_COLOR: STRING_COLOR,
                STRING_SLIDER: STRING_SLIDER,
                STRING_MAP_ONLY: STRING_MAP_ONLY
            }
        },
        template: /* html */ `
            <div v-bind:class="{ 'flex-container-row': propertyInfo.isColor }">

                <material-color-picker
                    v-if="propertyInfo.componentType === STRING_COLOR"
                    :propertyInfo="propertyInfo"
                    :updateproperty="updateProperty"
                />

                <material-slider 
                    v-if="propertyInfo.componentType === STRING_SLIDER"
                    :propertyInfo="propertyInfo"
                    :defaultvalue="propertyInfo.value"
                    :updateproperty="updateProperty"
                />

                <material-map 
                    :propertyInfo="propertyInfo"
                    :updateproperty="updateProperty"
                />

            </div>
        `
    })

    Vue.component('material-slider', {
        props: ['propertyInfo', 'updateproperty', 'defaultvalue'],
        methods: {
            onSliderUpdate (newValue) {
                this.updateproperty({ value: +newValue });
            }
        },
        data() {
            return {
                sliderDefault: this.propertyInfo.value 
                    ? this.propertyInfo.value 
                    : this.propertyInfo.mapValue ? 1 : 0
            };
        },
        watch: {
            defaultvalue(value, newValue) {
                this.sliderDefault = value 
                    ? value 
                    : this.propertyInfo.mapValue ? 1 : 0
            }
        },
        template: /* html */ `
            <div class="flex-container-row">
                <p class="flex-item">{{ propertyInfo.name }}</p>
                <div class="flex-item">
                    <slider
                        :name="propertyInfo.name"
                        :max="1"
                        :increment="0.01"
                        :min="0"
                        :defaultvalue="sliderDefault"
                        :onchange="onSliderUpdate"
                    ></slider>
                </div>
            </div>
        `
    })

    Vue.component('material-map', { // ***
        props: ['propertyInfo', 'updateproperty' ],
        methods:{
            updateMap(fileName) {
                this.updateproperty({ map: fileName });
            }
        },
        template: /* html */ `
            <div class="flex-container-row">

                <p class="flex-item">
                    {{ propertyInfo.mapName }}
                </p>
                <div class="flex-item">
                
                    <drop-down-images
                        :items="propertyInfo.mapList"
                        :defaultimage="propertyInfo.mapValue"
                        :onselect="updateMap"
                    ></drop-down-images>
                
                </div>

            </div>
        `
    })

    Vue.component('material-color-picker', {
        props: ['propertyInfo', 'updateproperty'],
        methods: {
            updateValue(value) {

                if (DEBUG) {
                    console.log("calling color picker updating value" + this.colors + value);
                }
                this.updateproperty({ value: value });
            },
            cancelColor() {
                this.setColorToNA();
                this.onchange();
            },
            setColorToNA() {
                var id = "#" + this.colorElementIds + "-jscolor";
                
                if (DEBUG) {
                    console.log("Cancel color here " + id);
                }

                $(id).css("background-color", "");
                $(id).css("color", "#ff0000");
                $(id).val("N/A");
            }
        },
        computed: {
            colorElementIds() {
                return this.propertyInfo.name + "-color-id";
            }
        },
        template: /* html */ `
            <div class="flex-item">

                <p>{{ propertyInfo.name }}</p>

                <div class="flex-container-row">
                    <div class="flex-item">

                        <jscolor
                            :colorpickerid="colorElementIds"
                            :value="propertyInfo.value"
                            :onchange="updateValue"
                            :cancelcolor="setColorToNA"
                        ></jscolor>

                    </div>
                    <div class="flex-item">

                        <cancel-x
                            :onclick="cancelColor"
                            :isdisabled="false"
                        ></cancel-x>

                    </div>
                </div>
            </div>
        `
    })

    Vue.component('cancel-x', {
        props: ['onclick', 'isdisabled'],
        methods: {
            onClick() {
                this.onclick();
            }
        },
        template: /* html */ `
            <div class="">
                <button 
                    type="button" 
                    class="btn" 
                    @click="onClick"
                    :disabled="isdisabled"
                >
                    x
                </button> 
            </div>
        `
    })

    // JSColor picker made for Vue.js by mudream4869
    // https://gist.github.com/mudream4869/d956736a96bac2a89155a0c416a0ac35
    Vue.component('jscolor', {
        props : ['value', 'colorpickerid', 'onchange', 'cancelcolor'],
        // methods: {
        //     onChange(target) {

        //         this.value = target.jscolor.toHEXString();
        //         this.$refs.color_span.style.backgroundColor = this.value;
        //         this.$emit('input', this.value);

        //     }
        // },
        mounted : function(){
            window.jscolor.installByClassName('jscolor');
            this.$el.jscolor.fromString(this.value);
            $(this.$el).on('change', function(_this){
                return function(){
                    if (DEBUG) {
                        console.log("I'm changing!", this.value);
                    }
                    _this.$emit('input', this.value);
                    _this.onchange(this.value);
                }
            }(this));
        },
        computed: {
            styling() {
                return 'width:100px; height:50px; padding-left:10px;';
            },
            elementId() {
                return this.colorpickerid + "-jscolor";
            }
        },
        watch: {
            value (value, oldValue) {
                console.log("JSCOLORRRRR");
                if (value === "N/A") {
                    this.cancelcolor();
                } else {
                    this.$el.jscolor.fromString(value);
                    this.$emit('input', value);
                }
            }
        },
        template: `
            <input 
                v-bind:id="elementId"
                v-bind:value="value"
                class="jscolor"
                v-bind:style="styling"
            />
        `
    });

    // #endregion material tab components

    // #region Blendshapes tab

    Vue.component('blendshapes-tab', {
        props: ['dynamic', 'static'],
        methods: {
            applyNamedBlendshape(blendshapeName) {
                if (DEBUG) {
                    console.log("applyNamedBlendshape clicked " + blendshapeName);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_BLENDSHAPE,
                    name: blendshapeName
                }));

            },
            onSliderChange(value, name) {
                if (DEBUG) {
                    console.log("blendshape slider changed " + value + name);
                }
                var sliderChange = createSliderChangeCallback(this.dynamic.updatedProperties, EVENT_UPDATE_BLENDSHAPE);
                sliderChange(+value, name);
            },
        },
        computed: {
            facialBlendshapeList() {
                var blendshapeList = this.static.COMPONENT_DATA.FACIAL_BLENDSHAPES_OPTIONS;
                var currentProperties = this.dynamic.updatedProperties;

                return createSliderInfoFromLists(blendshapeList, currentProperties, getName);

                function getName(name) {
                    return name.replace(/_|-|\./g, '');
                }
            }
        },
        template: /* html */ `
            <div>

                <options-row-buttons
                    :selectedbutton="dynamic.selected"
                    :title="'Preset Expressions'"
                    :onclick="applyNamedBlendshape"
                    :buttonlist="static.COMPONENT_DATA.LIST"
                >
                </options-row-buttons>

                <h3>Facial Blendshapes</h3>

                <template v-for="blendshapeData in facialBlendshapeList">

                    <p>{{ blendshapeData.title }}</p>

                    <slider 
                        :title="blendshapeData.title"
                        :name="blendshapeData.name"
                        :max="blendshapeData.max"
                        :increment="blendshapeData.increment"
                        :min="blendshapeData.min"
                        :defaultvalue="blendshapeData.defaultValue"
                        :onchange="onSliderChange"
                    ></slider>

                </template>

            </div>
        `
    })

    // #endregion Blendshapes tab

    // Helper for formatting slider data using both the staticList and dynamicData
    function createSliderInfoFromLists(staticList, dynamicData, nameFunction) {

        return staticList.map(compileSliderInfo);

        function compileSliderInfo(optionInfo) {

            // Lists of strings or objects with the property name as a key
            var name = optionInfo.name ? optionInfo.name : optionInfo;

            var sliderInfo = {
                name: nameFunction ? nameFunction(name) : name,
                title: name,
                min: optionInfo.min ? optionInfo.min : 0,
                max: optionInfo.max ? optionInfo.max : 1,
                increment: optionInfo.increment ? optionInfo.increment : 0.1,
                defaultValue: dynamicData[name] ? dynamicData[name] : 0
            }
            return sliderInfo;
        }
    }

    function createSliderChangeCallback(dynamicData, eventBridgeTypeString, eventBridgeSubtypeString) {

        return sliderChangedCallback;

        function sliderChangedCallback(value, name) {
            // Do not send data over EventBridge unless slider changed value
            if (dynamicData[name] !== value) {
                var updates = {};
                updates[name] = value;
    
                EventBridge.emitWebEvent(JSON.stringify({
                    type: eventBridgeTypeString,
                    subtype: eventBridgeSubtypeString ? eventBridgeSubtypeString : "",
                    updates: updates // expected { [name]: value}
                }));
            }
        }
    }

    // #region Flow tab

    Vue.component('flow-tab', {
        props: ['dynamic', 'static'],
        methods: {
            debugToggle(value) {
                if (DEBUG) {
                    console.log("debugToggle" + value);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_FLOW,
                    subtype: "debugToggle",
                    updates: value
                }));
            },
            collisionsToggle(value) {
                if (DEBUG) {
                    console.log("collisionsToggle" + value);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_FLOW,
                    subtype: "collisionsToggle",
                    updates: value
                }));
            },
            onChangeHairFlowSlider(value, name) {
                var sliderChange = createSliderChangeCallback(this.dynamic.hairFlowOptions, EVENT_UPDATE_FLOW, "hair");
                sliderChange(value, name);
            },
            onChangeJointFlowSlider(value, name) {
                var sliderChange = createSliderChangeCallback(this.dynamic.jointFlowOptions, EVENT_UPDATE_FLOW, "joints");
                sliderChange(value, name);
            }
        },
        computed: {

            hairFlowOptionsList() {
                var staticHairFlowList = this.static.COMPONENT_DATA.HAIR_FLOW_OPTIONS;
                var currentProperties = this.dynamic.hairFlowOptions;

                return createSliderInfoFromLists(staticHairFlowList, currentProperties);
            },
            jointFlowOptionsList() {
                var staticJointFlowList = this.static.COMPONENT_DATA.JOINT_FLOW_OPTIONS;
                var currentProperties = this.dynamic.jointFlowOptions;

                function getName(name) {
                    return name + "joints";
                }

                return createSliderInfoFromLists(staticJointFlowList, currentProperties, getName);
            }

        },
        template: /* html */ `
            <div>

                <checkbox
                    :onchange="debugToggle"
                    :label="'Show Debug'"
                    v-bind:defaultvalue="dynamic.showDebug"
                ></checkbox>

                <checkbox
                    :onchange="collisionsToggle"
                    :label="'Enable Collisions'"
                    v-bind:defaultvalue="dynamic.enableCollisions"
                ></checkbox>

                <h3>Hair Flow Options</h3>

                <template v-for="hairFlowOption in hairFlowOptionsList">

                    <p>{{ hairFlowOption.title }}</p>

                    <slider 
                        :title="hairFlowOption.title"
                        :name="hairFlowOption.name"
                        :max="hairFlowOption.max"
                        :increment="hairFlowOption.increment"
                        :min="hairFlowOption.min"
                        :defaultvalue="hairFlowOption.defaultValue"
                        :onchange="onChangeHairFlowSlider"
                    ></slider>

                </template>

                <h3>Head Joint Options</h3>

                <template v-for="jointFlowOption in jointFlowOptionsList">

                    <p>{{ jointFlowOption.title }}</p>

                    <slider 
                        :title="jointFlowOption.title"
                        :name="jointFlowOption.name"
                        :max="jointFlowOption.max"
                        :increment="jointFlowOption.increment"
                        :min="jointFlowOption.min"
                        :defaultvalue="jointFlowOption.defaultValue"
                        :onchange="onChangeJointFlowSlider"
                    ></slider>

                </template>

            </div>
        `
    })

    // #endregion Flow tab

    // #region Simple Test Components

    Vue.component('modal-save-avatar', {
        props: ["close"],
        methods: {
            changeAvatarToAviAndSaveAvatar() {
                // save avatar

                if (DEBUG) {
                    console.log("changeAvatarToAviAndSaveAvatar clicked");
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_AVATAR,
                    subtype: EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR
                }));

                this.close();
            },
            changeAvatarToAviWithoutSavingAvatar() {
                // do not save avatar

                if (DEBUG) {
                    console.log("changeAvatarToAviWithoutSavingAvatar clicked");
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_AVATAR,
                    subtype: EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR
                }));

                this.close();
            }
        },
        data() {
            return {
                withoutSavingText: "No, I'd like to change my avatar without saving"
            };
        },
        template: /* html */ `
            <modal 
                v-bind:alert="true" 
                v-bind:hidex="false" 
                v-bind:isfullscreen="false" 
                @close="close"
            >

                <div slot="header"><h2>Save Avatar?</h2></div>
                
                <div slot="body">
                    <div class="p-3 mt-2">
                        <p>Would you like to favorite your current avatar?</p>
                        <p>To change avatar back:</p>
                        <p>Avatar App > Favorites > Click Avatar</p>
                    
                        <div id="save-avatar" class="flex-container-row">
                            <button-big 
                                :text="'Yes, favorite my avatar'" 
                                :onclick="changeAvatarToAviAndSaveAvatar" 
                                :classes="'flex-item two-lines'"
                            ></button-big>
                            <button-big 
                                :text="withoutSavingText" 
                                :onclick="changeAvatarToAviWithoutSavingAvatar" 
                                :classes="'flex-item two-lines'"
                            ></button-big>

                        </div>
                    </div>
                </div>
                
                <div slot="footer" class="text-center"></div>

            </modal>
        `
    })

    // #endregion Simple Test Components

    // #region EDIT COMPONENTS

    Vue.component('slider', {
        props: ['title', 'name', 'max', 'min', 'defaultvalue', 'increment', 'onchange'],
        computed: {
            sliderId() {
                return this.name;
            },
            sliderValueId() {
                return this.name + "Value";
            }
        },
        methods: {
            onChange() {
                this.onchange(this.val, this.title);
            }
        },
        data() {
            return {
                val: this.defaultvalue ? this.defaultvalue : this.min
            }
        },
        watch: {
            defaultvalue(newDefaultVal) {
                this.val = newDefaultVal.toFixed(2);
            }
        },
        template: /* html */ `
            <div class="flex-container-row">

                <div class="slidecontainer flex-item">
                    <input 
                        v-bind:min="min" 
                        v-bind:max="max" 
                        v-bind:step="increment" 
                        class="slider" 
                        v-bind:id="sliderId"
                        type="range"

                        v-model="val"
                        @change="onChange()"
                    >
                </div>
                <span 
                    class="flex-item"
                    v-bind:id="sliderValueId"
                >
                    {{ val }}
                </span>
            </div>
        `
    })

    // "Others to modify, You will learn about customizing your avatar in hifi"
    // <title-list :title="" :items=""></title-list>
    Vue.component('title-list', {
        props: ['title', 'items'],
        template: /* html */ `
            <div>
                <p>{{ title }}</p>
                <ul>
                    <template v-for="item in items">
                        <li>{{ item }}</li>
                    </template>
                </ul>
            </div>
        `
    })

    Vue.component('button-big', {
        props: ['text', 'onclick', 'classes', 'isdisabled', "selectedbutton", "onclickvalue"],
        computed: {
            disabledButton() {
                return this.isdisabled ? this.isdisabled : false;
            },
            style() {
                var selected = this.selectedbutton === this.text ? " active " : "";
                return "btn btn-primary " + this.classes + selected;
            }
        },
        methods: {
            onButtonClick() {
                if (this.onclickvalue){
                    this.onclick(this.onclickvalue);
                } else {
                    this.onclick();
                }
            }
        },
        template: /* html */ ` 
            <button type="button" v-bind:class="style" @click="onButtonClick" :disabled="disabledButton">
                {{ text }}
            </button> 
        `
    })

    Vue.component('options-row-buttons', {
        props: ['title', 'onclick', 'buttonlist', "selectedbutton"],
        template: /* html */ `
            <div>
                <p>{{ title }}</p>
                <div class="flex-container-row">
                    <template v-for="buttonName in buttonlist">
                        <button-big
                            :text="buttonName"
                            :onclick="onclick"
                            :classes="'flex-item'"
                            :selectedbutton="selectedbutton"
                            :onclickvalue="buttonName"
                        >
                        </button-big>
                    </template>
                </div>
            </div>
        `
    })

    // items are in the following format 
    // { 
    //   name: "Title of Dropdown", 
    //   value: what you want to pass into onSelect
    //   index: index in list
    // }
    Vue.component('drop-down', {
        props: ["items", "selectedItemIndex", "selectItem"],
        methods: {
            onSelect(itemIndex) {
                if (DEBUG) {
                    console.log("drop-down component index:" + itemIndex);
                }
                this.selected = this.items[itemIndex];
                this.selectItem(itemIndex);
            }
        },
        data() {
            return {
                selected: this.items[this.selectedItemIndex]
            }
        },
        template: /* html */ `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{ selected.name }}
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="item in items">
                        <a class="dropdown-item" href="#" @click="onSelect(item.index)">{{ item.name }}</a> 
                    </template>
                </div>
            </div>
        `
    })

    var NO_IMAGE = "no.jpg";
    var PREFIX = "images/"; // ***

    Vue.component('drop-down-images', {
        props: ["items", "defaultimage", "onselect"],
        methods: {
            onSelect(url) {

                this.selected = url;
                var fileName = url.replace(PREFIX, "");

                if (DEBUG) {
                    console.log("DropDown Image value:" + url);
                    console.log("DropDown Image file name:" + fileName);
                }

                this.onselect(fileName);
            }
        },
        computed: {
            itemsList() {
                var itemsList = this.items.map((imageURL) => PREFIX + imageURL);
                itemsList.unshift(PREFIX + NO_IMAGE);

                if (DEBUG) {
                    console.log(JSON.stringify(this.items));
                }

                return itemsList;
            }
        },
        data() {
            return {
                selected: this.defaultimage ? PREFIX + this.defaultimage : PREFIX + NO_IMAGE
            }
        },
        watch: {
            defaultimage(value, oldValue) { 
                console.log("IMAGE VALUE IS ", value);
                this.selected = this.defaultimage ? PREFIX + this.defaultimage : PREFIX + NO_IMAGE;
            }
        },
        template: /* html */ `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img 
                        class="dropdown-item-image" 
                        v-bind:src="selected"
                    >
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="item in itemsList">
                        <a class="dropdown-item" href="#" @click="onSelect(item)"><img class="dropdown-item-image" v-bind:src="item"/></a>
                    </template>
                </div>
            </div>
        `
    })

    Vue.component('checkbox', {
        props: ['onchange', 'label', 'defaultvalue'],
        computed: {
            id() {
                return this.label.replace(/ /g,'');
            }
        },
        data () {
            return {
                val: this.defaultvalue
            }
        },
        template: /* html */ `
            <div class="form-check">
                <input 
                    v-model="val" 
                    v-on:change="onchange(val)"
                    v-bind:id="id" 

                    type="checkbox" 
                    class="form-check-input" 
                >
                <label class="form-check-label" v-bind:for="id">{{ label }}</label>
            </div>
        `
    })

    Vue.component('modal', {
        props: {
            alert: { type: Boolean },
            hidex: { type: Boolean },
            isfullscreen: { type: Boolean }
        },
        methods: {
            close() {
                if (DEBUG) {
                    console.log("close");
                }
                this.$emit('close');
            }
        },
        template: /* html */ `
            <transition name="modal-fade">
                <div class="modal-backdrop">
                    <div class="modal" v-bind:class="{ 'modal-alert': alert }">

                        <header class="modal-header">
                            <slot name="header"></slot>
                            <button v-if="!hidex" type="button" class="btn-close" @click="close">
                                X<!-- <div data-icon="w" class="icon"></div> -->
                            </button> 
                        </header>

                        <section class="modal-body" v-bind:class="{ 'full-layout': isfullscreen }">
                            <slot name="body"></slot>
                        </section>

                        <footer class="modal-footer">
                            <slot name="footer"></slot>
                        </footer>

                    </div>
                </div>
            </transition>
      `
    })

    // #endregion EDIT COMPONENTS

    var app = new Vue({
        el: '#app',
        data: {
            staticData: CONFIG.STATIC_DATA,
            dynamicData: CONFIG.INITIAL_DYNAMIC_DATA
        }
    });

    function onScriptEventReceived(message) {
        var data;
        if (DEBUG) {
            print("onScriptEventRecieved");
        }
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    if (DEBUG) {
                        print("onScriptEventRecieved: Update UI");
                    }

                    if (data.subtype) {
                        app.dynamicData[data.subtype] = data.value;
                    } else {
                        app.dynamicData = data.value;
                    }

                    break;
                default:
            }
        } catch (e) {
            console.log(e);
            return;
        }
    }

    function onLoad() {

        // Open the EventBridge to communicate with the main script.
        EventBridge.scriptEventReceived.connect(onScriptEventReceived);
        EventBridge.emitWebEvent(JSON.stringify({
            type: EVENT_BRIDGE_OPEN_MESSAGE
        }));

    }

    document.addEventListener('DOMContentLoaded', onLoad, false);

}());
