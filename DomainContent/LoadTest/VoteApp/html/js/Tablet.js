(function () {

    "use strict";

    // Consts
    // /////////////////////////////////////////////////////////////////////////
    var EVENT_BRIDGE_OPEN_MESSAGE = "eventBridgeOpen",
        UPDATE_UI = "update_ui",

        GOTO = "goto",
        VOTE_AVATAR = "vote_avatar",
        VOTE_DOMAIN = "vote_domain",

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
                        <a class="nav-item nav-link active ml-4" id="nav-domains-tab" data-toggle="tab" href="#nav-domains" role="tab"
                        aria-controls="nav-domains" aria-selected="true">{{ polls.domain ? "" : "Vote " }} Best Environment</a>
                        <a class="nav-item nav-link mr-4" id="nav-avatars-tab" data-toggle="tab" href="#nav-avatars" role="tab"
                        aria-controls="nav-avatars" aria-selected="false">{{ polls.avatar ? "" : "Vote " }} Best Avatar</a>
                    </div>
                </nav>
            `
    })

    Vue.component('domainlist', {
        props: {
            visitedalldomains: { type: Boolean },
            domains: { type: Array },
            open: { type: Boolean }
        },
        computed: {
            groupedItems() {
                console.log("ROBIN");
                console.log(this.domains);
                console.log(this.visitedalldomains);

                var grouped = [];
                var index = -1;
                for (var i = 0; i < this.domains.length; i++) {
                    if (i % 2 == 0) {
                        index++;
                        grouped[index] = [];
                        grouped[index].id = index;
                    }
                    grouped[index].push(this.domains[i]);
                }

                if(grouped.length && grouped[index].length === 1) {
                    grouped[index].push({ hidden: true });
                }
                return grouped;
            }
        },
        template: `
                <div class="tab-pane fade show active" id="nav-domains" role="tabpanel" aria-labelledby="nav-domains-tab">
                    <div class="m-2">
                        <h4>{{ visitedalldomains ? "Vote for Your Favorite" : "Visit the Entries Then Vote" }}</h4>
                        <template v-for="items in groupedItems">
                            <div class="row" :key="items.id">
                                <domaincard  v-for="item in items" :domain="item" :key="item.name" :visitedalldomains="visitedalldomains"></domaincard>
                            </div>
                        </template>
                        
                    </div>
                </div>
            `
    })

    Vue.component('domaincard', {
        props: {
            visitedalldomains: { type: Boolean },
            domain: { type: Object }
        },
        methods: {
            goto(domainName){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO,
                    value: domainName
                }));
                console.log(domainName);
            }
        },
        computed: {
            styles() {
                return "background: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url('" + this.domain.image +
                "'); background-position: center; background-size: cover;";
            }
        },
        template:`
        <div class="col-sm">
            <div class="card card-image" v-bind:class="{ 'ghost': domain.hidden, 'card-visited': domain.visited }" v-bind:style="styles">

                <div class="card-body">
                    <h4 class="card-title">{{ domain.name }}</h4>
                    <div class="align-bottom-wrapper">
                        <div v-if="!visitedalldomains" class="align-bottom-left">{{ domain.visited ? "Visited." : "" }}</div>
                        <div v-if="visitedalldomains" class="align-bottom-left stroke text-size-icon icon icon-check"></div>
                        <a href="#" class="align-bottom-right btn btn-primary" v-on:click="goto(domain.name)">Go</a>
                    </div>
                </div>

            </div>
        </div>
        `
    })

    Vue.component('avatarlist', {
        props: {
            avatars: { type: Array },
            open: { type: Boolean }
        },
        computed: {
            groupedItems() {
                var grouped = [];
                var index = -1;
                for (var i = 0; i < this.avatars.length; i++) {
                    if (i % 3 == 0) {
                        index++;
                        grouped[index] = [];
                        grouped[index].id = index;
                    }
                    grouped[index].push(this.avatars[i]);
                }

                if(grouped.length && grouped[index].length < 3) {
                    grouped[index].push({ hidden: true });
                    if (grouped[index].length === 2){
                        grouped[index].push({ hidden: true });
                    }
                }
                return grouped;
            }
        },
        template: `
        <div class="tab-pane fade" id="nav-avatars" role="tabpanel" aria-labelledby="nav-avatars-tab">
            <div class="m-2">
                <h4>Vote for Your Favorite</h4>
                <template v-for="items in groupedItems">
                    <div class="row" :key="items.id">
                        <avatarcard  v-for="item in items" :avatar="item" :key="item.name"></avatarcard>
                    </div>
                </template>
                
            </div>
        </div>
        `
    })

    Vue.component('avatarcard', {
        props: {
            avatar: { type: Object }
        },
        methods: {
            vote_avatar(avatarName){
                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO,
                    value: domainName
                }));
                console.log(domainName);
            }
        },
        computed: {
            styles() {
                return "background: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url('" + this.avatar.image +
                "'); background-position: center; background-size: cover;";
            }
        },
        template:`
        <div class="col-sm">
            <div>
                <div class="card card-image avatar-card" v-bind:class="{ 'ghost': avatar.hidden, 'card-visited': avatar.visited }" v-bind:style="styles"></div>
                <p class="card-title text-center">{{ avatar.name }}</p>
            </div>
        </div>
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
            // dataStore: {
            //     polls: {
            //         avatar: false,
            //         domain: true
            //     },
            //     visitedalldomains: false,
            //     domains: [],
            //     avatars: []
            // }

            dataStore: {  
                "polls":{  
                   "avatar":false,
                   "domain":true
                },
                "visitedalldomains":true,
                "domains":[  
                   {  
                      "name":"TheSpot",
                      "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/6bf/6ed/a7-/thumbnail/hifi-place-6bf6eda7-51d6-45ef-8ffc-28a6c4080af4.jpg?1527698357",
                      "visited":true,
                      "index":0
                   },
                   { 
                      "name":"Studio",
                      "image":"http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg",
                      "visited":true,
                      "index":1
                   },
                   {  
                      "name":"Help1",
                      "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/0ce/40e/14-/thumbnail/hifi-place-0ce40e14-7c49-4076-8bcf-be6f76fe7482.png?1529018633",
                      "visited":true,
                      "index":2
                   },
                   {  
                    "name":"Help2",
                    "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/0ce/40e/14-/thumbnail/hifi-place-0ce40e14-7c49-4076-8bcf-be6f76fe7482.png?1529018633",
                    "visited":true,
                    "index":2
                 },
                 {  
                    "name":"Help3",
                    "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/0ce/40e/14-/thumbnail/hifi-place-0ce40e14-7c49-4076-8bcf-be6f76fe7482.png?1529018633",
                    "visited":true,
                    "index":2
                 },
                 {  
                    "name":"Help4",
                    "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/0ce/40e/14-/thumbnail/hifi-place-0ce40e14-7c49-4076-8bcf-be6f76fe7482.png?1529018633",
                    "visited":true,
                    "index":2
                 },
                 {  
                    "name":"Help5",
                    "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/0ce/40e/14-/thumbnail/hifi-place-0ce40e14-7c49-4076-8bcf-be6f76fe7482.png?1529018633",
                    "visited":true,
                    "index":2
                 },
                 {  
                    "name":"Help6",
                    "image":"https://hifi-metaverse.s3-us-west-1.amazonaws.com/images/places/previews/0ce/40e/14-/thumbnail/hifi-place-0ce40e14-7c49-4076-8bcf-be6f76fe7482.png?1529018633",
                    "visited":true,
                    "index":2
                 }
                ],
                "avatars":[  
                   {  
                      "name":"Robin1",
                      "image":"http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"
                   },
                   {  
                    "name":"Robin2",
                    "image":"http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"
                 },
                 {  
                    "name":"Robin3",
                    "image":"http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"
                 },
                 {  
                    "name":"Robin4",
                    "image":"http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"
                 },
                 {  
                    "name":"Robin5",
                    "image":"http://img.youtube.com/vi/kEJDqO7WrKY/hqdefault.jpg"
                 }
                ]
             }
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
