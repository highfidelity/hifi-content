# Vending Machine

## Description
This is the code repo for the Vending Machine Blueprint from High Fidelity.  This item allows you as a content creator to provide quick access to marketplace items you wish to promote, whether it's your own or someone else's!  By clicking or triggering on any of the buttons, a user will bring up the marketplace checkout page for that item and have it delivered to their inventory. The vending machine does not rez items, so you don't need to mess with user permissions!

## Instructions
To set the items you want your vending machine to sell:
1. Get the marketplaceID of the item by going to its webpage (e.g. https://highfidelity.com/marketplace/items/723aa413-e6a2-4753-b6aa-c9d34390b054) and copy the number after "...items/" (<code>723aa413-e6a2-4753-b6aa-c9d34390b054</code> for this example) and paste it into the file "vendingMachineItems.json" replacing one of the key-value pairs or extending the list with another as shown below.
2.      "Vending Machine Button 1": "-->>PASTE NUMBER HERE SO IT LOOKS LIKE THE NEXT LINE<<--",
        "Vending Machine Button 2": "1456c6f8-525a-430b-9217-5d6b39a8a874",
3. Save your JSON file!
4. Host your scripts on a public accessible repo (like Dropbox or Amazon S3).
5. Make sure the button entity name and number matches the key name in the JSON file (for the both the button and the image entities).
6. Load your script onto the vending machine button and image entities!


## Releases
### Version 1
SHA [6b12156](https://github.com/highfidelity/hifi-content/pull/311/commits/6b12156a0144f49c9e0a9a837c4dc410cb5aa74a)
March 1, 2019
- Initial Release


## Links
https://trello.com/c/E1Tcs7Wm/15-vending-machine
https://trello.com/c/0nMRCh8U/89-vending-machine

## Known issues


