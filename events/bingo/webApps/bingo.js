//
// bingo.js
// NodeJS Web App for Bingo
// Created by Zach Fox on 2019-02-12
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

var http = require('http');
var url = require('url');
var util = require('util');
var dbInfo = require('./dbInfo.json');

var currentTableName;
function createNewTable() {
    currentTableName = Date.now();

    var query = `CREATE TABLE '${currentTableName} (
        username VARCHAR(40) PRIMARY KEY,
        cardNumbers VARCHAR(300),
        cardColors VARCHAR(50),
        prizeWon VARCHAR(40)
    )`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            throw error;
        }
    });
}

function startNewRound(calledLettersAndNumbers, response) {
    if (!currentTableName) {
        createNewTable();
        var responseObject = {
            status: "success",
            text: "Started new round but DID NOT record any called numbers!"
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }

    var query = `INSERT INTO '${currentTableName}'(username, cardNumbers) VALUES ("BINGO HOST", ${calledLettersAndNumbers})`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error starting new round!"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(responseObject));
            throw error;
        }

        createNewTable();

        var responseObject = {
            status: "success",
            text: "Creating new table and starting new round!"
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(responseObject));
    });
}

function addNewPlayer(username) {

}

function handleGetRequest(request, response) {
    var queryParamObject = url.parse(request.url, true).query;
    
    var type = queryParamObject.type;

    if (type === "searchOrAdd" || type === "searchOnly") {
        var username = queryParamObject.username;

        if (username) {
            if (username === "Unknown user") {
                var responseObject = {
                    status: "success",
                    newUser: true,
                    text: "User not logged in"
                };

                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            }

            var query = `SELECT * FROM '${currentTableName}' WHERE username = '${username}'`;
            connection.query(query, function(error, results, fields) {
                if (error) {
                    throw error;
                }
        
                if (results.length === 0) {
                    addNewPlayer(username);
                } else if (type === "searchOnly") {
                    var responseObject = {
                        status: "success",
                        newUser: true
                    };
    
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    return response.end(JSON.stringify(responseObject));
                } else {
                    var responseObject = {
                        status: "success",
                        newUser: false,
                        userCardNumbers: JSON.parse(results[0].cardNumbers),
                        userCardColor: JSON.parse(results[0].cardColors)
                    };
    
                    response.statusCode = 200;
                    response.setHeader('Content-Type', 'application/json');
                    return response.end(JSON.stringify(responseObject));
                }
            });
        } else {
            var responseObject = {
                status: "error"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
    } else if (type === "newRound") {
        return startNewRound(queryParamObject.calledLettersAndNumbers, response);
    }

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text/plain');
    return response.end(JSON.stringify(queryParamObject) + '\n');
}

function handlePutRequest(request, response) {

}

function startServer() {
    const server = http.createServer((request, response) => {
        if (request.method === "GET") {
            handleGetRequest(request, response);
        } else if (request.method === "PUT") {
            handlePutRequest(request, response);
        } else {
            response.writeHead(405, 'Method Not Supported', {'Content-Type': 'text/html'});
            response.end('<!doctype html><html><head><title>405</title></head><body>405: Method Not Supported</body></html>');
        }
    });
    
    const HOSTNAME = 'localhost';
    const PORT = 3001;
    server.listen(PORT, HOSTNAME, () => {
        console.log(`Bingo App Server running at http://${HOSTNAME}:${PORT}/`);
    });
}

var mysql = require('mysql');
var connection;
function connectToBingoDB() {
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword,
        database: dbInfo.databaseName
    });

    connection.connect(function (error) {
        if (error) {
            console.log("ERROR: Could not connect to Bingo Database!\n" + error);
        } else {
            startServer();
        }
    });
}

function startup() {
    connectToBingoDB();
}

startup();