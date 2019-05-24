# Portal
When this script is attached to a zone, the zone serves as a portal, which can be used to transport avatars between domains and within domains.

## Setup
1. Rez a zone entity that you want to act as the portal.
2. Add the below `userData` object to the zone entity's `userData`.
3. Add the `portal.js` entity script to the zone entity.
4. Update `userData` at any time to modify the portal's destination.

Here's the object to add to the zone entity's `userData`:
```
{
    "destination": "<The destination at which the portal user will appear. The avatar's location will be changed using the `window.location` scripting interface, so relative paths and `hifi://` URLs are supported.>"
}
```

# Release Notes
## v1.0 :: [3963656](https://github.com/highfidelity/hifi-content/commit/3963656)
- Initial release