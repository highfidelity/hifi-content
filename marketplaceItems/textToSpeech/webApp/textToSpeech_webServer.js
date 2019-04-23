//
// textToSpeech_webServer.js
//
// Created by Zach Fox on 2019-04-22
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');


// Setup body parser middleware to handle post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Handle CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Origin', '*');
    next();
});


// Use the routes
const API_PATH = "/api/textToSpeech"
const API_ROUTER = require("./textToSpeech_router.js");
app.use(API_PATH, API_ROUTER);


// Starts the server and sets up requests
const PORT = 3007;
const startServer = () => {
    app.listen(PORT, () => console.log(`Web Server listening on port ${PORT}`));
}


var GENERATED_SPEECH_DIR = "./mp3s/generated";
const deleteGeneratedSpeech = () => {
    fs.readdir(GENERATED_SPEECH_DIR, (err, files) => {
        if (err) {
            throw err;
        }

        for (const file of files) {
            if (path.extname(file).toLowerCase() === ".mp3") {
                fs.unlink(path.join(GENERATED_SPEECH_DIR, file), err => {
                    if (err) {
                        throw err;
                    }
                });
            }
        }
    });
}


// Called on startup.
const startup = () => {
    deleteGeneratedSpeech();
    startServer();
};


startup();