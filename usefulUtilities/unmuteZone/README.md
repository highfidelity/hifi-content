# Unmute Zone
When this script is added to a zone as a client entity script, the zone will unmute when the person is inside the zone.

## Features
- Unmute zone will unmute a person when inside the zone
- Leaving the zone, the script will set your mute status back to the previous setting upon entering the zone
- If a user mutes themselves inside the zone, the zone will not change your mute settings after leaving the zone

## Setup
1. Add a zone entity to your domain
2. Select the zone entity with the Create Tool
3. Add `unmuteZoneClient.js` to the "Script" section

# Releases

## 2019-04-09_7-00-00 :: [5d396c5](https://github.com/highfidelity/hifi-content/commit/5d396c5)
- Initial release