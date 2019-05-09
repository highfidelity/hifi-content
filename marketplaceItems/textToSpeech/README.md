# Text to Speech
The Text to Speech app allows you to communicate in High Fidelity using Text-to-Speech synthesis. If you don't have a microphone, don't want to use your voice, or can't use your mic, try using Text to Speech to talk to others around you.

## Features
- TTS now uses Google's TTS API for speech synthesis instead of relying on Windows' TTS engine. This means TTS is now available for non-Windows users.
- You can now select a preferred synthesized voice from a number of high-quality options.
- TTS is now multilingual! Choose a language from several languages. Your input text will be automatically translated to the target language before being spoken no matter what language you use for the input text.
- TTS v2.0 supports [SSML](https://cloud.google.com/text-to-speech/docs/ssml) text input! **Press `CTRL + Enter` to send your text input as SSML text** - there is no UI element to send your text input as SSML text.

# Setup

1. Create a GCP Service Account and obtain its key from [here](https://console.cloud.google.com/apis/credentials/serviceaccountkey).
2. Move the JSON keyfile from (1) into `<textToSpeech root>/webApp/googleKeyfile.json` (see below)
2. Deploy the Text to Speech Web App
3. Configure `<textToSpeech root>/hifiScript/secrets.json` (see below)
4. Run `<textToSpeech root>/hifiScript/textToSpeech.js` from High Fidelity's Running Scripts menu.

## `webApp/secrets.json` Config

Here's what your `webApp/config.json` config file should look like:

```
{
    "MP3_HOST_ROOT": "<A link to where `<textToSpeech root>/webApp/mp3s/` is publicly hosted. No trailing slash.>"
}
```

## `hifiScript/secrets.json` Config

Here's what your `hifiScript/config.json` config file should look like:

```
{
    "REQUEST_URL": "<A hostname and path to your deployed Web App. No trailing slash.>" 
}
```

# Release Notes

## Web App v2.0 | HiFi Script v2.0 | [commit 516bf76](https://github.com/highfidelity/hifi-content/commits/516bf76)

This is the initial release of Text to Speech as developed by the High Fidelity Experiences Team.

Check out the Features section above for a full changelog over the existing v1.0.