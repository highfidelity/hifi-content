# `www` Entity Edit Filter 
This is the Entity Edit Filter that goes in the `hifi://www` domain.

## Parameters
This Entity Edit Filter has the following parameters:
1. All physics edits are disallowed.
2. Upon entity add, only allow entities to be added if the original name of the entity contains "Whiteboard" AND the new name equals the old name.
3. Upon entity edit, only allow entities to be edited if the original name of the entity contains "Whiteboard". Otherwise, allow all edits to `privateUserData` (the entity server will handle authenticating users to verify that they're actually allowed to edit that entity property).
4. Upon entity deletion, only allow entities to be deleted if the original name of the entity contains "Whiteboard".

# Releases

## v1.0 :: [xxxxxxx](https://github.com/highfidelity/hifi-content/commit/xxxxxxx)
- Initial release