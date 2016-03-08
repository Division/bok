var Level = require('Level');

/**
 * Test level
 *
 * @class SatanBokLevel
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

            for (var i = 0; i < 12; i ++) {
                var item = self.add(require('game/entities/SatanBok'));
                if (i > 0) {
                    item.POINT_COUNT = Math.min(2 + i, 10);
                    item.RADIUS /= 1.2;
                }

                item.setupAtPosition(new Point((i % 4) * 150 + 100 , Math.floor(i / 4) * 150 ));
                items.push(item)
            }

            items[0].mouseControls = true;

        }, 0);
    },

    /**
     * Create a world
     */
    create: function(){
        //this.game.world.setBounds(0, 0, 1920, 1200);
    }

});
