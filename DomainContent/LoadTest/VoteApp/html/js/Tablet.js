(function () {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",

        EVENTBRIDGE_SETUP_DELAY = 200;

    // Components
    // /////////////////////////////////////////////////////////////////////////

    Vue.component('navigation', {
        props: {
            polls: { type: Object }
        },
        template: `
                <nav>
                    <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">
                        <a class="nav-item nav-link active ml-4" id="nav-domainlist-tab" data-toggle="tab" href="#nav-domainlist" role="tab"
                        aria-controls="nav-domainlist" aria-selected="true">{{ polls.domain ? "" : "Vote " }} Best Environment</a>
                        <a class="nav-item nav-link mr-4" id="nav-avatarlist-tab" data-toggle="tab" href="#nav-avatarlist" role="tab"
                        aria-controls="nav-avatarlist" aria-selected="false">{{ polls.avatar ? "" : "Vote " }} Best Avatar</a>
                    </div>
                </nav>
            `
    })

    Vue.component('domainlist', {
        props: {
            visitedalldomains: { type: Boolean },
            domains: { type: Array }
        },
        computed: {
            groupedItems() {
                var grouped = [];
                var index = -1;
                for (var i = 0; i < this.domains.length; i++) {
                    if (i % 2 == 0) {
                        index++;
                        grouped[index] = [];
                    }
                    grouped[index].push(this.domains[i]);
                }

                if(grouped[index].length === 1) {
                    grouped[index].push({ hidden: true });
                }
                return grouped;
            }
        },
        template: `
                <div class="tab-pane fade show active" id="nav-domainlist" role="tabpanel" aria-labelledby="nav-domainlist-tab">
                    <div class="m-4">
                        <h4>{{ visitedalldomains ? "Vote for Your Favorite" : "Visit the Entries Then Vote" }}</h4>
                        <template v-for="items in groupedItems">
                            <div class="row">
                                <div v-for="item in items">
                                    <domaincard :domain="item"></domaincard>
                                </div>  
                            </div>
                        </template>
                        
                        
                    </div>
                </div>
            `
    })

    Vue.component('domaincard', {
        props: {
            domain: { type: Object }
        },
        template:`
        <div class="col-xs-4">
            <div class="card card-image m-2 card-visited" v-bind:class="{ 'ghost': item.hidden }" style="
                background: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url('http://placekitten.com/301/300');
                background-position: center;
                background-size: cover;">

                <div class="card-body">
                    <h4 class="card-title">Domain Name</h4>
                    <div class="align-bottom-wrapper">
                        <div class="align-bottom-left">Visited.</div>
                        <a href="#" class="align-bottom-right btn btn-primary">Go</a>
                    </div>
                </div>

            </div>
        </div>
        `
    })

    Vue.component('avatarlist', {
        props: {
            polls: { type: Object }
        },
        template: `
                <div class="tab-pane fade" id="nav-avatarlist" role="tabpanel" aria-labelledby="nav-avatarlist-tab">AVATAR LIST</div>
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

    // App
    // /////////////////////////////////////////////////////////////////////////
    var app = new Vue({
        el: '#app',
        data: {
            dataStore: {
                polls: {
                    avatar: false,
                    domain: true
                },
                visitedalldomains: false,
                clientData: { help: false, studio: true },
                domainlist: [
                    { name: "TheSpot", image: "", visited: false }, 
                    { name: "", image: "", visited: false }, 
                    { name: "", image: "", visited: false }
                ]
            }



            // dataStore: {
            //     example: [
            //         {
            //             name: "example"
            //         }
            //     ],
            //     ui: {}
            // }
        }
    });

    // Procedural
    // /////////////////////////////////////////////////////////////////////////
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

    // Main
    // /////////////////////////////////////////////////////////////////////////    
    onLoad();

}());
