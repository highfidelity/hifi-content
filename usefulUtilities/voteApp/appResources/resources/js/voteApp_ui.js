//
//  tablet.js 
//
//  Created by Robin Wilson 2019-1-09
//
//  Using Example Vue App Created by Milad Nazeri on 2018-10-11
//  Copyright 2019 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

(function () {

    // Consts
    var EVENT_NAME = CONFIG.EVENT_NAME,

        EVENT_BRIDGE_OPEN_MESSAGE = EVENT_NAME + CONFIG.EVENT_BRIDGE_OPEN_MESSAGE,
        UPDATE_UI = CONFIG.UPDATE_UI,

        GOTO_LOCATION = EVENT_NAME + CONFIG.GOTO_LOCATION,
        GOTO_DOMAIN = EVENT_NAME + CONFIG.GOTO_DOMAIN,
        VOTE_AVATAR = EVENT_NAME + CONFIG.VOTE_AVATAR,
        VOTE_DOMAIN = EVENT_NAME + CONFIG.VOTE_DOMAIN;

    // Components

    // ****

    //    Vue.component('grouped-list', {
    //     props: [list, title, isopen, isclosedtext],
    //     computed: {
    //         groupedItems () {
    //             var grouped = [];
    //             var index = -1;
    //             if (this.list) {
    //                 for (var i = 0; i < this.list.length; i++) {
    //                     if (i % 2 == 0) {
    //                         index++;
    //                         grouped[index] = [];
    //                         grouped[index].id = index;
    //                     }
    //                     grouped[index].push(this.list[i]);
    //                 }
    //             }

    //             if (grouped.length && grouped[index].length === 1) {
    //                 grouped[index].push({ hidden: true });
    //             }
    //             return grouped;
    //         }
    //     },
    //     template: /* html */ `
    //         <div>
    //             <div v-if="isopen" class="p-2">
    //                 <h4 class="color-main">{{ title }}</h4>
    //                 <template v-for="items in groupedItems">
    //                     <div class="row" :key="items.id">
    //                         <domaincard  v-for="item in items" :voted="voted" :domain="item" :key="item.name" :visitedalldomains="visitedalldomains"></domaincard>
    //                     </div>
    //                 </template>
    //             </div>

    //             <closed v-if="!isopen" :text="isclosedtext"></closed>

    //         </div>
    //     `
    // })

    // Vue.component('closed', {
    //     props: ["text", "isopen"],
    //     computed: {
    //     },
    //     template: /* html */ `
    //         <div v-if="!isopen" class="p-2 pt-5">
    //             <h4 class="text-center color-main">{{ text }}</h4>
    //         </div>
    //     `
    // })

    // Vue.component('visitedalldomains-modal', {
    //     props: ["closeVisitedModal"],
    //     template: /* html */ `
    //         <modal v-bind:alert="true" v-if="!showedVisited" v-show="isVisitedModalVisible" @close="closeVisitedModal">

    //             <div slot="header"></div>
                
    //             <div slot="body">
    //                 <div class="p-3 mt-2">
    //                     <h2 class="color-main">You've seen all the entries!</h2>
    //                     <div class="flex-container-row pb-4">
    //                         <p class="flex-item">Now you can vote for your favorite</p>
    //                     </div>
                    
    //                     <div class="flex-container-row">
    //                         <a href="#" class="flex-item btn btn-primary bkgd-pink" @click="closeVisitedModal">OK</a>
    //                     </div>
    //                 </div>
    //             </div>
                
    //             <div slot="footer" class="text-center"></div>

    //         </modal>
    //     `
    // })

    // Vue.component('card', {
    //     props: ["bottitle", "hasborder", "modal"],
    //     computed: {
    //     },
    //     template: /* html */ `
        
    //     `
    // })


    /*
        conditionalbuttoninfo: {
            isVotingDisabled bool
            buttonName
            method
        }
    */
    Vue.component('modal-vote', {
        props: ["closefunc", "votefunc", "backfunc", "name", "conditionalbuttoninfo"],
        computed: {
            canVote() {
                return this.conditionalbuttoninfo.hasConditional ? this.conditionalbuttoninfo.isMet : true;
            },
            conditionalBtn() {
                return {
                    method: this.conditionalbuttoninfo.buttonFunc ? this.conditionalbuttoninfo.method : () => {},
                    buttonName: this.conditionalbuttoninfo.buttonFunc ? this.conditionalbuttoninfo.buttonName : ""
                };
            }
        },
        template: /* html */ `
            <modal v-bind:alert="true" v-bind:hidex="false" v-bind:isfullscreen="false" @close="closefunc">
                <div slot="header"></div>
            
                <div slot="body">
                    <div class="p-3 mt-2">
                        <div class="flex-container-row pb-4">
                            <h2 class="flex-item">Vote for {{ name }}?</h2>
                        </div>
                        <div class="flex-container-row pb-4">
                            <p class="flex-item">You can only vote once. Your vote cannot be changed later.</p>
                        </div>
                
                        <div class="flex-container-row">
                            <a @click="backfunc" href="#" class="flex-item btn btn-secondary bkgd-pink m-2 back-btn">Back</a>
                            <a @click="votefunc(name)" v-bind:class="{ 'disabled': !canVote }" href="#" class="flex-item btn btn-primary bkgd-pink m-2">Vote for {{ name }}</a>
                        </div>

                        <div v-if="conditionalbuttoninfo.hasConditional" class="flex-container-row">
                            <a href="#" class="flex-item btn btn-primary bkgd-pink m-2" @click="conditionalBtn.method()">{{ conditionalBtn.buttonName }}</a>
                        </div>
                    </div>
                </div>
            </modal>
        `
    })

    /*
        item = {
            image: "",
            name: "",


        }
    */
    Vue.component('modal-image-votebar', {
        props: ["closefunc", "votefunc", "onclickbar", "bartext", "item", "voted"],
        computed: {
            modalStyles() {
                return "background: url('" + this.item.image +
                    "'); background-position: center; background-size: cover; border:none";
            },
            votedFor() {
                return this.voted && this.item.voted;
            },
            notVotedFor() {
                return this.voted && !this.item.voted; // 
            }
        },
        template: /* html */ `
            <modal v-bind:hidex="false" v-bind:isfullscreen="true" @close="closefunc">
                <div slot="header"></div>
                <div slot="body">
                    <h4 class="avatar-name color-main">{{ item.name }}</h4>
                    <div class="card card-image modal-image flex-item" v-bind:style="modalStyles"></div>
                    <div v-bind:class="{ 'vote-avatar-bar': !voted, 'votedfor-avatar-bar': votedFor, 'notvotedfor-avatar-bar': notVotedFor }" v-on:click="onclickbar" class="flex-container-row avatar-bar">
                        <div v-if="item.voted || !voted" v-bind:class="{ 'fill': item.voted}" class="flex-item stroke stroke-pink avatar-icon-fill text-size-icon icon icon-check"></div>
                        <h4 class="flex-item bold txt-modal-body">{{ bartext }}</h4>
                    </div>
                </div>
            </modal>
        `
    })

    // ****


    Vue.component('loggedin-modal', {
        props: ['loggedin'],
        template: /* html */ `
            <modal v-bind:alert="true" v-if="!loggedin" v-bind:hidex="true" @close="">
                <div slot="header"></div>
                <div slot="body">
                    <h2 class="color-main">You must be logged in to vote!</h2>
                    <p>Please log in.</p>
                </div>
                <div slot="footer" class="text-center"></div>
            </modal>
            `
    })

    Vue.component('unload-modal', {
        props: ['unload'], // v-if="dataStore.unload"
        template: /* html */ `
            <modal v-bind:alert="true" v-if="unload" v-bind:hidex="true" @close="">
                <div slot="header"></div>
                <div slot="body">

                    <div class="pt-5 flex-container-row">
                        <h2 class="color-main flex-item">Thanks for Voting!</h2>
                    </div>
                    <div class="pt-5 flex-container-row">
                        <p class="flex-item">The event is complete. This app will remove itself in 10 seconds.</p>
                    </div>

                </div>
                <div slot="footer" class="text-center"></div>
            </modal>
        `
    })


    Vue.component('loading-modal', {
        props: ['loading'],
        template: /* html */ `
            <modal v-bind:alert="true" v-if="loading" v-bind:hidex="true" @close="">
                <div slot="header"></div>
                <div slot="body">
                    <div class="pt-5 flex-container-row">
                        <div class="loading-container flex-item">
                            <div class="loading-icon"></div>
                        </div>
                    </div>
                    <div class="flex-container-row">
                        <h2 class="color-main flex-item">Loading</h2>
                    </div>
                    
                </div>
                <div slot="footer" class="text-center"></div>
            </modal>
        `
    })

    Vue.component('navigation', {
        props: {
            polls: { type: Object }
        },
        template: /* html */ `
            <nav>
                <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">
                    <a class="nav-item nav-link ml-2 active" id="info-tab" data-toggle="tab" href="#info" role="tab"
                    aria-controls="info" aria-selected="true">Info</a>
                    <a class="nav-item nav-link" id="nav-domains-tab" data-toggle="tab" href="#nav-domains" role="tab"
                    aria-controls="nav-domains" aria-selected="false">Favorite Domain</a> 
                    <a class="nav-item nav-link mr-2" id="nav-avatars-tab" data-toggle="tab" href="#nav-avatars" role="tab"
                    aria-controls="nav-avatars" aria-selected="false">Favorite Avatar</a>
                </div>
            </nav>
        `
    })


    Vue.component('infotab', {
        methods: {
            goto() {

                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO
                }));
            }
        },
        template: /* html */ `
            <div class="tab-pane fade show active" id="info" role="tabpanel" aria-labelledby="info-tab">
                <div class="p-2">

                    <div class="jumbotron jumbotron-fluid">
                    </div>

                    <h4 class="color-main">Holiday Tree Decorating Contest</h4>
                    <p class="fs-18 mt-3">
                        In a flurry of tinsel, the contestants decorated these trees using ONLY items from the marketplace. 
                    </p>

                    <p class="fs-18">
                        Now you vote for the winner.
                    </p>
                    <p class="fs-18 mt-3">
                        Voting closes Dec 20, 4:30pm PST
                    </p>
                </div>

                <div class="p-2">
                    <p class="fs-18">
                        ** Must visit trees to vote.
                    </p>

                </div>
            </div>
        `
    })

/* OLD
    Vue.component('domainlist', {
        props: {
            flagvisited: { type: Boolean },
            visitedalldomains: { type: Boolean },
            domains: { type: Array },
            open: { type: Boolean },
            voted: { type: Boolean } // *** 
        },
        computed: {
            groupedItems() {

                console.log("domains are : " + this.domains + typeof this.domains);

                var grouped = [];
                var index = -1;
                if (this.domains) {
                    for (var i = 0; i < this.domains.length; i++) {
                        if (i % 2 == 0) {
                            index++;
                            grouped[index] = [];
                            grouped[index].id = index;
                        }
                        grouped[index].push(this.domains[i]);
                    }
                }

                if (grouped.length && grouped[index].length === 1) {
                    grouped[index].push({ hidden: true });
                }
                return grouped;
            },
            getTitle() {
                if (!this.visitedalldomains) {
                    return "Visit the entries then vote:";
                } else if (this.voted) {
                    return "Thanks for voting!";
                } else {
                    return "Vote for your favorite!";
                }
            }
        },
        methods: {
            closeVisitedModal() {
                this.isVisitedModalVisible = false;
                this.showedVisited = true;
            }
        },
        data() {
            return {
                isVisitedModalVisible: false,
                showedVisited: false
            };
        },
        watch: {
            visitedalldomains: function (newVal, oldVal) {
                console.log("Visited all modals");
                if (newVal === true && oldVal === false && this.voted === false) {
                    this.isVisitedModalVisible = true;
                }
            }
        },
        template: `
                <div class="tab-pane fade" id="nav-domains" role="tabpanel" aria-labelledby="nav-domains-tab">
                    <div v-if="open" class="p-2">
                        <h4 class="color-main">{{ getTitle }}</h4>
                        <template v-for="items in groupedItems">
                            <div class="row" :key="items.id">
                                <domaincard  v-for="item in items" :voted="voted" :domain="item" :key="item.name" :visitedalldomains="visitedalldomains"></domaincard>
                            </div>
                        </template>
                    </div>

                    <div v-if="!open" class="p-2 pt-5">
                        <h4 class="text-center color-main">Favorite Domain voting isn't open yet, please check back later.</h4>
                    </div>

                    <modal v-bind:alert="true" v-if="!showedVisited" v-show="isVisitedModalVisible" @close="closeVisitedModal">

                        <div slot="header">
                        </div>
                        
                        <div slot="body">
                            <div class="p-3 mt-2">
                                <h2 class="color-main">You've seen all the entries!</h2>
                                <div class="flex-container-row pb-4">
                                    <p class="flex-item">Now you can vote for your favorite</p>
                                </div>
                            
                                <div class="flex-container-row">
                                    <a href="#" class="flex-item btn btn-primary bkgd-pink" @click="closeVisitedModal">OK</a>
                                </div>
                            </div>
                        </div>
                        
                        <div slot="footer" class="text-center"></div>
                    </modal>

                </div>
            `
    })


    Vue.component('domaincard', {
        props: {
            visitedalldomains: { type: Boolean },
            domain: { type: Object },
            voted: { type: Boolean }
        },
        methods: {
            goto(domainName) {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO_DOMAIN,
                    value: domainName
                }));
                console.log(domainName);
            },
            votedomain(domainName) {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: VOTE_DOMAIN,
                    value: domainName
                }));
                console.log(domainName);
                this.closeVoteModal();
            },
            showVoteModal() {
                if (!this.domain.hidden && !this.voted) {
                    this.isVoteModalVisible = true;
                }
            },
            closeVoteModal() {
                console.log("closeVoteModal");
                this.isVoteModalVisible = false;
            },
        },
        computed: {
            styles() {
                return "background: linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0)), url('" + this.domain.image +
                    "'); background-position: center; background-size: cover;";
            },
            showCheckMark() {
                if (this.voted) {
                    return this.domain.voted;
                } else {
                    return this.visitedalldomains;
                }
            },
        },
        data() {
            return {
                isVoteModalVisible: false
            };
        },
        template: `
        <div class="col-sm">
            <div class="card card-image" v-bind:class="{ 'ghost': domain.hidden, 'card-visited': domain.visited }" v-bind:style="styles">

                <div class="card-body" v-bind:class="{ 'voted-domain': domain.voted }">
                    <h4 class="card-title txt-color-white">{{ domain.displayName }}</h4>
                    <div class="align-bottom-wrapper">
                        <div v-if="!visitedalldomains" class="align-bottom-left">{{ domain.visited ? "Visited." : "" }}</div> 
                        <div v-if="showCheckMark" v-on:click="showVoteModal" v-bind:class="{ 'fill': domain.voted }" class="align-bottom-left stroke text-size-icon icon icon-check"></div>
                        <a href="#" class="align-bottom-right btn go-button" v-on:click="goto(domain.name)"></a>
                    </div>
                </div>
            </div>

            <modal v-show="isVoteModalVisible" v-bind:alert="true" v-bind:hidex="false" v-bind:isavatar="false" @close="closeVoteModal">
                <div slot="header"></div>
            
                <div slot="body">
                    <div class="p-3 mt-2">
                        <div class="flex-container-row pb-4">
                            <h2 class="flex-item">Vote for {{ domain.displayName }}?</h2>
                        </div>
                        <div class="flex-container-row pb-4">
                            <p class="flex-item">You can only vote once. Your vote cannot be changed later.</p>
                        </div>
                
                        <div class="flex-container-row">
                            <a href="#" class="flex-item btn btn-secondary bkgd-pink m-2 back-btn" @click="closeVoteModal">Back</a>
                            <a href="#" class="flex-item btn btn-primary bkgd-pink m-2" @click="votedomain(domain.name)">Vote for {{ domain.displayName }}</a>
                        </div>
                    </div>
                </div>
            </modal>
        </div>
        `
    })
    */

    Vue.component('domainlist', {
        props: {
            flagvisited: { type: Boolean },
            visitedalldomains: { type: Boolean },
            domains: { type: Array },
            open: { type: Boolean },
            voted: { type: Boolean } // *** 
        },
        computed: {
            groupedItems() {

                var grouped = [];
                var index = -1;
                if (this.domains) {
                    for (var i = 0; i < this.domains.length; i++) {
                        if (i % 2 == 0) {
                            index++;
                            grouped[index] = [];
                            grouped[index].id = index;
                        }
                        grouped[index].push(this.domains[i]);
                    }
                }

                if (grouped.length && grouped[index].length === 1) {
                    grouped[index].push({ hidden: true });
                }
                return grouped;
            },
            getTitle() {
                if (!this.visitedalldomains) {
                    return "Visit the entries then vote:";
                } else if (this.voted) {
                    return "Thanks for voting!";
                } else {
                    return "Vote for your favorite!";
                }
            }
        },
        methods: {
            closeVisitedModal() {
                this.isVisitedModalVisible = false;
                this.showedVisited = true;
            }
        },
        data() {
            return {
                isVisitedModalVisible: false,
                showedVisited: false
            };
        },
        watch: {
            visitedalldomains: function (newVal, oldVal) {
                console.log("Visited all modals");
                if (newVal === true && oldVal === false && this.voted === false) {
                    this.isVisitedModalVisible = true;
                }
            }
        },
        template: /* html */ `
                <div class="tab-pane fade" id="nav-domains" role="tabpanel" aria-labelledby="nav-domains-tab">
                    <div v-if="open" class="p-2">
                        <h4 class="color-main">{{ getTitle }}</h4>
                        <template v-for="items in groupedItems">
                            <div class="row" :key="items.id">
                                <domaincard  v-for="item in items" :voted="voted" :domain="item" :key="item.name" :visitedalldomains="visitedalldomains"></domaincard>
                            </div>
                        </template>
                    </div>

                    <div v-if="!open" class="p-2 pt-5">
                        <h4 class="text-center color-main">Favorite Domain voting isn't open yet, please check back later.</h4>
                    </div>

                    <modal v-bind:alert="true" v-if="!showedVisited" v-show="isVisitedModalVisible" @close="closeVisitedModal">

                        <div slot="header">
                        </div>
                        
                        <div slot="body">
                            <div class="p-3 mt-2">
                                <h2 class="color-main">You've seen all the entries!</h2>
                                <div class="flex-container-row pb-4">
                                    <p class="flex-item">Now you can vote for your favorite</p>
                                </div>
                            
                                <div class="flex-container-row">
                                    <a href="#" class="flex-item btn btn-primary bkgd-pink" @click="closeVisitedModal">OK</a>
                                </div>
                            </div>
                        </div>
                        
                        <div slot="footer" class="text-center"></div>
                    </modal>

                </div>
            `
    })

    Vue.component('domaincard', {
        props: {
            visitedalldomains: { type: Boolean },
            domain: { type: Object },
            voted: { type: Boolean }
        },
        methods: {
            goto(domainName) {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO_DOMAIN,
                    value: domainName
                }));
                console.log(domainName);
            },
            votedomain(domainName) {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: VOTE_DOMAIN,
                    value: domainName
                }));
                console.log(domainName);
                this.closeVoteModal();
            },
            showVoteModal() {
                if (!this.domain.hidden && !this.voted) {
                    this.isVoteModalVisible = true;
                }
            },
            closeVoteModal() {
                console.log("closeVoteModal");
                this.isVoteModalVisible = false;
            }
        },
        computed: {
            styles() {
                return "background: linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0)), url('" + this.domain.image +
                    "'); background-position: center; background-size: cover;";
            },
            showCheckMark() {
                if (this.voted) {
                    return this.domain.voted;
                } else {
                    return this.visitedalldomains;
                }
            },
            conditionalButtonInfo() {
                return { hasConditional: false };
            }
        },
        data() {
            return {
                isVoteModalVisible: false
            };
        },
        template: /* html */ `
        <div class="col-sm">
            <div class="card card-image" v-bind:class="{ 'ghost': domain.hidden, 'card-visited': domain.visited }" v-bind:style="styles">

                <div class="card-body" v-bind:class="{ 'voted-domain': domain.voted }">
                    <h4 class="card-title txt-color-white">{{ domain.displayName }}</h4>
                    <div class="align-bottom-wrapper">
                        <div v-if="!visitedalldomains" class="align-bottom-left">{{ domain.visited ? "Visited." : "" }}</div> 
                        <div v-if="showCheckMark" v-on:click="showVoteModal" v-bind:class="{ 'fill': domain.voted }" class="align-bottom-left stroke text-size-icon icon icon-check"></div>
                        <a href="#" class="align-bottom-right btn go-button" v-on:click="goto(domain.name)"></a>
                    </div>
                </div>
            </div>

            <modal-vote 
                v-show="isVoteModalVisible"
                :closefunc="closeVoteModal"
                :backfunc="closeVoteModal"
                :isfullscreen="false"
                :votefunc="votedomain"
                :name="domain.name"
                :conditionalbuttoninfo="conditionalButtonInfo"
            ></modal-vote>

        </div>
        `
    })

    Vue.component('avatarlist', {
        props: {
            avatars: { type: Array },
            open: { type: Boolean },
            voted: { type: Boolean }, // ***
            visited: { type: Boolean }
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

                if (grouped.length && grouped[index].length < 3) {
                    grouped[index].push({ hidden: true });
                    if (grouped[index].length === 2) {
                        grouped[index].push({ hidden: true });
                    }
                }
                return grouped;
            }
        },
        template: /* html */ `
            <div  class="tab-pane fade" id="nav-avatars" role="tabpanel" aria-labelledby="nav-avatars-tab">
                <div v-if="!open" class="p-2 pt-5">
                    <h4 class="color-main">Holiday Tree Decorating Contest isn't open yet, please check back later.</h4>
                    
                    <p class="fs-18 mt-3">
                        Trees decorated in TheSpot: Dec 19, 3:00pm-4:00pm PST
                    </p>
                    
                    <p class="fs-18 mt-3">
                        Voting opens: Dec 19, 4:30pm PST
                    </p>

                    <p class="fs-18 mt-3">
                        Voting closes: Dec 20, 4:30pm PST
                    </p>

                </div>
                <div v-if="open" class="p-2">
                    <h4 class="color-main">{{ voted ? "Thanks for voting!" : "Vote for your favorite!" }}</h4>
                    <template v-for="items in groupedItems">
                        <div class="row" :key="items.id">
                            <avatarcard  v-for="item in items" :voted="voted" :avatar="item" :key="item.name" :visited="visited"></avatarcard>
                        </div>
                    </template>
                </div>
            </div>
        `
    })

    Vue.component('avatarcard', {
        props: {
            avatar: { type: Object },
            voted: { type: Boolean },
            visited: { type: Boolean }
        },
        methods: {
            voteavatar(avatarName) {
                EventBridge.emitWebEvent(JSON.stringify({
                    type: VOTE_AVATAR,
                    value: avatarName
                }));
                console.log(avatarName);
                this.closeVoteModal();

            },
            showAvatarInfoModal() {
                if (!this.avatar.hidden) {
                    this.isAvatarInfoModalVisible = true;
                }
            },
            closeAvatarInfoModal() {
                this.isAvatarInfoModalVisible = false;
            },

            showVoteModal() {
                if (!this.avatar.hidden && !this.voted) {
                    this.isVoteModalVisible = true;
                    this.isAvatarInfoModalVisible = false;
                }
            },
            closeVoteModal() {
                this.isVoteModalVisible = false;
                this.isAvatarInfoModalVisible = true;
            },
            closeBothModals() {
                this.isVoteModalVisible = false;
                this.isAvatarInfoModalVisible = false;
            },

            goto() {

                EventBridge.emitWebEvent(JSON.stringify({
                    type: GOTO
                }));
            },


        },
        data() {
            return {
                isAvatarInfoModalVisible: false,
                isVoteModalVisible: false,
            };
        },
        computed: {
            cardStyles() {

                if (this.avatar && this.avatar.image && this.avatar.image.length && this.avatar.image.length > 5) {
                    var str = this.avatar.image;
                    var urlLength = str.length;
                    var charAt4 = str.charAt(urlLength - 4); // .png/.jpg
                    var charAt5 = str.charAt(urlLength - 5); // .jpeg

                    var index = -1;
                    if (charAt4 === "." || charAt5 === ".") {
                        index = charAt4 === "." ? urlLength - 4 : urlLength - 5;
                    }

                    var root = str.slice(0, index);
                    var end = str.slice(index, urlLength);

                    var thumbnail = "-thumbnail";

                    var styles = "background: linear-gradient(rgba(255,255,255,0), rgba(255,255,255,0)), url('" + root + thumbnail + end +
                        "'); background-position: center; background-size: cover;"

                    if (!this.avatar.voted) {
                        styles += "border:none";
                    }

                    return styles;
                }
            },
            voteBarText() {

                if (!this.voted) {
                    return "  Vote for " + this.avatar.name;
                } else {
                    // voted already
                    if (this.avatar.voted) {
                        return "  Voted!";
                    } else {
                        return "Thanks for voting!";
                    }
                }
            },
            votedFor() {
                return this.voted && this.item.voted;
            },
            conditionalButtonInfo() {
                return { hasConditional: false };
            }
        },
        template: /* html */ `
        <div class="col-sm">
            <div @click="showAvatarInfoModal">
                <div class="card card-image avatar-card" v-bind:class="{ 'ghost': avatar.hidden, 'card-visited': avatar.voted, 'voted-domain': avatar.voted }" v-bind:style="cardStyles">

                    <div class="align-bottom-wrapper-avatar">
                        <div v-if="votedFor" class="align-bottom-left fill stroke text-size-icon icon icon-check"></div>
                    </div>
                
                </div>
                <p class="card-title bold text-center">{{ avatar.name }}</p>
            </div>

            <modal-image-votebar 
                v-show="isAvatarInfoModalVisible"
                :closefunc="closeAvatarInfoModal", 
                :onclickbar="showVoteModal", 
                :bartext="voteBarText", 
                :item="avatar", 
                :voted="voted"
            ></modal-image-votebar>

            <modal-vote 
                v-show="isVoteModalVisible"
                :closefunc="closeBothModals"
                :backfunc="closeVoteModal"
                :isfullscreen="false"
                :votefunc="voteavatar"
                :name="avatar.name"
                :hasconditional="false"
                :conditionalbuttoninfo="conditionalButtonInfo"
            ></modal-vote>

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
                console.log("close");
                this.$emit('close');
            }
        },
        template: /* html */ `
        <transition name="modal-fade">
            <div class="modal-backdrop">
                <div class="modal" v-bind:class="{ 'modal-alert': alert }" > 
                    <header class="modal-header">
                        <slot name="header"></slot>
                        <button v-if="!hidex" type="button" class="btn-close" @click="close">
                            <div data-icon="w" class="icon"></div>
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

    // App
    var app = new Vue({
        el: '#app',
        data: {

            dataStore: {
                unload: false,
                loading: true,
                loggedin: true,
                visited: false,
                voted: {
                    domain: false,
                    avatar: false
                },
                openPolls: {
                    avatar: true,
                    domain: true
                },
                visitedAllDomains: false,
                domains: [
                    { "name": "Warroom", "image": "", "visited": false, "index": -1, "voted": false }
                ],
                avatars: [
                    {
                        "name": "Anchovy", "image": "http://hifi-content.s3-us-west-1.amazonaws.com/robin/robinStuff/voteAppTestPhotos/anchovy.png"
                        , voted: false
                    },
                    {
                        "name": "Andy", "image": "http://hifi-content.s3-us-west-1.amazonaws.com/robin/robinStuff/voteAppTestPhotos/andy.png",
                        voted: false
                    }
                ]
            }
        }
    });

    // Procedural
    function onScriptEventReceived(message) {
        console.log("HELLO ROBIN");
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

        Script.setTimeout(function () {
            
            // Open the EventBridge to communicate with the main script.
            EventBridge.scriptEventReceived.connect(onScriptEventReceived);
            EventBridge.emitWebEvent(JSON.stringify({
                type: EVENT_BRIDGE_OPEN_MESSAGE
            }));

        }, 200);
    }

    // Main 
    document.addEventListener('DOMContentLoaded', onLoad, false);

}());
