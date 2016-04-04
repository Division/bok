/**
 * Created by Nikita Sidorenko on 3/13/16.
 */
var Class = require("Class");
var SatanBok = require("game/entities/SatanBok");
var Point = require("core/verlet-physics/Point");
var LevelGeometry = require("game/entities/LevelGeometry");
var Killer = require("game/entities/Killer");
var Target = require("game/entities/Target");
var base64Binary = require("base64-binary");

/**
 * @class BaseLevel
 */
module.exports = Class.extend({

    game: null,
    engine: null,

    initialize: function(game, engine) {
        this.game = game;
        this.engine = engine;
    },

    load: function(id) {
        this.loadFromFile("level" + id);
    },

    loadFromFile: function(levelName) {
        var levelData = require("raw!game/levels/" + levelName + ".b64");
        //console.log(levelData);
        var position = 0;

        var uint = base64Binary.decode(levelData);
        var bytes = new Int32Array(uint.buffer);
        var scale = bytes[position++],
            polyCount = bytes[position++],
            targetCount = bytes[position++],
            start = {x: bytes[position++] * scale / 10, y: bytes[position++] * scale / 10},
            finish = {x: bytes[position++] * scale / 10, y: bytes[position++] * scale / 10}, // unused
            polygonList = [];

        for (var i = 0; i < polyCount; i++) {
            var vertexCount = bytes[position++],
                polygon = [];
            polygonList.push(polygon);

            for (var j = 0; j < vertexCount; j++) {
                var point = new Point(bytes[position++] * scale / 10, bytes[position++] * scale / 10);
                polygon.push(point);
            }
            polygon.reverse();
            var geometry = new LevelGeometry(polygon);
            this.game.addEntity(geometry);
        }

        var targets = [];
        for (i = 0; i < targetCount; i++) {
            point = new Point(bytes[position++] * scale / 10, bytes[position++] * scale / 10);
            targets.push(point);
        }

        var killerCount = bytes[position++];

        var killers = [];
        for (i = 0; i < killerCount; i++) {
            point = new Point(bytes[position++] * scale / 10, bytes[position++] * scale / 10);
            killers.push(point);
        }

        console.log("scale:" + scale);
        console.log("start: ", start);
        console.log("finish: ", finish);
        console.log("poly count:" + polyCount);
        console.log("target count:" + targetCount);
        console.log("enemy count:" + killerCount);

        // Player
        var player = new SatanBok(start);
        this.game.addEntity(player);

        // Killers
        for (i = 0; i < killers.length; i++) {
            var killer = new Killer(killers[i], player);
            this.game.addEntity(killer);
        }

        // Targets
        for (i = 0; i < targets.length; i++) {
            var target = new Target(targets[i], player);
            this.game.addEntity(target);
        }

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
            new Point(-600, 0),
            new Point(450 * scale / 10 + 600, 0),
            new Point(450 * scale / 10 + 600, -600),
            new Point(-600, -600)
        ].reverse());
        this.game.addEntity(wall);

        wall = new LevelGeometry([
            new Point(450 * scale / 10, 0),
            new Point(450 * scale / 10, 450 * scale / 10 + 600),
            new Point(450 * scale / 10 + 600, 450 * scale / 10 + 600),
            new Point(450 * scale / 10 + 600, -600)
        ].reverse());
        this.game.addEntity(wall);
    }

});
