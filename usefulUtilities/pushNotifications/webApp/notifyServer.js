// Setting up local https support
const fs = require('fs');
const https = require('https');
const path = require('path');
const parseQueryString = require('querystring');
const webpush = require('web-push');
const dbInfo = require('./secrets/dbInfo.json');
const vapidKeysFile = require('./secrets/vapidKeys.json');
const crypto = require('crypto');

const vapidKeys = {
    publicKey: vapidKeysFile.publicKey,
    privateKey: vapidKeysFile.privateKey
};

webpush.setVapidDetails('mailto:admin@highfidelity.co',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);


function saveSubscriptionToDatabase(body, response) {
    var username = body.username;
    var query = `INSERT INTO \`subscriptions\` (username, subscription)
        VALUES (${username}, ${JSON.stringify(body)})`;

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
    if (!body || !body.endpoint) {
        var responseObject = {
            status: "error",
            text: "Subscription must have an endpoint."
        };

        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }

    saveSubscriptionToDatabase(body, response);
}


function deleteSubscriptionFromDatabase(username, response) {
    var query = `DELETE FROM \`subscriptions\` WHERE username=${username}`;

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

        response.statusCode = 410;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify({
            data: {
                "success": true
            }
        }));
    });
}


function sendNotification(username, subscription, dataToSend, response) {
    return webpush.sendNotification(subscription, dataToSend)
        .then(() => {
            var responseObject = {
                status: "success"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        })
        .catch((err) => {
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


function getSubscriptionFromDatabase(username, response) {
    var query = `SELECT * FROM \`subscriptions\` WHERE username='${username}'`;

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

        if (results.length === 0) {
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

        var dataToSend = {

        };

        sendNotification(username, results[0].subscription, dataToSend, response);
    });
}


function handlePushRequest(body, response) {
    getSubscriptionFromDatabase(body.username, response);
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

        if (request.url === "api/subscription") {
            handleNewSubscription(body, response);
        } else if (request.url === "api/push") {
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


function handleGetRequest(request, response) {
    var filePath = './www' + request.url;

    if (!filePath.endsWith("/") && path.extname(filePath) === "") {
        filePath += "/index.html";
    }

    if (filePath.endsWith("/")) {
        filePath += "index.html";
    }

    console.log(`Client requested: ${filePath}`);

    if (!fs.existsSync(filePath)) {
        response.writeHead(500);
        response.end(`File does not exist.`);
        return response.end();
    }

    var fileExtension = path.extname(filePath);
    var contentType = 'text/html';
    switch (fileExtension) {
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
    }

    fs.readFile(filePath, function (error, content) {
        if (error) {
            if (error.code == 'ENOENT') {
                response.writeHead(404);
                response.end(`File not found.\n`);
                return response.end();
            } else {
                response.writeHead(500);
                response.end(`Error while reading file: ${error.code}\n`);
                return response.end();
            }
        } else {
            response.writeHead(200, { 'Content-Type': contentType });
            return response.end(content, 'utf-8');
        }
    });
}


const SERVER_OPTIONS = {
    key: fs.readFileSync('./secrets/server.key'),
    cert: fs.readFileSync('./secrets/server.crt'),
    passphrase: require("./secrets/serverOptions.json").certPassphrase,
    requestCert: false,
    rejectUnauthorized: false
};
function startServer() {
    const server = https.createServer(SERVER_OPTIONS, (request, response) => {
        response.setHeader('Access-Control-Allow-Origin', '*');

        if (request.method === "POST") {
            handlePostRequest(request, response);
        } else if (request.method === "GET") {
            handleGetRequest(request, response);
        } else {
            response.writeHead(405, 'Method Not Supported', { 'Content-Type': 'text/html' });
            response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
        }
    })

    const HOSTNAME = 'localhost';
    const PORT = 3004;
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Notify App Server running at https://${HOSTNAME}:${PORT}/`);
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
        subscription VARCHAR(750)
    )`;

    connection.query(query, function (error, results, fields) {
        if (error) {
            throw error;
        }
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
            throw error;
        }
    });

    connection.end();

    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword,
        database: dbInfo.databaseName
    });

    maybeCreateTables();

    connection.end();
}


function startup() {
    maybeCreateDB();
    connectToDB();
}


startup();
