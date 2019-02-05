# Bouncer Zone Script
When this script is attached to a zone, it serves as a virtual bouncer. The script can "bounce" avatars from the zone if they do not meet criteria defined by the script. There are two criteria used to determine whether an avatar should be removed from the zone:
1. Is the username of the avatar in the zone contained in the attached entity's userData OR in the hardcoded `PROVED_USERNAMES` array?
2. Is the avatar wearing a predefined wearable AND does the avatar own that wearable?

## Setup
1. Add the below `userData` object to the zone entity's `userData`
    1. Fill in `rejectTeleportLocation`, example `"/13.9828,-10.5277,0.0609192/0,0.460983,0,0.887409"`
        1. This is where "bounced" avatars are sent when they fail to pass the bouncer criteria
    2. Optional: Add a `marketplaceID` of the wearable to verify
    3. Optional (Can update while script is running): Update `usernames` array with whitelisted usernames
2. Add approved users to `APPROVED_USERNAMES` in the script - keep this array blank if you're not using this method
3. Add the `bouncerZone.js` script to the zone entity
4. Update `userData` at any time to add more usernames to the whitelist

Here's the object to add to the zone entity's `userData`:
```
{
    "whitelist" : {
        "rejectTeleportLocation" : "<HIFI ADDRESS>",
        "marketplaceID" : "<Optional: Marketplace Item ID>",
        "usernames" : [""]
    },
   "grabbableKey": {
      "grabbable": false
    }
}
```

# Release Notes
## Version 2019-01-16_16-30-00
commit ddc1aaf93202e51c7026fdb28c596caf9065192a
- Initial release