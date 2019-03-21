# Locked Avatar Entity Remover
When this script is attached to an entity as an entity script, the entity serves as a "Locked Avatar Entity Remover", useful for removing _locked and unlocked_ avatar entities in a domain. **This script will only fully work if it is deployed in a domain in which everyone has lock/unlock permissions!**

## Features
- Avatar Entity Remover will forcibly remove _locked and unlocked_ avatar entities from an avatar.

## Setup
1. Add an entity to your domain.
    - A giant Zone entity would work perfectly. A good place for this entity is centered around your domain's content. Its dimensions should be large enough to encompass the domain's content. You want to ensure that all visitors to your domain load this entity.
    - Note that anyone who can modify the `userData` of this entity will be able to control this script's configurable settings!
2. Add the below `userData` object to the attached entity's `userData`
    1. Set the `cleanUserDomain` value in the `userData`.
    2. Set the `neverMoveUsers` array in the `userData`.
2. Add the `lockedAvatarEntityRemover.js` script to the entity.

Here's the object to add to the entity's `userData`:
```
{
    "cleanUserDomain": <The domain to which you want users of ZERO avatar entities to be moved. If not specified, the script won't move clean avatars.>,
    "neverMoveUsers": [<Usernames of users you never want to move, even if they are clean.>]
}
```

# Releases

## 2019-03-15_14-36-00 :: [3963656](https://github.com/highfidelity/hifi-content/commit/3963656)
- Initial release