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

        var self = this;
        setTimeout(function() {
            //var bok = self.add(require('game/entities/SatanBok'));
            //bok.mouseControls = true;
            //bok.setupAtPosition(new Point(250, 200));

            var items = [];

            for (var i = 0; i < 9; i ++) {
                var item = self.add(require('game/entities/SatanBok'));
                item.setupAtPosition(new Point((i % 3) * 150 + 100 , Math.floor(i / 3) * 150 ));
                items.push(item)
            }

            items[6].mouseControls = true;

        }, 0);
    },

    /**
     * Create a world
     */
    create: function(){
        //this.game.world.setBounds(0, 0, 1920, 1200);
    }

});
