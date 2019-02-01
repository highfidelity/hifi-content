(function () {

    var EVENTBRIDGE_SETUP_DELAY = 200;

    // Consts
    var EVENT_BRIDGE_OPEN_MESSAGE = CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        UPDATE_UI = CONFIG.UPDATE_UI,
        APP_NAME = CONFIG.APP_NAME;

    var EVENT_CHANGE_TAB = CONFIG.EVENT_CHANGE_TAB;

    // Events 
    // !important Add APP_NAME to each event
    var EVENT_CHANGE_TAB = APP_NAME + CONFIG.EVENT_CHANGE_TAB;

    // Debug 

    var DEBUG = true;

    // Components

    Vue.component('page-content', {
        props: ['datastore'],
        template: /* html */ `
            <navigation :activetabname="datastore.activeTabName"></navigation>
            <tab-content></tab-content>
        `
    })

    Vue.component('navigation', {
        props: ['activetabname'],
        computed: {
            tabs() {
                var activeTabName = this.activetabname;

                var modifiedTabs = this.tabList.map((tabInfo) => {
                    console.log("computed:" + activeTabName + tabInfo.tabName + activeTabName === tabInfo.tabName)
                    tabInfo.active = activeTabName === tabInfo.tabName;
                    return tabInfo;
                })

                return modifiedTabs;
            }
        },
        data() {
            return {
                tabList: [
                    // USE STRING_BLENDSHAPES ETC FOR THE TABNAME
                    { tabName: "tab1", tabTitle: "Tab 1", active: false},
                    { tabName: "tab2", tabTitle: "Tab 2", active: false},
                    { tabName: "tab3", tabTitle: "Tab 3", active: false}
                ]
            }
        },
        template: /* html */ `
            <nav>
                <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">

                    <template v-for="tab in tabs">
                        <tab :tab="tab"></tab>
                    </template>

                </div>
            </nav>
        `
    })

    Vue.component('tab', {
        props: ['tab'],
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
                return {
                    tabName: this.tab.tabName,
                    active: this.tab.active,
                    href: "#" + this.tab.tabName,
                    tabID: this.tabName
                }
            }
        },
        template: /* html */ `
            <a 
                class="nav-item nav-link ml-2" 
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
                {{ tabInfo.tabName }}
            </a>
        `
    })

    [{
        tabContentData: {
            tabID: "",
            title: "",
            subtitle: "",
            componentname: "",
            data: ""
        }
    }]
    Vue.component('tab-content', {
        props: ['tabid', 'title', 'subtitle', 'data', 'componentname'],
        template: /* html */ `
            <div  class="tab-pane fade" v-bind:id="tabid" role="tabpanel" v-bind:aria-labelledby="tabid">

                <h1>{{ title }}</h1>
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
                activeTabName: "tab2",
                tabList: [
                    // USE STRING_BLENDSHAPES ETC FOR THE TABNAME
                    { tabName: "tab1", tabTitle: "Tab 1", active: false},
                    { tabName: "tab2", tabTitle: "Tab 2", active: false},
                    { tabName: "tab3", tabTitle: "Tab 3", active: false}
                ]


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
