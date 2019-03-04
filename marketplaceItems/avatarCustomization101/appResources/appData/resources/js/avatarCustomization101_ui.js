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
    // Events 
    // !important Add APP_NAME to each event
    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.APP_NAME + CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        EVENT_CHANGE_TAB = CONFIG.APP_NAME + CONFIG.EVENT_CHANGE_TAB,
        EVENT_UPDATE_AVATAR = CONFIG.APP_NAME + CONFIG.EVENT_UPDATE_AVATAR,
        EVENT_UPDATE_MATERIAL = CONFIG.APP_NAME + CONFIG.EVENT_UPDATE_MATERIAL,
        EVENT_UPDATE_BLENDSHAPE = CONFIG.APP_NAME + CONFIG.EVENT_UPDATE_BLENDSHAPE,
        EVENT_UPDATE_FLOW = CONFIG.APP_NAME + CONFIG.EVENT_UPDATE_FLOW,
        STRING_UPDATE_PROPERTY = CONFIG.MATERIAL_EVENTS_SUBTYPE.STRING_UPDATE_PROPERTY;

    // Debug
    var DEBUG = true;

    var INITIAL_DYNAMIC = {
        state: {
            isAviEnabled: false,
            activeTabName: STRING_INFO
        },
        info: {},
        material: {
            selectedTypeIndex: 0,
            selectedMaterial: "default",
            shadeless: {
                // component type color
                albedo: { value: "N/A", map: null },
                emissive: { value: "N/A", map: null }
            },
            pbr: {
                // component type color
                albedo: { value: "N/A", map: null }, 
                emissive: { value: "N/A", map: null }, 
                // component type sliders
                roughness: { value: 0, map: null },
                metallic: { value: 0, map: null },
                scattering: { value: 0, map: null },
                opacity: { value: 1, map: null },
                // component type map only
                normalMap: { value: null, map: null },
                occlusionMap: { value: null, map: null }
            }
        },
        blendshapes: {
            selected: "default",
            updatedProperties: {
                "EyeBlink_L": 0.00,
                "EyeBlink_R": 0.00,
                "BrowsU_L": 0.00,
                "BrowsU_R": 0.00,
                "JawOpen": 0.00,
                "Sneer": 0
            }
        },
        flow: {
            showDebug: true,
            enableCollisions: true,
            hairFlowOptions: {
                stiffness: CUSTOM_FLOW_DATA.leaf.stiffness, 
                radius: CUSTOM_FLOW_DATA.leaf.radius, 
                gravity: CUSTOM_FLOW_DATA.leaf.gravity, 
                damping: CUSTOM_FLOW_DATA.leaf.damping
            },
            jointFlowOptions: {
                radius: CUSTOM_COLLISION_DATA.HeadTop_End.radius,
                offset: CUSTOM_COLLISION_DATA.HeadTop_End.offset
            }
        }
    };

    // #region TABS AND TAB LAYOUT

    // Entry point to page
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


    // Tab bar
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

    // Each tab in navigation
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
                    // disable tabs if avi is NOT enabled 
                    // or avi is NOT enabled and the tab name is string info
                    isDisabled: !isAviEnabled || (!isAviEnabled && tabName !== CONFIG.STRING_INFO),
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


    // Entry point for the content to each tab
    // Loops through the tab data to create content
    Vue.component('tab-content-container', {
        props: ['staticdata', 'dynamicdata'],
        computed: {
            tabDataList() {
                return this.staticdata.TAB_LIST.map((tabName) => {
                    var tabData = {
                        static: this.staticdata.TAB_DATA[tabName.toUpperCase()],
                        dynamic: this.dynamicdata[tabName.toLowerCase()]
                    }
                    return tabData;
                });
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


    // Delegate each tab to the named component
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
 

    // #region INFO TAB

    // Info tab content container
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
                if (DEBUG) {
                    console.log("restoreAvatar clicked");
                }
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_AVATAR,
                    subtype: CONFIG.EVENT_RESTORE_SAVED_AVATAR
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

    
    // Called in the info tab
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
                    subtype: CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR
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
                    subtype: CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR
                }));

                this.close();
            }
        },
        data() {
            return {
                withoutSavingText: "No, do not favorite my avatar"
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

    // #endregion INFO TAB


    // #region MATERIAL TAB

    // Material tab content container
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
            dynamic(value) {
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

    // Each material property is delegated to the proper component
    Vue.component('material-property-container', {
        props: ['property', 'dynamic', "static"],
        methods: {
            updateProperty(info) {
                if (DEBUG) {
                    console.log("updating property!" + this.propertyInfo.name);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_MATERIAL,
                    subtype: STRING_UPDATE_PROPERTY,
                    updates: {
                        propertyName: this.propertyInfo.name,
                        newMaterialData: info,
                        componentType: this.propertyInfo.componentType,
                        isPBR: this.dynamic.selectedItemIndex === 1 ? false : true // 1 = shadeless, 2 = pbr
                    }
                }));

            }
        },
        computed: {
            propertyInfo() {
                // sets material properties to be interpreted by components
                var propertyName = this.property.key;
                var componentType = this.property.componentType;
                var mapName = componentType !== STRING_MAP_ONLY ? propertyName + "Map" : propertyName;

                var propertyInfo = {
                    name: propertyName,
                    componentType: componentType, 
                    value: this.dynamic[propertyName].value,
                    mapName: mapName,
                    mapValue: componentType === this.STRING_COLOR || componentType === this.STRING_SLIDER 
                        ? this.dynamic[propertyName].map 
                        : this.dynamic[propertyName].value,
                    mapList: this.static.PROPERTY_MAP_IMAGES[mapName] 
                        ? this.static.PROPERTY_MAP_IMAGES[mapName] 
                        : [],
                    isColor: componentType === this.STRING_COLOR, // for binding the right css class
                };
                return propertyInfo;
            }
        },
        data() {
            return {
                STRING_COLOR: CONFIG.STRING_COLOR,
                STRING_SLIDER: CONFIG.STRING_SLIDER,
                STRING_MAP_ONLY: CONFIG.STRING_MAP_ONLY
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
                    :iscolor="propertyInfo.isColor"
                />

            </div>
        `
    })

    // Material slider component
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
                <p class="material-label flex-item ">{{ propertyInfo.name }}</p>
                <div class="flex-item material-option">
                    <slider
                        :name="propertyInfo.name"
                        :defaultvalue="sliderDefault"
                        :onsliderupdate="onSliderUpdate"
                    ></slider>
                </div>
            </div>
        `
    })


    // Material map component
    Vue.component('material-map', { 
        props: ['propertyInfo', 'updateproperty', 'iscolor' ],
        methods:{
            updateMap(fileName) {
                this.updateproperty({ map: fileName });
            }
        },
        template: /* html */ `
            <div v-bind:class="{ 'flex-container-row': !iscolor, 'flex-item': iscolor }">

                <p class="material-label" v-bind:class="{ 'flex-item': !iscolor, 'material-label': !iscolor }">
                    {{ propertyInfo.mapName }}
                </p>
                <div class="material-option" v-bind:class="{ 'flex-item': !iscolor }">
                
                    <drop-down-images
                        :items="propertyInfo.mapList"
                        :defaultimage="propertyInfo.mapValue"
                        :onselect="updateMap"
                    ></drop-down-images>
                
                </div>

            </div>
        `
    })


    // Material color component
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
                this.updateValue("");
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
            <div class="flex-item material-label">

                <p>{{ propertyInfo.name }}</p>

                <div class="flex-container-row justify-content-start material-option">
                    <div class="flex-item">

                        <jscolor
                            :colorpickerid="colorElementIds"
                            :value="propertyInfo.value ? propertyInfo.value : 'N/A'"
                            :updatecolorvalue="updateValue"
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


    // Cancels the color component
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


    // Used in the material color component
    // JSColor picker made for Vue.js by mudream4869
    // https://gist.github.com/mudream4869/d956736a96bac2a89155a0c416a0ac35
    Vue.component('jscolor', {
        props : ['value', 'colorpickerid', 'updatecolorvalue', 'cancelcolor'],
        mounted : function(){
            window.jscolor.installByClassName('jscolor');
            this.$el.jscolor.fromString(this.value);
            $(this.$el).on('change', function(_this){
                return function(){
                    if (DEBUG) {
                        console.log("I'm changing!", this.value);
                    }
                    _this.updatecolorvalue(this.value);
                }
            }(this));

            if (this.value === "N/A") {
                this.cancelcolor();
            }
        },
        computed: {
            styling() {
                return 'width:90px; height:50px; padding-left:10px;';
            },
            elementId() {
                return this.colorpickerid + "-jscolor";
            }
        },
        watch: {
            value (value, oldValue) {
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

    // #endregion MATERIAL TAB


    // #region BLENDSHAPES TAB

    // Hosts blendshape data
    Vue.component('blendshapes-tab', {
        props: ['dynamic', 'static'],
        methods: {
            applyNamedBlendshape(blendshapeName) {
                if (DEBUG) {
                    console.log("applyNamedBlendshape clicked " + blendshapeName);
                }
                EventBridge.emitWebEvent(JSON.stringify({
                    type: this.EVENT_UPDATE_BLENDSHAPE,
                    name: blendshapeName
                }));
            }
        },
        data() {
            return {
                EVENT_UPDATE_BLENDSHAPE: EVENT_UPDATE_BLENDSHAPE
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

                <template v-for="blendshape in static.COMPONENT_DATA.FACIAL_BLENDSHAPES_OPTIONS">

                    <p>{{ blendshape.name }}</p>

                    <slider 
                        :title="blendshape.name"
                        :name="blendshape.name.replace(/_|-|\./g, '')"
                        :max="blendshape.min"
                        :increment="blendshape.increment"
                        :min="blendshape.min"
                        :defaultvalue="dynamic.updatedProperties[blendshape.name]"
                        :eventbridgeeventtypeslider="EVENT_UPDATE_BLENDSHAPE"
                    ></slider>

                </template>

            </div>
        `
    })

    // #endregion BLENDSHAPES TAB


    // #region FLOW TAB
    
    // Hosts flow tab and creates sliders
    Vue.component('flow-tab', {
        props: ['dynamic', 'static'],
        data() {
            return {
                EVENT_UPDATE_FLOW: EVENT_UPDATE_FLOW
            }
        },
        template: /* html */ `
            <div>

                <checkbox
                    :label="'Show Debug'"
                    v-bind:defaultvalue="dynamic.showDebug"
                    :eventbridgeeventtype="EVENT_UPDATE_FLOW"
                    :eventbridgeeventsubtype="'debugToggle'"
                ></checkbox>

                <checkbox
                    :label="'Enable Collisions'"
                    v-bind:defaultvalue="dynamic.enableCollisions"
                    :eventbridgeeventtype="EVENT_UPDATE_FLOW"
                    :eventbridgeeventsubtype="'collisionsToggle'"
                ></checkbox>

                <h3>Hair Flow Options</h3>

                <template v-for="hairFlowOption in static.COMPONENT_DATA.HAIR_FLOW_OPTIONS">

                    <p>{{ hairFlowOption.name }}</p>

                    <slider 
                        :title="hairFlowOption.name"
                        :name="hairFlowOption.name"
                        :max="hairFlowOption.max"
                        :increment="hairFlowOption.increment"
                        :min="hairFlowOption.min"
                        :defaultvalue="dynamic.hairFlowOptions[hairFlowOption.name]"
                        :eventbridgeeventtypeslider="EVENT_UPDATE_FLOW"
                        :eventbridgeeventsubtypeslider="'hair'"
                    ></slider>

                </template>

                <h3>Head Joint Options</h3>

                <template v-for="jointFlowOption in static.COMPONENT_DATA.JOINT_FLOW_OPTIONS">

                    <p>{{ jointFlowOption.name }}</p>

                    <slider 
                        :title="jointFlowOption.name"
                        :name="jointFlowOption.name + 'joints'"
                        :max="jointFlowOption.max"
                        :increment="jointFlowOption.increment"
                        :min="jointFlowOption.min"
                        :defaultvalue="dynamic.jointFlowOptions[jointFlowOption.name]"
                        :eventbridgeeventtypeslider="EVENT_UPDATE_FLOW"
                        :eventbridgeeventsubtypeslider="'joints'"
                    ></slider>

                </template>

            </div>
        `
    })

    // #endregion FLOW TAB


    // #region EDIT COMPONENTS

    // Slider
    Vue.component('slider', {
        props: [
            'title', 
            'name', 
            'max', 
            'min', 
            'defaultvalue', 
            'increment', 
            'eventbridgeeventtypeslider', 
            'eventbridgeeventsubtypeslider',
            'onsliderupdate'
        ],
        computed: {
            sliderId() {
                return this.name;
            },
            sliderValueId() {
                return this.name + "Value";
            },
            sliderOptions() {
                return {
                    min: this.min ? this.min : 0,
                    max: this.max ? this.max : 1,
                    step: this.increment ? this.increment : 0.1
                }
            }
        },
        methods: {
            onSliderChange() {
                if (DEBUG) {
                    console.log("Slider change: " + this.eventbridgeeventtypeslider + " " + this.eventbridgeeventsubtypeslider + " " + this.title + " " + +this.val);
                }
                if (this.onsliderupdate) {
                    this.onsliderupdate(this.val);
                    return;
                }
                EventBridge.emitWebEvent(JSON.stringify({
                    type: this.eventbridgeeventtypeslider,
                    subtype: this.eventbridgeeventsubtypeslider ? this.eventbridgeeventsubtypeslider : "",
                    updates: { [this.title]: +this.val } // expected { [name]: value }
                }));
            }
        },
        data() {
            return {
                val: this.defaultvalue 
                    ? this.defaultvalue.toFixed(2) 
                    : this.min 
                        ? this.min.toFixed(2)
                        : Number(0).toFixed(2)
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
                        v-bind:min="sliderOptions.min" 
                        v-bind:max="sliderOptions.max" 
                        v-bind:step="sliderOptions.step" 
                        class="slider" 
                        v-bind:id="sliderId"
                        type="range"

                        v-model="val"
                        @change="onSliderChange()"
                    >
                </div>
                <span 
                    class="flex-item"
                    style="width: 20px;"
                    v-bind:id="sliderValueId"
                >
                    {{ val }}
                </span>
            </div>
        `
    })


    // Title used in each tab content
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


    // Buttons used in app
    Vue.component('button-big', {
        props: ['text', 'onclick', 'classes', 'isdisabled', "selectedbutton", "onclickvalue"],
        computed: {
            disabledButton() {
                return this.isdisabled;
            },
            style() {
                var selected = this.selectedbutton === this.text ? " active " : "";
                var disabled = this.isdisabled ? " disabled " : "";
                return "btn btn-primary " + this.classes + selected + disabled;
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


    // Row of buttons with title
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


    // Drop down menu
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
                <button class="btn btn-secondary dropdown-toggle" style="width: 150px" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{ selected.name }}
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="item in items">
                        <a class="dropdown-item" href="#" @click.prevent="onSelect(item.index)">{{ item.name }}</a> 
                    </template>
                </div>
            </div>
        `
    })


    var NO_IMAGE = "no.jpg";
    var PREFIX = "images/";
    // Hosts the images drop down
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
                if (DEBUG) {
                    console.log("IMAGE VALUE IS ", value);
                }
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
                        <a class="dropdown-item" href="#" @click.prevent="onSelect(item)">
                            <img class="dropdown-item-image" v-bind:src="item"/>
                        </a>
                    </template>
                </div>
            </div>
        `
    })

    
    // Checkboxes
    Vue.component('checkbox', {
        props: ['label', 'defaultvalue', 'eventbridgeeventtype', 'eventbridgeeventsubtype'],
        methods: {
            checkBoxOnChange(value) {
                if (DEBUG) {
                    console.log("Checkbox event: " + this.eventbridgeeventtype + " " + this.eventbridgeeventsubtype+ " " + value);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: this.eventbridgeeventtype,
                    subtype: this.eventbridgeeventsubtype,
                    updates: value
                }));
            }
        },
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
                    v-on:change="checkBoxOnChange(val)"
                    v-bind:id="id" 

                    type="checkbox" 
                    class="form-check-input" 
                >
                <label class="form-check-label" v-bind:for="id">{{ label }}</label>
            </div>
        `
    })


    // Modal used in save avatar
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
                                X
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


    // Create the vue instance with the static data and dynamic data
    var app = new Vue({
        el: '#app',
        data: {
            staticData: CONFIG.STATIC_DATA,
            dynamicData: INITIAL_DYNAMIC
        }
    });


    // Handle updates from High Fidelity
    function onScriptEventReceived(message) {
        var data;
        if (DEBUG) {
            console.log("onScriptEventRecieved " + message);
        }
        try {
            data = JSON.parse(message);
            switch (data.type) {
                // case "aviChanged": 
                //     app.dynamicData["state"].isAviEnabled = data.value;
                //     break;
                case CONFIG.UPDATE_UI:
                    if (DEBUG) {
                        console.log("onScriptEventRecieved: Update UI");
                    }

                    if (data.subtype) {
                        app.dynamicData[data.subtype] = data.value;
                    } else {
                        app.dynamicData = data.value;
                    }

                    break;
                default:
                    break;
            }
        } catch (e) {
            console.log("Issue with onScriptEventRecieved " + e);
            return;
        }
    }


    // var LOAD_TIMEOUT_MS = 200;
    // // Load the app
    // function onLoad() {
    //     console.log("ROBIN IS GREAT 1");
    //     setTimeout(function() {
    //         // Open the EventBridge to communicate with the main script.
    //         EventBridge.scriptEventReceived.connect(onScriptEventReceived);
    //         EventBridge.emitWebEvent(JSON.stringify({
    //             type: EVENT_BRIDGE_OPEN_MESSAGE
    //         }));
    //     }, LOAD_TIMEOUT_MS);
    // }


    // document.addEventListener('DOMContentLoaded', onLoad, false);


    var EVENTBRIDGE_SETUP_DELAY = 50;
    // This is how much time to give the Eventbridge to wake up.  This won't be needed in RC78 and will be removed.
    function onLoad() {
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
    onLoad();

})();
