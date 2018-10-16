(function() {

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
            template:`
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
                vistedalldomains: { type: Boolean },
                domains: { type: Object }
            },
            template:`
                <div class="tab-pane fade show active" id="nav-domainlist" role="tabpanel" aria-labelledby="nav-domainlist-tab">
                    <div class="m-4">
                        <h4>Visit the Entries Then Vote:</h4>
                        <div class="row">
                            <div class="col-sm-6">
                                <div class="card card-image m-2 card-visited" style="
                                        background: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url('http://placekitten.com/301/300');
                                        background-position: center;
                                        background-size: cover;">
                                    <div class="card-body">
                                        <h3 class="card-title">Domain Name</h3>
                                        <div class="align-bottom-wrapper">
                                            <div class="align-bottom-left">Visited.</div>
                                            <a href="#" class="align-bottom-right btn btn-primary">Go</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">Special title treatment</h5>
                                        <p class="card-text">With supporting text below as a natural lead-in to additional
                                            content.</p>
                                        <a href="#" class="btn btn-primary">Go somewhere</a>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div class="row">
                            <div class="col-sm-6">
                                <div class="card card-image" style="
                                        background: linear-gradient(rgba(255,255,255,.5), rgba(255,255,255,.5)), url('http://placekitten.com/301/300');
                                        background-position: center;
                                        background-size: cover;">
                                    <div class="card-body">
                                        <h5 class="card-title">Special title treatment</h5>
                                        <p class="card-text">With supporting text below as a natural lead-in to additional
                                            content.</p>
                                        <div class="float-left">Visited.</div>
                                        <a href="#" class="btn btn-primary float-right">Go somewhere</a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-6">
                                <div class="card">
                                    <div class="card-body">
                                        <h5 class="card-title">Special title treatment</h5>
                                        <p class="card-text">With supporting text below as a natural lead-in to additional
                                            content.</p>
                                        <a href="#" class="btn btn-primary">Go somewhere</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            `
        })

        // Vue.component('domaincard', {
        //     props: {
        //         polls: { type: Object }
        //     },
        //     template:`
        //         <nav>
        //             <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">
        //                 <a class="nav-item nav-link active ml-4" id="nav-home-tab" data-toggle="tab" href="#nav-home" role="tab"
        //                 aria-controls="nav-home" aria-selected="true">{{ polls.domain ? "" : "Vote " }} Best Environment</a>
        //                 <a class="nav-item nav-link mr-4" id="nav-profile-tab" data-toggle="tab" href="#nav-profile" role="tab"
        //                 aria-controls="nav-profile" aria-selected="false">{{ polls.avatar ? "" : "Vote " }} Best Avatar</a>
        //             </div>
        //         </nav>
        //     `
        // })

        Vue.component('avatarlist', {
            props: {
                polls: { type: Object }
            },
            template:`
                <div class="tab-pane fade" id="nav-avatarlist" role="tabpanel" aria-labelledby="nav-avatarlist-tab">AVATAR LIST</div>
            `
        })


        Vue.component('example', {
            props: {
                example: { type: Object}
            },
            methods: {
                example(){
                    EventBridge.emitWebEvent(JSON.stringify({
                        type: EXAMPLE_MESSAGE,
                        value: this.example
                    }));
                }
            },
            template:`
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
                    visitedAllDomains: false,
                    clientData: { help: false, studio: true },
                    domainList: {
        
                    }
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
