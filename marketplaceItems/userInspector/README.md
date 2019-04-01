# User Inspector

## Description

With User Inspector, you can click anywhere on an avatar and get a quick view of who they are with a few advantages:

1. Always see the same size nametag no matter how far away you are.
2. Define the size yourself through the custom app.
3. If you are an admin, you will see their username
4. If their display name changes, you will see the update.
5. If they are your friend, they will become a brighter color, and you can also see their username. 

## Releases

### 2019-03-20_11-00-00 | Marketplace v1.0 | [518f5da]

### 2019-03-20_11-00-00 | Marketplace v1.1 | [e6b3a0f]
- Fixed enable / disable bug that was silently crashing the app

### 2019-04-01_14-07-46 | Marketplace v2.0 | [c14458c]
- Updated text colors
- Fixed culling to now use renderLayer: "front"

## Project Links
[Trello Card](https://trello.com/c/9BVI2fyL/71-combined-name-tag-app)

## Known issues
- V1.0 is a stop-gap version.  Created in RC79, but RC79.1 broke some local text entity properties this relied upon. They will be fixed in RC81.  The current rendering issues weren't worth fixing for one release.  In that release, the render layer will be in front, and you will always be able to see the name tags without being culled. 
