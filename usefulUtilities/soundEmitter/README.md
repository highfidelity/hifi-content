# Sound Emitter
- When you attach `soundEmitter.js` to any entity, audio will start playing from that position (or a specified position) for everybody in the domain.
- You can specify the audio that plays for everyone by modifying the attached entity's `userData`.
- You can attach `soundEmitter.js` to an entity as an entity server script or an entity client script.
    - If you attach `soundEmitter.js` to an entity as an **entity server script**:
        - The audio tracking offset **WILL** be synced across clients.
        - The audio **WILL** be affected by attenuation zones.
        - Users **CAN** manually set this audio's attenuation via Settings -> Audio -> Environment Volume.
        - You **CANNOT** use `soundEmitter.js` in serverless domains.
    - If you attach `soundEmitter.js` to an entity as an **entity client script**:
        - The audio tracking offset **WILL NOT** be synced across clients.
        - The audio **WILL NOT** be affected by attenuation zones.
        - Users **CANNOT** manually set this audio's attenuation via Settings -> Audio -> Environment Volume.
        - You **CAN** use `soundEmitter.js` in serverless domains.
- If a user modifies the attached entity's `userData` options (including `soundURL`), the audio injector will automatically apply those new settings.

# Setup Instructions
1. Rez an entity (any entity).
2. Modify the `userData` of the entity to set the sound emitter's options (see below).
3. Attach `soundEmitter.js` to the entity as EITHER an entity server script OR an entity client script. *Do not attach the script to the entity as BOTH an entity server script and an entity client script.*
    - Please see the description of Sound Emitter above for why you would want to choose one script type over the other.

## Entity `userData`
The entity's `userData` should follow this JSON structure:
```
{
    "soundURL": "<Required. A URL to an MP3 or WAV sound.>",
    "volume": <Optional. The sound emitter's volume from 0.0 to 1.0. Defaults to 0.5.>,
    "shouldLoop": <Optional. `true` if the sound should loop; `false` otherwise. Defaults to `false`.>,
    "positionOverride": <Optional. A JSON object containing `x, y, z` coordinates from which the sound should emit. Defaults to the attached entity's position.>
}
```

# Release Notes
## v1.2 HOTFIX | [commit 63bc395](https://github.com/highfidelity/hifi-content/commits/63bc395)
- This is a hotfix, so the version number isn't changing; the code on S3 will be updated to this version of the code, so code from commit `f648882` will not be officially hosted on our S3.
- Fixed [BUGZ-1147](https://highfidelity.atlassian.net/browse/BUGZ-1147): "Serverless domain - Audio log spam when in serverless domain"

## v1.2 | [commit f648882](https://github.com/highfidelity/hifi-content/commits/f648882)
- Added the ability to set the `position` option of the Audio Injector inside the Sound Emitter's `userData` via the `positionOverride` key/value pair.
- Documented why one would want to attach `soundEmitter.js` as either an entity client script or an entity server script.
- Removed the ability to set the `localOnly` option of the Audio Injector inside the Sound Emitter's `userData`. `localOnly` will be `true` if `soundEmitter.js` is attached as an entity client script, and `localOnly` will be `false` if `soundEmitter.js` is attached as an entity server script.

## v1.1 | [commit 3ea8117](https://github.com/highfidelity/hifi-content/commits/3ea8117)
- Added the ability to set the `localOnly` option of the Audio Injector inside the Sound Emitter's `userData`

## v1.0 | [commit b6b26ac](https://github.com/highfidelity/hifi-content/commits/b6b26ac)
- Initial Release