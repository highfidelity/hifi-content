(function () {
    console.log("running ws test");
    var WEBSOCKET_URL = "ws://tan-cheetah.glitch.me/";

    const TEST_MESSAGE = "This is a test message.";

    var webSocket = new WebSocket(WEBSOCKET_URL);

    webSocket.onmessage = function (event) {
        webSocket.close();
    };
    webSocket.onopen = function (event) {
        console.log("on open")
        webSocket.send(TEST_MESSAGE);
    };
    webSocket.onclose = function (event) {
    };

})();



"use strict";

process.title = 'node-chat';

// INIT
var webSocketServerPost = process.env.PORT,
    path = require('path'),
    fs = require('fs'),
    WebSocketServer = require('websocket').server,
    http = require('http');

// COLLECTION
var history = [],
    connectedUsernames = [],
    clients = [];

// CONST
var HISTORY = 'history',
    MESSAGE = 'message';

// HELPERS
function htmlEntities(str) {
    return String(str)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

var server = http.createServer((request, response) => { });

server.listen(webSocketServerPost, () => {
    console.log((new Date()) + " Server is listening on port " + webSocketServerPost);
    console.log(server.address());
});

var wsServer = new WebSocketServer({ httpServer: server });

wsServer.on('request', (request) => {
    //   console.log(test, Object.keys(request));

    //   for (var i = 0; i < Object.keys(request); i++) {
    //     console.log(
    //   }

    console.log((new Date()) + ' Connection from origin ' + request.origin + '.');

    var connection = request.accept(null, request.origin);

    var index = clients.push(connection) - 1;

    console.log((new Date()) + ' Connection accepted.');

    if (history.length > 0) {
        connection.sendUTF(
            JSON.stringify({
                type: MESSAGE,
                data: history.slice(-10),
                connectedUsernames: connectedUsernames
            })
        )
    }

    // MESSAGE TYPES
    var TYPE = "type";
    var NEW_USER = "newUser";
    var REMOVE_USER = "removeUser";
    var MESSAGE = "message";
    var USERNAME = "username";

    connection.on('message', (message) => {
        // var parseMessage = JSON.parse(message);
        if (message.type === 'utf8') {
            try {
                var parsedMessage = JSON.parse(message.utf8Data);
            } catch (e) {
                console.log(e);
            }
            console.log((new Date()) + ' Received Message from message.utf8Data');

            var type = parsedMessage[TYPE];

            var json;

            switch (type) {
                case NEW_USER:
                    var username = parsedMessage[USERNAME];
                    addUser(username);
                    break;
                case REMOVE_USER:
                    var username = parsedMessage[USERNAME];
                    removeUser(username);
                    break;
                default:
                    // regular message

                    var obj = {
                        time: (new Date()).getTime(),
                        text: parsedMessage.message,
                        author: parsedMessage.name || "miladn"
                    };
                    history.push(obj);
                    history = history.slice(-100);

                    var sendHistory = history.slice(-10);
                    var json = JSON.stringify({
                        type: MESSAGE,
                        data: sendHistory
                    });

                    break;

            }

            console.log(json);

            for (var i = 0; i < clients.length; i++) {
                clients[i].sendUTF(json);
            }
        }
    });

    function removeUser(username) {
        var index = connectedUsernames.indexOf(username);
        if (index !== -1) {
            connectedUsernames.splice(index, 1);
        }
    }

    function addUser(username) {
        if (connectedUsernames.indexOf(username) === -1) {
            connectedUsernames.push(username);
        }
    }

    connection.on('close', (connection) => {
        console.log((new Date()) + " Peer " + connection.remoteAddress + " disconnected.");
        clients.splice(index, 1);
    });
})
