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
const {Translate} = require('@google-cloud/translate');
const fs = require('fs');
const MP3_HOST_ROOT = require('./config.json').MP3_HOST_ROOT;

const translateClient = new Translate({
    "keyFilename": "./googleKeyfile.json"
});

const ttsClient = new textToSpeech.TextToSpeechClient({
    "keyFilename": "./googleKeyfile.json"
});


const WAIT_BEFORE_DELETE_MS = 60000;
async function sendTTSRequest(res, text, voiceName, languageCode, gender) {
    // Construct the request
    var request = {
        input: { text: text },
        // Select the language and SSML Voice Gender (optional)
        voice: {
            name: voiceName || "en-US-Wavenet-A",
            languageCode: languageCode || 'en-US'
        },
        // Select the type of audio encoding
        audioConfig: { audioEncoding: 'MP3' },
    };

    if (gender) {
        request.voice.gender = gender;
    }

    // Performs the Text-to-Speech request
    ttsClient.synthesizeSpeech(request, (err, response) => {
        if (err) {
            let errorText = `Error when calling synthesizeSpeech: ${err}`;
            let responseObject = {
                status: "error",
                errorText: errorText
            };
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }

        var filename = `${Date.now()}.mp3`;
        var filepath = `mp3s/generated/${filename}`;

        fs.writeFile(filepath, response.audioContent, 'binary', (err) => {
            if (err) {
                let responseObject = {
                    status: "error",
                    errorText: `Error when calling writeFile: ${err}`
                };
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify(responseObject));
            }

            setTimeout((fn) => {
                fs.unlink(fn, err => {
                    if (err) {
                        throw err;
                    }
                });
            }, WAIT_BEFORE_DELETE_MS, filepath);

            let responseObject = {
                status: "success",
                speechURL: `${MP3_HOST_ROOT}/generated/${filename}`
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        });
    });
}


// Handle "/generateSpeech/" POST requests.
router.post("/generateSpeech/", (req, res) => {
    sendTTSRequest(res, req.body.text, req.body.voiceName, req.body.languageCode, req.body.gender);
});


async function getVoices(res, languageCodes) {
    ttsClient.listVoices({}, (err, response) => {
        if (err) {
            let responseObject = {
                status: "error",
                errorText: `Error while listing voices: ${err}`
            };
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }

        let voices = response.voices;
        var returnVoices = [];
        languageCodes = languageCodes || ["en-US"];

        voices.forEach(voice => {
            languageCodes.forEach(code => {
                if (voice.languageCodes.indexOf(code) > -1) {
                    returnVoices.push({
                        "voiceName": voice.name,
                        "voiceGender": voice.ssmlGender,
                        "languageCode": code
                    });
                }
            });
        });

        let responseObject = {
            status: "success",
            voices: returnVoices
        };
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(responseObject));
    });
}


// Handle "/getVoices/" POST requests.
router.post("/getVoices/", (req, res) => {
    getVoices(res, req.body.languageCodes);
});


async function getSample(res, voiceName) {
    if (!voiceName) {
        let responseObject = {
            status: "error",
            errorText: `Please specify a voiceName`
        };
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(responseObject));
    }

    var sampleDir = `./mp3s/samples/${voiceName}`;

    fs.readdir(sampleDir, (err, items) => {
        if (err || items.length === 0) {
            let responseObject = {
                status: "error",
                errorText: `Please specify a valid voiceName`
            };
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }

        var randomIdx = Math.floor(Math.random() * items.length);

        let responseObject = {
            status: "success",
            speechURL: `${MP3_HOST_ROOT}/samples/${voiceName}/${items[randomIdx]}`
        };
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(responseObject));
    });
}


// Handle "/getSample/" POST requests.
router.post("/getSample/", (req, res) => {
    getSample(res, req.body.voiceName);
});


async function translateText(res, text, targetLanguageCode) {
    translateClient.translate(text, targetLanguageCode, (err, translation) => {
        if (err) {
            let responseObject = {
                status: "error",
                errorText: `Error while translating text: ${err}`
            };
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }

        let responseObject = {
            status: "success",
            translation: translation
        };
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        return res.end(JSON.stringify(responseObject));
    });
}


// Handle "/translateText/" POST requests.
router.post("/translateText/", (req, res) => {
    var targetLanguageCode = req.body.targetLanguageCode.split("-")[0].toLowerCase();
    translateText(res, req.body.text, targetLanguageCode);
});


module.exports = router;