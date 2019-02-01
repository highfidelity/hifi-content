(function () {

    var EVENTBRIDGE_SETUP_DELAY = 200;

    // Consts
    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        UPDATE_UI = CONFIG.UPDATE_UI,
        APP_NAME = CONFIG.APP_NAME;

    // Static strings
    var STRING_MATERIAL = CONFIG.STRING_MATERIAL,
        STRING_BLENDSHAPES = CONFIG.STRING_BLENDSHAPES,
        STRING_ANIMATION = CONFIG.STRING_ANIMATION,
        STRING_FLOW = CONFIG.STRING_FLOW,
        STRING_INFO = CONFIG.STRING_INFO;

    // Events 
    // !important Add APP_NAME to each event
    var EVENT_CHANGE_TAB = APP_NAME + CONFIG.EVENT_CHANGE_TAB,
        EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR = APP_NAME + CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_AND_SAVE_AVATAR,
        EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR = APP_NAME + CONFIG.EVENT_CHANGE_AVATAR_TO_AVI_WITHOUT_SAVING_AVATAR,
        EVENT_RESTORE_SAVED_AVATAR = APP_NAME + CONFIG.EVENT_RESTORE_SAVED_AVATAR;

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
                    :tabdatalist="datastore.tabDataList"
                    :isavienabled="datastore.isAviEnabled"
                ></navigation>
                
                <tab-content-container
                    :activetabname="datastore.activeTabName" 
                    :tabdatalist="datastore.tabDataList"
                    :isavienabled="datastore.isAviEnabled"
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
                v-bind:class="{ 'active': tabInfo.active, 'disabled':tabInfo.isDisabled }" 
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
                        :data="tabData"
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
            data2() {
                console.log("tab-content info: " + this.tabid + this.title + this.subtitle + this.data + this.componentname);
                return "";
            },
            isActiveTab(){
                return this.activetabname === this.tabid;
            }
        },
        template: /* html */ `
            <div class="tab-pane fade" v-bind:class="{ 'show active': isActiveTab }" v-bind:id="tabid" role="tabpanel" v-bind:aria-labelledby="tabid">

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
        // computed(){
        //     isSwitchAvatarDisabled() {
        //         return !this.isavienabled
        //     }
        // },
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
                        :isdisabled="!isavienabled"
                        :text="'Switch Avatar'" 
                        :onclick="showModalSaveAvatar" 
                        :classes="'flex-item'"
                    ></button-big>
                </div>

                <div class="flex-container-row">
                    <button-big 
                        :isdisabled="isavienabled"
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
        props: ['text', 'onclick', 'classes', 'isdisabled'],
        computed: {
            style() {
                return "btn btn-primary " + this.classes;
            }
        },
        template: /* html */ `
            <button type="button" v-bind:class="style" @click="onclick" :disabled="isdisabled">
                {{ text }}
            </button> 
        `
    })

    // "Others to modify, You will learn about customizing your avatar in hifi"
    Vue.component('dropdown', {
        props: ['max', 'min'],
        template: /* html */ `
            <div>
                <li></li>
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
            dataStore: {
                isAviEnabled: true, // *** robin
                activeTabName: STRING_INFO,
                tabDataList: [
                    // USE STRING_BLENDSHAPES ETC FOR THE TABNAME
                    {
                        // INFORMATION
                        tabName: STRING_INFO, 
                        title: STRING_INFO, 
                        subtitle: "Thank you for downloading the Avatar Customization 101 app.",
                        componentName: "info-tab"
                    },
                    {
                        // MATERIAL
                        tabName: STRING_MATERIAL, 
                        title: STRING_MATERIAL, 
                        subtitle: "Change avatars materials for each submesh.",
                        componentName: "test2"
                    },
                    {
                        // BLENDSHAPES
                        tabName: STRING_BLENDSHAPES, 
                        title: STRING_BLENDSHAPES, 
                        subtitle: "Change avatar expressions.",
                        componentName: "test1"
                    },
                    {
                        // ANIMATION
                        tabName: STRING_ANIMATION, 
                        title: STRING_ANIMATION, 
                        subtitle: "Change avatars default animations.",
                        componentName: "test2"
                    },
                    {
                        // FLOW
                        tabName: STRING_FLOW, 
                        title: STRING_FLOW, 
                        subtitle: "Modify flow joints for chain.",
                        componentName: "test1"
                    }
                ],
            }
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
