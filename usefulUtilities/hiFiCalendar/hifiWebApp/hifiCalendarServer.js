const express = require('express');
const app = express();
const routes = require('./hifiCalendarRouter');
const serverConfig = require("./serverConfig.json");
const bodyParser = require("body-parser");


// Load in our routes and port from the config
const PORT = serverConfig.PORT;

// Setup body parser middleware to handle post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

app.use("/hifiCalendar/", express.static('public'));

// Handle Logging
const logger = (req, res, next) => {
    console.log("got request");
    console.log(`${req.protocol}://${req.get('host')}${req.originalUrl}`)
    next();
};
app.use(logger);

// Use the routes
const API_PATH = "/hifiCalendar/api/";
app.use(API_PATH, routes);

// Starts the server and sets up request handlers
const startServer = () => {
    app.listen(PORT, () => console.log(`listening on port ${PORT}`));
}

startServer();