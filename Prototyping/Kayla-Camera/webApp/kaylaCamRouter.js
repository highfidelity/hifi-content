module.exports = (db) => {
    const express = require('express');
    const router = express.Router();
    
    router.post('/settings', (req, res) => {
        console.log("in post")
        let query = `
            INSERT INTO \`settings\` (config_name, settings)
            VALUES ('${req.body.configName}', '${JSON.stringify(req.body)}')`

        db.query(query)
        .then( () => {
            let responseObject = {
                status: "success"
            };
            console.log("SUCCESS!");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            let responseObject = {
                status: "error",
                text: "Error adding response"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        })

    })
    
    
    router.get('/settings', (req, res) => {
        console.log("in get")        
        let query = 'SELECT * FROM \`settings\`'
    
        db.query(query)
        .then( (results) => {
            let responseObject = {
                status: "success",
                data: results
            };
            console.log("SUCCESS!");
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(responseObject));
        })
        .catch( e => {
            console.log("e", e)
            let responseObject = {
                status: "error",
                text: "Error adding response"
            };

            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        })
    })
    
    return router;
}
