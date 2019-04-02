//
// multiConVote.js
// NodeJS Web App for Multi-Con Festival App
// Created by Robin Wilson and Zach Fox on 2019-03-11
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

// user status: <"available"/"busy"/"offline">

var http = require('http');
var url = require('url');
var dbInfo = require('./dbInfo.json');


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

// if timer runs out, will set user to offline
var HEARTBEAT_INTERVAL_MS = 10000;
function startHeartbeatTimer(username, response) {
    var heartbeatTimer = setTimeout(function() {
        // user has stopped sending heartbeat()
        // update user to offline
        users[username].timer = null;
        updateEmployee({
            username: username,
            status: "offline"
        }, response);
    }, HEARTBEAT_INTERVAL_MS);
    return heartbeatTimer;
}

function updateEmployee(updates, response) {
    // Create strings for query from the updates object
    var columnString = ""; // (username, displayName, status)
    var valueString = ""; // (username1, Display Name, busy)
    var updateString = ""; // username=username1, displayName=Display Name, status=busy
    var validUpdateParams = ["username", "displayName", "status", "teamName"];
    for (var key in updates) {
        if (validUpdateParams.indexOf(key) === -1) {
            continue;
        }

        updateString += key + "=";
        columnString += key + ", ";

        if (!updates[key]) {
            updates[key] = "NULL";
        }
        valueString += "'" + updates[key] + "', ";
        updateString += "'" + updates[key] + "', ";
    }
    columnString = columnString.slice(0, -2); // slice off the last ", "
    valueString = valueString.slice(0, -2); // slice off the last ", "
    updateString = updateString.slice(0, -2); // slice off the last ", "

    // build query string
    var query = `INSERT INTO \`availabilityindicator\` (${columnString}) VALUES (${valueString}) ON DUPLICATE KEY UPDATE ${updateString}`;

    console.log(query);

    connection.query(query, function(error, results, fields) {
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

            console.log("is ERROR robin");

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

function getAllEmployees(response) {
    var query = `SELECT * FROM availabilityindicator
        ORDER BY teamName, displayName`;

    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while retrieving ALL employees! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        if (results.length === 0) {
            return;
        }

        console.log(JSON.stringify(results[0]));

        var teamName = results[0].teamName;
        var responseHTML = `<div class="team"><h2>${teamName}</h2><table>`;
        for (var i = 0; i < results.length; i++) {
            if (teamName !== results[i].teamName) {
                responseHTML += `</table></div><div class="team"><h2>${results[i].teamName}</h2><table>`
                teamName = results[i].teamName;
            }
            responseHTML += `
<tr>
    <td width="60%">${results[i].displayName}</td>
    <td width="40%">${results[i].status}</td>
</tr>
            `;
        }
        responseHTML += `</table></div>`

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        return response.end(responseHTML);
    });
}

function getTeamEmployees(teamName, response) {
    var query = `SELECT * FROM availabilityindicator
        WHERE teamName = '${teamName}' ORDER BY displayName`;

    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while retrieving employees with teamName! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var responseHTML = "<table><tr><th>Display Name</th><th>status</th></tr>";
        for (var i = 0; i < results.length; i++) {
            responseHTML += `
<tr>
    <td>${results[i].displayName}</td>
    <td>${results[i].status}</td>
</tr>
            `;
        }
        
        responseHTML += "</table>";

        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        return response.end(responseHTML);
    });
}

// Handles any GET requests made to the server endpoint
// The handled method types are:
// "getParticipants"
// "vote"
// "getLeaderboard"
function handleGetRequest(request, response) {
    var queryParamObject = url.parse(request.url, true).query;
    var type = queryParamObject.type;

    // root/type=?alsjdf
    switch(type) {
        case "heartbeat":
            // {
            //      username: "exampleUsername"
            // }
            console.log("heartbeat");
            heartbeat(queryParamObject, response);
        break;

        case "getAllEmployees": // http://localhost:3305/?type=getAllEmployees
            getAllEmployees(response);
        break;

        case "getTeamEmployees": // http://localhost:3305/?type=getTeamEmployees&teamName=team1
            // {
            //      teamName: "exampleTeamName"
            // }
            getTeamEmployees(queryParamObject.teamName, response);
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
            response.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
            response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
        }
    });
    
    const HOSTNAME = 'localhost';
    const PORT = 3305;
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Availability App Server running at http://${HOSTNAME}:${PORT}/`);
    });
}


// Connects to the Availability DB, then starts the HTTP server.
var mysql = require('mysql');
var connection;
function connectToAvailabilityDB() {
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword,
        database: dbInfo.databaseName
    });
    connection.connect(function(error) {
        if (error) {
            throw error;
        }
        startServer();
    });
}


// Creates the necessary tables for the Multi-Con Vote app to work.
function maybeCreateNewTables(response) {
    var query = `CREATE TABLE IF NOT EXISTS \`availabilityIndicator\` (
        username VARCHAR(100) PRIMARY KEY,
        displayName VARCHAR(100),
        status VARCHAR(45),
        teamName VARCHAR(100) DEFAULT 'TBD'
    )`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            throw error;
        }
        connectToAvailabilityDB();
    });
}


// Creates the correct database and tables
function maybeCreateAvailabilityDB() {
    
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword
    });

    var query = `CREATE DATABASE IF NOT EXISTS ${dbInfo.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            console.log("error with connection");
            throw error;
        }
    
        connection.end();
    
        connection = mysql.createConnection({
            host: dbInfo.mySQLHost,
            user: dbInfo.mySQLUsername,
            password: dbInfo.mySQLPassword,
            database: dbInfo.databaseName
        });
    
        maybeCreateNewTables();
    });
}

// Called on startup.
function startup() {
    maybeCreateAvailabilityDB();
}

startup();