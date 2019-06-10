# `www` Entity Edit Filter 
This is the Entity Edit Filter that goes in the `hifi://www` domain.

## Parameters
This Entity Edit Filter has the following parameters:
1. All PHYSICS edits are disallowed.
2. When the ES receives an entity ADD packet, the filter will only allow entities to be added if the name of the new entity contains "Whiteboard".
    - This allows the on-board Whiteboard Polylines to get added to the ES' entity tree.
    - Theoretically, this means anyone could add an entity to the tree if they named the entity with this knowledge, but we don't expect people to grief their headquarters on purpose :).
3. When the ES receives an entity EDIT packet, the filter will only allow entities to be edited if the original name of the entity contains "Whiteboard". Otherwise, the filter will allow all edits to `privateUserData`; the entity server will handle authenticating users to verify that they're actually allowed to edit `privateUserData`.
    - This allows the on-board Whiteboard Polylines to be edited as the user draws.
4. When the ES receives an entity DELETE packet, the filter will only allow entities to be deleted if the original name of the entity contains "Whiteboard".
    - This allows the on-board Whiteboard Polylines to be deleted by users.

# Releases

## v1.0 :: [4752c25](https://github.com/highfidelity/hifi-content/commit/4752c25)
- Initial release