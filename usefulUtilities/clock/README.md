# CLOCK

## Description
This script turns a text entity into a clock. The time zone can be adjusted via the userData of the entity. If you do not want the time zone to show, make the width of your text entity smaller to cover it.

## File List
### Server Side
* **clockServer.js** attached to the text entity.

## Setup
1. Add an text entity to your domain.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`.
    1. Set the `timezoneName` to the name of the time zone you would like to show after the time.
    1. Set the `timezoneOffset` to the numerical difference between GMT and the time zone you would like your clock to be in.
3. Add the `clockServer.js` script to the zone entity.

Here's a sample object to add to the entity's `userData`. You can adjust the position and dimensions.:
```
{
  "timezoneName": "PDT",
  "timezoneOffset": "-7"
}
```

## Releases
### Version 1.0
SHA [277df3d](https://github.com/highfidelity/hifi-content/commits/277df3d) May 28, 2019
- [JIRA 300](https://highfidelity.atlassian.net/browse/BUGZ-300)   Initial Release