//
// textToSpeech_router.js
//
// Created by Zach Fox on 2019-04-22
// Copyright High Fidelity 2019
//
// Licensed under the Apache 2.0 License
// See accompanying license file or http://apache.org/

const express = require('express');
const router = express.Router();
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');


const client = new textToSpeech.TextToSpeechClient({
    "keyFilename": "./googleKeyfile.json"
});


async function sendTTSRequest(text, res) {
    // Construct the request
    const request = {
        input: { text: text },
        // Select the language and SSML Voice Gender (optional)
        voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
        // Select the type of audio encoding
        audioConfig: { audioEncoding: 'MP3' },
    };

    // Performs the Text-to-Speech request
    client.synthesizeSpeech(request)
        .then((response) => {
            // Write the binary audio content to a local file
            const writeFile = util.promisify(fs.writeFile);
            writeFile('mp3s/output.mp3')
                .then(() => {
                    fs.writeFile(response.audioContent, 'binary');
                    console.log('Audio content written to file: mp3s/output.mp3');

                    let responseObject = {
                        status: "success"
                    };
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify(responseObject));
                })
                .catch((err) => {
                    let responseObject = {
                        status: "error",
                        errorText: `Error when calling writeFile: ${JSON.stringify(err)}`
                    };
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    return res.end(JSON.stringify(responseObject));
                });
        })
        .catch((err) => {
            let responseObject = {
                status: "error",
                errorText: `Error when calling synthesizeSpeech: ${JSON.stringify(err)}`
            };
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        });
}


// Handle POST requests. Handled POST paths are:
// `generateSpeech`
const PATH = "/generateSpeech/";
router.post(PATH, (req, res) => {
    sendTTSRequest(req.body.text, res);
});


module.exports = router;