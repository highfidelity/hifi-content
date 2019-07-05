# Sound Emitter
When you attach `soundEmitterServer.js` to any entity, audio will start playing from that point for everybody in the domain. You can specify the audio that plays in the attached entity's `userData`.

# Setup Instructions
1. Rez an entity (any entity).
2. Modify the `userData` of the entity to set the sound emitter's options (see below).
3. Attach `soundEmitterServer.js` as a Server Script to the entity.

Sound emitter options are automatically checked and applied every 500ms.

## Entity `userData`
The entity's `userData` should follow this JSON structure:
```
{
    "soundURL": "<A URL to a _mono_ MP3 or WAV sound.>",
    "volume": <The sound emitter's volume from 0.0 to 1.0.>,
    "shouldLoop": <`true` if the sound should loop; `false` otherwise.>
}
```

# Release Notes
## v1.0 | [commit xxxxxxx](https://github.com/highfidelity/hifi-content/commits/xxxxxxx)
- Initial Release