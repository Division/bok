var BaseLevel = require("./BaseLevel");
var LevelGeometry = require("game/entities/LevelGeometry");
var Point = require("core/verlet-physics/Point");
var SatanBok = require("game/entities/SatanBok");

module.exports = BaseLevel.extend({

    load: function(name) {

        var player = new SatanBok({x: 600, y: -200});
        this.game.addEntity(player);
        player.particles[0].applyForce(new Point(0, 40));
        player.fireEnabled = false;
        player.ROTATE_FORCE = 2;
        var polygon = [
            new Point(-150, 1700),
            new Point(800, 1500),
            new Point(250, 1700)
        ];

        var geometry = new LevelGeometry(polygon);
        this.game.addEntity(geometry);

        for (var i = 0; i < 30; i++) {
            var dynamicBody = new SatanBok({x: i % 5 * 150 + 100, y : Math.floor(i / 5) * 80 + 200});
            dynamicBody.mouseControls = false;
            dynamicBody.POINT_COUNT = Math.max(3, i % 7);
            dynamicBody.MASS = 0.7;
            dynamicBody.RADIUS = 40;
            dynamicBody.followCamera = false;
            this.game.addEntity(dynamicBody);
        }


        var staticBody = new SatanBok({x: 100, y : 1000});
        staticBody.mouseControls = false;
        staticBody.POINT_COUNT = 20;
        staticBody.MASS = 0.4;
        staticBody.RADIUS = 320;
        staticBody.followCamera = false;
        this.game.addEntity(staticBody);
        staticBody.setStatic();

        staticBody = new SatanBok({x: 600, y : 700});
        staticBody.mouseControls = false;
        staticBody.POINT_COUNT = 3;
        staticBody.MASS = 0.4;
        staticBody.RADIUS = 60;
        staticBody.followCamera = false;
        this.game.addEntity(staticBody);
        staticBody.setStatic();
        staticBody = new SatanBok({x: 750, y : 650});
        staticBody.mouseControls = false;
        staticBody.POINT_COUNT = 4;
        staticBody.MASS = 0.4;
        staticBody.RADIUS = 60;
        staticBody.followCamera = false;
        this.game.addEntity(staticBody);
        staticBody.setStatic();



        var scale = 18;
        // Outer walls
        var wall = new LevelGeometry([
            new Point(-600, 450 * scale / 10),
            new Point(-600, 450 * scale / 10 + 600),
            new Point(450 * scale / 10 + 600, 450 * scale / 10 + 600),
            new Point(450 * scale / 10 + 600, 450 * scale / 10)
        ].reverse());
        this.game.addEntity(wall);

        wall = new LevelGeometry([
            new Point(-600, -600),
            new Point(-600, 450 * scale / 10 + 600),
            new Point(0, 450 * scale / 10 + 600),
            new Point(0, -600)
        ].reverse());
        this.game.addEntity(wall);

        wall = new LevelGeometry([
            new Point(-600, -300),
            new Point(450 * scale / 10 + 600, -300),
            new Point(450 * scale / 10 + 600, -600),
            new Point(-600, -600)
        ].reverse());
        this.game.addEntity(wall);

        wall = new LevelGeometry([
            new Point(450 * scale / 10, -300),
            new Point(450 * scale / 10, 450 * scale / 10 + 600),
            new Point(450 * scale / 10 + 600, 450 * scale / 10 + 600),
            new Point(450 * scale / 10 + 600, -300)
        ].reverse());
        this.game.addEntity(wall);
    }

});
