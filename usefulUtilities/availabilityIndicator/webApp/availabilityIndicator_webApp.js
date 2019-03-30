//
// multiConVote.js
// NodeJS Web App for Multi-Con Festival App
// Created by Robin Wilson and Zach Fox on 2019-03-11
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

var http = require('http');
var url = require('url');
var dbInfo = require('./dbInfo.json');


function heartbeat() {

}

function updateEmployee(updates, response) {
    // Create strings for query from the updates object
    var columnString = "";
    var valueString = "";
    for(var key in updates) {
        columnString += key + ", ";
        if(!updates[key]) {
            updates[key] = "NULL";
        }
        valueString += "'" + updates[key] + "', ";
    }
    columnString = columnString.slice(0, -2); // slice off the last ", "
    valueString = valueString.slice(0, -2); // slice off the last ", "

    var query = `REPLACE INTO \`availabilityindicator\` (${columnString}) VALUES (${valueString})`;

    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while updating employee! " + JSON.stringify(error)
            };

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

        var responseHTML = "<table><tr><th>Display Name</th><th>status</th><th>teamName</th></tr>";
        for (var i = 0; i < results.length; i++) {
            responseHTML += `
<tr>
    <td>${results[i].displayName}</td>
    <td>${results[i].status}</td>
    <td>${results[i].teamName}</td>
</tr>
            `;
        }
        
        responseHTML += "</table>";

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
        case "updateEmployee": {
            var queryObject = {};
            if (queryParamObject.username) {
                queryObject.username = queryParamObject.username;
                if (queryParamObject.status) {
                    queryObject.status = queryParamObject.status;
                }
                if (queryParamObject.displayName) {
                    queryObject.displayName = queryParamObject.displayName;
                }
                if (queryParamObject.teamName) {
                    queryObject.teamName = queryParamObject.teamName;
                }
                updateEmployee(queryObject, response);
            } else {
                console.error("There was no username or primary key! Can't update or create employee!");
            }
        }
        // case "updateStatus":
        //     // {
        //     //      status: ["available", "unavailable", "away"]
        //     // }
        //     var username = queryParamObject.username;
        //     var status = queryParamObject.status;
        //     updateEmployee({
        //         username: queryParamObject.username,
        //         status: queryParamObject.status
        //     }, response);
        // break;

        // case "updateDisplayName":
        //     // {
        //     //      displayName: "exampleDisplayName"
        //     //      username: "exampleUsername"
        //     // }
        //     updateEmployee
        //     var username = queryParamObject.username;
        //     var displayName = queryParamObject.displayName;
        //     // var voterUserAgent = request.headers['user-agent']; ?? What is
        //     updateEmployee({
        //         username: queryParamObject.username,
        //         displayName: queryParamObject.displayName
        //     }, response);
        // break;

        case "heartbeat":
            // {
            //      username: "exampleUsername"
            // }
            console.log("heartbeat");
            var username = queryParamObject.username;
            heartbeatForUser(username, response);
        break;

        // case "updateTeamName":
        //     // {
        //     //      teamName: "exampleTeamName"
        //     //      username: "exampleUsername"
        //     // }
        //     // var voterUserAgent = request.headers['user-agent']; ?? What is
        //     updateEmployee({
        //         username: queryParamObject.username,
        //         teamName: queryParamObject.teamName
        //     }, response);
        // break;

        // case "createEmployee": // http://localhost:3305/?username=hello1&teamName=team1&status=available&displayName=Hello
        //     // http://localhost:3305/?type=createEmployee&username=hello1&teamName=ttt&status=available&displayName=HELLO%2022222    
        //     // {
        //     //      username: "exampleTeamName"
        //     //      displayName: "exampleUsername"
        //     //      status: "exampleUsername"
        //     // }
        //     updateEmployee({
        //         username: queryParamObject.username,
        //         teamName: queryParamObject.teamName,
        //         status: queryParamObject.status,
        //         displayName: queryParamObject.displayName
        //     }, response);
        // break;

        case "getAllEmployees": // http://localhost:3305/?type=getAllEmployees
            getAllEmployees(response);
        break;

        case "getTeamEmployees": // http://localhost:3305/?type=getTeamEmployees&teamName=team1
            // {
            //      username: "exampleTeamName"
            //      displayName: "exampleUsername"
            //      status: "exampleUsername"
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
function createNewTables(response) {
    var query = `CREATE TABLE IF NOT EXISTS \`availabilityIndicator\` (
        username VARCHAR(100) PRIMARY KEY,
        displayName VARCHAR(100),
        status VARCHAR(45),
        teamName VARCHAR(100)
    )`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            throw error;
        }
    });
}


// Creates the correct database and tables
function createAvailabilityDB() {
    
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword,
        port: dbInfo.mySQLPort
    });

    var query = `CREATE DATABASE IF NOT EXISTS ${dbInfo.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            console.log("error with connection");
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

    createNewTables();

    connection.end();
}

// Called on startup.
function startup() {
    // createAvailabilityDB();
    connectToAvailabilityDB();
}

startup();