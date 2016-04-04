/**
 * Created by Nikita Sidorenko on 4/3/16.
 */

var BaseEntity = require('game/base/BaseEntity');
var Point = require("core/verlet-physics/Point");

/**
 * @class Killer
 */
module.exports = BaseEntity.extend({

    RADIUS: 20,

    position: null,
    player: null,

    initialize: function(position, player) {
        this.position = new Point(position.x ,position.y);
        this.player = player;
    },

    update: function() {
        if (Point.distance(this.player.particles[0].position, this.position) < this.RADIUS + this.player.RADIUS) {
            this.player.kill();
        }
    },

    render: function() {
        this.game.engine.physicsDebugDraw.drawPixel(this.position.x, this.position.y, 10, [1, 0, 0, 1]);
    }

});
