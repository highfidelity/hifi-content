# Mirror
- Attach `mirrorClient.js` to a box entity whose z dimension is very small, and whose x and y dimensions are up to you.
- Attach `mirrorReflection.js` to a zone entity that is parented to the above box entity. When a user enters this zone, the mirror will turn on. When a user leaves this zone, the mirror will turn off.

The maximum pixel resolution of the mirror is 960px on the mirror's long side. The pixel resolution of the short side of the mirror is based on the aspect ratio of the mirror to ensure square pixels, and will always be smaller than 960px.

# Release Notes
## Version 2019-08-01_13-02-00
commit 550bb2ba
- Made the mirror local entity not grabbable

## Version 2019-07-24_09-18-00
commit 9cd250fe397a88f90108a49559934fbec7f639bd
- Fixed a nasty bug that caused the mirror not to turn on or off.

## Version 2019-07-03_10_20_00
commit 12f28b5f47d3905d1dbaf93f5199a294d709e1f5
- Fixed a hack in which the mirrors were darkened to compensate for the secondary camera being too light.
- If your mirrors look too light, it means you have an older version of Interface (pre PR #15862) and should go back to the previous version of this script.
- If your mirrors look too dark, it means you have a newer version of Interface (post PR #15682) and should update to the current version of this script.

## Version 2019-01-14_09_40_00
commit 38a75210f31c46b4b23b285859d2f33159fce163
- Initial release

# Known Issues
- mirrorClient.js uses an update loop instead of a timer.
