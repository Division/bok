var BaseLevel = require("./BaseLevel");
var LevelGeometry = require("game/entities/LevelGeometry");
var Point = require("core/verlet-physics/Point");
var SatanBok = require("game/entities/SatanBok");

module.exports = BaseLevel.extend({

    load: function(name) {

        var player = new SatanBok({x: 200, y: 135});
        this.game.addEntity(player);
        player.particles[0].applyForce(new Point(0, 40));

        var polygon = [
            new Point(-150, 1700),
            new Point(800, 1500),
            new Point(250, 1700)
        ];

        var geometry = new LevelGeometry(polygon);
        this.game.addEntity(geometry);
    }

});
