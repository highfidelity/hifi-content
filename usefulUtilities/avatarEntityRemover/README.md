# Avatar Entity Remover
When this script is attached to an entity as an entity script, the entity serves as an "Avatar Entity Remover", useful for removing avatar entities in a domain.

## Features
- Avatar Entity Remover will prevent new avatar entities from being added by a user when the script is running.
- Avatar Entity Remover will remove existing avatar entities from an avatar when they load the script.
- If a user of a locked avatar entity loads the script, they will be kicked to a user-configurable domain.
- Using a configuration switch, you can enable a feature that will restore all removed avatar entities when the Avatar Entity Remover script is unloaded.

## Exclusions
- You cannot whitelist avatar entity model domains - with that feature, users could simply enlarge approved wearables and use them for griefing purposes.

## Setup
1. Add an entity to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`
    1. Set the `enableAvatarEntityRestore` `bool` in the `userData` to `true` if you want removed avatar entities to be restored when the script is unloaded; set it to `false` otherwise.
    2. Set the `kickDomain` value in the `userData` to the domain to which you want users of locked avatar entities to be moved.
3. Add the `avatarEntityRemover.js` script to the entity

Here's the object to add to the entity's `userData`:
```
{
    "enableAvatarEntityRestore": <true|false>,
    "kickDomain": <The domain to which you want users of locked avatar entities to be moved. Defaults to "hifi://domain">
}
```

# Releases

## 2019-03-15_10-23-00 :: [6417299](https://github.com/highfidelity/hifi-content/commit/6417299)
- Initial release