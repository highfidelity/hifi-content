Primitive Painting
=================

Primitive Painting is an introductory piece of content to get you familiar with building interactive content for High Fidelity 

You can try out Primitive Painting in your own High Fidelity domain by copying the link below and using Edit > Import Entities from URL to bring in a basic set of cubes, palette, and brush. 

Link to import painting entities:
[https://cdn.glitch.com/9edc1264-7131-4cd6-8451-db2f2f1b994a%2FPrimitive_Painting.json](https://cdn.glitch.com/9edc1264-7131-4cd6-8451-db2f2f1b994a%2FPrimitive_Painting.json)

The painting set is a set of shortcuts for editing the color property on entities. The brush tip, which has the brushScript.js file in its 'script' entity property field, changes color when you touch it against a paint color on the palette, and transfers that color to other primitives.

### ← brushScript.js

The brushScript.js file hooks into the `collisionWithEntity` function that the physics engine triggers on entities when they collide wiwth other entities in the space. In this script, we use a specific naming convention for our entities to define what should be edited.

If the paintbrush touches an entity with the name 'Paint-Color', it changes the brush head to the colliding entity's color. Any other entity, as long as it isn't the brush handle or the palette, will be "painted" by the brush head.

[Entities API Documentation](https://docs.highfidelity.com/api-reference/namespaces/entities) 

[Collision With Entity API Reference](https://docs.highfidelity.com/api-reference/namespaces/entities#.collisionWithEntity) 

### ← assets

The assets for this project are all primitive entities built into the High Fidelity platform. No external models have been used.