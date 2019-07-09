# Sound Emitter
- When you attach `soundEmitterServer.js` to any entity, audio will start playing from that position for everybody in the domain.
- You can specify the audio that plays for everyone by modifying the attached entity's `userData`.
- The audio tracking offset will be synced across clients.
- The audio will be affected by attenuation zones.
- Users can manually set this audio's attenuation via Settings -> Audio -> Environment Volume.
- If a user modifies the attached entity's `userData` options (including `soundURL`), the audio injector will automatically apply those new settings.

# Setup Instructions
1. Rez an entity (any entity).
2. Modify the `userData` of the entity to set the sound emitter's options (see below).
3. Attach `soundEmitterServer.js` as a Server Script to the entity.

## Entity `userData`
The entity's `userData` should follow this JSON structure:
```
{
    "soundURL": "<A URL to an MP3 or WAV sound.>",
    "volume": <The sound emitter's volume from 0.0 to 1.0. Defaults to 0.5.>,
    "shouldLoop": <`true` if the sound should loop; `false` otherwise. Defaults to `false`.>,
    "localOnly": <`true` if the sound injector should be a local injector; `false` otherwise. Defaults to `false`.>
}
```

# Release Notes
## v1.1 | [commit 3ea8117](https://github.com/highfidelity/hifi-content/commits/3ea8117)
- Added the ability to set the `localOnly` option of the Audio Injector inside the Sound Emitter's `userData`

## v1.0 | [commit b6b26ac](https://github.com/highfidelity/hifi-content/commits/b6b26ac)
- Initial Release