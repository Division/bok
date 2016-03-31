/**
 * Created by Nikita Sidorenko on 3/13/16.
 */
var Class = require("Class");
var SatanBok = require("game/entities/SatanBok");
var base64 = require('base64-js');
var Point = require("core/verlet-physics/Point");
var LevelGeometry = require("game/entities/LevelGeometry");
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

    load: function(name) {
        this.loadFromFile("level9");
    },

    loadFromFile: function(levelName) {
        var levelData = require("raw!game/levels/" + levelName + ".b64");
        console.log(levelData);
        var position = 0;

        var uint = base64Binary.decode(levelData);
        var bytes = new Int32Array(uint.buffer);
        //var bytes = new Int32Array(base64.toByteArray(levelData).buffer);
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
        console.log("poly count:" + polyCount);
        console.log("Polygons:" + polygonList);
        console.log("target count:" + targetCount);
        console.log("Targets:" + targets);
        console.log("enemy count:" + killerCount);
        console.log("Killers:" + killers);

        var player = new SatanBok(start);
        this.game.addEntity(player);
    }

});
