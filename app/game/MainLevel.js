var Level = require('Level');

/**
 * Test level
 *
 * @name MainLevel
 * @class MainLevel
 */
module.exports = Level.extend({

    /**
     * Start loading game object
     */
    preload: function(){

        //this.add(require('game/entities/Player'));

    },

    /**
     * Create a world
     */
    create: function(){
        //this.game.world.setBounds(0, 0, 1920, 1200);
    }

});
