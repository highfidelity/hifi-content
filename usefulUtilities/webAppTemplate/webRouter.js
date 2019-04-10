
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


// Use this if you need to handle a preflight request, if not, you can remove
router.all("*", (req,res, next) => {
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.statusCode = 200;
        return res.end();
    }
    next();
})


// Adding vars for the below examples
const TABLE_NAME = "TABLE_NAME"
const PATH = "/path/";

router.get("/", (req, res) => {
    res.send("TEST")
})


// GET: Request a record
router.get(PATH, (req, res) => {
    let query = `SELECT * FROM \`${TABLE_NAME}\``

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then((results) => {
            let responseObject = {
                status: "success",
                data: results
            };
            console.log(`Got the ${TABLE_NAME}, sending over!`);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch(e => {
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


// POST: Create a record through a request body
router.post(PATH, (req, res) => {
    // Escape the body in case there are any invalid characters in the string
    // Example below puts a JSON object into a record
    let query = `
        INSERT INTO \`${TABLE_NAME}\` (json_name, json)
        VALUES ('${req.body.id}', '${mysql.escape(req.body)}')`

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then(() => {
            let responseObject = {
                status: "success"
            };
            console.log("Saved!");
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch(e => {
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


// DELETE: Delete a record
// You can use the path to get a variable like: /settings/:name.  Then you can get that name using req.params.name
// You can also supply a query string like ?settings=name and then req.query.settings
router.delete(`${PATH}:id`, (req, res) => {
    let id = req.params.id;

    let query = `DELETE FROM \`${TABLE_NAME}\` WHERE id = '${id}'`;

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then((results) => {
            let responseObject = {
                status: "success",
                data: results
            };
            console.log("Deleted!");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            console.log("e", e)
            let responseObject = {
                status: "error",
                text: "Error Deleting"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }))
})


// PUT: Update a record by replacing it completly
router.put(`${PATH}:id`, (req, res) => {
    let id = req.params.id;
    let value1 = req.body.value1;
    let value2 = req.body.value2;

    let query = `
        UPDATE \`${TABLE_NAME}\`
        SET column1 = value1, column2 = value2
        WHERE value = '${id}'`;

    Database.execute(connectionConfig, 
        database => database.query(query)
        .then((results) => {
            let responseObject = {
                status: "success",
                data: results
            };
            console.log("Updated!");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            console.log("e", e)
            let responseObject = {
                status: "error",
                text: "Error Updating"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }))
})


module.exports = router;

