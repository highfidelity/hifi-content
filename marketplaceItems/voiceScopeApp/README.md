# The Voice Scope App

Have you ever had trouble figuring out who was talking in a group? Then this is the tool for you! The Voice Scope is a tool that lets you see the audio output of the people around you visualized as a loudness meter floating above their head.

Simply enable the app by clicking the ON/OFF button and enjoy the knowledge of who is talking, visualized.

# Release Notes
## version 1.1
Februrary 6, 2019
20c1361e9362b65275cbb28500704e20cc5c735e
- Bug fix for Window.domainChanged() on appEnding(), and added draw order toggler and height slider to the app.

## version 1.0 
2019-01-17_09_45_00
d369c44e9b7515d3d3a4267aeadd7eb259742b98
- Initial Release

# TO DO

1. Clean up userArray and userObject if sorting the loudest users is not desired.
2. Remove the "findOverlays()" usage for cleaning up straggler overlays once certain deleting parents takes care of children.
3. Remove sorting function if not sorting anything.
4. Figure out creation of overlays with children and why there is a non-zero amount of time that needs to pass before spawning children overlays.

