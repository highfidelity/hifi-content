const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const serverConfig = require('./config.json');
const dbConfig = require('./dbinfo.json');
const db = new (require('./db.js'))(dbConfig);

const API_ROUTER = require(serverConfig.API_ROUTER)(db);
const PORT = serverConfig.PORT;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use( (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
app.use('/api', API_ROUTER);



// Starts the server and sets up request handlers
const startServer = () => {
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}


// Called on startup.
const startup = () => {
    db.maybeCreateDbAndTables()
        .then( () => {
            startServer();
        })
        .catch( e => {
            console.log("trouble connecting to the db")
            db.close();
        })
};

startup();

