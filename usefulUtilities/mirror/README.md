# Mirror
- Attach `mirrorClient.js` to a box entity whose z dimension is very small, and whose x and y dimensions are up to you.
- Attach `mirrorReflection.js` to a zone entity that is parented to the above box entity. When a user enters this zone, the mirror will turn on. When a user leaves this zone, the mirror will turn off.

The maximum pixel resolution of the mirror is 960px on the mirror's long side. The pixel resolution of the short side of the mirror is based on the aspect ratio of the mirror to ensure square pixels, and will always be smaller than 960px.

# Release Notes
## Version 2019-01-14_09_40_00
commit 38a75210f31c46b4b23b285859d2f33159fce163
- Initial release