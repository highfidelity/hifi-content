(function() {
    console.log("running ws test");
    var WEBSOCKET_URL = "ws://tan-cheetah.glitch.me/";

    const TEST_MESSAGE = "This is a test message.";

    var webSocket = new WebSocket(WEBSOCKET_URL);
    
    webSocket.onmessage = function(event) {
        webSocket.close();
    };
    webSocket.onopen = function(event) {
        console.log("on open")
        webSocket.send(TEST_MESSAGE);
    };
    webSocket.onclose = function(event) {
    };

})();
