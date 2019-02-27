# Script Pauser
When this script is attached to an entity as an entity script, the entity serves as a "Script Pauser", useful for when you don't want some script to be running in your domain.

## Features
- Script Pauser will stop a client script that a user is running if it meets one of the following criteria:
    1. The user-defined "fuzzy match" array contains a string that is within any script name that is currently running
        - CAUTION: Fuzzy matching script names comes with risks of accidentally stopping the wrong client script, resulting in more user frustration!
    2. The user-defined "exact match" array contains a string that exactly matches the script name that is currently running
- Any scripts that Script Pauser stops will be automatically restarted when Script Pauser is unloaded (i.e. the user leaves the domain in which the entity to which Script Pauser is attached is contained)

NOTE that, when Script Pauser restores a Paused script that is a certified script, the "Installed" state of that script will be lost. This means that, when Script Pauser restores a previously-installed certified app, the Inventory app will not show that app as "Installed", even though its associated script is running.

## Setup
1. Add an entity to your domain.
    - A big Box primitive would work perfectly.
    - Note that anyone who can modify the `userData` of this entity will be able to control which scripts are temporarily paused!
    - A good place for this entity is right under the floor near your domain's spawn point. You want to ensure that all visitors to your domain load this entity.
2. Add the below `userData` object to the attached entity's `userData`
    1. Fill in the `fuzzyScriptNames` array in the `userData` by adding partial names of scripts that you want to pause.
        - For example, to pause the Appreciation App, you might use: `"fuzzyScriptNames": ["ApPrEcIaTe"]`
    2. Fill in the `exactScriptNames` array in the `userData` by adding exact names of scripts that you want to pause.
        - For example, to pause the Appreciation App, you might use: `"fuzzyScriptNames": ["appreciate_app.js"]`
3. Add the `scriptPauser.js` script to the entity

Here's the object to add to the entity's `userData`:
```
{
    "fuzzyScriptNames": [],
    "exactScriptNames": []
}
```

# Releases

## 2019-02-26_17-00-00 :: [4b5af1b](https://github.com/highfidelity/hifi-content/commit/4b5af1b)
- Initial release