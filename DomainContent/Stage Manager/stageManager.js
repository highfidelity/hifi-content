//
//  stageManager.js
//
//  Created by Rebecca Stankus on 06/11/18
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html

(function() {
    var TABLET_BUTTON_IMAGE = Script.resolvePath('svg/megaphone-i.svg');
    var TABLET_BUTTON_PRESSED = Script.resolvePath('svg/megaphone-a.svg');
    var SEARCH_RADIUS = 100;

    var tablet = Tablet.getTablet('com.highfidelity.interface.tablet.system');
    var appPage = Script.resolvePath('stageManager.html?1235');
    var button = tablet.addButton({
        text: 'STAGE',
        icon: TABLET_BUTTON_IMAGE,
        activeIcon: TABLET_BUTTON_PRESSED
    });
    var open = false;

    function onClicked() { 
        if (open) {
            tablet.gotoHomeScreen();
        } else {
            tablet.gotoWebScreen(appPage);
        }
    }

    function onWebEventReceived(event) {
        if (typeof event === 'string') {
            event = JSON.parse(event);
            if (event.app === 'stage') {
                switch (event.type) {
                    case 'addTrivia':
                        addTrivia();
                        break;
                    case 'addTriviaCollisions':
                        addTriviaCollisions();
                        break;
                    case 'removeTrivia':
                        removeTrivia();
                        break;
                    case 'avatarContestVisible':
                        avatarContestVisible();
                        break;
                    case 'avatarContestCollisions':
                        avatarContestCollisions();
                        break;
                    case 'removeAvatarContest':
                        removeAvatarContest();
                        break;
                    case 'modelURL':
                        modelURL();
                        break;
                    default:
                        print("error in detecting event.type");
                }
            }
        }
    }

    function addTrivia() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name.indexOf("Trivia") !== -1) {
                if (name.indexOf("Light") === -1 && name.indexOf("Zone") === -1 && name.indexOf("Bubble") === -1 
                    && name.indexOf("Correct") === -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        visible: true,
                        collisionless: true
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                } else {
                    if (name.indexOf("Zone") !== -1) {
                        if (name.indexOf("Counter") === -1 && name.indexOf("Marker") === -1) {
                            Entities.editEntity(nearbyEntity, {
                                locked: false
                            });
                            Entities.editEntity(nearbyEntity, {
                                script: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Trivia/Version2/triviaZone.js"
                            });
                            Entities.editEntity(nearbyEntity, {
                                locked: true
                            });
                        } else if (name.indexOf("Counter") !== -1) {
                            Entities.editEntity(nearbyEntity, {
                                locked: false
                            });
                            Entities.editEntity(nearbyEntity, {
                                script: "http://hifi-content.s3-us-west-1.amazonaws.com/rebecca/Trivia/Version2/gameZone.js"
                            });
                            Entities.editEntity(nearbyEntity, {
                                locked: true
                            });
                        }
                    } else if (name.indexOf("Bubble") === -1) {
                        Entities.editEntity(nearbyEntity, {
                            locked: false
                        });
                        Entities.editEntity(nearbyEntity, {
                            collisionless: true
                        });
                        Entities.editEntity(nearbyEntity, {
                            locked: true
                        });
                    }
                }
            }
        });
    }

    function addTriviaCollisions() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name.indexOf("Trivia") !== -1) {
                if (name.indexOf("Light") === -1 && name.indexOf("Zone") === -1 && name.indexOf("Bubble") === -1 
                    && name.indexOf("Correct") === -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        visible: true,
                        collisionless: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                }
            }
        });
    }

    function removeTrivia() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name.indexOf("Trivia") !== -1) {
                if (name.indexOf("Zone") !== -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        script: ""
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                } else {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        visible: false,
                        collisionless: true
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                }
            }
        });
    }

    function avatarContestVisible() {
        Entities.editEntity("{c0d78e3d-c9a2-4736-a74c-7aef520dd06e}", {
            locked: false
        });
        Entities.editEntity("{c0d78e3d-c9a2-4736-a74c-7aef520dd06e}", {
            visible: false
        });
        Entities.editEntity("{c0d78e3d-c9a2-4736-a74c-7aef520dd06e}", {
            locked: true
        });
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name.indexOf("Fashion") !== -1 && name.indexOf("SitCube") === -1) {
                Entities.editEntity(nearbyEntity, {
                    locked: false
                });
                Entities.editEntity(nearbyEntity, {
                    visible: true
                });
                Entities.editEntity(nearbyEntity, {
                    locked: true
                });
            }
        });
    }

    function avatarContestCollisions() {
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name.indexOf("Fashion") !== -1) {
                if (name.indexOf("SitCube") !== -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        script: "https://hifi-production.s3.amazonaws.com/robin/sit/sitPrototypes/sit.js"
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                }
                if (name.indexOf("Zone") !== -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        script: "https://hifi-content.s3.amazonaws.com/robin/dev/domains/faceToFace/bouncerZone/F2FBouncerZone.js?098"
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                }
                Entities.editEntity(nearbyEntity, {
                    locked: false
                });
                Entities.editEntity(nearbyEntity, {
                    collisionless: false
                });
                Entities.editEntity(nearbyEntity, {
                    locked: true
                });
            } 
        });
    }

    function removeAvatarContest() {
        Entities.editEntity("{c0d78e3d-c9a2-4736-a74c-7aef520dd06e}", {
            locked: false
        });
        Entities.editEntity("{c0d78e3d-c9a2-4736-a74c-7aef520dd06e}", {
            visible: true
        });
        Entities.editEntity("{c0d78e3d-c9a2-4736-a74c-7aef520dd06e}", {
            locked: true
        });
        Entities.findEntities(MyAvatar.position, SEARCH_RADIUS).forEach(function(nearbyEntity) {
            var name = Entities.getEntityProperties(nearbyEntity, 'name').name;
            if (name.indexOf("Fashion") !== -1) {
                if (name.indexOf("Zone") !== -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        script: ""
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                } else if (name.indexOf("SitCube") !== -1) {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        script: ""
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                } else {
                    Entities.editEntity(nearbyEntity, {
                        locked: false
                    });
                    Entities.editEntity(nearbyEntity, {
                        visible: false,
                        collisionless: true
                    });
                    Entities.editEntity(nearbyEntity, {
                        locked: true
                    });
                }
            }
        });
    }

    function modelURL() {
        
        Entities.editEntity("{eac8cc87-e967-4269-ad77-1e59c049fa5e}", {
            locked: false
        });
        Entities.editEntity("{eac8cc87-e967-4269-ad77-1e59c049fa5e}", {
            modelURL: ""
        });
        Entities.editEntity("{eac8cc87-e967-4269-ad77-1e59c049fa5e}", {
            modelURL: "https://cdn.highfidelity.com/DomainContent/production/TheSpot-LoadTest-201810/hub-v5-trivia/baked/hub-v5-trivia.baked.fbx?"
        });
        Entities.editEntity("{eac8cc87-e967-4269-ad77-1e59c049fa5e}", {
            locked: true
        });
    }

    function onScreenChanged(type, url) {
        open = (url === appPage);
        button.editProperties({isActive: open});
    }

    function appEnding() {
        button.clicked.disconnect(onClicked);
        tablet.removeButton(button);
        tablet.screenChanged.disconnect(onScreenChanged);
        tablet.webEventReceived.disconnect(onWebEventReceived);
    }
    
    button.clicked.connect(onClicked);
    tablet.screenChanged.connect(onScreenChanged);
    tablet.webEventReceived.connect(onWebEventReceived);

    Script.scriptEnding.connect(appEnding);
}());
