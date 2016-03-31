var Class = require("Class");
var Point = require("core/verlet-physics/Point");

/**
 * @class Particle
 */
module.exports = Class.extend({

    /**
     * @type {Point}
     */
    position: null,

    /**
     * @type {Point}
     */
    prevPosition: null,

    /**
     * @type {Number}
     */
    acceleration: null,

    /**
     * @type {Number}
     */
    mass: null,

    /**
     * @type {Number}
     */
    invMass: null,

    /**
     * If false particle will not be moved by the engine
     */
    enabled: true,

    /**
     * @param position
     * @param mass
     * @constructor
     */
    initialize: function (position, mass) {
        this.set(position, mass);
    },

    set: function (position, mass, acceleration) {
        this.position = position.clone();
        this.prevPosition = position.clone();

        this.setMass(mass);

        if (acceleration === undefined) {
            acceleration = new Point(0, 0);
        }

        this.acceleration = acceleration;
    },

    setMass: function(mass) {
        if (mass === undefined) {
            mass = 1;
        }
        this.mass = mass;
        if (mass > 0) {
            this.invMass = 1 / mass;
        } else {
            this.invMass = 0;
            this.mass = 0;
        }
    },

    setPosition: function(position) {
        this.position.copyFrom(position);
        this.prevPosition.copyFrom(position);
    },

    getSpeed: function() {
        return Point.subtract(this.position, this.prevPosition);
    },

    applyForce: function(forceVector) {
        this.prevPosition.subtract(forceVector);
    }
});
