# Marketplace Item Advertiser
When this script is attached to an entity as an entity script, the entity serves as a "Marketplace Item Advertiser".

## Features
- When a user clicks with their mouse or uses the red hand controller laser on the entity that is running this script, the user will be presented with the Marketplace Checkout page associated with the Marketplace Item ID that is referenced in the `userData` of that entity.

## Setup
1. Add an entity to your domain.
    - A Box primitive would work perfectly.
    - The entity should have some affordance to indicate that a user can click on the entity. A billboard with text "CLICK HERE TO PURCHASE XYZ APP" is one example.
    - Note that anyone who can modify the `userData` of this entity will be able to control which Checkout page that users see!
2. Add the below `userData` object to the attached entity's `userData`
    1. Fill in the `marketplaceID` value in the `userData` by adding Marketplace IDs to Items that you want users to purchase.
        - Obtain a Marketplace ID from the URL of your Marketplace item; the ID is the long string that comes after `marketplace/items/` in the URL. 
        - For example, to direct users to the checkout page of the Appreciate App v1.2, you would use: `"marketplaceID": "4034dc57-09a2-4b5e-b589-c50862566f6c"`
3. Add the `marketplaceItemAdvertiser.js` script to the entity

Here's the object to add to the zone entity's `userData`:
```
{
    "marketplaceID": "<Your Item's Marketplace ID>"
}
```

# Releases

## 2019-02-14_10-45-00 :: [333e19d](https://github.com/highfidelity/hifi-content/commit/333e19ddbb1c7db7441ed05df34dd7978a5b0aad)
- Initial release