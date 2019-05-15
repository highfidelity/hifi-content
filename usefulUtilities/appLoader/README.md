# App Loader
When this script is attached to an entity as an entity script, the entity serves as an "app loader".

## Features
- App Loader will load scripts defined as hardcoded URLs in the JavaScript, AND will load scripts defined in the `userData` property of the attached entity.
- When the user leaves the domain (or otherwise unloads the script attached to the entity), App Loader will stop client scripts that it loaded. App Loader will NOT stop client scripts that it did not load (i.e. those that were previously running).

## Setup
1. Add an entity to your domain.
    - A Box primitive would work perfectly.
    - Note that anyone who can modify the `userData` of this entity will be able to control which scripts other users load!
    - A good place for this entity is right under the floor near your domain's spawn point. You want to ensure that all visitors to your domain load this entity.
2. Add the below `userData` object to the attached entity's `userData`
    1. Fill in the `apps` array in the `userData` by adding URLs to scripts that you want users to load.
        - For example, to load an uncertified version of the Appreciation App, you would use: `"appURLs": ["https://hifi-content.s3.amazonaws.com/Experiences/Releases/marketPlaceItems/appreciate/2019-02-14_10-00-00/appResources/appData/appreciate_app.js"]`
    2. Fill in the `usernameWhitelist` array in the `userData` by adding usernames of users for whom you don't want the App Loader to load any apps.
        - For example, if you don't want the App Loader to load any apps for the user with username `zach`, you would use: `"usernameWhitelist": ["zach"]`
3. Add the `appLoader.js` script to the entity

Here's the object to add to the zone entity's `userData`:
```
{
    "appURLs": [],
    "usernameWhitelist": []
}
```

# Releases

## v1.2 :: [ea92250](https://github.com/highfidelity/hifi-content/commit/ea92250)
- Added a "username whitelist" feature

## v1.1 :: [2d46694](https://github.com/highfidelity/hifi-content/commit/2d46694)
- Fixed a bug where a duplicate copy of an already-running script would erroneously be loaded.

## 2019-02-14_10-45-00 :: [3fee98493cf228259b231b88384f5aafd47309b0](https://github.com/highfidelity/hifi-content/commit/3fee98493cf228259b231b88384f5aafd47309b0)
- Initial release