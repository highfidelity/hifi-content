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
var parseQueryString = require('querystring');

// Creates a new table in the Bingo DB.
var currentTableName;
var currentCalledNumbers = [];
function createNewTable(newTablePrefix, response) {
    currentTableName = newTablePrefix + "_" + Date.now();
    currentCalledNumbers = [];

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
    
            response.statusCode = 500;
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

// Called when the Bingo Boss requests a new round
function startNewRound(newTablePrefix, response) {
    createNewTable(newTablePrefix, response);
}

// Gets a random valid Bingo number associated with the passed `currentColumn`
const POSSIBLE_NUMBERS_PER_COLUMN = 15;
function getRandomBingoNumber(currentColumn) {
    var min = 1 + POSSIBLE_NUMBERS_PER_COLUMN * currentColumn;
    var max = min + POSSIBLE_NUMBERS_PER_COLUMN;

    return Math.floor(Math.random() * (max - min)) + min;
}

// Generates an array of valid Bingo numbers
function generateBingoNumbers() {
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

// Returns a random valid card color
const CARD_COLORS = [
    {"red": 178, "green": 0, "blue": 18},
    {"red": 178, "green": 46, "blue": 116},
    {"red": 16, "green": 28, "blue": 91},
    {"red": 0, "green": 110, "blue": 156},
    {"red": 0, "green": 144, "blue": 54},
    {"red": 204, "green": 189, "blue": 0},
]
function getCardColor() {
    return CARD_COLORS[Math.floor(Math.random() * CARD_COLORS.length)];
}


// Adds a new player to the current Bingo table in the Bingo DB.
// Adds the new player's card numbers and color to the DB.
const BINGO_STRING = "BINGO";
const NUM_ROWS = BINGO_STRING.length;
const NUM_COLS = NUM_ROWS;
function addNewPlayer(username, response) {
    var userCardNumbers = generateBingoNumbers();
    var userCardColor = getCardColor();

    var query = `INSERT INTO \`${currentTableName}\` (username, cardNumbers, cardColor)
        VALUES ('${username}', '${JSON.stringify(userCardNumbers)}', '${JSON.stringify(userCardColor)}')`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error adding new player!"
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
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


// Handles any GET requests made to the Bingo server endpoint
// The three handled method types are:
// "searchOrAdd"
// "searchOnly"
// "newRound"
// "getCalledNumbers"
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
                    var responseObject = {
                        status: "error",
                        text: error
                    };
    
                    response.statusCode = 500;
                    response.setHeader('Content-Type', 'application/json');
                    return response.end(JSON.stringify(responseObject));
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

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }
    } else if (type === "newRound") {
        return startNewRound(queryParamObject.newTablePrefix, response);
    } else if (type === "getCalledNumbers") {
        var responseObject = {
            "status": "success",
            "calledNumbers": currentCalledNumbers
        };

        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    } else if (type === "exportAllPlayersWinData") {
        var responseHtml = `
<html>
    <head>
        <title>Bingo</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <form action="/bingo" method="post">
            Bingo Table Prefix:<br>
            <input type="text" name="prefix"><br>

            All Players Receive (HFC):<br>
            <input type="text" name="allPlayersReceiveAmount"><br>

            Password (use Bingo MySQL user's password):<br>
            <input type="password" name="password"><br><br>

            <input type="hidden" name="type" value="exportAllPlayersWinData">
            
            <input type="submit" value="Submit">
        </form>
    </body>
</html>
        `;
    
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html; charset=utf-8');
        return response.end(responseHtml);
    } else {
        response.statusCode = 501;
        response.setHeader('Content-Type', 'text/plain');
        return response.end(JSON.stringify(queryParamObject) + '\n');
    }
}

// A utility function for creating a "CASE" argument in an SQL
// query when recording winners. 
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

// A utility function for creating a "IN" argument in an SQL
// query when recording winners.
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

// Records the prizes that a given list of users has won.
// This method is inefficient: we are storing a mostly-empty
// "prizeWon" column in each of our tables.
function recordWinners(winnersArray, response) {
    if (!currentTableName) {
        var responseObject = {
            status: "error",
            text: "Tried to record prizes, but there's no `currentTableName`!"
        };

        response.statusCode = 500;
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
    
            response.statusCode = 500;
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

// Inserts the new called numbers array into the current table,
// then replaces the `currentCalledNumbers` var in memory with the one
// passed into this function.
// This ensures we don't have to do a DB fetch when users fetch the
// currentCalledNumbers with a GET request.
function replaceCalledNumbers(newCalledNumbers, response) {
    if (currentTableName) {
        var query = `REPLACE INTO \`${currentTableName}\` (username, cardNumbers)
            VALUES ('BINGO BOSS', '${JSON.stringify(newCalledNumbers)}')`;
        connection.query(query, function(error, results, fields) {
            if (error) {
                var responseObject = {
                    status: "error",
                    text: "Error replacing called numbers! " + JSON.stringify(error)
                };
    
                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            }

            currentCalledNumbers = newCalledNumbers;
            
            var responseObject = {
                status: "success",
                text: "Replaced called numbers."
            };

            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        });
    } else {
        var responseObject = {
            status: "error",
            text: "replaceCalledNumbers was called, but there was no currentTableName!"
        };

        response.statusCode = 500;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));
    }
}


// Given some input data, formats the human-readable text data
// in an arbitrary way as needed by the team.
function formatDataForExport(tablePrefix, allWinnersReceive, data, response) {
    var finalResponseText = `Requested Table Prefix: "${tablePrefix}"\n\n`;

    for (var i = 0; i < data.length; i++) {
        finalResponseText += "Bingo Round #" + (i + 1) + "\n";

        var currentUsernameList = data[i];
        var someoneWonAllPlayersWin = false;
        var currentResponseText = "";
        for (var j = 0; j < currentUsernameList.length; j++) {
            currentResponseText += allWinnersReceive + ",";
            currentResponseText += "Event Grant,";
            currentResponseText += currentUsernameList[j].username;
            currentResponseText += "\n";

            if (String(currentUsernameList[j].prizeWon).toLowerCase().indexOf("all") > -1) {
                someoneWonAllPlayersWin = true;
            }
        }

        if (someoneWonAllPlayersWin) {
            finalResponseText += "Amount of HFC,Type,Username\n";
            finalResponseText += currentResponseText;
        } else {
            finalResponseText += "NOBODY WON 'All Players Win' in this round.";
        }

        finalResponseText += "\n\n\n";
    }

    response.statusCode = 200;
    response.setHeader('Content-Type', 'text');
    return response.end(finalResponseText);
}

// Handles data export request as per the user-submitted form.
// Uses password-based authentication using the same password
// as the db password.
function handleDataExportRequest(formData, response) {
    if (formData.password !== dbInfo.mySQLPassword) {
        var responseObject = {
            status: "error",
            text: "Not authorized."
        };
    
        response.statusCode = 401;
        response.setHeader('Content-Type', 'application/json');
        return response.end(JSON.stringify(responseObject));    
    }

    var query = `SHOW TABLES LIKE '${formData.prefix}_%'`;
    connection.query(query, function(error, results, fields) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Couldn't export player data! Error while showing tables with prefix: " + error
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        if (results.length === 0) {
            var responseObject = {
                status: "error",
                text: "There are no tables with that prefix! Go back and make sure you've input a valid prefix."
            };

            response.statusCode = 500;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(responseObject));
        }

        var allResults = [];

        for (var i = 0; i < results.length; i++) {
            var currentTableName;
            for (var key in results[i]) {
                currentTableName = results[i][key];
            }
            
            query = `SELECT username,prizeWon FROM \`${currentTableName}\` WHERE username != 'BINGO BOSS'`;
            
            connection.query(query, function(error, tableResults, fields) {
                if (error) {
                    var responseObject = {
                        status: "error",
                        text: "Couldn't export player data! Error while getting data from table: " + error
                    };
        
                    response.statusCode = 500;
                    response.setHeader('Content-Type', 'application/json');
                    return response.end(JSON.stringify(responseObject));
                }

                allResults.push(tableResults);

                if (allResults.length === results.length) {
                    formatDataForExport(formData.prefix, formData.allPlayersReceiveAmount, allResults, response);
                }
            });
        }
    }); 
}


// Handles all POST requests made to the Bingo endpoint.
// The handled request types are:
// "recordPrizes"
// "replaceCalledNumbers"
// "exportData"
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
        
        if (body.type === "recordPrizes") {
            if (!body.winners) {
                var responseObject = {
                    status: "error",
                    text: "No valid winners array provided!"
                };

                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            } else {
                recordWinners(body.winners, response);
            }            
        } else if (body.type === "replaceCalledNumbers") {
            if (!body.calledNumbers) {
                var responseObject = {
                    status: "error",
                    text: "No valid calledNumbers array provided!"
                };

                response.statusCode = 500;
                response.setHeader('Content-Type', 'application/json');
                return response.end(JSON.stringify(responseObject));
            } else {
                replaceCalledNumbers(body.calledNumbers, response);
            }
        } else if (body.type === "exportAllPlayersWinData") {
            handleDataExportRequest(body, response);     
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

// Starts the NodeJS HTTP server.
function startServer() {
    const server = http.createServer((request, response) => {
        response.setHeader('Access-Control-Allow-Origin', '*');
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

// Connects to the Bingo DB
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

// Creates the Bingo DB
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

// Called on startup.
function startup() {
    //createBingoDB();
    connectToBingoDB();
}

startup();