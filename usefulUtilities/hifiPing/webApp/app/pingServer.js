// Setting up local https support
var http = require('http');
var parseQueryString = require('querystring');
var webpush = require('web-push');
var dbInfo = require('./secrets/dbInfo.json');
var vapidKeysFile = require('./secrets/vapidKeys.json');

webpush.setVapidDetails('mailto:admin@highfidelity.co',
    vapidKeysFile.publicKey,
    vapidKeysFile.privateKey
);


function saveSubscriptionToDatabase(body, response) {
    var query = `REPLACE INTO \`subscriptions\` (username, subscription)
        VALUES ('${body.username}', '${JSON.stringify(body.subscription)}')`;

    connection.query(query, function (error) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while saving subscription! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({
            data: {
                "success": true
            }
        }));
    });
}


function handleNewSubscription(body, response) {
    if (!body.subscription || !body.subscription.endpoint) {
        var responseObject = {
            status: "error",
            text: "Subscription must have an endpoint.",
            body: body
        };

        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }

    saveSubscriptionToDatabase(body, response);
}


function deleteSubscriptionFromDatabase(username, response) {
    var query = `DELETE FROM \`subscriptions\` WHERE username="${username}"`;

    connection.query(query, function (error) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while deleting subscription from DB! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
        
        var responseObject = {
            status: "success"
        };

        response.statusCode = 410;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    });
}


function sendNotification(username, subscription, payloadText, response) {
    return webpush.sendNotification(subscription, payloadText)
        .then(() => {
            var responseObject = {
                status: "success"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        })
        .catch((err) => {
            console.log(JSON.stringify(err));
            if (err.statusCode === 410) {
                deleteSubscriptionFromDatabase(username, response)
            } else {
                var responseObject = {
                    status: "error",
                    text: "Subscription is no longer valid."
                };
    
                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            }
        });
}


function getSubscriptionFromDatabase(targetUsername, senderDisplayName, senderHref, response) {
    var query = `SELECT * FROM \`subscriptions\` WHERE username='${targetUsername}'`;

    connection.query(query, function (error, results) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while retrieving subscription! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        // We don't want anyone to know that the server doesn't have that username in the DB
        if (results.length === 0) {
            console.log("User tried to send a notification to someone who isn't in the DB: " + targetUsername);
            var responseObject = {
                status: "success"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        } else if (results.length > 1) {
            var responseObject = {
                status: "error",
                text: "Error while retrieving subscription! Multiple results returned..."
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var subscription;
        try {
            subscription = JSON.parse(results[0].subscription);
        } catch (error) {
            var responseObject = {
                status: "error",
                text: `Error while parsing subscription from DB! ${error}`
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var payloadText = JSON.stringify({
            "targetUsername": targetUsername,
            "senderDisplayName": senderDisplayName,
            "senderHref": senderHref
        });
        sendNotification(targetUsername, subscription, payloadText, response);
    });
}


function handlePushRequest(body, response) {
    getSubscriptionFromDatabase(body.targetUsername, body.senderDisplayName, body.senderHref, response);
}


// Handles all POST requests made to the server.
function handlePostRequest(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        try {
            body = JSON.parse(body);
        } catch (error) {
            try {
                body = parseQueryString.parse(body);
            } catch (error) {
                var responseObject = {
                    status: "error",
                    text: "Error handling POST request!"
                };

                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            }
        }

        if (request.url === "/api/hifiPing/subscription") {
            handleNewSubscription(body, response);
        } else if (request.url === "/api/hifiPing/push") {
            handlePushRequest(body, response);
        } else {
            var responseObject = {
                status: "error",
                text: "Invalid request type provided!"
            };

            response.statusCode = 501;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
    })
}

function startServer() {
    const server = http.createServer((request, response) => {
        response.setHeader('Access-Control-Allow-Origin', '*');

        if (request.method === "POST") {
            handlePostRequest(request, response);
        } else if (request.method === "OPTIONS") {
            response.statusCode = 200;
            response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
            response.setHeader('Access-Control-Allow-Headers', 'content-type');
            return response.end();
        } else {
            response.writeHead(405, 'Method Not Supported', { 'Content-Type': 'text/html' });
            return response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
        }
    })

    const HOSTNAME = 'localhost';
    const PORT = 3004;
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Ping App Server running at http://${HOSTNAME}:${PORT}/`);
    });
}


// Connects to the DB
var mysql = require('mysql');
var connection;
function connectToDB() {
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword,
        database: dbInfo.databaseName
    });

    connection.connect(function (error) {
        if (error) {
            throw error;
        }

        startServer();
    });
}


function maybeCreateTables() {
    var query = `CREATE TABLE IF NOT EXISTS \`subscriptions\` (
        username VARCHAR(100) PRIMARY KEY,
        subscription VARCHAR(500)
    )`;

    connection.query(query, function (error, results, fields) {
        if (error) {
            throw error;
        }
        connection.end();

        connectToDB();
    });
}


function maybeCreateDB() {
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword
    });

    var query = `CREATE DATABASE IF NOT EXISTS ${dbInfo.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    connection.query(query, function (error) {
        if (error) {
            connection.end();
            throw error;
        }

        connection = mysql.createConnection({
            host: dbInfo.mySQLHost,
            user: dbInfo.mySQLUsername,
            password: dbInfo.mySQLPassword,
            database: dbInfo.databaseName
        });
    
        maybeCreateTables();
    });
}


function startup() {
    maybeCreateDB();
}


startup();
