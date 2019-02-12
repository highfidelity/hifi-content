(function () {

    var EVENTBRIDGE_SETUP_DELAY = 200;

    var Chrome = VueColor.Chrome;
    console.log(Chrome);
    console.log(VueColor);

    // Consts
    var UPDATE_UI = CONFIG.UPDATE_UI,
        APP_NAME = CONFIG.APP_NAME;

    // Static strings
    var STRING_MATERIAL = CONFIG.STRING_MATERIAL,
        STRING_BLENDSHAPES = CONFIG.STRING_BLENDSHAPES,
        STRING_ANIMATION = CONFIG.STRING_ANIMATION,
        STRING_FLOW = CONFIG.STRING_FLOW,
        STRING_INFO = CONFIG.STRING_INFO;

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
        EVENT_UPDATE_FLOW = APP_NAME + CONFIG.EVENT_UPDATE_FLOW;

    var IMAGE_URL = "../images/red-kitten.jpg";

    // Debug

    var DEBUG = true;

    // Utils

    function deepCopy(objectToCopy) {

        var newObject;

        try {
            newObject = JSON.parse(JSON.stringify(objectToCopy));
        } catch (e) {
            console.error("Error with deepCopy utility method" + e);
        }

        return newObject;
    }

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

                return {
                    tabName: tabName,
                    active: (tabName === this.activetabname),
                    href: "#" + tabName,
                    tabID: tabName + "-tab",
                    isDisabled: !isAviEnabled || (!isAviEnabled && tabName !== STRING_INFO)
                }
            }
        },
        template: /* html */ `
            <a 
                class="nav-item nav-link ml-2 title-case" 
                v-bind:class="{ 'active': tabInfo.active, 'disabled': tabInfo.isDisabled }" 
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
                var TAB_LIST = this.staticdata.TAB_LIST;
                var TAB_DATA = this.staticdata.TAB_DATA;
                return TAB_LIST.map((tabName) => {

                    var tabData = {
                        static: TAB_DATA[tabName.toUpperCase()],
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
 
    // #region Specific Tab-Content Layouts

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
                items: ["Materials", "Blendshapes", "Animations", "Flow"]
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

    Vue.component('material-tab', {
        props: ['dynamic', 'static'],
        methods: {
            applyNamedMaterial(materialName) {
                if (DEBUG) {
                    console.log("applyNamedMaterial clicked " + materialName);
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_MATERIAL,
                    name: materialName
                }));

            },
            updateMaterialProperties(materialPropertiesObject) {
                if (DEBUG) {
                    console.log("updateMaterialProperties clicked");
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_UPDATE_MATERIAL,
                    updates: materialPropertiesObject
                }));
            }, 
            changeModel(modelName) {

                var selected = modelName;

                if (selected === "hifi-pbr") {
                    selected = "pbr";
                } else if (selected === "Select one") {
                    selected = "selectOne";
                }

                this.selected = selected;
            }
        },
        computed: {
            dropDownList() {
                return ["Select one", "shadeless", "hifi-pbr"];
            },
            selectedPropertyList() {
                console.log(JSON.stringify(this.static));
                return this.static.COMPONENT_DATA.PROPERTIES_LISTS[this.selected];
            }
        },
        data() {
            return {
                models: ["Select one", "shadeless", "hifi-pbr"],
                selected: "selectOne"
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
                    :items="models"
                    :defaulttext="'Model type'"
                    :onselect="changeModel"
                >
                </drop-down>
                
                <template v-for="propertyData in selectedPropertyList">

                    <material-property-container 
                        :property="propertyData"
                        :dynamic="dynamic[selected]"
                    ></material-property-container>

                </template>

            </div>
        `
    })

    Vue.component('material-property-container', {
        props: ['property', 'dynamic'],
        computed: {
            propertyInfo(){
                var propertyData = this.property;
                console.log("ROBIN FIRST" + JSON.stringify(propertyData.key))

                var dynamicPropertyData = this.dynamic[propertyData.key];
                console.log("ROBIN WHAT IS" + JSON.stringify(this.dynamic))

                return {
                    name: propertyData.key,
                    hasMap: propertyData.hasMap,
                    componentType: propertyData.componentType, // 
                    value: dynamicPropertyData.value,
                    map: propertyData.hasMap ? dynamicPropertyData.map : null
                }
            }
        },
        template: /* html */ `
            <div>

                <material-slider 
                    v-if="propertyInfo.componentType === 'slider'" 
                    :propertyInfo="propertyInfo"
                ></material-slider>

                <material-map-only 
                    v-if="propertyInfo.componentType === 'mapOnly'" 
                    :propertyInfo="propertyInfo"
                ></material-map-only>

                <material-color 
                    v-if="propertyInfo.componentType === 'color'" 
                    :propertyInfo="propertyInfo"
                ></material-color> 

            </div>
        `
    })

    Vue.component('material-slider', {
        props: ['propertyInfo'],
        computed: {
            mapName() {
                return this.propertyInfo.name + "Map";
            },
            dropDownList() { // ***
                return ["Select one", "shadeless", "hifi-pbr"];
            }
        },
                    // :title="blendshapeData.title"
                    // :name="blendshapeData.name"
                    // :max="blendshapeData.max"
                    // :increment="blendshapeData.increment"
                    // :min="blendshapeData.min"
                    // :defaultvalue="blendshapeData.defaultValue"
                    // :onchange="onSliderChange"
        template: /* html */ `
            <div>

                <div class="flex-container-row">

                    <h3 class="flex-item">{{ propertyInfo.name }}</h3>
                    <div class="flex-item">
                        <slider
                            :name="'test1'"
                            :max="10"
                            :increment="0.1"
                            :min="0"
                            :defaultvalue="7"
                        ></slider>
                    </div>
                </div>

                <div class="flex-container-row">

                    <h3 class="flex-item">{{ mapName }}</h3>
                    <div class="flex-item">
                    
                        <drop-down-images
                            :items="dropDownList"
                            :defaulttext="'Model type'"
                        ></drop-down-images>
                    
                    </div>
                </div>

            </div>
        `
    })

    Vue.component('material-map-only', {
        props: ['propertyInfo'],
        computed: {
            dropDownList() { // ***
                return ["Select one", "shadeless", "hifi-pbr"];
            }
        },
        template: /* html */ `
            <div class="flex-container-row">

                <h3 class="flex-item">
                    {{ propertyInfo.name }}
                </h3>
                <div class="flex-item">
                
                    <drop-down-images
                        :items="dropDownList"
                        :defaulttext="'Model type'"
                    ></drop-down-images>
                
                </div>

            </div>
        `
    })

    Vue.component('material-color', {
        props: ['propertyInfo'],
        methods: {
            updateValue(){
                console.log("calling color picker updating value" + this.colors);
            }
        },
        computed: {
            dropDownList() { // ***
                return ["Select one", "shadeless", "hifi-pbr"];
            },
            mapName() {
                return this.propertyInfo.name + "Map";
            }
        },
        data() {
            return {
                colors: '#194d33'
            }
        },
        template: /* html */ `
            <div class="flex-container-row"> 
                <div class="flex-item">

                    <h3>{{ propertyInfo.name }}</h3>
                    <chrome-picker 
                        :value="colors" 
                        @input="updateValue"
                    ></chrome-picker>

                </div>

                <div class="flex-item">

                    <h3>{{ mapName }}</h3>
                    <drop-down-images
                        :items="dropDownList"
                        :defaulttext="'Model type'"
                    ></drop-down-images>

                </div>

            </div>
        `
    })

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
                var sliderChange = createSliderChangeCallback(EVENT_UPDATE_BLENDSHAPE, this.dynamic.updatedProperties);
                sliderChange(value, name);
            },
        },
        computed: {
            facialBlendshapeList() {
                var blendshapeList = this.static.COMPONENT_DATA.FACIAL_BLENDSHAPES;
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

        function sliderChangedCallback(value, name) {
            if (dynamicData[name] !== value) {
                var updates = {};
                updates[name] = value;
    
                EventBridge.emitWebEvent(JSON.stringify({
                    type: eventBridgeTypeString,
                    subtype: eventBridgeSubtypeString ? eventBridgeSubtypeString : "",
                    updates: updates
                }));
            }
        }
        return sliderChangedCallback;
    }

    Vue.component('flow-tab', {
        props: ['dynamic', 'static'],
        methods: {
            debugToggle() {
                console.log("toggle toggle");
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
                    v-bind:defaultvalue="true"
                ></checkbox>

                <checkbox
                    :onchange="debugToggle"
                    :label="'Enable Collisions'"
                    v-bind:defaultvalue="true"
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

                <h3>Avatar Head Joint Flow Options</h3>

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

    // #endregion Specific Tab-Content Layouts

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
                    
                        <div class="flex-container-row">
                            <button-big 
                                :text="'Yes, favorite my avatar'" 
                                :onclick="changeAvatarToAviAndSaveAvatar" 
                                :classes="'flex-item'"
                            ></button-big>
                            <button-big 
                                :text="withoutSavingText" 
                                :onclick="changeAvatarToAviWithoutSavingAvatar" 
                                :classes="'flex-item'"
                            ></button-big>

                        </div>
                    </div>
                </div>
                
                <div slot="footer" class="text-center"></div>

            </modal>
        `
    })

    Vue.component('test1', {
        template: /* html */ `
            <div>
                test1
            </div>
        `
    })

    Vue.component('test2', {
        template: /* html */ `
            <div>
                test2
            </div>
        `
    })

    // #endregion Simple Test Components

    // #region EDIT COMPONENTS

    Vue.component('slider-container', {
        props: ['title', 'showval', 'istitleabove', 'maxval', 'minval'],
        // if title exists
        // istitleabove boolean to the left of slider and value or on the top
        template: /* html */ `
            <div>
                
            </div>
        `
    })

    Vue.component('slider', {
        props: ['title', 'name', 'max', 'min', 'defaultvalue', 'increment', 'onchange'],
        computed: {
            sliderId() {
                console.log("COMPUTED" + this.name);
                return this.name;
            },
            sliderValueId() {
                return this.name + "Value";
            }
        },
        mounted() {

            var sliderId = "#" + this.sliderId;
            var sliderValueId = "#" + this.sliderValueId;

            var onChange = this.onchange;
            var title = this.title;

            $(sliderId).slider();
            $(sliderId).on("slide", function(slideEvent) {

                $(sliderValueId).text(slideEvent.value);
                onChange(slideEvent.value, title);

            });

        },
        template: /* html */ `
            <div>
                <input 
                    v-bind:data-slider-min="min"
                    v-bind:data-slider-max="max"
                    v-bind:data-slider-value="defaultvalue"
                    v-bind:data-slider-step="increment"
                    v-bind:id="sliderId" 

                    data-slider-handle="square" 
                    type="text"
                />
                <span
                    v-bind:id="sliderValueId"
                >
                    {{ defaultvalue }}
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

    Vue.component('drop-down', {
        props: ["items", "defaulttext", "onselect"],
        methods: {
            onSelect(value) {
                console.log("DropDown value:" + value);
                this.selected = value;
                this.onselect(value);
            }
        },
        data() {
            return {
                selected: this.items[0]
            }
        },
        template: /* html */ `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{ selected }}
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="item in items">
                        <a class="dropdown-item" href="#" @click="onSelect(item)">{{ item }}</a> 
                    </template>
                </div>
            </div>
        `
    })

    Vue.component('drop-down-images', {
        props: ["items", "defaulttext", "onselect"],
        methods: {
            onSelect(value) {
                console.log("DropDown Image value:" + value);
                this.selected = value;
                this.onselect(value);
            }
        },
        data() {
            return {
                selected: this.items[0]
            }
        },
        template: /* html */ `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    <img src="http://lorempixel.com/75/50/abstract/">
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="item in items">
                        <a class="dropdown-item" href="#"><img src="http://lorempixel.com/75/50/abstract"/></a>
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
                    v-on:change="onchange()"
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
        components: {
            'chrome-picker': Chrome,
        },
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
            console.log(e)
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
