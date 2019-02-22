# BINGO
A Bingo game for High Fidelity. Requires setting up a domain in a very specific way. There's no easy way to deploy this Bingo game on your own domain right now.

## Secrets

The code for this game is open source. There are two sets of secrets that you must have set up for this game to work:
1. A `config.json` file in `<bingo root>/config/config.json` that contains the data below.
2. A `dbInfo.json` file in `<bingo root>/webApps/dbInfo.json` that contains the data below.

### `config.json`
Here's what your `config.json` file should look like:
```
{
    "requestURL": "<a deployed version of the bingo.js Web App. MAKE SURE you also update REQUEST_URL in bingoCard_ui.js!>",
    "usersAllowedToSpinWheel": [<an array of strings dictating who can spin the Bingo wheel>],
    "gameAudioPosition": { "x": <int>, "y": <int>, "z": <int> },
    "dbTablePrefix": "<a prefix for all of the Bingo tables in your DB associated with this deployment>",
    "possiblePrizes": [<an array of short strings dictating the prizes that players can win>],
    "debugMode": <true|false, depending on whether you want to enable various debug functions, such as the ability to use the Bingo Test App to call all numbers immediately>
}
```

### `dbInfo.json`
Here's what your `dbInfo.json` file should look like:
```
{
    "mySQLHost": "<the host associated with your database>",
    "mySQLUsername": "<MySQL DB username>",
    "mySQLPassword": "<MySQL DB password>",
    "databaseName": "<the name of the database associated with Bingo>"
}
```

## Testing
You can perform a local 1-person test of this new code by doing the following:
1. Restore a Bingo content archive onto your local sandbox so that you have all of the necessary content.
2. Set up your Secrets as per the  "Secrets" section above.
3. Run the `bingo.js` Web app from a local NodeJS v10.15.1 installation.
    - Run `node bingo.js` from the `webApps` directory.
4. Run MySQL locally.
    - You can create the necessary Bingo database by modifying the `startup()` function within the `bingo.js` web app script.
5. Run a local HTTP server to serve the client/server scripts, then change all of the script URLs on the content.
    - With NodeJS and `npm` installed, stand up a simple HTTP server with `npm install http-server -g` followed by `http-server -p 8888` from the `bingo` directory.


# Release Notes

## v2.2 | 2019-02-21_16-00-00 | [commit 419c111](https://github.com/highfidelity/hifi-content/commits/419c111)

- Bingo players can now see all of the numbers that were called in a round in their Card app.

## v2.1 | 2019-02-20_15-28-00 | [commit 9070468](https://github.com/highfidelity/hifi-content/commits/9070468)

- Tons of various fixes and improvements to v2.0.

## v2.0 | 2019-02-14_11-38-00 | [commit 4ae9e0b](https://github.com/highfidelity/hifi-content/commits/4ae9e0b46c5561c19eb8cb3a7b8994d9c985421f)

- Transitioned Bingo backend from Google Scripts to custom High Fidelity Experiences backend.

## v1.16

2019-02-05_15-44-00 commit 4a5b7fb3ffdf58a0a212f5293cb042392f177871

- Update UI version on Spawner entity script

## v1.15

2019-02-05_15-06-00 commit 534d4defa76dd6b1b1a65ec31a5ecff7406ece90

- Small update to prize language

## v1.14

2019-02-05_09-41-00 commit cd209119d66842c3f30ace0876c2ebe97af48c22

- Moved backend DB to new URL

## v1.13

2019-02-04_16-10-00 commit cd209119d66842c3f30ace0876c2ebe97af48c22

- Fixed off-by-one error during Bingo prize selection

## v1.12

2019-02-04_12-04-00 commit cc224b357248076d2d50af50f03f6c4ce9fd9523

- Fixed oculus prize name

## v1.11

2019-02-04_11-28-00 commit 1719ac704da653e32747ef5e6deaa96236005dc9

- Removed stillOccupied and Cleanup logic for scanner zone stability

## v1.1

2019-02-04_10-25-00 commit 373745235ae2dda3cb123978752bf6f00ed9a06e

- Added error message to Bingo card app when not logged in

## V1

02/01/2019 commit bd16f6dacfdade1ee07a89987b2d834390cdefb2

-Applied new Coding Standards
-Applied new file structure standards
-Added prize doors and prizes
-Removed texture swapping
-Implemented scanner walk through with stage bouncer zones
