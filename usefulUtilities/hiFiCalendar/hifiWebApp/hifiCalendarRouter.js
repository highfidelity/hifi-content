const express = require('express');
const router = express.Router();
const request = require('request');
const serverConfig = require("./serverConfig.json");
const CLIENT_ID = serverConfig.CLIENT_ID;
const CLIENT_SECRET = serverConfig.CLIENT_SECRET;
const REDIRECT_URI = serverConfig.REDIRECT_URI;
const TOKEN_URL = "https://www.googleapis.com/oauth2/v4/token";

router.get("/", (req, res) => {
    res.send("test");
})

router.get("/canary", (req, res) => {
    // Ensure that the REDIRECT_URI is up.
    // Checks that NGINX is serving the right page.
    var redirectUriOK;
    var apiRouterOK = true; // Always true if we can get here!
    request.get(
        REDIRECT_URI,
        {
            timeout: 15000
        },
        (error, response) => {
            redirectUriOK = !error;

            // The `result` value should be a logical AND
            // of all of the subsystems whose status we check.
            var responseObject = {
                result: redirectUriOK && apiRouterOK && lastOauthRequestTokenOK && lastOauthExchangeCodeOK,
                systemStatus: {
                    apiRouter: {
                        status: apiRouterOK
                    },
                    oAuth: {
                        lastRequest_token: {
                            status: lastOauthRequestTokenOK
                        },
                        lastExchangeCode: {
                            status: lastOauthExchangeCodeOK
                        }
                    },
                    redirectURI: {
                        status: redirectUriOK
                    }
                }
            };
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        }
    );
});


var lastOauthRequestTokenOK = true; // System is fine until proven otherwise
router.post("/request_token", (req, res) => {
    const refresh_token = req.body.refresh_token; 
    const oAuthInfo = {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refresh_token,
        grant_type: "refresh_token"
    }
    request({
        uri: TOKEN_URL,
        method: "POST",
        json: true,
        body: oAuthInfo
    }, (error, response) => {
        lastOauthRequestTokenOK = !error;

        if (error) {
            const responseObject = {
                status: "error",
                errorText: `Refreshing Oauth Token with Google`
            };
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        } else {
            response.body.status = "success"
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(response.body));
        }
    })
})


var lastOauthExchangeCodeOK = true; // System is fine until proven otherwise
router.post("/exchangeCode", (req, res) => {
    const code = req.body.code;
    request({
        uri: TOKEN_URL,
        method: "POST",
        json: true,
        body: {
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            redirect_uri: REDIRECT_URI,
            grant_type: "authorization_code",
            code: code
        }
    }, (error, response) => {
        lastOauthExchangeCodeOK = !error;

        if (error) {
            const responseObject = {
                status: "error",
                errorText: `Problem getting back token`
            };
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(responseObject));
        } else {
            response.body.status = "success"
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(response.body));
        }
    })
})

module.exports = router;