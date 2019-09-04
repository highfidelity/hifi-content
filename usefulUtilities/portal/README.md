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
    "destination": "<See the section titled 'The `destination` Key/Value Pair in `userData`' below.>"
}
```

### The `destination` Key/Value Pair in `userData`
The value associated with the `destination` key refers to the destination at which the portal user will appear.

If a portal's `destination` is set to be in the same domain using relative paths (i.e. it matches one of the regular expressions detailed below), the avatar's feet will be sent to the specified location rather than the avatar's hips.

If you specify the `destination` as a `hifi://` URL, the avatar's location will be changed using the `window.location` scripting interface.

If you specify the `destination` value using the syntax `bookmark:<bookmark name>`, then the portal will move the user to the location specified by that named bookmark (which is stored on the user's hard drive in `bookmarks.json`) using the `window.location` scripting interface.

#### Intra-Domain Feet Positioning Regular Expressions
##### Local Coordinates with Orientation Regex
`^\/(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?)\/(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?)`
##### Local Coordinates Without Orientation Regex
`^\/(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?),(-?[0-9]+(?:\.[0-9]+)?)`

# Release Notes
## v1.3 :: [bae5191](https://github.com/highfidelity/hifi-content/commit/bae5191)
- Intra-domain `destination`s (i.e. the portal `destination` is set to a relative path) will now move the avatar's _feet_ position to the specified location instead of the avatar's hips.

## v1.2 :: [cf7e6d2](https://github.com/highfidelity/hifi-content/commit/cf7e6d2)
- Added the ability for a portal to send users to a location specified by a bookmark (_any_ bookmark!). Bookmarks are stored in a `bookmarks.json` file on the user's hard drive.

## v1.1 :: [ea202c9](https://github.com/highfidelity/hifi-content/commit/ea202c9)
- Added the ability for a portal to send users to a location specified by the bookmark called "Home" (and _only_ "Home"). Bookmarks are stored in a `bookmarks.json` file on the user's hard drive.

## v1.0 :: [3963656](https://github.com/highfidelity/hifi-content/commit/3963656)
- Initial release