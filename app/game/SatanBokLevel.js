var Level = require('Level');
var LevelData = require('binary!./level1.b64');
var base64 = require('base64-js');
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

        console.log(LevelData);
        var position = 0;
        var bytes = new Int32Array(base64.toByteArray(LevelData).buffer);
        var scale = bytes[position++],
            polyCount = bytes[position++],
            enemyCount = bytes[position++],
            start = {x: bytes[position++] * scale / 10, y: bytes[position++] * scale / 10},
            finish = {x: bytes[position++] * scale / 10, y: bytes[position++] * scale / 10},
            polygonList = [];

        for (var i = 0; i < polyCount; i++) {
            var vertexCount = bytes[position++],
                polygon = [];
            polygonList.push(polygon);

            for (var j = 0; j < vertexCount; j++) {
                var point = new Point(bytes[position++] * scale / 10, bytes[position++] * scale / 10);
                polygon.push(point);
            }
        }



        console.log("scale:" + scale);
        console.log("poly count:" + polyCount);
        console.log("enemy count:" + enemyCount);
        console.log(polygonList);


        var self = this;
        setTimeout(function() {
            //var bok = self.add(require('game/entities/SatanBok'));
            //bok.mouseControls = true;
            //bok.setupAtPosition(new Point(250, 200));

            var bok2 = self.add(require('game/entities/SatanBok'));
            bok2.setupAtPosition(new Point(550, 200));
            bok2.setStatic();

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
                    //item.MASS = 5;
                }
                item.setupAtPosition(new Point((i % 5) * 120 + 100 , Math.floor(i / 5) * 150 ));
                items.push(item);

                if ((i+1) % 5 == 0) {
                    item.convex.setStatic();
                }
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
