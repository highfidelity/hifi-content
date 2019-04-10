const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const serverConfig = require('./config.json');
const dbMaker = new (require('./dbMaker'));

// Load in our routes and port from the config
const API_PATH = require(serverConfig.API_PATH)
const API_ROUTER = require(serverConfig.API_ROUTER);
const PORT = serverConfig.PORT;

// Setup body parser middleware to handle post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle CORS
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    if (req.method === "OPTIONS") {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
        res.statusCode = 200;
        return res.end();
    }

    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Handle Logging
const logger = (req, res, next) => {
    console.log("got: ", req.method);
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next();
};
app.use(logger);

// Use the routes
app.use(API_PATH, API_ROUTER);

// Starts the server and sets up requests
const startServer = () => {
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

// Called on startup.
const startup = () => {
    dbMaker.maybeCreateDbAndTables()
        .then( () => {
            startServer();
        })
        .catch( e => {
            console.log("trouble connecting to the db:", e)
        })
};

startup();

