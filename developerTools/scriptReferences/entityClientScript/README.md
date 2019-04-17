## Entity Client Script Template

This file contains all entity client script signals. It can be used as a starting point for a new entity client script or as a hifi developer reference guide.

Client entity methods and signals that are triggered by mouse and/or controller interactions.

Entity client scripts are run on every instance of Interface that is connected to the Entity Server that hosts the entity. If one user modifies the state of the script, other users will not see the changes that user made to the state of the script.

In other words, consider the following example:
- `Entity A` is stored on `Entity Server 1`
- `Entity A` has an entity client script attached to it. When the script starts, it starts a timer that increments a value by 1 every second. That `Value` starts at 0.
- `Entity Server 1` is connected to `Domain Server A`

Now:
1. `User X` connects to `Domain Server A`, which connects `User X` with the `Entity Server 1`.
2. `Client X` downloads `Entity A` and its properties.
3. `Client X` sees that `Entity A` has an entity client script attached to it. The client downloads that script and begins running it.
4. Five seconds elapse. `Value X` is now `5`.
5. `User Y` connects to `Domain Server A`, which connects `User Y` with the `Entity Server 1`.
6. `Client Y` downloads `Entity A` and its properties.
7. `Client Y` sees that `Entity A` has an entity client script attached to it. The client downloads that script and begins running it.

At this point, `Value X` is 5, and `Value Y` is 0. This is because each client has started its own instance of `Entity A`'s client script.

## Releases 

## 2019-04-15_13-00-00 :: [061e5a1e](https://github.com/highfidelity/hifi-content/commit/061e5a1e)
- Initial release