//
// april04bingoWinners.js
// NodeJS Web App for Bingo to fix some mistakes
// Created by Zach Fox on 2019-04-04
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/
//

function checkRow(userNumbers2D, calledNumbers, rowIndex) {
    for (var colIterator = 0; colIterator < NUM_ROWS_COLS; colIterator++) {
        if (calledNumbers.indexOf(userNumbers2D[colIterator][rowIndex]) === -1) {
            return false;
        }
    }

    return true;
}


function checkColumn(userNumbers2D, calledNumbers, columnIndex) {
    for (var rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
        if (calledNumbers.indexOf(userNumbers2D[columnIndex][rowIterator]) === -1) {
            return false;
        }
    }

    return true;
}


function checkDiagonalTopLeftToBottomRight(userNumbers2D, calledNumbers) {
    for (var rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
        if (calledNumbers.indexOf(userNumbers2D[rowIterator][rowIterator]) === -1) {
            return false;
        }
    }

    return true;
}


function checkDiagonalTopRightToBottomLeft(userNumbers2D, calledNumbers) {
    for (var rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
        // eslint-disable-next-line no-magic-numbers
        if (calledNumbers.indexOf(userNumbers2D[4 - rowIterator][rowIterator]) === -1) {
            return false;
        }
    }

    return true;
}


var NUM_ROWS_COLS = 5;
var CENTER_ROW_COL_IDX = 2;
function verifyBingoWin(userNumbers, calledNumbers) {
    // -1 is the free space and was always "called"
    calledNumbers.push(-1);

    var userNumbers2D = [];
    for (var rowIterator = 0; rowIterator < NUM_ROWS_COLS; rowIterator++) {
        var currentColumn = [];

        for (var colIterator = 0; colIterator < NUM_ROWS_COLS; colIterator++) {
            // Handle free space
            if (rowIterator === CENTER_ROW_COL_IDX && colIterator === CENTER_ROW_COL_IDX) {
                currentColumn.push(-1);
            } else {
                currentColumn.push(userNumbers.shift());
            }
        }
        userNumbers2D.push(currentColumn);
    }

    for (var i = 0; i < NUM_ROWS_COLS; i++) {
        if (checkRow(userNumbers2D, calledNumbers,i)) {
            return true;
        }

        if (checkColumn(userNumbers2D, calledNumbers, i)) {
            return true;
        }
    }

    if (checkDiagonalTopLeftToBottomRight(userNumbers2D, calledNumbers) || checkDiagonalTopRightToBottomLeft(userNumbers2D, calledNumbers)) {
        return true;
    }
    
    return false;
}


function getAllLogicalWinners(oneTableData) {
    var bossNumbers = [];
    for (var i = 0; i < oneTableData.length; i++) {
        if (oneTableData[i].username === "BINGO BOSS") {
            bossNumbers = JSON.parse(oneTableData[i].cardNumbers);
            oneTableData[i].cardNumbers = "[0]";
            break;
        }
    }
    
    var logicalWinners = [];
    for (var i = 0; i < oneTableData.length; i++) {
        if (verifyBingoWin(JSON.parse(oneTableData[i].cardNumbers), bossNumbers)) {
            logicalWinners.push({
                "username": oneTableData[i].username,
                "prizeWon": oneTableData[i].prizeWon
            });
        }
    }

    return logicalWinners;
}


function parseData(data) {
    var perTableData = [];
    var currentTableNameProcessing;
    var currentTableData = [];

    if (data.length > 0) {
        currentTableNameProcessing = data[0].sourceTableName;
    } else {
        console.error("No tables.");
        return;
    }

    for (var i = 0; i < data.length; i++) {
        if (data[i].sourceTableName !== currentTableNameProcessing) {
            perTableData.push(currentTableData);
            currentTableNameProcessing = data[i].sourceTableName;
            currentTableData = [];
        }

        currentTableData.push(data[i]);
    }
    perTableData.push(currentTableData);

    var april04LogicalWinnerData = {};
    for (var i = 0; i < perTableData.length; i++) {
        if (perTableData[i][0].sourceTableName.indexOf("april04") > -1) {
            april04LogicalWinnerData[perTableData[i][0].sourceTableName] = [];
            april04LogicalWinnerData[perTableData[i][0].sourceTableName] = getAllLogicalWinners(perTableData[i]);
        }
    }

    console.log("START APRIL 04 LOGICAL WINNER DATA");
    console.log(JSON.stringify(april04LogicalWinnerData));
    console.log("");
    for (april04WinnerTableName in april04LogicalWinnerData) {
        for (var i = 0; i < april04LogicalWinnerData[april04WinnerTableName].length; i++) {
            var currentWinnerObject = april04LogicalWinnerData[april04WinnerTableName][i];
            if (!currentWinnerObject.prizeWon) {
                console.log(`User ${currentWinnerObject.username} won logically in table ${april04WinnerTableName}, but they did not claim a prize.`);

                april04LogicalWinnerData[april04WinnerTableName][i].prizeWon = "LOGICAL WIN";
            }
        }
    }
    console.log("END APRIL 04 LOGICAL WINNER DATA");
    console.log("\n");

    var prevRecordedWinnerData = {};
    for (var i = 0; i < perTableData.length; i++) {
        if (perTableData[i][0].sourceTableName.indexOf("april04") === -1) {
            prevRecordedWinnerData[perTableData[i][0].sourceTableName] = [];

            for (var j = 0; j < perTableData[i].length; j++) {
                if (perTableData[i][j].prizeWon) {
                    prevRecordedWinnerData[perTableData[i][0].sourceTableName].push(perTableData[i][j].username);
                }
            }
        }
    }

    console.log("START PREVIOUSLY RECORDED WINNER DATA");
    console.log(JSON.stringify(prevRecordedWinnerData));
    console.log("END PREVIOUSLY RECORDED WINNER DATA");
    console.log("\n");

    console.log("START USEFUL DATA");
    for (april04WinnerTableName in april04LogicalWinnerData) {
        for (var i = 0; i < april04LogicalWinnerData[april04WinnerTableName].length; i++) {
            var currentWinnerObject = april04LogicalWinnerData[april04WinnerTableName][i];

            for (prevWinnerTableName in prevRecordedWinnerData) {
                if (prevRecordedWinnerData[prevWinnerTableName].indexOf(currentWinnerObject.username) > -1) {
                    console.log(`${currentWinnerObject.username} has won before.`);
                    console.log(`Before, they won in table: ${prevWinnerTableName}`);
                    console.log(`Today, they won in table: ${april04WinnerTableName}`);
                    console.log(`Today, they won the prize: ${currentWinnerObject.prizeWon}`);
                    console.log(``);
                }
            }
        }
    }
    console.log("END USEFUL DATA");
}


// Connects to the Bingo DB
var mysql = require('mysql');
var dbInfo = require('../dbInfo.json');
var connection;
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

    var query = `SHOW TABLES LIKE '%_%'`;
    connection.query(query, function(error, results) {
        if (error) {
            console.error("Error in SHOW TABLES LIKE: " + JSON.stringify(error));
            return;
        }
    
        if (results.length === 0) {
            console.error("No tables.");
            return;
        }
    
        query = `SELECT username, prizeWon, cardNumbers, sourceTableName FROM (`;
        for (var i = 0; i < results.length; i++) {
            var currentTableName;
            for (var key in results[i]) {
                currentTableName = results[i][key];
            }
    
            query += `SELECT username, prizeWon, cardNumbers, '${currentTableName}' as sourceTableName FROM \`${currentTableName}\``;
    
            if (i < (results.length - 1)) {
                query += " UNION ALL ";
            }
        }
        query += `) AS B`;
            
        connection.query(query, function(error, results) {
            if (error) {
                console.error("Error while getting results from tables: " + JSON.stringify(error));
                return;
            }
    
            parseData(results);
        });
    });
});
