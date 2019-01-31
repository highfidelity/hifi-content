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

                    <!-- 
                    <a class="nav-item nav-link active" v-bind:class="{ 'active': }"  id="info-tab" data-toggle="tab" href="#info" role="tab"
                    aria-controls="info" aria-selected="true">Info</a>
                    <a class="nav-item nav-link" id="nav-domains-tab" data-toggle="tab" href="#nav-domains" role="tab"
                    aria-controls="nav-domains" aria-selected="false">Favorite Domain</a> 
                    <a class="nav-item nav-link" id="nav-avatars-tab" data-toggle="tab" href="#nav-avatars" role="tab"
                    aria-controls="nav-avatars" aria-selected="false">Favorite Avatar</a>
                    -->

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
                    id: this.tabName
                }
            }
        },
        template: /* html */ `
            <a 
                class="nav-item nav-link ml-2" 
                v-bind:class="{ 'active': tabInfo.active }" 
                v-bind:id="tabInfo.id" 
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

    Vue.component('example', {
        props: {
            example: { type: Object }
        },
        methods: {
            example() {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: EXAMPLE_MESSAGE,
                    value: this.example
                }));
            }
        },
        template: `
                <div class="card">
                    <div class="card-header">
                        {{ example.name }}
                    </div>
                    <div class="card-body">
                        <button class="btn-sm btn-primary mt-1 mr-1" v-on:click="example()">Example</button>
                    </div>
                </div>
            `
    })

    var app = new Vue({
        el: '#app',
        data: {
            dataStore: {
                activeTabName: "tab2"
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
