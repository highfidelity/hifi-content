(function(){
    /* eslint-disable indent */

    // Notes
    // ////////////////////////////////////////////////////////////////////////
        /*
            Things Needed:

                1. Check if ball is equiped
                2. Random Timer for when it goes off
                3. Particle Effects (possibly use the particle animation system)
                4. Light Show
                5. Shape Explosion
                6. Each effect is a Type
                7. Random Amount of Types used
                8. Function to combine the types
                9. Function to run everything

            Things to Test:

                1. Which works, release or grab?
    
        */
    // Init
    // ////////////////////////////////////////////////////////////////////////

        var
            that
        ;
    
    // Consts
    // ////////////////////////////////////////////////////////////////////////

    // Collections
    // ////////////////////////////////////////////////////////////////////////

    // Constructors
    // ////////////////////////////////////////////////////////////////////////

    // Object Definitions
    // ////////////////////////////////////////////////////////////////////////


    // Entity Definition
    // ////////////////////////////////////////////////////////////////////////
        
        function SupriseBall(){
            that = this;
        }

        SupriseBall.prototype = {
            preload: function(){

            },

            startNearGrab: function(){
                
            },

            startFarGrab: function(){

            },

            startEquip: function(){

            },

            releaseGrab: function(){

            },

            releaseEquip: function(){

            },

            unload: function(){

            }
        }

        return new SupriseBall();
});