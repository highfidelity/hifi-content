(function() {

    var isOccupied = false;

    function SitServer() {

    }

    SitServer.prototype = {
        remotelyCallable: [
            "getOccupiedStatus",
            "onSitDown",
            "onStandUp"
        ],
        preload: function (id) {

        },

        getOccupiedStatus: function () {
            return isOccupied;
        },

        onSitDown: function () {
            isOccupied = true;
        },

        onStandUp: function () {
            isOccupied = false;
        }
    };

    return new SitServer();
});