# Bouncer Zone Script
When this script is attached to a zone, it serves as a virtual bouncer. The script can "bounce" avatars from the zone if they do not meet criteria defined by the script. Data to determine which users are allowed inthe zone can be changed via userData of the zone without the need for a script restart. There are two criteria used to determine whether an avatar should be removed from the zone:
1. If the avatar is listed in the zone userData under whitelist > usernames, they will not be bounced.
2. If the avatar is an admin and the zone userData: whitelist > adminsAllowed is set to tru, the user will not be bounced. Admins are defined as users with lock/unlock privileges.
3. If the user is wearing awearable with a Marketplace ID that matches an ID listed in the userData of the zone under whitelist > marketplaceID, the user will not be bounced.

## Setup
1. Add the below `userData` object to the zone entity's `userData`
    1. Fill in `rejectTeleportLocation`, example `"/13.9828,-10.5277,0.0609192/0,0.460983,0,0.887409"`
        1. This is where "bounced" avatars are sent when they fail to pass the bouncer criteria
        2. If this is not filled in, the user will be sent to the position/orientation `"/0,0,0/0,0,0,0"`
    2. Optional: Add a `marketplaceID` of the wearable to verify
    3. Optional: Update `usernames` array with whitelisted usernames
2. Add approved users to `APPROVED_USERNAMES` in the script - keep this array blank if you're not using this method
3. Add the `bouncerZone.js` script to the zone entity as a client script
4. Update `userData` at any time to add more usernames to the whitelist

Here's the object to add to the zone entity's `userData`:
```
{
    "whitelist": {
        "rejectTeleportLocation": "<HIFI ADDRESS>",
        "adminsAllowed": <Optional: boolean>,
        "marketplaceID" : "<Optional: Marketplace Item ID>",
        "usernames" : [""]
    },
    "bounceSound": {
        "bounceSoundURL": "<URL of sound that plays when user is ejected from zone>",
        "bounceSoundVolume": <number 0-1>
    },
   "grabbableKey": {
      "grabbable": false
    }
}
```

## Releases
### Version 2019-01-16_16-30-00
- Initial release

### Version 