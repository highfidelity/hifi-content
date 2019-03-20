# JATScript
A script used by James Arnold Taylor during his performance.

## Features
- When run, rezzes JAT's five avatars as clickable Overlays on the Multi-Con stage.
- When run, rezzes JAT's VLC play/pause/next/previous Overlays on the Multi-Con stage.

## Setup
1. Set up `config.json` as per instructions below.
2. Run `JATScript.js` on JAT's client once he enters the Multi-Con domain.

## `config.json` Setup
Place a `config.json` file in the same directory as this script in the following format:
```
{
    "avatars": [
        {
            "name": "<Name of Avatar 1>",
            "url": "<URL to FST of Avatar 1>"
        },
        {
            "name": "<Name of Avatar 2>",
            "url": "<URL to FST of Avatar 2>"
        },
        {
            "name": "<Name of Avatar 3>",
            "url": "<URL to FST of Avatar 3>"
        },
        {
            "name": "<Name of Avatar 4>",
            "url": "<URL to FST of Avatar 4>"
        },
        {
            "name": "<Name of Avatar 5>",
            "url": "<URL to FST of Avatar 5>"
        }
    ],
    "screenleapURL": "<URL to Screenleap associated with the Web Overlay that shows up in front of JAT>",
    "controlsMessageChannel": "<Message channel used for presentation controls>",
    "statusMessageChannel": "<Message channel used for changing presentation status text>"
}
```

# Releases

## 2019-03-19_09-36-00 :: [74c4b1c](https://github.com/highfidelity/hifi-content/commit/74c4b1c)
- Integrated CR feedback

## 2019-03-15_19-00-00 :: [b564b47](https://github.com/highfidelity/hifi-content/commit/b564b47)
- Initial release