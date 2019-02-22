module.exports = {
    "root": true,
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 5
    },
    "globals": {
        "Account": false,
        "AccountServices": false,
        "Agent": false,
        "AnimationCache": false,
        "Assets": false,
        "Audio": false,
        "AudioDevice": false,
        "AudioEffectOptions": false,
        "Avatar": false,
        "AvatarBookmarks": false,
        "AvatarList": false,
        "AvatarManager": false,
        "Camera": false,
        "Clipboard": false,
        "Controller": false,
        "Desktop": false,
        "DebugDraw": false,
        "DialogsManager": false,
        "Entities": false,
        "EntityViewer": false,
        "FaceTracker": false,
        "Keyboard": false,
        "GlobalServices": false,
        "Graphics": false,
        "HMD": false,
        "LODManager": false,
        "Mat4": false,
        "Menu": false,
        "Messages": false,
        "Midi": false,
        "ModelCache": false,
        "MyAvatar": false,
        "Overlays": false,
        "OverlayWebWindow": false,
        "Paths": false,
        "Picks": false,
        "PickType": false,
        "Pointers": false,
        "Quat": false,
        "Rates": false,
        "RayPick": false,
        "Recording": false,
        "Resource": false,
        "Reticle": false,
        "Scene": false,
        "Script": false,
        "ScriptDiscoveryService": false,
        "Selection": false,
        "Settings": false,
        "Snapshot": false,
        "SoundCache": false,
        "Stats": false,
        "Tablet": false,
        "TextureCache": false,
        "Toolbars": false,
        "Uuid": false,
        "UndoStack": false,
        "UserActivityLogger": false,
        "Vec3": false,
        "WebSocket": false,
        "WebWindow": false,
        "Window": false,
        "XMLHttpRequest": false,
        "console": false,
        "location": false,
        "print": false,
        "$": false,
        "document": false,
        "EventBridge": false,
        "module": false
    },
    "rules": {
        "brace-style": ["error", "1tbs", { "allowSingleLine": false }],
        "comma-dangle": ["error", "never"],
        "camelcase": ["error"],
        "curly": ["error", "all"],
        "eqeqeq": ["error", "always"],
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "keyword-spacing": ["error", { "before": true, "after": true }],
        "max-len": ["error", 128, 4],
        "new-cap": ["error"],
        "no-console": "off",
        "no-floating-decimal": ["error"],
        "no-magic-numbers": ["error", { "ignore": [-1, 0, 1], "ignoreArrayIndexes": true }],
        "no-multiple-empty-lines": ["error"],
        "no-multi-spaces": ["error"],
        "no-unused-vars": ["error", { "args": "none", "vars": "local" }],
        "semi": ["error", "always"],
        "spaced-comment": ["error", "always", {
            "line": { "markers": ["/"] }
        }],
        "space-before-function-paren": ["error", {"anonymous": "ignore", "named": "never"}]
    }
};
