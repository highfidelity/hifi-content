//
// statusIndicator_webApp.js
//
// NodeJS Web App for Status Indicator App
// Created by Robin Wilson on 2019-04-02
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/

var http = require('http');
var url = require('url');
var config = require('./config.json');
var request = require('request');
var DEBUG = 0;

// Returns the user's current status from the DB
function getStatus(queryParamObject, response) {
    var username = queryParamObject.username;
    if (!username) {
        var responseObject = {
            status: "error",
            text: "No username supplied!"
        };

        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }

    // build query string
    var query = `SELECT * FROM \`statusIndicator\` WHERE username='${username}'`;

    connection.query(query, function (error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while retrieving user status! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        // Default status is "Offline"
        var userStatus = "offline";

        if (results.length > 0) {
            userStatus = results[0].status;
        }

        var responseObject = {
            "status": "success",
            "data": {
                "userStatus": userStatus
            }
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    });
}


// Heartbeat updates setTimeout and updates employee data in database
var users = {}; // { username: { timer: <timer object>} }
function heartbeat(queryParamObject, response) {
    var username = queryParamObject.username;
    // handle heartbeat
    if (!users[username]) {
        // new heartbeat for username
        users[username] = {};
    } else {
        // stop the old heartbeat timer
        clearTimeout(users[username].timer);
    }
    users[username].timer = startHeartbeatTimer(username, response);

    if (username) {
        updateEmployee(queryParamObject, response);
    } else {
        console.error("There was no username or primary key! Can't update or create employee!");
        return;
    }
}


// If timer runs out, will set user to offline
var HEARTBEAT_INTERVAL_MS = 10000;
function startHeartbeatTimer(username, response) {
    if (heartbeatTimer) {
        heartbeatTimer
    }
    var heartbeatTimer = setTimeout(function () {
        // user has stopped sending heartbeat()
        // update user to offline
        if (users[username] && users[username].timer) {
            clearTimeout(users[username].timer)
            users[username].timer = null;
        }
        updateEmployee({
            username: username,
            status: "offline",
            location: "unknown"
        }, response);
    }, HEARTBEAT_INTERVAL_MS);
    return heartbeatTimer;
}


// Update employee status in database
function updateEmployee(updates, response) {
    if (DEBUG) {
        console.log("UPDATES: ", updates);
    }
    // Create strings for query from the updates object
    var columnString = ""; // (username, displayName, status, organization)
    var valueString = ""; // ('username1', 'Display Name', 'busy', 'HiFi')
    var updateString = ""; // username='username1', displayName='Display Name', status='busy', organization='HiFi'
    var validUpdateParams = ["username", "displayName", "status", "location", "organization"];
    for (var key in updates) {
        if (validUpdateParams.indexOf(key) === -1) {
            continue;
        }

        updateString += key + "=";
        columnString += key + ", ";

        if (!updates[key]) {
            updates[key] = "NULL";
        }
        valueString += connection.escape(updates[key]) + ", ";
        updateString += connection.escape(updates[key]) + ", ";
    }
    columnString = columnString.slice(0, -2); // slice off the last ", "
    valueString = valueString.slice(0, -2); // slice off the last ", "
    updateString = updateString.slice(0, -2); // slice off the last ", "

    // build query string
    var query = `INSERT INTO \`statusIndicator\` (${columnString}) VALUES (${valueString}) ON DUPLICATE KEY UPDATE ${updateString}`;

    if (DEBUG) {
        console.log(query);
    }

    connection.query(query, function (error, results, fields) {
        if (updates.status === "offline" && updates.username) {
            // do not have a response to send
            // client is disconnected
            delete users[updates.username];
            return;
        }

        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while updating employee! " + JSON.stringify(error)
            };

            console.log("updateEmployee error:" + JSON.stringify(error));

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var responseObject = {
            status: "success",
            text: "Successfully updated employee."
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    });
}


function formatMemberData(singleResultObject) {
    var location;
    if (singleResultObject.status === "busy") {
        location = "hidden";
    } else {
        location = singleResultObject.location || "unknown";
    }

    var displayName = singleResultObject.displayName;
    var status = singleResultObject.status;

    return {
        "displayName": displayName,
        "status": status,
        "location": location
    };
}

// Get all employees
// Return tables with all employee information
function getAllEmployees(organization, response) {
    if (!organization) {
        var responseObject = {
            status: "error",
            text: "You must specify an organization!"
        };

        response.statusCode = 400;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }

    var query = `SELECT * FROM statusIndicator 
        WHERE organization = '${organization}' 
        ORDER BY displayName`;

    connection.query(query, function (error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while retrieving ALL employees! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var responseObject = {
            "status": "success",
            "people": []
        };

        for (var i = 0; i < results.length; i++) {
            responseObject.people.push(formatMemberData(results[i]));
        }

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    });
}


function handleCanaryRequest(res) {
    // Checks that NGINX is serving the right page.
    var allEmployeesPageOK;
    var apiRouterOK = true; // Always true if we can get here!
    var sqlConnectionOK;
    request.get(
        config.wwwRoot + "allEmployees.html",
        {
            timeout: 15000
        },
        (error, response) => {
            allEmployeesPageOK = !error;

            var query = "SELECT 1;"
            connection.query(query, function (error, results, fields) {
                sqlConnectionOK = !error;

                // The `result` value should be a logical AND
                // of all of the subsystems whose status we check.
                var responseObject = {
                    result: apiRouterOK && allEmployeesPageOK && sqlConnectionOK,
                    systemStatus: {
                        apiRouter: {
                            status: apiRouterOK
                        },
                        http: {
                            allEmployeesPage: {
                                status: allEmployeesPageOK
                            }
                        },
                        database: {
                            status: sqlConnectionOK
                        }
                    }
                };
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(responseObject));
            });
        }
    );
}


// Handles any GET requests made to the server endpoint
// The handled method types are:
// "getStatus"
// "heartbeat"
// "getAllEmployees"
// "canary"
function handleGetRequest(request, response) {
    var queryParamObject = url.parse(request.url, true).query;
    var type = queryParamObject.type;

    switch (type) {
        case "getStatus":
            getStatus(queryParamObject, response);
        break;

        // Used when user's hifi client updates status
        case "heartbeat":
            heartbeat(queryParamObject, response);
        break;

        // Used when other entities such as zones or entities update status or location
        case "updateEmployee":
            updateEmployee(queryParamObject, response);
        break;

        case "getAllEmployees": // http://localhost:3305/?type=getAllEmployees&organization=org
            getAllEmployees(queryParamObject.organization, response);
            break;

        case "canary":
            handleCanaryRequest(response);
            break;

        default:
            response.statusCode = 501;
            response.setHeader('Content-Type', 'text/plain');
            return response.end(JSON.stringify(queryParamObject) + '\n');
    }
}


// Starts the NodeJS HTTP server.
function startServer() {
    const server = http.createServer((request, response) => {
        response.setHeader('Access-Control-Allow-Origin', '*');
        if (request.method === "GET") {
            handleGetRequest(request, response);
        } else {
            response.writeHead(405, 'Method Not Supported', { 'Content-Type': 'text/html' });
            response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
        }
    });

    const HOSTNAME = 'localhost';
    const PORT = 3305;
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Status App Server running at http://${HOSTNAME}:${PORT}/`);
    });
}


// Connects to the Status DB, then starts the HTTP server.
var mysql = require('mysql');
var connection;
function connectToStatusDB() {
    connection = mysql.createConnection({
        host: config.mySQLHost,
        user: config.mySQLUsername,
        password: config.mySQLPassword,
        database: config.databaseName
    });
    connection.connect(function (error) {
        if (error) {
            throw error;
        }
        startServer();
    });
}


// Creates the necessary tables for the Status Indicator app to work.
function maybeCreateNewTables(response) {
    var query = `CREATE TABLE IF NOT EXISTS \`statusIndicator\` (
        username VARCHAR(100) PRIMARY KEY,
        displayName VARCHAR(100),
        status VARCHAR(150) DEFAULT 'busy',
        location VARCHAR(100) DEFAULT 'unknown',
        organization VARCHAR(200) DEFAULT NULL
    )`;
    connection.query(query, function (error, results, fields) {
        if (error) {
            throw error;
        }
        connectToStatusDB();
    });
}


// Creates the database and tables
function maybeCreateStatusDB() {
    connection = mysql.createConnection({
        host: config.mySQLHost,
        user: config.mySQLUsername,
        password: config.mySQLPassword
    });

    var query = `CREATE DATABASE IF NOT EXISTS ${config.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    connection.query(query, function (error, results, fields) {
        if (error) {
            console.log("error with connection");
            throw error;
        }

        connection.end();

        connection = mysql.createConnection({
            host: config.mySQLHost,
            user: config.mySQLUsername,
            password: config.mySQLPassword,
            database: config.databaseName
        });

        maybeCreateNewTables();
    });
}


// Called on startup.
function startup() {
    maybeCreateStatusDB();
}

startup();