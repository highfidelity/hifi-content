const path = require("path");
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const dbInfo = require('./secrets/dbInfo.json');

const port = 3002;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.post('/message/', (req, res) => {
    res.send('welcome:' + JSON.stringify(req.body));
})

// Starts the server and sets up request handlers
function startServer() {
    app.listen(port, () => console.log(`listening on port ${port}`));
}


// Connects to the DB, then starts the server
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


// Creates the necessary DB tables if they don't exist
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


// Creates the necessary DB if it doesn't exist.
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


// Called on startup.
function startup() {
    maybeCreateDB();
}


startup();