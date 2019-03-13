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


// Gets all information associated with users participating in the Best Avatar Contest
function getParticipants(voterUsername, response) {
    // have they voted?
        // yes
        // no

    var query = `SELECT * FROM \`multiConAvatarContestParticipants\``;
    connection.query(query, function(error, results) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while getting all participants! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
        
        var avatarInformation = results;

        query = `SELECT votedFor FROM \`multiConAvatarContestVotes\` WHERE voterUsername = '${voterUsername}'`
        
        connection.query(query, function(error, results) {
            if (error) {
                var responseObject = {
                    status: "error",
                    text: "Error while getting previous vote information! " + JSON.stringify(error)
                };
    
                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            }

            if (results.length > 0) {
                var avatarVotedFor = results[0].votedFor;

                for (var i = 0; i < avatarInformation.length; i++) {
                    if (avatarInformation[i].username === avatarVotedFor) {
                        avatarInformation[i].votedFor = true;
                        break;
                    }
                }
            }

            var responseObject = {
                status: "success",
                text: "Successfully recieved avatar information.",
                data: avatarInformation
            };
    
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        });
    });
}


// Saves voter information to the 'multiConAvatarContestVotes' table.
function vote(votedUsername, votedFor, response) {
    var query = `REPLACE INTO \`multiConAvatarContestVotes\` (voterUsername, votedFor)
        VALUES ('${votedUsername}', '${votedFor}')`;

    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error while voting! " + JSON.stringify(error)
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
        
        var responseObject = {
            status: "success",
            text: "Successfully voted."
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    });
}


// Handles any GET requests made to the server endpoint
// The handled method types are:
// "getParticipants"
// "vote"
function handleGetRequest(request, response) {
    var queryParamObject = url.parse(request.url, true).query;
    var type = queryParamObject.type;

    switch(type) {
        case "getParticipants":
            var voterUsername = queryParamObject.voterUsername;
            getParticipants(voterUsername, response);
        break;


        case "vote":
            var voterUsername = queryParamObject.voterUsername;
            var votedFor = queryParamObject.votedFor;
            vote(voterUsername, votedFor, response);
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
    const PORT = 3003;
    server.listen(PORT, HOSTNAME, () => {
        console.log(`MultiCon Vote App Server running at http://${HOSTNAME}:${PORT}/`);
    });
}


// Connects to the MultiCon Vote DB, then starts the HTTP server.
var mysql = require('mysql');
var connection;
function connectToMultiConVoteDB() {
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


// Creates the necessary tables for the Multi-Con Vote app to work.
function createNewTables(response) {
    var query = `CREATE TABLE IF NOT EXISTS \`multiConAvatarContestVotes\` (
        voterUsername VARCHAR(100) PRIMARY KEY,
        votedFor VARCHAR(100),
        votedTimestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            throw error;
        }
    });

    var query = `CREATE TABLE IF NOT EXISTS \`multiConAvatarContestParticipants\` (
        username VARCHAR(100) PRIMARY KEY,
        imageURL VARCHAR(250)
    )`;

    connection.query(query, function(error, results, fields) {
        if (error) {
            throw error;
        }
    });
}


// Creates the correct database and tables
function createMultiConVoteDB() {
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword
    });

    var query = `CREATE DATABASE IF NOT EXISTS ${dbInfo.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    connection.query(query, function(error, results, fields) {
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

    createNewTables();

    connection.end();
}

// Called on startup.
function startup() {
    createMultiConVoteDB();
    connectToMultiConVoteDB();
}

startup();