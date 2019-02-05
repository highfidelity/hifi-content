(function () {

    var EVENTBRIDGE_SETUP_DELAY = 200;

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
        EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR = APP_NAME + CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR,
        EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR = APP_NAME + CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR,
        EVENT_RESTORE_SAVED_AVATAR = APP_NAME + CONFIG.EVENT_RESTORE_SAVED_AVATAR,

        // Material tab events
        EVENT_UPDATE_MATERIAL = APP_NAME + CONFIG.EVENT_UPDATE_MATERIAL;

    // Debug 

    var DEBUG = true;

    // Components

    // #region Tabs and Tab Layout

    Vue.component('page-content', {
        props: ['datastore'],
        template: /* html */ `
            <div>

                <navigation 
                    :activetabname="datastore.activeTabName" 
                    :isavienabled="datastore.isAviEnabled"
                    :tabdatalist="datastore.tabDataList"
                ></navigation>
                
                <tab-content-container
                    :isavienabled="datastore.isAviEnabled"
                    :activetabname="datastore.activeTabName" 
                    :tabdatalist="datastore.tabDataList"
                ></tab-content-container>

            </div>
        `
    })

    Vue.component('navigation', {
        props: ['activetabname', 'tabdatalist', 'isavienabled'],
        template: /* html */ `
            <nav>
                <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">

                    <template v-for="tab in tabdatalist">
                        <tab :tab="tab" :activetabname="activetabname" :isavienabled="isavienabled"></tab>
                    </template>

                </div>
            </nav>
        `
    })

    Vue.component('tab', {
        props: ['tab', 'activetabname', 'isavienabled'],
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

                var tabName = this.tab.tabName;
                var isAviEnabled = this.isavienabled;

                return {
                    tabName: tabName,
                    title: this.tab.title,
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
                {{ tabInfo.title }}
            </a>
        `
    })

    Vue.component('tab-content-container', {
        props: ['activetabname', 'tabdatalist', 'isavienabled'],
        template: /* html */ `
            <div class="tab-content" id="nav-tabContent">

                <template v-for="tabData in tabdatalist">

                    <tab-content 
                        :activetabname="activetabname"
                        :tabid="tabData.tabName"
                        :title="tabData.title"
                        :subtitle="tabData.subtitle"
                        :data="tabData.componentData"
                        :componentname="tabData.componentName"
                        :isavienabled="isavienabled"
                    ></tab-content>

                </template>

            </div>
        `
    })

    Vue.component('tab-content', {
        props: ['activetabname', 'tabid', 'title', 'subtitle', 'data', 'componentname', 'isavienabled'],
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

                <h1 class="title-case">{{ title }}</h1>
                <p>{{ subtitle }}</p>

                <component :is="componentname" :isavienabled="isavienabled" :data="data"></component>

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
                    type: EVENT_RESTORE_SAVED_AVATAR
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
        props: ['data'],
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
            }
        },
        computed: {
            dropDownList() {
                return ["Select one", "shadeless", "hifi-pbr"];
            }
        },
        template: /* html */ `
            <div>

                <h3>Jacket</h3>

                <options-row-buttons
                    :selectedbutton="data.selectedMaterial"
                    :title="'PBR Presets'"
                    :onclick="applyNamedMaterial"
                    :buttonlist="data.pbrList"
                >
                </options-row-buttons>

                <options-row-buttons
                    :selectedbutton="data.selectedMaterial"
                    :title="'Shadeless Presets'"
                    :onclick="applyNamedMaterial"
                    :buttonlist="data.shadelessList"
                >
                </options-row-buttons>

                <h3>Shading Model</h3>
                <drop-down-simple
                    :items="dropDownList"
                    :defaulttext="'Model type'"
                >
                </drop-down-simple>

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
                    type: EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR
                }));

                this.close();
            },
            changeAvatarToAviWithoutSavingAvatar() {
                // do not save avatar

                if (DEBUG) {
                    console.log("changeAvatarToAviWithoutSavingAvatar clicked");
                }

                EventBridge.emitWebEvent(JSON.stringify({
                    type: EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR
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
        props: ['max', 'min'],
        template: /* html */ `
            <div>
            
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
        props: ["items", "defaulttext"],
        template: /* html */ `
            <div class="dropdown">
                <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                    {{ defaulttext }}
                </button>
                <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                    <template v-for="item in items">
                        <a class="dropdown-item" href="#">{{ item }}</a> 
                    </template>
                </div>
            </div>
        `
    })

    Vue.component('drop-down-simple', {
        props: ["items", "defaulttext"],
        template: /* html */ `
            <div class="form-group">
                <label for="sel1">{{ defaulttext }}</label>
                <select class="form-control" id="sel1">
                    <template v-for="item in items">
                        <option>{{ item }}</option> 
                    </template>
                </select>
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
            dataStore: 
            
            CONFIG.INITIAL_DATASTORE_SETTINGS 
            
            // {
            //     isAviEnabled: false, // *** robin
            //     activeTabName: STRING_INFO,
            //     tabDataList: [
            //         // USE STRING_BLENDSHAPES ETC FOR THE TABNAME
            //         {
            //             // INFORMATION
            //             tabName: STRING_INFO, 
            //             title: STRING_INFO, 
            //             subtitle: "Thank you for downloading the Avatar Customization 101 app.",
            //             componentName: "info-tab"
            //         },
            //         {
            //             // MATERIAL
            //             tabName: STRING_MATERIAL, 
            //             title: STRING_MATERIAL, 
            //             subtitle: "Change avatars materials for each submesh.",
            //             componentName: "test2"
            //         },
            //         {
            //             // BLENDSHAPES
            //             tabName: STRING_BLENDSHAPES, 
            //             title: STRING_BLENDSHAPES, 
            //             subtitle: "Change avatar expressions.",
            //             componentName: "test1"
            //         },
            //         {
            //             // ANIMATION
            //             tabName: STRING_ANIMATION, 
            //             title: STRING_ANIMATION, 
            //             subtitle: "Change avatars default animations.",
            //             componentName: "test2"
            //         },
            //         {
            //             // FLOW
            //             tabName: STRING_FLOW, 
            //             title: STRING_FLOW, 
            //             subtitle: "Modify flow joints for chain.",
            //             componentName: "test1"
            //         }
            //     ],
            // }
        }
    });


    function onScriptEventReceived(message) {
        var data;
        try {
            data = JSON.parse(message);
            switch (data.type) {
                case UPDATE_UI:
                    app.dataStore = data.value;
                    break;
                default:
            }
        } catch (e) {
            console.log(e)
            return;
        }
    }

    // function onLoad() {

    //     // Open the EventBridge to communicate with the main script.
    //     EventBridge.scriptEventReceived.connect(onScriptEventReceived);
    //     EventBridge.emitWebEvent(JSON.stringify({
    //         type: EVENT_BRIDGE_OPEN_MESSAGE
    //     }));

    // }

    // document.addEventListener('DOMContentLoaded', onLoad, false);

}());
