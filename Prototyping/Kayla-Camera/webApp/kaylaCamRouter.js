
const express = require('express');
const router = express.Router();
const Database = require('./dbClass.js');
const dbConfig = require("./dbInfo.json").config;
const mysql = require('mysql');

const connectionConfig = {
    host: dbConfig.mySQLHost,
    user: dbConfig.mySQLUsername,
    password: dbConfig.mySQLPassword,
    database: dbConfig.databaseName,
} 


router.get("/", (req, res) => {
    res.send("TEST")
})


router.get('/settings', (req, res) => {
    let query = 'SELECT * FROM \`settings\`'

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then( (results) => {
            let responseObject = {
                status: "success",
                data: results
            };
            console.log("Got the settings, sending over!");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            console.log("e", e)
            let responseObject = {
                status: "error",
                text: "Error getting response"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }))
})


router.post('/settings', (req, res) => {
    let query = `
        INSERT INTO \`settings\` (config_name, settings)
        VALUES ('${req.body.configName}', '${mysql.escape(req.body)}')`

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then( () => {
            let responseObject = {
                status: "success"
            };
            console.log("Saved the settings!");
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            console.log("e", e)
            let responseObject = {
                status: "error",
                text: "Error adding request"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }))
})


router.delete('/settings/:config_name', (req, res) => {
    let config_name = req.params.config_name;

    let query = `DELETE FROM \`settings\` WHERE config_name = '${config_name}'`;

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then( (results) => {
            let responseObject = {
                status: "success",
                data: results
            };
            console.log("Deleted the settings!");
            res.statusCode = 202;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            console.log("e", e)
            let responseObject = {
                status: "error",
                text: "Error Deleting config"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }))
})


module.exports = router;

