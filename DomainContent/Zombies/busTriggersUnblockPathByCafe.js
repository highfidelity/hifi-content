(function() {
    var AMBULANCE_BLOCKING_PATH_BY_CAFE = "{3f1e4501-622d-44c9-a353-7278a98b2142}";
    print("bus zone");
    this.enterEntity = function() {
        print("entered bus zone");
        if (Entities.getEntityProperties(AMBULANCE_BLOCKING_PATH_BY_CAFE,'visible').visible) {
            print("unblock path");
            Entities.editEntity(AMBULANCE_BLOCKING_PATH_BY_CAFE, {
                visible: false,
                collisionless: true
            });
        }
    };
});