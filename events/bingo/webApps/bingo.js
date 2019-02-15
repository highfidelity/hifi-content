//
// bingo.js
// NodeJS Web App for Bingo
// Created by Zach Fox on 2019-02-12
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//
//
// NOTE 2019-02-13:
// In its current form, this script has been closely adapted from
// the Google Script that the Experiences team used for previous Bingo
// events. I made a couple of bugfixes and optimizations, but not many.
// I wanted to maintain as much backwards compatibility as possible.
//

var http = require('http');
var url = require('url');
var dbInfo = require('./dbInfo.json');

var currentTableName;
function createNewTable(newTablePrefix, response) {
    currentTableName = newTablePrefix + "_" + Date.now();

    var query = `CREATE TABLE \`${currentTableName}\` (
        username VARCHAR(50) PRIMARY KEY,
        cardNumbers VARCHAR(1000),
        cardColor VARCHAR(60),
        prizeWon VARCHAR(100)
    )`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                tableName: currentTableName,
                text: "Could not create new table! " + error
            };
    
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var responseObject = {
            status: "success",
            tableName: currentTableName,
            text: "Created new table for a new round!"
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(responseObject));
    });
}

function startNewRound(calledNumbers, newTablePrefix, response) {
    if (currentTableName) {
        var query = `INSERT INTO \`${currentTableName}\` (username, cardNumbers)
            VALUES ('BINGO BOSS', '${calledNumbers}')`;
        connection.query(query, function(error, results, fields) {
            if (error) {
                var responseObject = {
                    status: "error",
                    text: "Error starting new round! " + JSON.stringify(error)
                };
    
                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            }
    
            createNewTable(newTablePrefix, response);
        });
    } else {
        createNewTable(newTablePrefix, response);
    }
}

const POSSIBLE_NUMBERS_PER_COLUMN = 15;
function getRandomBingoNumber(currentColumn) {
    var min = 1 + POSSIBLE_NUMBERS_PER_COLUMN * currentColumn;
    var max = min + POSSIBLE_NUMBERS_PER_COLUMN;

    return Math.floor(Math.random() * (max - min)) + min;
}

function getBingoNumbers() {
    var userCardNumbers = [];

    for (var currentColumn = 0; currentColumn < NUM_COLS; currentColumn++) {
        for (var currentRow = 0; currentRow < NUM_ROWS; currentRow++) {
            if (!(currentColumn === 2 && currentRow === 2)) {
                var currentNumber = getRandomBingoNumber(currentColumn);

                if (userCardNumbers.indexOf(currentNumber) > -1) {
                    currentRow--;
                } else {
                    userCardNumbers.push(currentNumber);
                }
            }
        }
    }

    return userCardNumbers;
}


const CARD_YELLOW = { "blue": 66, "green": 255, "red": 227 };
const CARD_BLUE = { "blue": 247, "green": 196, "red": 0 };
const CARD_GREEN = { "blue": 0, "green": 255, "red": 30 };
const CARD_PINK = { "blue": 119, "green": 0, "red": 255 };
function getCardColor() {
    var colorChange = Math.floor(Math.random() * 4);
    var newColor;
    switch (colorChange) {
      case 0:
        newColor = CARD_YELLOW;
        break;
      case 1:
        newColor = CARD_BLUE;
        break;
      case 2:
        newColor = CARD_GREEN;
        break;
      case 3:
        newColor = CARD_PINK;
        break;
      default:
        newColor = CARD_PINK;
    }
    return newColor;
}


const BINGO_STRING = "BINGO";
const NUM_ROWS = BINGO_STRING.length;
const NUM_COLS = NUM_ROWS;
function addNewPlayer(username, response) {
    var userCardNumbers = getBingoNumbers();
    var userCardColor = getCardColor();

    var query = `INSERT INTO \`${currentTableName}\` (username, cardNumbers, cardColor)
        VALUES ('${username}', '${JSON.stringify(userCardNumbers)}', '${JSON.stringify(userCardColor)}')`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error adding new player!"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify(responseObject));
            throw error;
        }

        var responseObject = {
            status: "success",
            newUser: true,
            userCardNumbers: userCardNumbers,
            userCardColor: userCardColor
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.end(JSON.stringify(responseObject));
    });
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

            var query = `SELECT * FROM \`${currentTableName}\` WHERE username='${username}'`;
            connection.query(query, function(error, results, fields) {
                if (error) {
                    throw error;
                }
        
                if (results.length === 0) {
                    addNewPlayer(username, response);
                } else if (results.length === 0 && type === "searchOnly") {
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
                        userCardColor: JSON.parse(results[0].cardColor)
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
        return startNewRound(queryParamObject.calledNumbers, queryParamObject.newTablePrefix, response);
    } else {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/plain');
        return response.end(JSON.stringify(queryParamObject) + '\n');
    }
}

function createCaseString(winnersArray) {
    var caseString = '';

    for (var i = 0; i < winnersArray.length; i++) {
        caseString += "when username='" + winnersArray[i].username +
            "' then '" + winnersArray[i].prizeWon + "'";

        if (i < (winnersArray.length - 1)) {
            caseString += ' ';
        }
    }

    return caseString;
}

function createQueryInString(winnersArray) {
    var inString = '';

    for (var i = 0; i < winnersArray.length; i++) {
        inString += "'" + winnersArray[i].username + "'";

        if (i < (winnersArray.length - 1)) {
            inString += ', ';
        }
    }

    return inString;
}

function recordWinners(winnersArray, response) {
    if (!currentTableName) {
        var responseObject = {
            status: "error",
            text: "Tried to record prizes, but there's no `currentTableName`!"
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }

    var query = `
        UPDATE \`${currentTableName}\`
            SET prizeWon = (case ${createCaseString(winnersArray)} end)
            WHERE username in (${createQueryInString(winnersArray)})
    `;
    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Couldn't record prize winners! Error: " + error,
                winnersArray: winnersArray
            };
    
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var responseObject = {
            status: "success"
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    });
}

function handlePostRequest(request, response) {
    let body = '';
    request.on('data', chunk => {
        body += chunk.toString();
    });
    request.on('end', () => {
        try {
            body = JSON.parse(body);
        } catch (error) {
            var responseObject = {
                status: "error",
                text: "Error handling POST request!"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
        
        if (body.type === "recordPrizes") {
            if (!body.winners) {
                var responseObject = {
                    status: "error",
                    text: "No valid winners array provided!"
                };

                response.statusCode = 200;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            } else {
                recordWinners(body.winners, response);
            }            
        } else {
            var responseObject = {
                status: "error",
                text: "Invalid request type provided!"
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
    })
}

function startServer() {
    const server = http.createServer((request, response) => {
        if (request.method === "GET") {
            handleGetRequest(request, response);
        } else if (request.method === "POST") {
            handlePostRequest(request, response);
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
            throw error;
        }
        
        startServer();
    });
}

function createBingoDB() {
    connection = mysql.createConnection({
        host: dbInfo.mySQLHost,
        user: dbInfo.mySQLUsername,
        password: dbInfo.mySQLPassword
    });

    var query = `CREATE DATABASE ${dbInfo.databaseName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            throw error;
        }
    });

    connection.end();
}

function startup() {
    //createBingoDB();
    connectToBingoDB();
}

startup();