# High Fidelity Ping
This app lets you send other users a browser push notification from within High Fidelity.

# Setup Instructions
1. Setup `<hifiPing>/hifiApp/config/config.json` as per the instructions below.
2. Change the definition of `SUBSCRIPTION_ENDPOINT` within `<hifiPing>/webApp/www/hifiPing/js/ping.js`
3. Set up `<hifiPing>/webApp/app/secrets/dbInfo.json` as per the instructions below.

## `hifiApp/config/config.json` Setup
```
{
    "pushApiEndpoint": "<The URL of /api/hifiPing/push>"
}
```

## `webApp/app/secrets/dbInfo.json` Setup
```
{
    "mySQLHost": "<Hostname of the MySQL server>",
    "mySQLUsername": "<Username you'll use to connect to the MySQL server>",
    "mySQLPassword": "<Password you'll use to connect to the MySQL server>",
    "databaseName": "<Name of the DB you'll use for this webapp>"
}
```

# Usage Instructions

# Release Notes

## 2019-xx-xx_xx-xx-xx | [commit xxxxxxx](https://github.com/highfidelity/hifi-content/commits/xxxxxxx)
- Initial Release