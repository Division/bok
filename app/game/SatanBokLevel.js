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

            var improvedI = 0;

            for (var i = 0; i < 20; i ++) {
                var item = self.add(require('game/entities/SatanBok'));

                improvedI = i % 6 + 1;

                if (i > 0) {
                    item.POINT_COUNT = Math.min(2 + improvedI, 10);
                    item.RADIUS /= 1.2;
                }

                if (i==0) {
                    item.MASS = 5;
                }
                item.setupAtPosition(new Point((i % 5) * 120 + 100 , Math.floor(i / 5) * 150 ));
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
