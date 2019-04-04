const path = require("path");
const express = require('express');
const app = express();
const bodyParser = require('body-parser')
const dbInfo = require('./dbInfo.json');

const port = 3002;

app.use(bodyParser.urlencoded({ extended: false }));

app.use(bodyParser.json());

app.use( (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var newBody = {};

var bodies = [];

app.post('/settings', (req, res) => {
    var query = `INSERT INTO \`settings\` (config_name, settings)
        VALUES ('${req.body.configName}', '${JSON.stringify(req.body)}')`;

    connection.query(query, function(error) {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error adding response"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }

        var responseObject = {
            status: "success"
        };
        console.log("SUCCESS!");
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseObject));
    });
})

app.get('/settings', (req, res) => {
    var query = 'SELECT * FROM \`settings\`'

    connection.query(query, (error, results) => {
        if (error) {
            var responseObject = {
                status: "error",
                text: "Error adding response"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }

        var responseObject = {
            status: "success",
            data: results
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(responseObject));

        console.log(JSON.stringify(responseObject));
    })
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
    var query = `CREATE TABLE IF NOT EXISTS \`settings\` (
        config_name VARCHAR(100) PRIMARY KEY,
        settings JSON
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