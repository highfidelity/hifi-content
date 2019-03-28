# Notify App
This app lets you notify other users via a browser push notification.

# Setup Instructions
1. Setup `<pushNotifications>/hifiApp/config/config.json` as per the instructions below.
2. Change the definition of `SUBSCRIPTION_ENDPOINT` within `<pushNotifications>/webApp/www/notify/js/notif.js`
3. Set up `<pushNotifications>/webApp/app/secrets/dbInfo.json` as per the instructions below.

## `hifiApp/config/config.json` Setup
```
{
    "pushApiEndpoint": "<The URL of /api/notify/push>"
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