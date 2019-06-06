# Vending Machine

## Description
This is the code repo for the Vending Machine Blueprint from High Fidelity.  This item allows you as a content creator to provide quick access to marketplace items you wish to promote, whether it's your own or someone else's!  By clicking or triggering on any of the buttons, a user will bring up the marketplace checkout page for that item and have it delivered to their inventory. The vending machine does not rez items, so you don't need to mess with user permissions!

## Instructions
To set the items you want your vending machine to sell:
1. Get the `marketplaceID` of the item you want to sell
    1. Go to the item's webpage (e.g. https://highfidelity.com/marketplace/items/723aa413-e6a2-4753-b6aa-c9d34390b054).
    2. Copy the string in the URL that comes after "...items/" (e.g. `723aa413-e6a2-4753-b6aa-c9d34390b054` for the above URL).
2. Rez the Vending Machine.
3. For the button whose vended item you want to change, use Create to unlock that button's associated Box entity and Image entity.
4. Add the `marketplaceID` from (1) to the UserData of the button's **Box entity**:
    1. Use the Create app to find the button's associated Box entity.
    2. Scroll to that entity's User Data section.
    3. In the User Data of the entity, replace the existing value associated with the `marketplaceID` key with the `marketplaceID` from (1).
5. Reload the script on the button's Box entity, then re-lock the entity.
6. Add the `marketplaceID` from (1) to the UserData of the button's **Image entity**:
    1. Use the Create app to find the button's associated Image entity.
    2. Scroll to that entity's User Data section.
    3. In the User Data of the entity, replace the existing value associated with the `marketplaceID` key with the `marketplaceID` from (1).
7. Reload the script on the button's Image entity, then re-lock the entity.


## Releases
### v2.0 | [commit 1e80698](https://github.com/highfidelity/hifi-content/commits/1e80698)
- The Vending Machine now sources its button data from the button entity's `userData` rather than a JSON URL! This means you can more easily update the Marketplace Items served by the Vending Machine.


### 2019-03-04_10_00_00 | [commit 6b12156](https://github.com/highfidelity/hifi-content/pull/311/commits/6b12156a0144f49c9e0a9a837c4dc410cb5aa74a)
- Initial Release


## Links
https://trello.com/c/E1Tcs7Wm/15-vending-machine
https://trello.com/c/0nMRCh8U/89-vending-machine