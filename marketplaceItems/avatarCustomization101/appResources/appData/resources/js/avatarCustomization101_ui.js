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
    var EVENT_CHANGE_TAB = APP_NAME + CONFIG.EVENT_CHANGE_TAB;

    // Debug 

    var DEBUG = true;

    // Components

    Vue.component('page-content', {
        props: ['datastore'],
        template: /* html */ `
            <div>
                <navigation 
                    :activetabname="datastore.activeTabName" 
                    :tabdatalist="datastore.tabDataList"
                ></navigation>
                
                <tab-content-container
                    :activetabname="datastore.activeTabName" 
                    :tabdatalist="datastore.tabDataList"
                ></tab-content-container>

            </div>
        `
    })

    Vue.component('navigation', {
        props: ['activetabname', 'tabdatalist'],
        template: /* html */ `
            <nav>
                <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">

                    <template v-for="tab in tabdatalist">
                        <tab :tab="tab" :activetabname="activetabname"></tab>
                    </template>

                </div>
            </nav>
        `
    })

    Vue.component('tab', {
        props: ['tab', 'activetabname'],
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

                return {
                    tabName: tabName,
                    title: this.tab.title,
                    active: (tabName === this.activetabname),
                    href: "#" + tabName,
                    tabID: tabName + "-tab"
                }
            }
        },
        template: /* html */ `
            <a 
                class="nav-item nav-link ml-2 title-case" 
                v-bind:class="{ 'active': tabInfo.active }" 
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

    // [{
    //     tabContentData: {
    //         tabID: "",
    //         title: "",
    //         t: "",
    //         componentname: "",
    //         data: ""
    //     }
    // }]
    Vue.component('tab-content-container', {
        props: ['activetabname', 'tabdatalist'],
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
                    ></tab-content>

                </template>

            </div>
        `
    })

    Vue.component('tab-content', {
        props: ['activetabname', 'tabid', 'title', 'subtitle', 'data', 'componentname'],
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
                <h3>{{ subtitle }}</h3>

                 <component :is="componentname" :data="data"></component>

            </div>
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

    
    // Edit components

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
    Vue.component('title-list', {
        props: ['max', 'min'],
        template: /* html */ `
            <div>
                <li></li>
            </div>
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

    var app = new Vue({
        el: '#app',
        data: {
            dataStore: {
                activeTabName: STRING_MATERIAL,
                tabDataList: [
                    // USE STRING_BLENDSHAPES ETC FOR THE TABNAME
                    { 
                        // INFORMATION
                        tabName: STRING_INFO, 
                        title: STRING_INFO, 
                        subtitle: "I am a test for " + STRING_INFO,
                        componentName: "test1"
                    },
                    { 
                        // MATERIAL
                        tabName: STRING_MATERIAL, 
                        title: STRING_MATERIAL, 
                        subtitle: "I am a test for " + STRING_MATERIAL,
                        componentName: "test2"
                    },
                    { 
                        // BLENDSHAPES
                        tabName: STRING_BLENDSHAPES, 
                        title: STRING_BLENDSHAPES, 
                        subtitle: "I am a test for " + STRING_BLENDSHAPES,
                        componentName: "test1"
                    },
                    {
                        // ANIMATION
                        tabName: STRING_ANIMATION, 
                        title: STRING_ANIMATION, 
                        subtitle: "I am a test for " + STRING_ANIMATION,
                        componentName: "test2"
                    },
                    {
                        // FLOW
                        tabName: STRING_FLOW, 
                        title: STRING_FLOW, 
                        subtitle: "I am a test for " + STRING_FLOW,
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
